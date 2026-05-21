import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getStoredToken } from '../auth/tokenStore.js';

export default function ProductDetailModal({ product, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [product, onClose]);

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const image   = product.imageUrl;
  const stored  = getStoredToken();
  const canBuy  = stored?.role === 'Buyer';
  const inStock = product.quantity > 0;

  const statusBadge = inStock
    ? <span className="badge badge-green">{product.quantity} in stock</span>
    : <span className="badge badge-red">Out of stock</span>;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(8px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1rem',
        animation:'pdm-in 0.18s ease',
      }}
    >
      <style>{`
        @keyframes pdm-in  { from{opacity:0} to{opacity:1} }
        @keyframes pdm-up  { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      <div style={{
        position:'relative',
        background:'var(--bg-3)',
        border:'1px solid var(--border-2)',
        borderRadius:'var(--radius-lg)',
        width:'100%', maxWidth:800,
        maxHeight:'90vh', overflowY:'auto',
        boxShadow:'var(--shadow-lg)',
        animation:'pdm-up 0.22s ease',
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position:'absolute', top:12, right:14,
            width:30, height:30, borderRadius:'50%',
            border:'1px solid var(--border-2)',
            background:'var(--bg-2)', color:'var(--text)',
            fontSize:13, cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center',
            zIndex:2, transition:'all 0.15s',
          }}
          onMouseEnter={(e)=>{ e.target.style.background='var(--accent)'; e.target.style.color='#fff'; }}
          onMouseLeave={(e)=>{ e.target.style.background='var(--bg-2)'; e.target.style.color='var(--text)'; }}
          aria-label="Close"
        >✕</button>

        {/* Image side */}
        <div style={{
          minHeight:340,
          background:'var(--bg-2)',
          borderRadius:'var(--radius-lg) 0 0 var(--radius-lg)',
          overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {image
            ? <img src={image} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
            : <div style={{fontSize:'3.5rem',opacity:0.15}}>🖼️</div>
          }
        </div>

        {/* Details side */}
        <div style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'0.8rem' }}>
          <span style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--accent-2)' }}>
            {product.category}
          </span>

          <h2 style={{ fontSize:'1.6rem', margin:0 }}>{product.name}</h2>

          {product.description && (
            <p style={{ color:'var(--text)', fontSize:'0.9rem', lineHeight:1.65 }}>{product.description}</p>
          )}

          <div style={{ fontSize:'2rem', fontWeight:900, color:'var(--heading)', letterSpacing:'-0.04em' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', borderTop:'1px solid var(--border)', paddingTop:'0.75rem', fontSize:'0.88rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-2)', minWidth:50 }}>Stock</span>
              {statusBadge}
            </div>
            {product.dimensions && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-2)', minWidth:50 }}>Size</span>
                <span style={{ color:'var(--text)' }}>
                  {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                </span>
              </div>
            )}
            {product.vendor?.name && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-2)', minWidth:50 }}>Vendor</span>
                <span style={{ color:'var(--text)' }}>{product.vendor.name}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop:'auto', paddingTop:'0.5rem' }}>
            {canBuy && inStock && (
              <Link
                to={`/checkout/${product._id}`}
                className="btn btn-primary"
                style={{ width:'100%' }}
                onClick={onClose}
                id={`modal-buy-${product._id}`}
              >
                Buy now →
              </Link>
            )}
            {canBuy && !inStock && (
              <button className="btn" style={{ width:'100%', opacity:0.4, cursor:'not-allowed', background:'var(--surface-2)', color:'var(--text)' }} disabled>
                Out of stock
              </button>
            )}
            {!stored?.token && (
              <Link to="/auth/login" className="btn btn-outline" style={{ width:'100%' }} onClick={onClose}>
                Sign in to buy
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
