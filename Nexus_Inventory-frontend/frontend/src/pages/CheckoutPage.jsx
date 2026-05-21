import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductImage } from '../utils/imageStore.js';

export default function CheckoutPage({ api }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setError('');
      try {
        const res = await api.get(`/api/product/${productId}`);
        if (!active) return;
        setProduct(res.data);
        setQuantity(1);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || 'Failed to load product');
      }
    }
    load();
    return () => { active = false; };
  }, [api, productId]);

  const total = useMemo(() => {
    if (!product) return 0;
    return Number(quantity) * Number(product.price);
  }, [product, quantity]);

  async function startPayment(e) {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    setError('');
    try {
      // 1) place order
      const orderRes = await api.post('/api/order/add', { productId, quantity: Number(quantity) });
      const order = orderRes.data.order;

      // 2) create Razorpay order
      const paymentRes = await api.post('/api/payment/create', { orderId: order._id, amount: total });

      // 3) open Razorpay widget
      const { razorpayOrderId } = paymentRes.data;
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentRes.data.amount,
        currency: 'INR',
        name: 'Nexus Inventory',
        description: `Order: ${product.name}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              OrderId: order._id,
            });
            navigate('/orders');
          } catch (err) {
            setError(err?.response?.data?.message || 'Payment verify failed');
          }
        },
        prefill: { name: '' },
        theme: { color: '#6366f1' }, // Match our accent color
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         setError(response.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (error && !product) {
    return (
      <div className="empty">
        <div className="empty-icon">⚠️</div>
        <p>{error}</p>
        <Link to="/products" className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to Products</Link>
      </div>
    );
  }

  if (!product) {
    return <div className="page-loader"><div className="spinner" /><span>Loading product details…</span></div>;
  }

  const image = getProductImage(product._id);
  const inStock = product.quantity > 0;
  const maxQty = Math.min(product.quantity, 10); // Let's limit to 10 for safety/demo, or just use product.quantity

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: '1rem' }}>
      <div className="page-header">
        <div>
           <Link to="/products" style={{ color: 'var(--text-2)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
            ← Back to products
          </Link>
          <h2>Checkout</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left: Product Info */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 100, height: 100, borderRadius: 'var(--radius)', background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {image ? (
                 <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <span style={{ fontSize: '2rem', opacity: 0.2 }}>🖼️</span>
               )}
            </div>
            <div>
              <span className="badge badge-indigo" style={{ marginBottom: '0.35rem' }}>{product.category}</span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--heading)' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Price: ₹{product.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="divider" style={{ margin: '0.5rem 0' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-2)' }}>Available Stock</span>
            <span className={inStock ? 'product-stock-ok' : 'product-stock-out'}>
              {inStock ? `${product.quantity} units` : 'Out of stock'}
            </span>
          </div>
          {product.vendor?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-2)' }}>Sold by</span>
              <span style={{ color: 'var(--text)' }}>{product.vendor.name}</span>
            </div>
          )}
        </div>

        {/* Right: Payment Form */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--heading)' }}>Order Summary</h3>
          
          {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={startPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="field">
              <label className="label">Quantity</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                 <input 
                   type="range" 
                   className="input" 
                   min={1} 
                   max={maxQty} 
                   value={quantity} 
                   onChange={(e) => setQuantity(Number(e.target.value))}
                   disabled={!inStock}
                   style={{ flex: 1, padding: 0, height: 'auto', background: 'transparent', border: 'none' }}
                 />
                 <input 
                   type="number" 
                   className="input" 
                   min={1} 
                   max={maxQty} 
                   value={quantity} 
                   onChange={(e) => setQuantity(Number(e.target.value))} 
                   disabled={!inStock}
                   style={{ width: 80, textAlign: 'center' }}
                 />
              </div>
            </div>

            <div className="divider" style={{ margin: '0.5rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>Total Amount</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', lineHeight: 1 }}>
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              type="submit" 
              disabled={loading || !inStock}
              style={{ marginTop: '1rem' }}
            >
              {loading ? (
                 <><div className="spinner" style={{ width: 16, height: 16 }} /> Processing...</>
              ) : !inStock ? (
                'Out of stock'
              ) : (
                'Pay securely with Razorpay'
              )}
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-2)', margin: 0 }}>
              Powered by <span style={{ fontWeight: 600, color: '#3399cc' }}>Razorpay</span>. Test mode is active.
            </p>
          </form>
        </div>

      </div>

      {/* Razorpay script */}
      <ScriptLoader />
    </div>
  );
}

function ScriptLoader() {
  useEffect(() => {
    if (document.getElementById('razorpay-sdk')) return;
    const s = document.createElement('script');
    s.id = 'razorpay-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);
  return null;
}
