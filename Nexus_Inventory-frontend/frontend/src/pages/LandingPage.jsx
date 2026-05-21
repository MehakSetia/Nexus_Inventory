import './LandingPage.css';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '📦', title: 'Smart Inventory', desc: 'Real-time stock tracking with automatic updates on every purchase.' },
  { icon: '💳', title: 'Instant Payments', desc: 'Integrated Razorpay checkout — buyers pay in seconds, vendors get notified instantly.' },
  { icon: '🏪', title: 'Vendor Storefront', desc: 'Vendors manage products, track orders, and update delivery status from one place.' },
  { icon: '🛡️', title: 'Role-Based Access', desc: 'Separate secure dashboards for Buyers, Vendors, and Admins.' },
  { icon: '📊', title: 'Admin Oversight', desc: 'Full visibility into every user, order, and transaction across the platform.' },
  { icon: '⚡', title: 'Built for Scale', desc: 'MongoDB Atlas + Node.js backend handles thousands of concurrent users.' },
];

export default function LandingPage() {
  return (
    <div className="land">
      {/* ── Navbar ─────────────────────────────────── */}
      <header className="land-nav">
        <div className="land-nav-inner">
          <span className="land-brand">◎ Nexus</span>
          <div className="land-nav-links">
            <Link to="/auth/login"  className="btn btn-outline btn-sm" id="btn-signin">Sign In</Link>
            <Link to="/auth/register" className="btn btn-primary btn-sm" id="btn-started">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="land-hero">
        <div className="land-glow land-glow-1" />
        <div className="land-glow land-glow-2" />

        <div className="land-hero-inner">
          <div className="land-badge">🚀 THE B2B INVENTORY PLATFORM</div>

          <h1 className="land-h1">
            Procurement &amp; Supply Chain<br />
            <span className="land-gradient">Reimagined for Business</span>
          </h1>

          <p className="land-sub">
            Nexus connects vendors and buyers on a unified platform —<br />
            manage products, orders, and payments end-to-end with<br />
            enterprise-grade security and simplicity.
          </p>

          <div className="land-cta">
            <Link to="/auth/register" className="btn btn-primary btn-lg" id="hero-cta">
              Start for Free →
            </Link>
            <Link to="/auth/login" className="btn btn-outline btn-lg" id="hero-signin">
              Sign In
            </Link>
          </div>

          <div className="land-scroll">
            <span>SCROLL</span>
            <div className="land-arrow">↓</div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section className="land-features">
        <div className="land-section-inner">
          <p className="land-eyebrow">Everything you need</p>
          <h2 className="land-section-title">Built for every role on the chain</h2>

          <div className="land-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="land-feature-card">
                <div className="land-feature-icon">{f.icon}</div>
                <h3 className="land-feature-title">{f.title}</h3>
                <p className="land-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────── */}
      <section className="land-banner">
        <div className="land-section-inner land-banner-inner">
          <h2 className="land-section-title" style={{ color: '#fff' }}>
            Ready to transform your supply chain?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
            Join thousands of businesses managing inventory smarter.
          </p>
          <div className="land-cta" style={{ marginTop: '1.75rem' }}>
            <Link to="/auth/register" className="btn btn-lg" style={{ background: '#fff', color: '#6366f1', fontWeight: 800 }} id="banner-cta">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="land-footer">
        <span>© 2025 Nexus Inventory · Built with ♥</span>
      </footer>
    </div>
  );
}
