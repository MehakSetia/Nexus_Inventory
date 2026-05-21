import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
export default function AddProductPage({ api }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', category: 'Electronics', quantity: '', price: '', description: '',
    dimLength: '', dimWidth: '', dimHeight: '', dimUnit: 'cm', imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity),
        price: Number(form.price),
        description: form.description,
        imageUrl: form.imageUrl,
        dimensions: {
          length: Number(form.dimLength),
          width: Number(form.dimWidth),
          height: Number(form.dimHeight),
          unit: form.dimUnit
        }
      };
      
      await api.post('/api/product/add', payload);

      navigate('/vendor/products');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <Link to="/vendor/products" style={{ color: 'var(--text-2)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
            ← Back to products
          </Link>
          <h2>Add New Product</h2>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="field">
            <label className="label">Image URL</label>
            <input className="input" placeholder="e.g., https://i.imgur.com/your-image.jpg" value={form.imageUrl} onChange={field('imageUrl')} />
            {form.imageUrl && (
              <div style={{ marginTop: '0.5rem', width: '100%', height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="field">
            <label className="label">Product Name</label>
            <input className="input" placeholder="e.g., Wireless Noise-Cancelling Headphones" value={form.name} onChange={field('name')} required />
          </div>

          <div className="field">
            <label className="label">Category</label>
            <select className="select" value={form.category} onChange={field('category')} required>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
              <option value="Tools">Tools</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field">
              <label className="label">Price (₹)</label>
              <input className="input" type="number" min="0" placeholder="0.00" value={form.price} onChange={field('price')} required />
            </div>
            <div className="field">
              <label className="label">Initial Stock Quantity</label>
              <input className="input" type="number" min="0" placeholder="0" value={form.quantity} onChange={field('quantity')} required />
            </div>
          </div>
          
          <div className="field">
            <label className="label">Dimensions (L × W × H)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input" type="number" min="0" step="0.1" placeholder="Length" value={form.dimLength} onChange={field('dimLength')} required />
              <input className="input" type="number" min="0" step="0.1" placeholder="Width" value={form.dimWidth} onChange={field('dimWidth')} required />
              <input className="input" type="number" min="0" step="0.1" placeholder="Height" value={form.dimHeight} onChange={field('dimHeight')} required />
              <select className="select" style={{ width: '80px', flexShrink: 0 }} value={form.dimUnit} onChange={field('dimUnit')} required>
                <option value="cm">cm</option>
                <option value="in">in</option>
                <option value="m">m</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="Describe the product..." value={form.description} onChange={field('description')} />
          </div>

          <div className="divider" style={{ margin: '0.5rem 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/vendor/products" className="btn btn-ghost">Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14 }}/> Saving…</> : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
