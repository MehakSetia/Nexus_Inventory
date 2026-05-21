import { useEffect, useState } from 'react';

function StatusBadge({ status }) {
  switch (status) {
    case 'Pending':   return <span className="badge badge-amber">Pending</span>;
    case 'Confirmed': return <span className="badge badge-indigo">Confirmed</span>;
    case 'Delivered': return <span className="badge badge-green">Delivered</span>;
    case 'Cancelled': return <span className="badge badge-red">Cancelled</span>;
    default:          return <span className="badge badge-gray">{status}</span>;
  }
}

export default function OrdersPage({ api }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/order', { params: { status: status || undefined, page: 1, limit: 50 } });
        if (!active) return;
        setOrders(res.data.orders || []);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || 'Failed to load your orders');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [api, status]);

  async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/api/order/${orderId}/cancel`);
      setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o)));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to cancel order');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Orders</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Track the status of your past purchases
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      {loading ? (
        <div className="page-loader"><div className="spinner" /><span>Loading your orders…</span></div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <p>You have no orders yet.</p>
        </div>
      ) : (
        <div className="grid-2">
          {orders.map((o) => (
            <div key={o._id} className="card order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <StatusBadge status={o.status} />
                <span className="order-meta">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>
                {o.products?.[0]?.product?.name || 'Unknown Product'}
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>Quantity: {o.products?.[0]?.quantity || 1}</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--heading)' }}>
                  ₹{o.totalPrice?.toLocaleString('en-IN') || 0}
                </span>
              </div>

              <div className="divider" style={{ margin: '0.75rem 0' }}></div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', display: 'grid', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Order ID:</span>
                  <span className="order-id" style={{ maxWidth: '60%', textAlign: 'right' }}>{o._id}</span>
                </div>
                {o.refundStatus && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Refund:</span>
                    <span style={{ color: o.refundStatus === 'Pending' ? 'var(--amber)' : 'var(--green)', fontWeight: 600 }}>
                      {o.refundStatus} {o.refundId ? `(ID: ${o.refundId})` : ''}
                    </span>
                  </div>
                )}
                {o.vendor && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Vendor:</span>
                    <span>{o.vendor?.name || o.vendor}</span>
                  </div>
                )}
                {o.deliveryDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estimated Delivery:</span>
                    <span style={{ color: 'var(--heading)', fontWeight: 500 }}>
                      {new Date(o.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {(o.status === 'Pending' || o.status === 'Confirmed') && (
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => cancelOrder(o._id)} className="btn btn-outline btn-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
