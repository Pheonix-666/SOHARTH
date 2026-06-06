import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      paddingTop: 'var(--section-gap)',
      paddingBottom: 'var(--section-gap)',
      backgroundColor: 'var(--surface-dim)',
      borderTop: '1px solid rgba(71, 71, 65, 0.2)'
    }}>
      <div className="container">
        {/* Brand Heading */}
        <div className="font-headline-lg" style={{ letterSpacing: '0.3em', color: 'var(--primary)', marginBottom: '3rem' }}>
          SOLARTH
        </div>

        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--gutter)', marginBottom: '5rem' }}>
          {/* About */}
          <div>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '240px', lineHeight: '1.8' }}>
              Celestial minimalism for the discerning modern observer.
            </p>
          </div>

          {/* Collections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '0.5rem' }}>COLLECTIONS</h4>
            {['The Void', 'Starlight Tech', 'Lunar Essentials', 'New Arrivals'].map(l => (
              <Link key={l} href="/products" className="nav-link" style={{ letterSpacing: '0.15em' }}>{l}</Link>
            ))}
          </div>

          {/* Client Service */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '0.5rem' }}>CLIENT SERVICE</h4>
            {['Shipping & Returns', 'Retail Locations', 'Contact Us', 'Terms of Service'].map(l => (
              <a key={l} href="#" className="nav-link" style={{ letterSpacing: '0.15em' }}>{l}</a>
            ))}
          </div>

          {/* Social */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '0.5rem' }}>SOCIAL</h4>
            {['Instagram', 'Vogue Business', 'Editorial Archive'].map(l => (
              <a key={l} href="#" className="nav-link" style={{ letterSpacing: '0.15em' }}>{l}</a>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="font-label-caps" style={{ opacity: 0.5, fontSize: '10px' }}>
            © {new Date().getFullYear()} SOLARTH. CELESTIAL MINIMALISM.
          </span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" className="nav-link">Privacy Policy</a>
            <a href="#" className="nav-link">Sustainability</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
