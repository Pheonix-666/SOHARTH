'use client';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)' }}>
        
        {/* Hero Section */}
        <section className="container" style={{ marginBottom: '6rem', animation: 'fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', marginBottom: '4rem' }}>
            <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.4em' }}>THE SOHARTH MANIFESTO</span>
            <h1 className="font-headline-lg" style={{ lineHeight: 1.1, color: 'var(--primary)' }}>
              BRIDGING EDITORIAL REFINEMENT & COSMIC PRECISION.
            </h1>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
              Soharth is born from the silence between stars. We believe clothing is not merely a cover, but an architectural envelope for the modern soul—meticulously drafted and constructed with high-tactility, premium materials that echo the precision of astronomical phenomena.
            </p>
          </div>
          
          {/* Main Visual Frame */}
          <div className="glass-panel" style={{ position: 'relative', width: '100%', aspectRatio: '21/9', overflow: 'hidden', border: '1px solid rgba(229,226,224,0.1)' }}>
            <Image 
              src="/WhatsApp Image 2026-05-29 at 12.50.12 PM (1).jpeg" 
              alt="Soharth draping detail" 
              fill 
              style={{ objectFit: 'cover', filter: 'grayscale(70%) brightness(0.6)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(20,19,19,0.85))' }} />
            <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.5 }}>COORDINATES</span>
                <p className="font-body-md" style={{ color: 'var(--primary)' }}>45.4642° N, 9.1900° E (MILANO)</p>
              </div>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.5 }}>ESTABLISHED</span>
                <p className="font-body-md" style={{ color: 'var(--primary)' }}>ERA 01.NEBULA</p>
              </div>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--primary)', opacity: 0.5 }}>FOCUS</span>
                <p className="font-body-md" style={{ color: 'var(--primary)' }}>CELESTIAL MINIMALISM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Narrative Sections */}
        <section className="container about-narrative-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '8rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(229,226,224,0.2)', paddingLeft: '2rem' }}>
              <span className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.1em' }}>01 / THE COSMIC SYNAPSE</span>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
                Every garment begins with a mathematical thesis. We look to the geometry of gravitational fields, the gradient of black holes, and the structured chaos of stellar dust. These abstract astronomical events are translated directly into architectural patterns, clean silhouettes, and sharp seams.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(229,226,224,0.2)', paddingLeft: '2rem' }}>
              <span className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.1em' }}>02 / TEXTURE & TACTILITY</span>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
                We work exclusively with elite mills in Northern Italy and Japan to source wools, silks, and knits that possess a distinct physical weight and grain. By infusing natural, sustainable fabrics with technical carbon-filaments and magnetic hardware, we achieve products that capture and deflect light in equal measure.
              </p>
            </div>
          </div>
          
          <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', border: '1px solid rgba(229,226,224,0.1)' }} className="glass-panel">
            <Image 
              src="/WhatsApp Image 2026-05-29 at 12.50.12 PM.jpeg" 
              alt="Intricate knit textures representing stellar nebula" 
              fill 
              style={{ objectFit: 'cover', filter: 'grayscale(30%)' }}
            />
          </div>
        </section>

        {/* Philosophy Grid */}
        <section style={{ backgroundColor: 'var(--surface-dim)', padding: 'var(--section-gap) 0', borderTop: '1px solid rgba(229,226,224,0.05)', borderBottom: '1px solid rgba(229,226,224,0.05)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
              <div>
                <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em', display: 'block', marginBottom: '0.5rem' }}>OUR THREE PILARS</span>
                <h2 className="font-headline-lg" style={{ color: 'var(--primary)' }}>FOUNDATIONAL TENETS</h2>
              </div>
            </div>
            
            <div className="about-philosophy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gutter)' }}>
              {[
                {
                  no: "I",
                  title: "TEMPORAL PERMANENCE",
                  desc: "We design pieces that defy seasons. Each garment is constructed using reinforced invisible seams and high-twist wool jerseys designed to retain their pristine form for decades."
                },
                {
                  no: "II",
                  title: "ARCHITECTURAL DRAFTING",
                  desc: "Instead of typical fashion flat-patterns, our jackets and shirts are drafted in three dimensions, sculpting key articulation zones for completely unrestricted ergonomic motion."
                },
                {
                  no: "III",
                  title: "ECOLOGICAL RESPONSIBILITY",
                  desc: "We utilize natural dyes, trace-certified mulesing-free virgin wools, and technical biodegradable crepe fibers, ensuring that our imprint on Earth is as quiet as our design language."
                }
              ].map((item, idx) => (
                <div key={item.title} className="glass-panel" style={{ padding: '3rem', border: '1px solid rgba(229,226,224,0.08)', animation: `fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 150}ms both` }}>
                  <span className="font-headline-lg" style={{ opacity: 0.1, display: 'block', marginBottom: '1.5rem', fontSize: '3rem' }}>{item.no}</span>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.2em' }}>{item.title}</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section style={{ padding: 'var(--section-gap) 0', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(229,226,224,0.06) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }} />
          <div className="container">
            <div className="glass-panel" style={{ padding: '4rem 2rem', border: '1px solid rgba(229,226,224,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.4em' }}>GET IN TOUCH</span>
              <h2 className="font-headline-lg" style={{ color: 'var(--primary)', lineHeight: 1.2, fontSize: '2.5rem' }}>
                INITIATE CONTACT
              </h2>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '700px' }}>
                Whether for private commissions, press inquiries, or detailed garment specifications, our team is available to assist you across the globe.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', textAlign: 'left' }}>
                <div style={{ padding: '2.5rem', border: '1px solid rgba(229,226,224,0.1)', background: 'rgba(20,19,19,0.4)', backdropFilter: 'blur(10px)' }}>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.2em' }}>CLIENT SERVICES</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>concierge@soharth.com</p>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>+91 9137773967</p>
                </div>
                <div style={{ padding: '2.5rem', border: '1px solid rgba(229,226,224,0.1)', background: 'rgba(20,19,19,0.4)', backdropFilter: 'blur(10px)' }}>
                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.2em' }}>ATELIER</h4>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Via Monte Napoleone, 9</p>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>20121 Milano MI, Italy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic CTA */}
        <section className="container about-cta" style={{ marginTop: 'var(--section-gap)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.4em' }}>EXPLORE OUR WORKS</span>
          <h2 className="font-headline-lg" style={{ color: 'var(--primary)', maxWidth: '600px', lineHeight: 1.2 }}>EXPERIENCE THE COGNITIVE SIMPLICITY OF SOHARTH</h2>
          <div className="about-cta-buttons" style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <Link href="/products" className="btn-primary" style={{ padding: '1.25rem 3rem' }}>VIEW COLLECTIONS</Link>
            <Link href="/" className="btn-ghost" style={{ padding: '1.25rem 3rem' }}>RETURN HOME</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
