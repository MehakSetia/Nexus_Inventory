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

export default function AdminPage({ api }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'orders' or 'products'
  const [modalUser, setModalUser] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (tab === 'users') {
          const res = roleFilter 
            ? await api.get('/api/admin/users/role', { params: { role: roleFilter } }) 
            : await api.get('/api/admin/users');
          if (!active) return;
          setUsers(res.data);
        } else if (tab === 'orders') {
          const res = await api.get('/api/admin/orders');
          if (!active) return;
          setOrders(res.data);
        }
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || 'Failed to load data');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [api, tab, roleFilter]);

  async function openModal(user, type) {
    setModalUser(user);
    setModalType(type);
    setModalData([]);
    setModalLoading(true);
    try {
      if (type === 'orders') {
        const res = await api.get(`/api/admin/users/${user._id}/orders`);
        setModalData(res.data);
      } else if (type === 'products') {
        const res = await api.get(`/api/admin/vendor/${user._id}/products`);
        setModalData(res.data);
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to load details');
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setModalUser(null);
    setModalType(null);
    setModalData([]);
  }

  const totalUsers = users.length;
  const totalOrders = orders.length;
  const revenue = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? (o.totalPrice || 0) : 0), 0);

  return (
    <div>
      {/* Modal Overlay */}
      {modalType && (
        <div style={{
          position:'fixed', inset:0, zIndex:1000,
          background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem'
        }} onClick={closeModal}>
          <div style={{
            background:'var(--bg-3)', border:'1px solid var(--border-2)',
            borderRadius:'var(--radius-lg)', width:'100%', maxWidth:700,
            maxHeight:'85vh', overflowY:'auto', padding:'2rem', position:'relative'
          }} onClick={(e)=>e.stopPropagation()}>
            <button onClick={closeModal} style={{ position:'absolute', top:16, right:16, background:'transparent', border:'none', color:'var(--text-2)', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
            <h3 style={{ marginTop:0, marginBottom:'1rem' }}>
              {modalType === 'orders' ? `Orders by ${modalUser.name}` : `Products by ${modalUser.name}`}
            </h3>
            
            {modalLoading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : modalData.length === 0 ? (
              <div className="empty" style={{ padding:'2rem' }}>No records found.</div>
            ) : modalType === 'orders' ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order ID</th><th>Status</th><th>Total Price</th></tr></thead>
                  <tbody>
                    {modalData.map(o => (
                      <tr key={o._id}>
                        <td className="order-id">{o._id}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>₹{o.totalPrice?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Product Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
                  <tbody>
                    {modalData.map(p => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td><span className="badge badge-indigo">{p.category}</span></td>
                        <td>₹{p.price?.toLocaleString('en-IN')}</td>
                        <td>{p.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Platform overview and management
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('users')}>Manage Users</button>
        <button className={`btn ${tab === 'orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('orders')}>All Orders</button>
      </div>

      {tab === 'users' && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat-card"><div className="stat-value">{totalUsers}</div><div className="stat-label">Total Users</div></div>
        </div>
      )}
      
      {tab === 'orders' && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="stat-card"><div className="stat-value">{totalOrders}</div><div className="stat-label">Total Orders</div></div>
          <div className="stat-card"><div className="stat-value">₹{revenue.toLocaleString('en-IN')}</div><div className="stat-label">Platform Revenue (Excl. Cancelled)</div></div>
        </div>
      )}

      {error && <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

      {tab === 'users' && (
        <>
          <div className="filter-bar" style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, maxWidth: 300 }}
            />
            <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="">All Roles</option>
              <option value="Buyer">Buyer</option>
              <option value="Vendor">Vendor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {loading ? (
             <div className="page-loader"><div className="spinner" /><span>Loading users…</span></div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty"><div className="empty-icon">👥</div><p>No users found matching your search.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th style={{textAlign:'right'}}>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, color: 'var(--heading)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'Admin' ? 'badge-red' : u.role === 'Vendor' ? 'badge-amber' : 'badge-indigo'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || '-'}</td>
                      <td style={{textAlign:'right'}}>
                        {u.role === 'Buyer' && <button className="btn btn-outline btn-sm" onClick={() => openModal(u, 'orders')}>View Orders</button>}
                        {u.role === 'Vendor' && <button className="btn btn-outline btn-sm" onClick={() => openModal(u, 'products')}>View Products</button>}
                        {u.role === 'Admin' && <span style={{fontSize:'0.8rem', color:'var(--text-2)'}}>-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <>
          {loading ? (
             <div className="page-loader"><div className="spinner" /><span>Loading orders…</span></div>
          ) : orders.length === 0 ? (
            <div className="empty"><div className="empty-icon">🧾</div><p>No orders found.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Status</th><th>Total Value</th><th>Buyer</th><th>Vendor</th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="order-id">{o._id}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td style={{ fontWeight: 600, color: 'var(--heading)' }}>₹{o.totalPrice?.toLocaleString('en-IN') || 0}</td>
                      <td>{o.buyer?.name || o.buyer || '-'}</td>
                      <td>{o.vendor?.name || o.vendor || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
