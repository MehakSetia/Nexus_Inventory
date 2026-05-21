import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage, deleteProductImage } from '../utils/imageStore.js';

export default function VendorProductsPage({ api }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/product/my-products');
        if (!active) return;
        setProducts(res.data);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || 'Failed to load your products');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [api]);

  async function remove(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/product/${id}/delete`);
      deleteProductImage(id); // Cleanup local storage image
      setProducts((ps) => ps.filter((p) => p._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete product');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Products</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage your inventory and stock levels
          </p>
        </div>
        <Link to="/vendor/products/add" className="btn btn-primary">
          + Add New Product
        </Link>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      {loading ? (
        <div className="page-loader"><div className="spinner" /><span>Loading your products…</span></div>
      ) : products.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏪</div>
          <p>You haven't added any products yet.</p>
          <Link to="/vendor/products/add" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = getProductImage(p._id);
                const inStock = p.quantity > 0;
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--bg-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ opacity: 0.2 }}>🖼️</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{p.name}</div>
                    </td>
                    <td><span className="badge badge-indigo">{p.category}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={inStock ? 'product-stock-ok' : 'product-stock-out'}>
                        {p.quantity} {inStock ? 'in stock' : 'sold out'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link to={`/vendor/products/${p._id}/edit`} className="btn btn-outline btn-sm">Edit Stock</Link>
                        <button onClick={() => remove(p._id)} className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
