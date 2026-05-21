import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductImage } from '../utils/imageStore.js';

export default function EditProductPage({ api }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantityDelta, setQuantityDelta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get(`/api/product/${id}`);
        if (!active) return;
        setProduct(res.data);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || 'Failed to load product');
      }
    }
    load();
    return () => { active = false; };
  }, [api, id]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch(`/api/product/${id}/update`, { quantity: Number(quantityDelta) });
      navigate('/vendor/products');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  }

  if (error && !product) {
    return (
      <div className="empty">
        <div className="empty-icon">⚠️</div>
        <p>{error}</p>
        <Link to="/vendor/products" className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to My Products</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="page-loader"><div className="spinner" /><span>Loading product details…</span></div>;
  }

  const image = getProductImage(product._id);
  const projectedStock = product.quantity + (Number(quantityDelta) || 0);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: '1rem' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
           <Link to="/vendor/products" style={{ color: 'var(--text-2)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
            ← Back to products
          </Link>
          <h2>Manage Stock</h2>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 80, height: 80, borderRadius: 'var(--radius)', background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {image ? (
               <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
               <span style={{ fontSize: '1.5rem', opacity: 0.2 }}>🖼️</span>
             )}
          </div>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.25rem' }}>{product.category}</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>{product.name}</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-2)' }}>Price: <strong style={{ color: 'var(--heading)' }}>₹{product.price.toLocaleString('en-IN')}</strong></span>
              <span style={{ color: 'var(--text-2)' }}>Current Stock: <strong style={{ color: 'var(--heading)' }}>{product.quantity}</strong></span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="field">
            <label className="label">Stock Adjustment</label>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: '0.5rem' }}>
              Enter a positive number to add stock, or a negative number to reduce stock.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                className="input" 
                type="number" 
                placeholder="+10 or -5" 
                value={quantityDelta} 
                onChange={(e) => setQuantityDelta(e.target.value)} 
                required 
                style={{ flex: 1 }}
              />
              <div style={{ padding: '0.65rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                New total: <strong style={{ color: projectedStock < 0 ? 'var(--red)' : 'var(--green)' }}>{projectedStock}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/vendor/products" className="btn btn-ghost">Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={loading || projectedStock < 0}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }}/> Updating…</> : 'Save Stock Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
