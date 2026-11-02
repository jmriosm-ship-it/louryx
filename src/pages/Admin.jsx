import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as store from '../lib/catalogStore'
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
        <p className="ad-error">Esta cuenta ({session.user.email}) no tiene permiso de administrador.</p>
        <button type="button" className="ad-btn" onClick={store.signOut}>Salir</button>
      </>
    )
  } else body = <Panel />

  return <main className="ad"><div className="ad-in">{body}</div></main>
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
    <form className="ad-login" onSubmit={submit}>
      <h1>Panel de administración</h1>
      <label>Correo<input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
      <label>Contraseña<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
      {error && <p className="ad-error" role="alert">{error}</p>}
      <button className="ad-btn ad-btn--solid" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
  )
}

function Panel() {
  const { reload: reloadShop } = useCatalog()
  const [data, setData] = useState({ categories: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('perfumes')
  const [editing, setEditing] = useState(null) // { kind: 'product' | 'category', data }
  const [filter, setFilter] = useState('')
  const [msg, setMsg] = useState('')
  const [importing, setImporting] = useState(false)

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

  // Suma o resta una unidad sin abrir el formulario (para llevar el inventario al día)
  const setStock = (p, n) => attempt(() => store.saveProduct({ id: p.id, stock: Math.max(0, n) }), 'Cantidad actualizada')
  const saveWholesale = (p, patch) => attempt(() => store.saveProduct({ id: p.id, ...patch }), 'Mayorista guardado')
  // Pone el mismo descuento mayorista a todos los perfumes (o lo quita si va vacío)
  const applyWholesaleToAll = (pct) =>
    window.confirm(pct ? `¿Poner ${pct}% de descuento mayorista a los ${data.products.length} perfumes?` : '¿Quitar el descuento propio de todos los perfumes? Usarán el general.') &&
    attempt(async () => { for (const p of data.products) await store.saveProduct({ id: p.id, wholesale_discount: pct || null }) }, 'Descuento mayorista aplicado')
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

  const shown = prods.filter((p) => !filter || p.category_id === filter)

  return (
    <>
      <header className="ad-top">
        <h1>Panel de administración</h1>
        <div>
          <Link to="/" className="ad-link">Ver la tienda</Link>
          {!store.isLocal && <button type="button" className="ad-link" onClick={store.signOut}>Salir</button>}
        </div>
      </header>

      {editing?.kind === 'product' && <ProductForm initial={editing.data} cats={cats} onSaved={() => done('Perfume guardado')} onCancel={() => setEditing(null)} />}
      {editing?.kind === 'category' && <CategoryForm initial={editing.data} onSaved={() => done('Categoría guardada')} onCancel={() => setEditing(null)} />}

      {!editing && (
        <>
          {store.isLocal && (
            <p className="ad-note">
              <b>Modo de prueba.</b> Todavía no hay una base de datos conectada: lo que crees aquí solo se guarda en este navegador y no lo verán tus clientes.
            </p>
          )}
          {msg && <p className="ad-ok" role="status">{msg}</p>}

          <nav className="ad-tabs">
            <button type="button" className={tab === 'perfumes' ? 'on' : ''} onClick={() => { setTab('perfumes'); setMsg('') }}>Perfumes ({data.products.length})</button>
            <button type="button" className={tab === 'categorias' ? 'on' : ''} onClick={() => { setTab('categorias'); setMsg('') }}>Categorías ({data.categories.length})</button>
            <button type="button" className={tab === 'mayoristas' ? 'on' : ''} onClick={() => { setTab('mayoristas'); setMsg('') }}>Mayoristas ({data.products.filter((p) => p.wholesale).length})</button>
          </nav>

          {loading && <p>Cargando…</p>}

          {!loading && tab === 'perfumes' && (
            <>
              <button type="button" className="ad-btn ad-btn--solid ad-btn--big" onClick={() => newProduct(filter)}>+ Nuevo perfume</button>
              {data.categories.length > 1 && (
                <label className="ad-filter">Categoría
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="">Todas</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
              {data.products.length === 0 ? (
                <div className="ad-empty">
                  <p>Todavía no hay perfumes en el panel. La tienda está mostrando los perfumes de ejemplo.</p>
                  <p className="ad-help">Empieza de cero con “Nuevo perfume”, o carga los {EXAMPLE_PRODUCTS.length} perfumes actuales para editarlos desde aquí.</p>
                  <button type="button" className="ad-btn" onClick={importExamples} disabled={importing}>{importing ? 'Cargando…' : 'Cargar los perfumes actuales'}</button>
                </div>
              ) : (
                <ul className="ad-list">
                  {shown.map((p) => (
                    <li key={p.id} className={p.active ? '' : 'off'}>
                      <Thumb src={p.image_url} />
                      <span className="ad-list__info">
                        <strong>{p.name}</strong>
                        <small>{catName(p.category_id)} · {money(Number(p.price) || 0)}</small>
                        <small>
                          <span className={`ad-badge ${p.wholesale ? 'ad-badge--ok' : ''}`}>{p.wholesale ? 'Al por mayor' : 'Solo detal'}</span>
                          {!p.active && <span className="ad-badge ad-badge--out">Oculto</span>}
                          {p.discount_percent > 0 && <span className="ad-badge">-{p.discount_percent}%</span>}
                        </small>
                        <small className="ad-stock">
                          Cantidad:
                          <button type="button" aria-label="Quitar una unidad" onClick={() => setStock(p, (Number(p.stock) || 0) - 1)} disabled={(Number(p.stock) || 0) <= 0}>−</button>
                          <b>{Number(p.stock) || 0}</b>
                          <button type="button" aria-label="Agregar una unidad" onClick={() => setStock(p, (Number(p.stock) || 0) + 1)}>+</button>
                          {(Number(p.stock) || 0) <= 0 && <span className="ad-badge ad-badge--out">Agotado</span>}
                        </small>
                      </span>
                      <button type="button" onClick={() => editProduct(p)}>Editar</button>
                      <button type="button" onClick={() => removeProduct(p)}>Borrar</button>
                    </li>
                  ))}
                  {shown.length === 0 && <li className="ad-empty">Esta categoría todavía no tiene perfumes.</li>}
                </ul>
              )}
            </>
          )}

          {!loading && tab === 'categorias' && (
            <>
              <button type="button" className="ad-btn ad-btn--solid ad-btn--big" onClick={() => setEditing({ kind: 'category', data: { name: '', sort: data.categories.length, active: true, photo: '' } })}>+ Nueva categoría</button>
              <ul className="ad-list ad-list--cats">
                {cats.map((c) => (
                  <li key={c.id} className={c.active ? '' : 'off'}>
                    <Thumb src={c.photo_url} />
                    <span className="ad-list__info">
                      <strong>{c.name}</strong>
                      <small>{countOf(c.id)} {countOf(c.id) === 1 ? 'perfume' : 'perfumes'}{c.active ? '' : ' · oculta'}</small>
                    </span>
                    <button type="button" className="ad-btn--solid" onClick={() => { newProduct(c.id); setTab('perfumes') }}>+ Crear producto</button>
                    <button type="button" onClick={() => setEditing({ kind: 'category', data: { id: c.id, name: c.name, sort: c.sort, active: c.active, photo: c.photo_url ?? '' } })}>Editar</button>
                    <button type="button" onClick={() => removeCategory(c)}>Borrar</button>
                  </li>
                ))}
                {cats.length === 0 && <li className="ad-empty">Todavía no hay categorías. Crea la primera con “Nueva categoría”.</li>}
              </ul>
            </>
          )}

          {!loading && tab === 'mayoristas' && (
            <>
              <p className="ad-help">
                Aquí decides, para cada perfume, si se vende al por mayor y cuánto descuento tiene. El descuento se aplica solo en la página de Mayoristas,
                cuando piden {STORE.wholesaleFrom} o más unidades de ese perfume; en la tienda normal el precio no cambia.
                Si dejas el descuento vacío, se usa el general ({Math.round(STORE.wholesaleDiscount * 100)}%).
              </p>
              {data.products.length > 0 && <WholesaleBulk onApply={applyWholesaleToAll} />}
              <ul className="ad-list ad-list--ws">
                {prods.map((p) => <WholesaleRow key={`${p.id}-${p.wholesale}-${p.wholesale_discount ?? ''}`} p={p} onSave={(patch) => saveWholesale(p, patch)} />)}
                {prods.length === 0 && <li className="ad-empty">Todavía no hay perfumes. Crea el primero en la pestaña Perfumes.</li>}
              </ul>
            </>
          )}
        </>
      )}
    </>
  )
}

const Thumb = ({ src }) => (src ? <img src={asset(src)} alt="" /> : <span className="ad-thumb-empty">Sin foto</span>)

// Fotos: la primera es la portada. Con `single` solo se puede tener una (se reemplaza al subir otra).
function PhotoList({ photos, onChange, single = false, addLabel = '+ Foto', main = false }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const add = async (e) => {
    const files = [...(e.target.files || [])]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const urls = []
      for (const f of single ? files.slice(0, 1) : files) urls.push(await store.uploadImage(f))
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
      <div className="ad-photos">
        {photos.map((src, i) => (
          <div className="ad-photo" key={src + i}>
            <img src={asset(src)} alt="" />
            {main && i === 0 && <span className="ad-photo__main">Portada</span>}
            <div className="ad-photo__bar">
              {!single && <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda">◀</button>}
              {!single && <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Mover a la derecha">▶</button>}
              <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))}>Quitar</button>
            </div>
          </div>
        ))}
        {(!single || photos.length === 0) && (
          <label className="ad-photo ad-photo--add">
            {busy ? 'Subiendo…' : addLabel}
            <input type="file" accept="image/*" multiple={!single} hidden onChange={add} disabled={busy} />
          </label>
        )}
      </div>
      {error && <p className="ad-error" role="alert">{error}</p>}
    </>
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
    <div className="ad-actions">
      <button className="ad-btn ad-btn--solid" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      <button type="button" className="ad-btn" onClick={onCancel}>Cancelar</button>
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
    <form className="ad-form" onSubmit={submit}>
      <h2>{f.id ? 'Editar perfume' : 'Nuevo perfume'}</h2>
      <label>Nombre<input required autoFocus {...bind('name')} /></label>
      <label>Descripción<textarea rows="4" {...bind('description')} /></label>
      <div className="ad-row">
        <label>Precio (pesos)<input required type="number" min="0" step="1000" inputMode="numeric" {...bind('price')} />
          {price > 0 && <small className="ad-help">Se verá como {money(price)}</small>}
        </label>
        <label>Categoría
          <select {...bind('category_id')}>
            <option value="">Sin categoría</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Etiqueta (Nuevo, Edición limitada…)<input {...bind('badge')} /></label>
      </div>
      <div className="ad-row">
        <label>Aroma
          <select {...bind('family')}>
            <option value="">Sin aroma</option>
            {FAMILIES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>Tamaño (ml)<input type="number" min="1" {...bind('size_ml')} /></label>
      </div>
      <div className="ad-row">
        <label>Cantidad disponible<input required type="number" min="0" step="1" inputMode="numeric" {...bind('stock')} />
          <small className="ad-help">{Number(f.stock) > 0 ? 'Se puede comprar hasta esta cantidad.' : 'Con 0 sale como Agotado y no se puede comprar.'}</small>
        </label>
        <label>Descuento (%) — opcional<input type="number" min="1" max="90" step="1" inputMode="numeric" placeholder="Sin descuento" {...bind('discount')} />
          <small className="ad-help">
            {price > 0 && Number(f.discount) > 0
              ? `Pasa de ${money(price)} a ${money(Math.round((price * (1 - Math.min(90, Number(f.discount)) / 100)) / 100) * 100)}.`
              : 'Déjalo vacío si no tiene descuento.'}
          </small>
        </label>
      </div>

      <label className="ad-check ad-check--card">
        <input type="checkbox" checked={f.wholesale} onChange={(e) => set({ wholesale: e.target.checked })} />
        <span>
          <b>Se puede vender al por mayor</b>
          <small className="ad-help">
            {f.wholesale
              ? `Aparece en la página de Mayoristas desde ${STORE.wholesaleFrom} unidades. Su descuento mayorista se pone en la pestaña Mayoristas.`
              : 'No aparece en Mayoristas: solo se vende al detal.'}
          </small>
        </span>
      </label>
      <div className="ad-checks">
        <label className="ad-check"><input type="checkbox" checked={f.active} onChange={(e) => set({ active: e.target.checked })} /> Visible en la tienda</label>
        <label className="ad-check"><input type="checkbox" checked={f.featured} onChange={(e) => set({ featured: e.target.checked })} /> Más vendido</label>
        <label className="ad-check"><input type="checkbox" checked={f.is_new} onChange={(e) => set({ is_new: e.target.checked })} /> Nuevo ingreso</label>
      </div>

      <h3>Portada</h3>
      <p className="ad-help">Es la foto principal del perfume: sale en el inicio, en el carrusel, en las tarjetas y como foto grande en su página. Mejor con fondo transparente o liso. Si subes otra, reemplaza a la anterior.</p>
      <PhotoList photos={f.cover ? [f.cover] : []} single addLabel="+ Portada" main onChange={(a) => set({ cover: a[0] || '' })} />

      <h3>Fotos secundarias</h3>
      <p className="ad-help">Otros ángulos o detalles (caja, tamaño, en mano…). En la página del perfume salen como miniaturas debajo de la foto grande.</p>
      <PhotoList photos={f.extra} addLabel="+ Foto" onChange={(a) => set({ extra: a })} />

      {error && <p className="ad-error" role="alert">{error}</p>}
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
    <form className="ad-form" onSubmit={submit}>
      <h2>{f.id ? 'Editar categoría' : 'Nueva categoría'}</h2>
      <label>Nombre<input required autoFocus {...bind('name')} /></label>
      <div className="ad-row">
        <label>Orden (menor sale primero)<input type="number" {...bind('sort')} /></label>
        <label className="ad-check"><input type="checkbox" checked={f.active} onChange={(e) => set({ active: e.target.checked })} /> Visible en la tienda</label>
      </div>
      <h3>Portada de la categoría</h3>
      <p className="ad-help">Es la foto que sale en el menú “Colección” y en las colecciones del inicio. Mejor vertical (4:5). Si subes otra, reemplaza a la anterior.</p>
      <PhotoList photos={f.photo ? [f.photo] : []} single addLabel="+ Foto" onChange={(a) => set({ photo: a[0] || '' })} />
      {error && <p className="ad-error" role="alert">{error}</p>}
      <Actions busy={busy} onCancel={onCancel} />
    </form>
  )
}

// Aplicar el mismo descuento mayorista a todos los perfumes
function WholesaleBulk({ onApply }) {
  const [pct, setPct] = useState('')
  return (
    <div className="ad-bulk">
      <label>Mismo descuento para todos (%)
        <input type="number" min="1" max="90" step="1" inputMode="numeric" value={pct} placeholder="Ej. 15" onChange={(e) => setPct(e.target.value)} />
      </label>
      <button type="button" className="ad-btn" onClick={() => onApply(pct ? Math.min(90, Math.max(1, Math.round(Number(pct)))) : null)}>
        {pct ? 'Aplicar a todos' : 'Quitar el descuento propio de todos'}
      </button>
    </div>
  )
}

// Una fila de la pestaña Mayoristas: si el perfume se vende al por mayor y su descuento
function WholesaleRow({ p, onSave }) {
  const [pct, setPct] = useState(p.wholesale_discount ?? '')
  const general = Math.round(STORE.wholesaleDiscount * 100)
  const shown = Number(pct) > 0 ? Math.min(90, Math.round(Number(pct))) : general
  const price = Number(p.price) || 0

  const commit = () => {
    const next = Number(pct) > 0 ? Math.min(90, Math.max(1, Math.round(Number(pct)))) : null
    if (next !== (p.wholesale_discount ?? null)) onSave({ wholesale_discount: next })
  }

  return (
    <li className={p.wholesale ? '' : 'off'}>
      <Thumb src={p.image_url} />
      <span className="ad-list__info">
        <strong>{p.name}</strong>
        <small>Precio normal {money(price)}</small>
        {p.wholesale && <small>Desde {STORE.wholesaleFrom} unidades: {money(wholesalePrice(price, shown))} c/u ({shown}% menos){Number(pct) > 0 ? '' : ' · descuento general'}</small>}
      </span>
      <label className="ad-check ad-ws-on">
        <input type="checkbox" checked={Boolean(p.wholesale)} onChange={(e) => onSave({ wholesale: e.target.checked })} /> Al por mayor
      </label>
      <label className="ad-ws-pct">Descuento (%)
        <input
          type="number" min="1" max="90" step="1" inputMode="numeric" value={pct} placeholder={`General ${general}`} disabled={!p.wholesale}
          onChange={(e) => setPct(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
      </label>
    </li>
  )
}
