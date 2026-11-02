// Lee y guarda categorías y perfumes. Con claves de Supabase usa la base de datos real;
// sin ellas usa el navegador (localStorage) para poder probar el panel.
import { getClient, hasBackend, shrinkImage, uploadImage as uploadRemote } from './supabase'

export const isLocal = !hasBackend

const LOCAL_KEY = 'louryx-admin-db'
const empty = () => ({ categories: [], products: [], seq: 0 })
const readLocal = () => {
  try {
    return { ...empty(), ...JSON.parse(localStorage.getItem(LOCAL_KEY)) }
  } catch {
    return empty()
  }
}
const writeLocal = (db) => localStorage.setItem(LOCAL_KEY, JSON.stringify(db))
// Modo de prueba: borra todo lo guardado en este navegador
export const clearLocal = () => localStorage.removeItem(LOCAL_KEY)
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

// Quita lo que la base genera sola y lo que no es una columna
const clean = (row) => {
  const { id, created_at, ...rest } = row
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined))
}

export async function listAll() {
  if (isLocal) return readLocal()
  const sb = await getClient()
  const [cats, prods] = await Promise.all([
    sb.from('louryx_categories').select('*').order('sort').order('name'),
    sb.from('louryx_products').select('*').order('created_at', { ascending: true }),
  ])
  if (cats.error) throw cats.error
  if (prods.error) throw prods.error
  return { categories: cats.data, products: prods.data }
}

export async function saveCategory(row) {
  if (isLocal) {
    const db = readLocal()
    if (row.id) db.categories = db.categories.map((c) => (c.id === row.id ? { ...c, ...row } : c))
    else {
      row = { sort: db.categories.length, active: true, ...row, id: newId(), created_at: new Date().toISOString() }
      db.categories.push(row)
    }
    writeLocal(db)
    return row
  }
  const sb = await getClient()
  const q = row.id
    ? sb.from('louryx_categories').update(clean(row)).eq('id', row.id)
    : sb.from('louryx_categories').insert(clean(row))
  const { data, error } = await q.select().single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  if (isLocal) {
    const db = readLocal()
    db.categories = db.categories.filter((c) => c.id !== id)
    db.products = db.products.map((p) => (p.category_id === id ? { ...p, category_id: null } : p))
    return writeLocal(db)
  }
  const sb = await getClient()
  const { error } = await sb.from('louryx_categories').delete().eq('id', id)
  if (error) throw error
}

export async function saveProduct(row) {
  if (isLocal) {
    const db = readLocal()
    if (row.id) db.products = db.products.map((p) => (p.id === row.id ? { ...p, ...row } : p))
    else {
      db.seq += 1
      row = { active: true, wholesale: true, ...row, id: db.seq, created_at: new Date().toISOString() }
      db.products.push(row)
    }
    writeLocal(db)
    return row
  }
  const sb = await getClient()
  const q = row.id
    ? sb.from('louryx_products').update(clean(row)).eq('id', row.id)
    : sb.from('louryx_products').insert(clean(row))
  const { data, error } = await q.select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  if (isLocal) {
    const db = readLocal()
    db.products = db.products.filter((p) => p.id !== id)
    return writeLocal(db)
  }
  const sb = await getClient()
  const { error } = await sb.from('louryx_products').delete().eq('id', id)
  if (error) throw error
}

// Foto del perfume: con base de datos se sube a Supabase; en modo de prueba queda dentro del navegador.
export async function uploadImage(file) {
  if (isLocal) return (await shrinkImage(file, 900, 0.8)).dataUrl
  return uploadRemote(file)
}

// ---------- Usuarios (solo con Supabase) ----------
export async function getSession() {
  const sb = await getClient()
  if (!sb) return null
  return (await sb.auth.getSession()).data.session
}

export async function onAuthChange(cb) {
  const sb = await getClient()
  if (!sb) return () => {}
  const { data } = sb.auth.onAuthStateChange((_e, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export async function signIn(email, password) {
  const sb = await getClient()
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  const sb = await getClient()
  if (sb) await sb.auth.signOut()
}

export async function checkAdmin() {
  const sb = await getClient()
  if (!sb) return true
  const { data, error } = await sb.rpc('louryx_is_admin')
  return !error && data === true
}
