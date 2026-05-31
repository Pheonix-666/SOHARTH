import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      width: '100%',
      paddingTop: 'var(--section-gap)',
      paddingBottom: 'calc(var(--section-gap) + var(--bottom-nav-height, 0px))',
      backgroundColor: 'var(--surface-dim)',
      borderTop: '1px solid rgba(71, 71, 65, 0.15)',
    }}>
      <div className="container">
        {/* Brand */}
        <div className="font-headline-lg" style={{
          letterSpacing: '0.3em', color: 'var(--primary)', marginBottom: '2.5rem',
        }}>
          SOLARTH
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
        }}>
          {/* About */}
          <div style={{ gridColumn: '1 / -1' }}>
            <p className="font-body-md" style={{
              color: 'var(--on-surface-variant)',
              maxWidth: '300px', lineHeight: '1.85',
            }}>
              Celestial minimalism for the discerning modern observer.
            </p>
          </div>

          {/* Collections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.45, marginBottom: '0.25rem' }}>
              COLLECTIONS
            </h4>
            {['The Void', 'Starlight Tech', 'Lunar Essentials', 'New Arrivals'].map(l => (
              <Link key={l} href="/products" className="nav-link" style={{ letterSpacing: '0.12em', fontSize: '12px' }}>
                {l}
              </Link>
            ))}
          </div>

          {/* Client Service */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.45, marginBottom: '0.25rem' }}>
              CLIENT SERVICE
            </h4>
            {['Shipping & Returns', 'Retail Locations', 'Contact Us', 'Terms of Service'].map(l => (
              <a key={l} href="#" className="nav-link" style={{ letterSpacing: '0.12em', fontSize: '12px' }}>
                {l}
              </a>
            ))}
          </div>

          {/* Social */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <h4 className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.45, marginBottom: '0.25rem' }}>
              SOCIAL
            </h4>
            {['Instagram', 'Vogue Business', 'Editorial Archive'].map(l => (
              <a key={l} href="#" className="nav-link" style={{ letterSpacing: '0.12em', fontSize: '12px' }}>
                {l}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span className="font-label-caps" style={{ opacity: 0.4, fontSize: '10px' }}>
            © {new Date().getFullYear()} SOLARTH. CELESTIAL MINIMALISM.
          </span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" className="nav-link" style={{ fontSize: '10px' }}>Privacy</a>
            <a href="#" className="nav-link" style={{ fontSize: '10px' }}>Sustainability</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
