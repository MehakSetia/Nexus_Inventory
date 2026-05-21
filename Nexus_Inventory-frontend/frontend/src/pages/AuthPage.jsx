import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setStoredToken, decodeJwt } from '../auth/tokenStore.js';

export default function AuthPage({ mode, api, onAuth }) {
  const navigate = useNavigate();
  const isLogin  = mode === 'login';

  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', role:'Buyer' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  function field(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { ...form, phone: form.phone ? Number(form.phone) : undefined };

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await api.post(endpoint, payload);

      if (isLogin) {
        const token   = res.data.token;
        const decoded = decodeJwt(token);
        setStoredToken({ token, userId: decoded?.userId, role: decoded?.role, name: decoded?.name });
        onAuth?.();
        navigate('/products', { replace: true });
      } else {
        setSuccess('Account created! Please sign in.');
        setTimeout(() => navigate('/auth/login'), 1500);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message;
      setError(typeof msg === 'string' ? msg : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>◎</div>
        <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
          {isLogin ? 'Sign in to continue to Nexus' : 'Join thousands of businesses on Nexus'}
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {!isLogin && (
            <>
              <div className="field">
                <label className="label">Full name</label>
                <input className="input" placeholder="Jane Doe" value={form.name} onChange={field('name')} required />
              </div>
              <div className="field">
                <label className="label">Phone (optional)</label>
                <input className="input" type="tel" placeholder="9876543210" value={form.phone} onChange={field('phone')} />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <select className="select" value={form.role} onChange={field('role')}>
                  <option value="Buyer">Buyer</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={field('email')} required />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={field('password')} required />
          </div>

          {error   && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width:16,height:16 }} /> Please wait…</>
              : isLogin ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>
      </div>

      {/* Switch link */}
      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-2)' }}>
        {isLogin
          ? <>Don't have an account? <Link to="/auth/register">Register</Link></>
          : <>Already have an account? <Link to="/auth/login">Sign In</Link></>
        }
      </p>
    </div>
  );
}
