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

export default function VendorOrdersPage({ api }) {
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
        const res = await api.get('/api/order/vendor', { params: { status: status || undefined, page: 1, limit: 50 } });
        if (!active) return;
        setOrders(res.data.orders || []);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || 'Failed to load orders');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [api, status]);

  async function updateOrder(orderId, nextStatus) {
    try {
      await api.patch(`/api/order/${orderId}/status`, { status: nextStatus });
      setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update order status');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Vendor Orders</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage and fulfill orders from your buyers
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
        <div className="page-loader"><div className="spinner" /><span>Loading orders…</span></div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🧾</div>
          <p>No orders found matching this status.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>Buyer Details</th>
                <th>Product Info</th>
                <th>Status</th>
                <th>Total Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <div className="order-id" style={{ marginBottom: '0.25rem' }}>{o._id}</div>
                    <div className="order-meta">{new Date(o.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{o.buyer?.name || 'Unknown User'}</div>
                    <div className="order-meta">{o.buyer?.email}</div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--heading)' }}>{o.products?.[0]?.product?.name || 'Unknown Product'}</div>
                    <div className="order-meta">Qty: {o.products?.[0]?.quantity || 1}</div>
                    {o.refundStatus && (
                      <div className="order-meta" style={{ color: o.refundStatus === 'Pending' ? 'var(--amber)' : 'var(--green)', marginTop: '0.2rem', fontWeight: 600 }}>
                        Refund: {o.refundStatus} {o.refundId ? `(ID: ${o.refundId})` : ''}
                      </div>
                    )}
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ fontWeight: 600, color: 'var(--heading)' }}>
                    ₹{o.totalPrice?.toLocaleString('en-IN') || 0}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {o.status === 'Pending' && (
                        <button onClick={() => updateOrder(o._id, 'Confirmed')} className="btn btn-primary btn-sm">Confirm</button>
                      )}
                      {o.status === 'Confirmed' && (
                        <button onClick={() => updateOrder(o._id, 'Delivered')} className="btn btn-primary btn-sm" style={{ background: 'var(--green)' }}>Mark Delivered</button>
                      )}
                      {(o.status === 'Pending' || o.status === 'Confirmed') && (
                        <button onClick={() => updateOrder(o._id, 'Cancelled')} className="btn btn-outline btn-sm">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
