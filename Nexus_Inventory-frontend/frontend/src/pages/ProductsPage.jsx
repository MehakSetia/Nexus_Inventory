import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductDetailModal from '../components/ProductDetailModal.jsx';

function ProductCard({ p, onClick }) {
  const image   = p.imageUrl;
  const inStock = p.quantity > 0;
  return (
    <div
      className="card product-card"
      onClick={() => onClick(p)}
      id={`card-${p._id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(p)}
      aria-label={`View ${p.name}`}
    >
      <div className="product-img">
        {image
          ? <img src={image} alt={p.name} />
          : <span className="no-img">🖼️</span>
        }
        {!inStock && <div className="product-ribbon">Out of stock</div>}
      </div>
      <div className="product-body">
        <span className="product-cat">{p.category}</span>
        <div className="product-name">{p.name}</div>
        {p.vendor?.name && <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '-0.1rem', marginBottom: '0.2rem' }}>by <span style={{ color: 'var(--text)' }}>{p.vendor.name}</span></div>}
        {p.description && <div className="product-desc">{p.description}</div>}
        <div className="product-footer">
          <span className="product-price">₹{p.price?.toLocaleString('en-IN')}</span>
          <span className={inStock ? 'product-stock-ok' : 'product-stock-out'}>
            {inStock ? `${p.quantity} left` : 'Sold out'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ api }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const obj = {};
    for (const key of ['category','minPrice','maxPrice','search','sort','page','limit']) {
      const v = searchParams.get(key);
      if (v) obj[key] = v;
    }
    return obj;
  }, [searchParams]);

  const [data,     setData]     = useState({ products:[], total:0, page:1, pages:0 });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState(null);

  // Controlled filter inputs
  const [q,    setQ]    = useState(filters.search   || '');
  const [cat,  setCat]  = useState(filters.category || '');
  const [min,  setMin]  = useState(filters.minPrice || '');
  const [max,  setMax]  = useState(filters.maxPrice || '');
  const [sort, setSort] = useState(filters.sort     || '');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.get('/api/product', { params: filters })
      .then((r) => { if (active) setData(r.data); })
      .catch((e) => { if (active) setError(e?.response?.data?.message || 'Failed to load'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, filters]);

  const applyFilters = useCallback(() => {
    const next = {};
    if (q)    next.search   = q;
    if (cat)  next.category = cat;
    if (min)  next.minPrice = min;
    if (max)  next.maxPrice = max;
    if (sort) next.sort     = sort;
    setSearchParams(next);
  }, [q, cat, min, max, sort, setSearchParams]);

  return (
    <>
      <ProductDetailModal product={selected} onClose={useCallback(() => setSelected(null), [])} />

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Browse Products</h2>
          {!loading && <p style={{ color:'var(--text-2)', fontSize:'0.85rem', marginTop:'0.2rem' }}>
            {data.total ?? 0} products · click any card to see details
          </p>}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input className="input" placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&applyFilters()} id="f-search" />
        <input className="input" placeholder="Category" value={cat} onChange={(e)=>setCat(e.target.value)} id="f-cat" />
        <input className="input" type="number" placeholder="Min ₹" value={min} onChange={(e)=>setMin(e.target.value)} style={{maxWidth:100}} id="f-min" />
        <input className="input" type="number" placeholder="Max ₹" value={max} onChange={(e)=>setMax(e.target.value)} style={{maxWidth:100}} id="f-max" />
        <select className="select" value={sort} onChange={(e)=>setSort(e.target.value)} style={{flex:'0 0 130px'}} id="f-sort">
          <option value="">Sort by</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={applyFilters} id="btn-search">Search</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>{ setQ('');setCat('');setMin('');setMax('');setSort('');setSearchParams({}); }} id="btn-clear">Clear</button>
      </div>

      {/* States */}
      {error && <div className="alert-error" style={{marginBottom:'1rem'}}>{error}</div>}

      {loading ? (
        <div className="page-loader"><div className="spinner" /><span>Loading products…</span></div>
      ) : data.products?.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <p>No products found.</p>
        </div>
      ) : (
        <div className="grid-3">
          {data.products.map((p) => (
            <ProductCard key={p._id} p={p} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'center', marginTop:'2rem' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSearchParams({...filters, page: Math.max(1,(Number(data.page)||1)-1)})}
            disabled={Number(data.page) <= 1}
            id="btn-prev"
          >← Prev</button>
          <span style={{ fontSize:'0.85rem', color:'var(--text-2)' }}>Page {data.page} / {data.pages}</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setSearchParams({...filters, page: Number(data.page||1)+1})}
            disabled={Number(data.page) >= Number(data.pages)}
            id="btn-next"
          >Next →</button>
        </div>
      )}
    </>
  );
}
