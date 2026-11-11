import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as store from '../lib/catalogStore'
import { cutoutFile } from '../lib/cutout'
import { parseCsv, rowToProduct, templateCsv } from '../lib/csvImport'
import { useCatalog } from '../context/CatalogContext'
import { products as EXAMPLE_PRODUCTS, CATEGORIES as EXAMPLE_CATEGORIES, FAMILIES } from '../data/products'
import { STORE, asset, money, wholesalePercent, wholesalePrice } from '../config'

// Panel de administración (/admin), con el mismo orden que el de Quality Shop:
// pestañas Perfumes / Categorías, listas con Editar y Borrar, y formularios a página completa.
// Con Supabase pide usuario y contraseña de un administrador; sin Supabase funciona en "modo de prueba".

export default function Admin() {
  const [session, setSession] = useState(store.isLocal ? null : undefined) // undefined = comprobando
  const [admin, setAdmin] = useState(store.isLocal)

  useEffect(() => {
    if (store.isLocal) return
    let off = () => {}
    store.getSession().then(setSession)
    store.onAuthChange(setSession).then((fn) => { off = fn })
    return () => off()
  }, [])

  useEffect(() => {
    if (store.isLocal) return
    if (session) store.checkAdmin().then(setAdmin)
    else setAdmin(false)
  }, [session])

  let body
  if (!store.isLocal && session === undefined) body = <p>Cargando…</p>
  else if (!store.isLocal && !session) body = <Login />
  else if (!store.isLocal && !admin) {
    body = (
      <>
        <p className="lxp-error">Esta cuenta ({session.user.email}) no tiene permiso de administrador.</p>
        <button type="button" className="lxp-btn" onClick={store.signOut}>Salir</button>
      </>
    )
  } else body = <Panel />

  return <main className="lxp"><div className="lxp-in">{body}</div></main>
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await store.signIn(email.trim(), password)
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="lxp-login" onSubmit={submit}>
      <h1>Panel de administración</h1>
      <label>Correo<input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
      <label>Contraseña<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
      {error && <p className="lxp-error" role="alert">{error}</p>}
      <button className="lxp-btn lxp-btn--solid" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
  )
}

function Panel() {
  const { reload: reloadShop } = useCatalog()
  const [data, setData] = useState({ categories: [], products: [], bundles: [], settings: {} })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('perfumes')
  const [editing, setEditing] = useState(null) // { kind: 'product' | 'category', data }
  const [filter, setFilter] = useState('')
  const [msg, setMsg] = useState('')
  const [importing, setImporting] = useState(false)
  const csvRef = useRef(null)
  const photosRef = useRef(null)

  const load = async () => {
    setData(await store.listAll())
  }

  useEffect(() => {
    load().catch(() => setMsg('No se pudo leer la base de datos.')).finally(() => setLoading(false))
  }, [])

  const cats = useMemo(() => [...data.categories].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name)), [data.categories])
  const prods = useMemo(() => [...data.products].reverse(), [data.products])
  const catName = (id) => data.categories.find((c) => c.id === id)?.name || 'Sin categoría'
  const countOf = (id) => data.products.filter((p) => p.category_id === id).length

  const done = async (text) => {
    setEditing(null)
    setMsg(text)
    await load()
    reloadShop()
  }

  const attempt = async (fn, ok) => {
    try {
      await fn()
      await done(ok)
    } catch (e) {
      setMsg(`No se pudo guardar: ${e.message || 'error desconocido'}`)
    }
  }

  // Modo de prueba: borra lo guardado en este navegador y la tienda vuelve a mostrar los perfumes de src/data/products.js
  const clearTestData = async () => {
    if (!window.confirm('¿Borrar todo lo que hay en el panel de prueba (perfumes y categorías de este navegador)? La tienda volverá a mostrar los perfumes originales.')) return
    store.clearLocal()
    await done('Datos de prueba borrados')
  }
  // Suma o resta una unidad sin abrir el formulario (para llevar el inventario al día)
  const setStock = (p, n) => attempt(() => store.saveProduct({ id: p.id, stock: Math.max(0, n) }), 'Cantidad actualizada')
  const saveWholesale = (p, patch) => attempt(() => store.saveProduct({ id: p.id, ...patch }), 'Mayorista guardado')
  // Pone el mismo descuento mayorista a todos los perfumes (o lo quita si va vacío)
  const applyWholesaleToAll = (vals) =>
    window.confirm(`¿Poner estos descuentos mayoristas a los ${data.products.length} perfumes? Los escalones vacíos se borran.`) &&
    attempt(async () => { for (const p of data.products) await store.saveProduct({ id: p.id, ...vals }) }, 'Descuento mayorista aplicado')
  const removeProduct = (p) => window.confirm(`¿Borrar "${p.name}" para siempre?`) && attempt(() => store.deleteProduct(p.id), 'Perfume borrado')
  const removeCategory = (c) =>
    window.confirm(`¿Borrar la categoría "${c.name}"? Sus perfumes no se borran: quedan sin categoría.`) &&
    attempt(() => store.deleteCategory(c.id), 'Categoría borrada')

  const newProduct = (category_id = '') =>
    setEditing({ kind: 'product', data: { name: '', description: '', price: '', category_id, badge: '', active: true, wholesale: true, family: '', size_ml: 100, featured: false, is_new: false, stock: 10, discount: '', cover: '', extra: [] } })
  const editProduct = (p) =>
    setEditing({
      kind: 'product',
      data: {
        id: p.id, name: p.name, description: p.description ?? '', price: p.price ?? '', category_id: p.category_id ?? '', badge: p.badge ?? '',
        active: p.active, wholesale: p.wholesale !== false, family: p.family ?? '', size_ml: p.size_ml ?? 100, featured: Boolean(p.featured), is_new: Boolean(p.is_new),
        stock: p.stock ?? 20, discount: p.discount_percent ?? '', cover: p.image_url ?? '', extra: p.photos ?? [],
      },
    })

  // Copia los perfumes de src/data/products.js a la base para poder editarlos desde aquí
  const importExamples = async () => {
    if (!window.confirm('Esto crea las categorías y los perfumes que hoy tiene la tienda para que puedas editarlos. ¿Continuar?')) return
    setImporting(true)
    try {
      const ids = {}
      for (const [i, name] of EXAMPLE_CATEGORIES.entries()) ids[name] = (await store.saveCategory({ name, sort: i, active: true })).id
      for (const p of EXAMPLE_PRODUCTS) {
        await store.saveProduct({
          name: p.name, description: p.description, price: p.price, category_id: ids[p.category] ?? null, image_url: p.image || null,
          wholesale: true, family: p.family, size_ml: p.size, badge: p.badge || null, featured: Boolean(p.vendido), is_new: Boolean(p.nuevo),
          notes: p.notes, stock: p.stock ?? 20, active: true,
        })
      }
      await done('Perfumes cargados')
    } catch (e) {
      setMsg(`No se pudo cargar: ${e.message || 'error'}`)
    } finally {
      setImporting(false)
    }
  }

  // Sube todos los perfumes de un archivo CSV: si el nombre ya existe lo actualiza, si no lo crea.
  // La categoría de cada fila se busca por nombre; si no existe se crea sola.
  const downloadTemplate = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([templateCsv()], { type: 'text/csv;charset=utf-8' }))
    a.download = 'plantilla-perfumes-louryx.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const importFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImporting(true)
    setMsg('')
    try {
      const rows = parseCsv(await file.text())
      if (!rows.length) throw new Error('el archivo está vacío o no tiene el formato de la plantilla')
      const items = rows.map((r, i) => rowToProduct(r, i + 2))
      const errors = items.filter((x) => x.error).map((x) => x.error)
      const good = items.filter((x) => !x.error)
      if (!good.length) throw new Error(errors.slice(0, 3).join(' · '))
      if (!window.confirm(`Se van a subir ${good.length} perfumes (los que ya existan con el mismo nombre se actualizan; las categorías que falten se crean).${errors.length ? ` ${errors.length} filas tienen errores y se saltan.` : ''} ¿Continuar?`)) return
      const catIds = Object.fromEntries(data.categories.map((c) => [c.name.trim().toLowerCase(), c.id]))
      const byName = Object.fromEntries(data.products.map((p) => [p.name.trim().toLowerCase(), p]))
      let created = 0, updated = 0, newCats = 0, skipped = 0
      const failed = []
      // Cada guardado espera máximo 25 s y se reintenta 2 veces, para que una conexión lenta no deje la carga colgada
      const tryTwice = async (fn) => {
        for (let t = 0; ; t++) {
          try {
            return await Promise.race([fn(), new Promise((_, no) => setTimeout(() => no(new Error('tardó demasiado')), 25000))])
          } catch (err) {
            if (t >= 2) throw err
          }
        }
      }
      for (const [i, { category, row }] of good.entries()) {
        setMsg(`Subiendo perfumes… ${i + 1} de ${good.length}`)
        try {
          const key = category.trim().toLowerCase()
          if (key && !catIds[key]) {
            catIds[key] = (await tryTwice(() => store.saveCategory({ name: category.trim(), sort: Object.keys(catIds).length, active: true }))).id
            newCats++
          }
          const old = byName[row.name.trim().toLowerCase()]
          // Si ya está y en su categoría, no hay nada que cambiar (así se puede volver a subir el archivo para continuar)
          if (old && (!key || old.category_id === catIds[key])) { skipped++; continue }
          const fields = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined && !(old && (v === null || v === ''))))
          const saved = await tryTwice(() => store.saveProduct({ ...(old ? { id: old.id } : { price: 0 }), ...fields, category_id: key ? catIds[key] : old?.category_id ?? null }))
          byName[row.name.trim().toLowerCase()] = saved
          old ? updated++ : created++
        } catch (err) {
          failed.push(`${row.name} (${err.message || 'error'})`)
        }
      }
      await done(`Listo: ${created} perfumes nuevos, ${updated} actualizados${skipped ? `, ${skipped} ya estaban` : ''} y ${newCats} categorías nuevas.${failed.length ? ` No se pudieron subir ${failed.length}: ${failed.slice(0, 3).join(' · ')}` : ''}${errors.length ? ` Filas saltadas: ${errors.slice(0, 3).join(' · ')}` : ''}`)
    } catch (err) {
      setMsg(`No se pudo importar: ${err.message || 'error'}`)
    } finally {
      setImporting(false)
    }
  }

  // Sube muchas fotos de una vez: cada archivo se une al perfume cuyo nombre coincide con el nombre del archivo
  // (ej. "orientica-royal-bleu.png" -> "Orientica Royal Bleu"). A las categorías sin foto se les pone la del primer perfume.
  const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const importPhotos = async (e) => {
    const files = [...(e.target.files || [])]
    e.target.value = ''
    if (!files.length) return
    setImporting(true)
    setMsg('')
    try {
      const byName = {}
      for (const p of data.products) byName[slug(p.name)] = p
      const catPhoto = {}
      let ok = 0
      const missing = []
      for (const [i, f] of files.entries()) {
        const p = byName[slug(f.name.replace(/.[^.]+$/, '').replace(/-d+$/, ''))] || byName[slug(f.name.replace(/.[^.]+$/, ''))]
        if (!p) { missing.push(f.name); continue }
        setMsg(`Subiendo fotos… ${i + 1} de ${files.length}`)
        const url = await store.uploadImage(f)
        await store.saveProduct({ id: p.id, image_url: url })
        if (p.category_id && !catPhoto[p.category_id]) catPhoto[p.category_id] = url
        ok++
      }
      for (const c of data.categories) if (!c.photo_url && catPhoto[c.id]) await store.saveCategory({ id: c.id, photo_url: catPhoto[c.id] })
      await done(`Listo: ${ok} fotos puestas.${missing.length ? ` Sin perfume con ese nombre (${missing.length}): ${missing.slice(0, 5).join(', ')}` : ''}`)
    } catch (err) {
      setMsg(`No se pudieron subir las fotos: ${err.message || 'error'}`)
    } finally {
      setImporting(false)
    }
  }

  // Pone sola la foto a cada perfume que no tiene, tomándola de la carpeta /catalogo de la tienda (sin elegir archivos).
  // Une cada perfume con su foto por el nombre (ej. "Orientica Royal Bleu" -> orientica-royal-bleu.webp).
  const autoPhotos = async () => {
    setImporting(true)
    setMsg('')
    try {
      const idx = await (await fetch(asset('/catalogo/index.json'), { cache: 'no-store' })).json()
      const slugOf = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const todo = data.products.filter((p) => !p.image_url && idx[slugOf(p.name)])
      const noPhoto = data.products.filter((p) => !p.image_url && !idx[slugOf(p.name)]).map((p) => p.name)
      if (!todo.length) throw new Error(noPhoto.length ? `no hay fotos para ${noPhoto.length} perfumes sin foto (ej. ${noPhoto.slice(0, 3).join(', ')})` : 'todos los perfumes ya tienen foto')
      let ok = 0
      const failed = []
      const catPhoto = {}
      for (const [i, p] of todo.entries()) {
        setMsg(`Poniendo fotos… ${i + 1} de ${todo.length}`)
        const url = '/catalogo/' + idx[slugOf(p.name)]
        try {
          for (let t = 0; ; t++) {
            try { await store.saveProduct({ id: p.id, image_url: url }); break } catch (err) { if (t >= 2) throw err }
          }
          ok++
          if (p.category_id && !catPhoto[p.category_id]) catPhoto[p.category_id] = url
        } catch (err) {
          failed.push(p.name)
        }
      }
      for (const c of data.categories) if (!c.photo_url && catPhoto[c.id]) await store.saveCategory({ id: c.id, photo_url: catPhoto[c.id] })
      await done(`Listo: ${ok} fotos puestas.${failed.length ? ` Fallaron ${failed.length}: ${failed.slice(0, 3).join(', ')}.` : ''}${noPhoto.length ? ` Sin foto en el catálogo: ${noPhoto.length} (ej. ${noPhoto.slice(0, 3).join(', ')}).` : ''}`)
    } catch (err) {
      setMsg(`No se pudieron poner las fotos: ${err.message || 'error'}`)
    } finally {
      setImporting(false)
    }
  }

  const shown = prods.filter((p) => !filter || p.category_id === filter)

  return (
    <>
      <header className="lxp-top">
        <h1>Panel de administración</h1>
        <div>
          <Link to="/" className="lxp-link">Ver la tienda</Link>
          {!store.isLocal && <button type="button" className="lxp-link" onClick={store.signOut}>Salir</button>}
        </div>
      </header>

      {editing?.kind === 'product' && <ProductForm initial={editing.data} cats={cats} onSaved={() => done('Perfume guardado')} onCancel={() => setEditing(null)} />}
      {editing?.kind === 'bundle' && <BundleForm initial={editing.data} products={data.products} onSaved={() => done('Guardado')} onCancel={() => setEditing(null)} />}
      {editing?.kind === 'category' && <CategoryForm initial={editing.data} onSaved={() => done('Categoría guardada')} onCancel={() => setEditing(null)} />}

      {!editing && (
        <>
          {store.isLocal && (
            <p className="lxp-note">
              <b>Modo de prueba.</b> Todavía no hay una base de datos conectada: lo que crees aquí solo se guarda en este navegador y no lo verán tus clientes.{' '}
              <button type="button" className="lxp-link" onClick={clearTestData}>Borrar los datos de prueba</button>
            </p>
          )}
          {msg && <p className="lxp-ok" role="status">{msg}</p>}

          <nav className="lxp-tabs">
            <button type="button" className={tab === 'perfumes' ? 'on' : ''} onClick={() => { setTab('perfumes'); setMsg('') }}>Perfumes ({data.products.length})</button>
            <button type="button" className={tab === 'categorias' ? 'on' : ''} onClick={() => { setTab('categorias'); setMsg('') }}>Categorías ({data.categories.length})</button>
            <button type="button" className={tab === 'mayoristas' ? 'on' : ''} onClick={() => { setTab('mayoristas'); setMsg('') }}>Mayoristas ({data.products.filter((p) => p.wholesale).length})</button>
            <button type="button" className={tab === 'ofertas' ? 'on' : ''} onClick={() => { setTab('ofertas'); setMsg('') }}>Ofertas ({data.bundles.length})</button>
          </nav>

          {loading && <p>Cargando…</p>}

          {!loading && tab === 'perfumes' && (
            <>
              <button type="button" className="lxp-btn lxp-btn--solid lxp-btn--big" onClick={() => newProduct(filter)}>+ Nuevo perfume</button>
              <div className="lxp-note">
                <b>Subir muchos perfumes de una vez.</b> Descarga la plantilla, llénala en Excel (en la columna “categoria” pon por ejemplo Original, Árabe, Mujer…), guárdala como CSV y súbela aquí. Si la categoría no existe se crea sola.{' '}
                <span className="lxp-links">
                  <button type="button" className="lxp-link" onClick={downloadTemplate}>Descargar plantilla</button>
                  <button type="button" className="lxp-link" disabled={importing} onClick={() => csvRef.current?.click()}>{importing ? 'Subiendo…' : 'Subir archivo'}</button>
                  <button type="button" className="lxp-link" disabled={importing} onClick={() => photosRef.current?.click()}>Subir fotos (varias)</button>
                  <button type="button" className="lxp-link" disabled={importing} onClick={autoPhotos}>Poner fotos del catálogo (automático)</button>
                </span>
                <input ref={csvRef} type="file" accept=".csv,text/csv" hidden onChange={importFile} />
                <input ref={photosRef} type="file" accept="image/*" multiple hidden onChange={importPhotos} />
              </div>
              {data.categories.length > 1 && (
                <label className="lxp-filter">Categoría
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="">Todas</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
              {data.products.length === 0 ? (
                <div className="lxp-empty">
                  {store.isLocal ? (
                    <>
                      <p>Todavía no hay perfumes en el panel. La tienda está mostrando los perfumes de ejemplo.</p>
                      <p className="lxp-help">Empieza de cero con “Nuevo perfume”, o carga los {EXAMPLE_PRODUCTS.length} perfumes actuales para editarlos desde aquí.</p>
                      <button type="button" className="lxp-btn" onClick={importExamples} disabled={importing}>{importing ? 'Cargando…' : 'Cargar los perfumes actuales'}</button>
                    </>
                  ) : (
                    <>
                      <p>Todavía no hay perfumes. La tienda sale vacía hasta que subas el primero.</p>
                      <p className="lxp-help">Usa “Nuevo perfume” o sube la plantilla en el recuadro de arriba.</p>
                    </>
                  )}
                </div>
              ) : (
                <ul className="lxp-list">
                  {shown.map((p) => (
                    <li key={p.id} className={p.active ? '' : 'off'}>
                      <Thumb src={p.image_url} />
                      <span className="lxp-list__info">
                        <strong>{p.name}</strong>
                        <small>{catName(p.category_id)} · {money(Number(p.price) || 0)}</small>
                        <small>
                          <span className={`lxp-badge ${p.wholesale ? 'lxp-badge--ok' : ''}`}>{p.wholesale ? 'Al por mayor' : 'Solo detal'}</span>
                          {!p.active && <span className="lxp-badge lxp-badge--out">Oculto</span>}
                          {p.discount_percent > 0 && <span className="lxp-badge">-{p.discount_percent}%</span>}
                        </small>
                        <small className="lxp-stock">
                          Cantidad:
                          <button type="button" aria-label="Quitar una unidad" onClick={() => setStock(p, (Number(p.stock) || 0) - 1)} disabled={(Number(p.stock) || 0) <= 0}>−</button>
                          <b>{Number(p.stock) || 0}</b>
                          <button type="button" aria-label="Agregar una unidad" onClick={() => setStock(p, (Number(p.stock) || 0) + 1)}>+</button>
                          {(Number(p.stock) || 0) <= 0 && <span className="lxp-badge lxp-badge--out">Agotado</span>}
                        </small>
                      </span>
                      <button type="button" onClick={() => editProduct(p)}>Editar</button>
                      <button type="button" onClick={() => removeProduct(p)}>Borrar</button>
                    </li>
                  ))}
                  {shown.length === 0 && <li className="lxp-empty">Esta categoría todavía no tiene perfumes.</li>}
                </ul>
              )}
            </>
          )}

          {!loading && tab === 'categorias' && (
            <>
              <button type="button" className="lxp-btn lxp-btn--solid lxp-btn--big" onClick={() => setEditing({ kind: 'category', data: { name: '', sort: data.categories.length, active: true, photo: '' } })}>+ Nueva categoría</button>
              <ul className="lxp-list lxp-list--cats">
                {cats.map((c) => (
                  <li key={c.id} className={c.active ? '' : 'off'}>
                    <Thumb src={c.photo_url} />
                    <span className="lxp-list__info">
                      <strong>{c.name}</strong>
                      <small>{countOf(c.id)} {countOf(c.id) === 1 ? 'perfume' : 'perfumes'}{c.active ? '' : ' · oculta'}</small>
                    </span>
                    <button type="button" className="lxp-btn--solid" onClick={() => { newProduct(c.id); setTab('perfumes') }}>+ Crear producto</button>
                    <button type="button" onClick={() => setEditing({ kind: 'category', data: { id: c.id, name: c.name, sort: c.sort, active: c.active, photo: c.photo_url ?? '' } })}>Editar</button>
                    <button type="button" onClick={() => removeCategory(c)}>Borrar</button>
                  </li>
                ))}
                {cats.length === 0 && <li className="lxp-empty">Todavía no hay categorías. Crea la primera con “Nueva categoría”.</li>}
              </ul>
            </>
          )}

          {!loading && tab === 'ofertas' && (
            <OffersTab
              data={data}
              onSettings={(patch) => attempt(() => store.saveSettings(patch), 'Guardado')}
              onNew={(type) => setEditing({ kind: 'bundle', data: { type, name: '', blurb: '', off: 10, active: true, items: [{ id: '', qty: 1 }] } })}
              onEdit={(b) => setEditing({ kind: 'bundle', data: { id: b.id, type: b.type, name: b.name, blurb: b.blurb ?? '', off: b.discount_percent ?? 0, active: b.active !== false, items: b.items?.length ? b.items.map((i) => ({ id: String(i.id), qty: i.qty })) : [{ id: '', qty: 1 }] } })}
              onDelete={(b) => window.confirm(`¿Borrar "${b.name}"?`) && attempt(() => store.deleteBundle(b.id), 'Borrado')}
            />
          )}

          {!loading && tab === 'mayoristas' && (
            <>
              <p className="lxp-help">
                Aquí decides, para cada perfume, si se vende al por mayor y el descuento de cada escalón: desde {STORE.wholesaleTiers[0]}, desde {STORE.wholesaleTiers[1]} y desde {STORE.wholesaleTiers[2]} unidades
                de ese mismo perfume. Se aplica solo en la página de Mayoristas; en la tienda normal el precio no cambia.
                Si dejas el primero vacío, se usa el general ({Math.round(STORE.wholesaleDiscount * 100)}%); un escalón vacío repite el anterior.
              </p>
              {data.products.length > 0 && <WholesaleBulk onApply={applyWholesaleToAll} />}
              <ul className="lxp-list lxp-list--ws">
                {prods.map((p) => <WholesaleRow key={`${p.id}-${p.wholesale}-${p.wholesale_discount ?? ''}-${p.wholesale_discount_12 ?? ''}-${p.wholesale_discount_30 ?? ''}`} p={p} onSave={(patch) => saveWholesale(p, patch)} />)}
                {prods.length === 0 && <li className="lxp-empty">Todavía no hay perfumes. Crea el primero en la pestaña Perfumes.</li>}
              </ul>
            </>
          )}
        </>
      )}
    </>
  )
}

// Miniatura: si la foto no carga (por ejemplo una ruta vieja), muestra "Sin foto" en vez del ícono roto
function Thumb({ src }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  return src && !failed ? <img src={asset(src)} alt="" onError={() => setFailed(true)} /> : <span className="lxp-thumb-empty">{src ? 'No carga' : 'Sin foto'}</span>
}

// Fotos: la primera es la portada. Con `single` solo se puede tener una (se reemplaza al subir otra).
function PhotoList({ photos, onChange, single = false, addLabel = '+ Foto', main = false, cutout = false }) {
  const [busy, setBusy] = useState(false)
  const [noBg, setNoBg] = useState(true)
  const [error, setError] = useState('')

  const add = async (e) => {
    const files = [...(e.target.files || [])]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const urls = []
      for (let f of single ? files.slice(0, 1) : files) {
        if (cutout && noBg) {
          try {
            f = await cutoutFile(f)
          } catch (err) {
            setError(`No pude quitar el fondo (${err.message}). Subí la foto tal cual: usa una con fondo liso o recórtala antes.`)
          }
        }
        urls.push(await store.uploadImage(f))
      }
      onChange(single ? urls : [...photos, ...urls])
    } catch (err) {
      setError(`No se pudo subir la foto: ${err.message || 'error'}`)
    } finally {
      setBusy(false)
    }
  }
  const move = (i, d) => {
    const next = [...photos]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }

  return (
    <>
      {cutout && (
        <label className="lxp-check"><input type="checkbox" checked={noBg} onChange={(e) => setNoBg(e.target.checked)} /> Quitar el fondo de la foto al subirla (para que salga limpia en la portada)</label>
      )}
      <div className="lxp-photos">
        {photos.map((src, i) => (
          <div className="lxp-photo" key={src + i}>
            <img src={asset(src)} alt="" />
            {main && i === 0 && <span className="lxp-photo__main">Portada</span>}
            <div className="lxp-photo__bar">
              {!single && <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda">◀</button>}
              {!single && <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Mover a la derecha">▶</button>}
              <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))}>Quitar</button>
            </div>
          </div>
        ))}
        {(!single || photos.length === 0) && (
          <label className="lxp-photo lxp-photo--add">
            {busy ? 'Subiendo…' : addLabel}
            <input type="file" accept="image/*" multiple={!single} hidden onChange={add} disabled={busy} />
          </label>
        )}
      </div>
      {error && <p className="lxp-error" role="alert">{error}</p>}
    </>
  )
}

// Fecha y hora para el campo datetime-local (en la hora del computador)
const toInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
const fmt = (ms) => new Date(ms).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

// Pestaña Ofertas: opciones fijas del menú (Combos, Oferta relámpago, Kits), la oferta relámpago y los combos y kits
function OffersTab({ data, onSettings, onNew, onEdit, onDelete }) {
  const st = data.settings || {}
  const covers = st.covers || {}
  const active = st.flash_active !== false
  const [ends, setEnds] = useState(toInput(st.flash_ends_at))
  const endMs = st.flash_ends_at ? new Date(st.flash_ends_at).getTime() : null
  const over = endMs !== null && endMs <= Date.now()
  const deals = data.products.filter((p) => p.active && Number(p.discount_percent) > 0 && Number(p.stock) > 0).length
  const status = !active ? 'Apagada: no se ve en la tienda.'
    : over ? 'Ya terminó: se quitó sola de la tienda. Ponle una hora nueva para volver a mostrarla.'
      : deals === 0 ? 'Activa y visible, pero ningún perfume tiene descuento todavía: la tienda muestra el aviso “estamos preparando las ofertas”. Ponle “Descuento %” a un perfume para que aparezca.'
        : endMs ? `Activa hasta el ${fmt(endMs)}. Después se quita sola.` : 'Activa: termina cada día a las 11:59 pm y empieza de nuevo al día siguiente.'
  const setEnd = (date) => {
    setEnds(date ? toInput(date.toISOString()) : '')
    onSettings({ flash_active: true, flash_ends_at: date ? date.toISOString() : null })
  }
  const inHours = (h) => new Date(Date.now() + h * 3600 * 1000)
  const todayEnd = () => { const d = new Date(); d.setHours(23, 59, 0, 0); return d }
  const priceOf = (b) => {
    const full = (b.items || []).reduce((t, i) => t + (Number(data.products.find((p) => String(p.id) === String(i.id))?.price) || 0) * (Number(i.qty) || 0), 0)
    return Math.round((full * (1 - (Number(b.discount_percent) || 0) / 100)) / 1000) * 1000
  }
  const nameOf = (id) => data.products.find((p) => String(p.id) === String(id))?.name || 'Perfume borrado'

  return (
    <>
      <h2 className="lxp-h2">Oferta relámpago</h2>
      <p className="lxp-help">Muestra los perfumes que tengan “Descuento %” puesto. Aparece en el menú, en el inicio y en su página mientras esté activa, y cuando llega la hora de fin se quita sola.</p>
      <div className="lxp-box">
        <label className="lxp-check lxp-check--card">
          <input type="checkbox" checked={active} onChange={(e) => onSettings({ flash_active: e.target.checked })} />
          <span><b>Mostrar la oferta relámpago en la tienda</b><small className="lxp-help">{status}</small></span>
        </label>
        <div className="lxp-row">
          <label>Termina el día y la hora
            <input type="datetime-local" value={ends} onChange={(e) => setEnds(e.target.value)} />
          </label>
          <button type="button" className="lxp-btn lxp-btn--solid" disabled={!ends} onClick={() => setEnd(new Date(ends))}>Guardar hora</button>
        </div>
        <div className="lxp-quick">
          <span>Atajos:</span>
          <button type="button" className="lxp-btn" onClick={() => setEnd(todayEnd())}>Hasta hoy 11:59 pm</button>
          <button type="button" className="lxp-btn" onClick={() => setEnd(inHours(6))}>6 horas</button>
          <button type="button" className="lxp-btn" onClick={() => setEnd(inHours(24))}>24 horas</button>
          <button type="button" className="lxp-btn" onClick={() => setEnd(inHours(72))}>3 días</button>
          <button type="button" className="lxp-btn" onClick={() => setEnd(null)}>Sin hora (cada día a las 11:59 pm)</button>
          <button type="button" className="lxp-btn" onClick={() => onSettings({ flash_active: false })}>Quitar ahora</button>
        </div>
      </div>

      <h2 className="lxp-h2">Opciones fijas del menú</h2>
      <p className="lxp-help">Son las tres opciones de ofertas del menú “Colección”. Aquí cambias la foto que sale al pasar el mouse. Si no subes una, usan la de Louryx.</p>
      <ul className="lxp-list lxp-list--cats">
        {[['combo', 'Combos emprendedores', '/combos'], ['flash', 'Oferta relámpago', '/oferta-relampago'], ['kit', 'Kits', '/kits']].map(([key, title, to]) => (
          <li key={key}>
            <Thumb src={covers[key]} />
            <span className="lxp-list__info"><strong>{title}</strong><small>{to}</small></span>
            <PhotoList photos={covers[key] ? [covers[key]] : []} single addLabel="+ Foto" onChange={(a) => onSettings({ covers: { ...covers, [key]: a[0] || '' } })} />
          </li>
        ))}
      </ul>

      <h2 className="lxp-h2">Combos y kits</h2>
      <p className="lxp-help">
        Cada combo o kit junta varios perfumes con un descuento extra. El precio se calcula solo con los precios de los perfumes.
        {data.bundles.length === 0 && ' Todavía no has creado ninguno: la tienda muestra unos de ejemplo hasta que crees el primero.'}
      </p>
      <div className="lxp-quick">
        <button type="button" className="lxp-btn lxp-btn--solid" onClick={() => onNew('combo')}>+ Nuevo combo</button>
        <button type="button" className="lxp-btn lxp-btn--solid" onClick={() => onNew('kit')}>+ Nuevo kit</button>
      </div>
      <ul className="lxp-list">
        {data.bundles.map((b) => (
          <li key={b.id} className={b.active === false ? 'off' : ''}>
            <span className="lxp-thumb-empty">{b.type === 'kit' ? 'Kit' : 'Combo'}</span>
            <span className="lxp-list__info">
              <strong>{b.name}</strong>
              <small>{(b.items || []).map((i) => `${i.qty} × ${nameOf(i.id)}`).join(' · ') || 'Sin perfumes'}</small>
              <small>{money(priceOf(b))}{b.discount_percent > 0 ? ` · ${b.discount_percent}% menos` : ''}{b.active === false ? ' · oculto' : ''}</small>
            </span>
            <button type="button" onClick={() => onEdit(b)}>Editar</button>
            <button type="button" onClick={() => onDelete(b)}>Borrar</button>
          </li>
        ))}
      </ul>
    </>
  )
}

// Formulario de combo o kit
function BundleForm({ initial, products, onSaved, onCancel }) {
  const [f, set, bind] = useForm(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const kind = f.type === 'kit' ? 'kit' : 'combo'
  const setItem = (i, patch) => set({ items: f.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) })
  const items = f.items.filter((it) => it.id && Number(it.qty) > 0)
  const full = items.reduce((t, it) => t + (Number(products.find((p) => String(p.id) === String(it.id))?.price) || 0) * Number(it.qty), 0)
  const off = Math.min(90, Math.max(0, Math.round(Number(f.off)) || 0))
  const price = Math.round((full * (1 - off / 100)) / 1000) * 1000

  const submit = async (e) => {
    e.preventDefault()
    if (!items.length) return setError('Agrega al menos un perfume.')
    setBusy(true)
    setError('')
    try {
      await store.saveBundle({
        ...(f.id ? { id: f.id } : {}),
        type: kind, name: f.name.trim(), blurb: f.blurb.trim() || null, discount_percent: off, active: f.active,
        items: items.map((it) => ({ id: String(it.id), qty: Math.round(Number(it.qty)) })),
      })
      return onSaved()
    } catch (err) {
      setError(`No se pudo guardar: ${err.message || 'error'}`)
      return setBusy(false)
    }
  }

  return (
    <form className="lxp-form" onSubmit={submit}>
      <h2>{f.id ? 'Editar' : 'Nuevo'} {kind === 'kit' ? 'kit' : 'combo'}</h2>
      <div className="lxp-row">
        <label>Tipo
          <select {...bind('type')}><option value="combo">Combo emprendedor</option><option value="kit">Kit</option></select>
        </label>
        <label>Nombre<input required autoFocus {...bind('name')} /></label>
      </div>
      <label>Descripción corta<textarea rows="2" {...bind('blurb')} /></label>

      <h3>Perfumes que incluye</h3>
      {products.length === 0 && <p className="lxp-help">Primero crea perfumes en la pestaña Perfumes.</p>}
      {f.items.map((it, i) => (
        <div className="lxp-row lxp-items" key={i}>
          <label>Perfume
            <select value={it.id} onChange={(e) => setItem(i, { id: e.target.value })}>
              <option value="">Elige un perfume</option>
              {products.map((p) => <option key={p.id} value={String(p.id)}>{p.name} · {money(Number(p.price) || 0)}</option>)}
            </select>
          </label>
          <label>Cantidad<input type="number" min="1" step="1" inputMode="numeric" value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value })} /></label>
          <button type="button" className="lxp-btn" onClick={() => set({ items: f.items.filter((_, k) => k !== i) })}>Quitar</button>
        </div>
      ))}
      <button type="button" className="lxp-btn" onClick={() => set({ items: [...f.items, { id: '', qty: 1 }] })}>+ Agregar perfume</button>

      <div className="lxp-row">
        <label>Descuento (%)<input type="number" min="0" max="90" step="1" inputMode="numeric" {...bind('off')} />
          <small className="lxp-help">{full > 0 ? `Suman ${money(full)} y quedan en ${money(price)}.` : 'Elige los perfumes para ver el precio.'}</small>
        </label>
        <label className="lxp-check"><input type="checkbox" checked={f.active} onChange={(e) => set({ active: e.target.checked })} /> Visible en la tienda</label>
      </div>
      {error && <p className="lxp-error" role="alert">{error}</p>}
      <Actions busy={busy} onCancel={onCancel} />
    </form>
  )
}

function useForm(initial) {
  const [f, setF] = useState(initial)
  const set = (patch) => setF((cur) => ({ ...cur, ...patch }))
  const bind = (k) => ({
    value: f[k] ?? '',
    onChange: (e) => set({ [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }),
  })
  return [f, set, bind]
}

function Actions({ busy, onCancel }) {
  return (
    <div className="lxp-actions">
      <button className="lxp-btn lxp-btn--solid" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      <button type="button" className="lxp-btn" onClick={onCancel}>Cancelar</button>
    </div>
  )
}

function ProductForm({ initial, cats, onSaved, onCancel }) {
  const [f, set, bind] = useForm(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const price = Number(f.price)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await store.saveProduct({
        ...(f.id ? { id: f.id } : {}),
        name: f.name.trim(), description: f.description.trim(), price: price || 0, category_id: f.category_id || null,
        badge: f.badge.trim() || null, active: f.active, wholesale: f.wholesale, family: f.family || null, size_ml: Number(f.size_ml) || 100,
        featured: f.featured, is_new: f.is_new, image_url: f.cover || null, photos: f.extra,
        stock: Math.max(0, Math.round(Number(f.stock)) || 0),
        discount_percent: Number(f.discount) > 0 ? Math.min(90, Math.max(1, Math.round(Number(f.discount)))) : null,
      })
      onSaved()
    } catch (err) {
      setError(`No se pudo guardar: ${err.message || 'error'}`)
      setBusy(false)
    }
  }

  return (
    <form className="lxp-form" onSubmit={submit}>
      <h2>{f.id ? 'Editar perfume' : 'Nuevo perfume'}</h2>
      <label>Nombre<input required autoFocus {...bind('name')} /></label>
      <label>Descripción<textarea rows="4" {...bind('description')} /></label>
      <div className="lxp-row">
        <label>Precio (pesos)<input required type="number" min="0" step="1000" inputMode="numeric" {...bind('price')} />
          {price > 0 && <small className="lxp-help">Se verá como {money(price)}</small>}
        </label>
        <label>Categoría
          <select {...bind('category_id')}>
            <option value="">Sin categoría</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Etiqueta (Nuevo, Edición limitada…)<input {...bind('badge')} /></label>
      </div>
      <div className="lxp-row">
        <label>Aroma
          <select {...bind('family')}>
            <option value="">Sin aroma</option>
            {FAMILIES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>Tamaño (ml)<input type="number" min="1" {...bind('size_ml')} /></label>
      </div>
      <div className="lxp-row">
        <label>Cantidad disponible<input required type="number" min="0" step="1" inputMode="numeric" {...bind('stock')} />
          <small className="lxp-help">{Number(f.stock) > 0 ? 'Se puede comprar hasta esta cantidad.' : 'Con 0 sale como Agotado y no se puede comprar.'}</small>
        </label>
        <label>Descuento (%) — opcional<input type="number" min="1" max="90" step="1" inputMode="numeric" placeholder="Sin descuento" {...bind('discount')} />
          <small className="lxp-help">
            {price > 0 && Number(f.discount) > 0
              ? `Pasa de ${money(price)} a ${money(Math.round((price * (1 - Math.min(90, Number(f.discount)) / 100)) / 100) * 100)}.`
              : 'Déjalo vacío si no tiene descuento.'}
          </small>
        </label>
      </div>

      <label className="lxp-check lxp-check--card">
        <input type="checkbox" checked={f.wholesale} onChange={(e) => set({ wholesale: e.target.checked })} />
        <span>
          <b>Se puede vender al por mayor</b>
          <small className="lxp-help">
            {f.wholesale
              ? `Aparece en la página de Mayoristas desde ${STORE.wholesaleFrom} unidades. Su descuento mayorista se pone en la pestaña Mayoristas.`
              : 'No aparece en Mayoristas: solo se vende al detal.'}
          </small>
        </span>
      </label>
      <div className="lxp-checks">
        <label className="lxp-check"><input type="checkbox" checked={f.active} onChange={(e) => set({ active: e.target.checked })} /> Visible en la tienda</label>
        <label className="lxp-check"><input type="checkbox" checked={f.featured} onChange={(e) => set({ featured: e.target.checked })} /> Más vendido</label>
        <label className="lxp-check"><input type="checkbox" checked={f.is_new} onChange={(e) => set({ is_new: e.target.checked })} /> Nuevo ingreso (sale en la portada de inicio)</label>
      </div>

      <h3>Portada</h3>
      <p className="lxp-help">Es la foto principal del perfume: sale en el inicio, en el carrusel, en las tarjetas y como foto grande en su página. Mejor con fondo transparente o liso. Si subes otra, reemplaza a la anterior.</p>
      <PhotoList photos={f.cover ? [f.cover] : []} single addLabel="+ Portada" main cutout onChange={(a) => set({ cover: a[0] || '' })} />

      <h3>Fotos secundarias</h3>
      <p className="lxp-help">Otros ángulos o detalles (caja, tamaño, en mano…). En la página del perfume salen como miniaturas debajo de la foto grande.</p>
      <PhotoList photos={f.extra} addLabel="+ Foto" onChange={(a) => set({ extra: a })} />

      {error && <p className="lxp-error" role="alert">{error}</p>}
      <Actions busy={busy} onCancel={onCancel} />
    </form>
  )
}

function CategoryForm({ initial, onSaved, onCancel }) {
  const [f, set, bind] = useForm(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await store.saveCategory({ ...(f.id ? { id: f.id } : {}), name: f.name.trim(), sort: Number(f.sort) || 0, active: f.active, photo_url: f.photo || null })
      onSaved()
    } catch (err) {
      setError(`No se pudo guardar: ${err.message || 'error'}`)
      setBusy(false)
    }
  }

  return (
    <form className="lxp-form" onSubmit={submit}>
      <h2>{f.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
      <label>Nombre<input required autoFocus {...bind('name')} /></label>
      <div className="lxp-row">
        <label>Orden (menor sale primero)<input type="number" {...bind('sort')} /></label>
        <label className="lxp-check"><input type="checkbox" checked={f.active} onChange={(e) => set({ active: e.target.checked })} /> Visible en la tienda</label>
      </div>
      <h3>Portada de la categoría</h3>
      <p className="lxp-help">Es la foto que sale en el menú “Colección” y en las colecciones del inicio. Mejor vertical (4:5). Si subes otra, reemplaza a la anterior.</p>
      <PhotoList photos={f.photo ? [f.photo] : []} single addLabel="+ Foto" onChange={(a) => set({ photo: a[0] || '' })} />
      {error && <p className="lxp-error" role="alert">{error}</p>}
      <Actions busy={busy} onCancel={onCancel} />
    </form>
  )
}

const KEYS = ['wholesale_discount', 'wholesale_discount_12', 'wholesale_discount_30']
const toPct = (v) => (Number(v) > 0 ? Math.min(90, Math.max(1, Math.round(Number(v)))) : null)

// Aplicar los mismos descuentos mayoristas a todos los perfumes
function WholesaleBulk({ onApply }) {
  const [v, setV] = useState(['', '', ''])
  return (
    <div className="lxp-bulk">
      {STORE.wholesaleTiers.map((t, i) => (
        <label key={t}>Desde {t} u. (%)
          <input type="number" min="1" max="90" step="1" inputMode="numeric" value={v[i]} placeholder={i === 0 ? `Ej. ${Math.round(STORE.wholesaleDiscount * 100)}` : 'Vacío'} onChange={(e) => setV(v.map((x, k) => (k === i ? e.target.value : x)))} />
        </label>
      ))}
      <button type="button" className="lxp-btn" onClick={() => onApply(Object.fromEntries(KEYS.map((k, i) => [k, toPct(v[i])])))}>Aplicar a todos</button>
    </div>
  )
}

// Una fila de la pestaña Mayoristas: si el perfume se vende al por mayor y el descuento de cada escalón
function WholesaleRow({ p, onSave }) {
  const [v, setV] = useState(KEYS.map((k) => p[k] ?? ''))
  const general = Math.round(STORE.wholesaleDiscount * 100)
  const price = Number(p.price) || 0
  const d1 = toPct(v[0]) ?? general
  const d2 = toPct(v[1]) ?? d1
  const shown = [d1, d2, toPct(v[2]) ?? d2]

  const commit = (i) => {
    const next = toPct(v[i])
    if (next !== (p[KEYS[i]] ?? null)) onSave({ [KEYS[i]]: next })
  }

  return (
    <li className={p.wholesale ? '' : 'off'}>
      <Thumb src={p.image_url} />
      <span className="lxp-list__info">
        <strong>{p.name}</strong>
        <small>Precio normal {money(price)}</small>
        {p.wholesale && <small>{STORE.wholesaleTiers.map((t, i) => `Desde ${t}: ${money(wholesalePrice(price, shown[i]))}`).join(' · ')} c/u</small>}
      </span>
      <label className="lxp-check lxp-ws-on">
        <input type="checkbox" checked={Boolean(p.wholesale)} onChange={(e) => onSave({ wholesale: e.target.checked })} /> Al por mayor
      </label>
      {STORE.wholesaleTiers.map((t, i) => (
        <label key={t} className="lxp-ws-pct">Desde {t} u. (%)
          <input
            type="number" min="1" max="90" step="1" inputMode="numeric" value={v[i]} placeholder={i === 0 ? `General ${general}` : 'Igual al anterior'} disabled={!p.wholesale}
            onChange={(e) => setV(v.map((x, k) => (k === i ? e.target.value : x)))} onBlur={() => commit(i)} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        </label>
      ))}
    </li>
  )
}
