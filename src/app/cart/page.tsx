'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface Product {
  id: string | number;
  name: string;
  subtitle?: string;
  price: number;
  image: string;
  category: string;
  [key: string]: any; // Allow flexibility for extra properties safely
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  name: string;
  email: string;
}

export default function CartPage() {
  const { cart: items, updateQty, removeFromCart, clearCart, isHydrated, addToCart } = useCart();
  const { showToast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState<Address>({ street: '', city: '', state: '', zip: '', country: '', phone: '', name: '', email: '' });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>('new');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllProducts(data); })
      .catch(() => { });
  }, []);

  const getShippingCost = () => {
    if (items.length === 0) return 0;

    const countryClean = (address.country || '').trim().toLowerCase();
    const stateClean = (address.state || '').trim().toLowerCase();

    if (countryClean && countryClean !== 'india' && countryClean !== 'in') {
      return 200;
    }

    const isMaharashtra =
      stateClean === 'maharashtra' ||
      stateClean === 'mh' ||
      stateClean.includes('maharashtra') ||
      (stateClean.length >= 3 && 'maharashtra'.includes(stateClean));

    if (isMaharashtra) {
      return 60;
    }

    return 120;
  };

  const shipping = getShippingCost();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    const { street, city, state, zip, country, phone, name, email } = address;

    if (!name || !email) {
      showToast('Please fill out your name and email address.', 'error');
      return;
    }

    if (selectedAddressId === 'new') {
      if (!street || !city || !state || !zip || !country || !phone) {
        showToast('Please complete your shipping address.', 'error');
        return;
      }
    }

    if (items.length === 0) {
      showToast('Your bag is empty.', 'error');
      return;
    }

    setIsCheckingOut(true);
    try {
      const customer = { name, email, phone };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, subtotal, tax, total,
          customer,
          shippingAddress: { street, city, state, zip, country },
          userId: null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setOrderPlaced(true);
        clearCart();
        showToast('Order placed successfully!', 'success');
      } else {
        showToast('Order processing failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('A network error occurred. Please try again.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const crossSell = allProducts.filter(p => !items.find(i => i.id === p.id)).slice(0, 4);

  if (!isHydrated) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Loading Selection...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '10rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--primary)', animation: 'scaleIn 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
              task_alt
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em' }}>ORDER CONFIRMED</span>
              <h1 className="font-headline-lg" style={{ color: 'var(--primary)' }}>THANK YOU FOR YOUR PATRONAGE</h1>
            </div>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
              Your order <strong style={{ color: 'var(--primary)' }}>#{orderId}</strong> has been successfully broadcast to our fulfillment hub.
              A dispatch confirmation along with transit metrics will be transmitted shortly.
            </p>
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(229,226,224,0.1)' }}>
              <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>
                Fulfillment Estimate: 3-5 standard Solar cycles.
              </p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/products" className="btn-primary" style={{ padding: '1.25rem 2.5rem' }}>
                RETURN TO PRODUCTS
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)' }}>
        <div className="container">

          {/* Header */}
          <header style={{ marginBottom: '4rem' }}>
            <h1 className="font-headline-lg" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Your Selection</h1>
            <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '500px' }}>
              Items meticulously curated from our celestial collections, waiting for their final journey.
            </p>
          </header>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>Your bag is empty.</p>
              <Link href="/products" className="btn-primary" style={{ padding: '1.25rem 2.5rem' }}>Explore Collection</Link>
            </div>
          ) : (
            <div className="cart-grid">

              {/* Left Column */}
              <div className="cart-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                {/* Products in Bag */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {items.map((item, idx) => (
                    <div
                      key={`${item.id}-${item.size}`}
                      style={{
                        display: 'flex', gap: '2rem', paddingBottom: '2rem',
                        borderBottom: '1px solid rgba(229,226,224,0.1)',
                        animation: `fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 100}ms both`,
                      }}
                    >
                      <Link href={`/products/${item.id}`} className="cart-item-thumb" style={{ position: 'relative', width: '192px', height: '256px', flexShrink: 0, overflow: 'hidden', backgroundColor: 'var(--surface-container)' }}>
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                        />
                      </Link>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h3 className="font-headline-md" style={{ color: 'var(--primary)' }}>{item.name}</h3>
                            <p className="font-body-md" style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: '1rem' }}>₹{(item.price * item.qty).toLocaleString()}</p>
                          </div>
                          <p className="font-label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>{item.subtitle}</p>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <span className="font-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Size: {item.size}</span>
                            {item.color && (
                              <span className="font-caption" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Color: {item.color}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(71,71,65,0.3)', padding: '0 0.75rem' }}>
                            <button onClick={() => updateQty(item.id, item.size, -1, item.color)} style={{ color: 'var(--on-surface-variant)', padding: '0.5rem 0', transition: 'color 0.3s', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                            </button>
                            <span className="font-body-md" style={{ padding: '0 1rem' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.size, 1, item.color)} style={{ color: 'var(--on-surface-variant)', padding: '0.5rem 0', transition: 'color 0.3s', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id, item.size, item.color)} className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.3s', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Shipping Address */}
                <div className="shipping-address-container">
                  <h2 className="shipping-address-title">Shipping Address</h2>

                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {savedAddresses.map(addr => (
                        <label key={addr.id} className={`address-option-label ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                          <input type="radio" name="saved_address" checked={selectedAddressId === addr.id}
                            onChange={() => {
                              setSelectedAddressId(addr.id);
                              setAddress({
                                street: addr.street || addr.line1 || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                zip: addr.zip || addr.pincode || '',
                                country: addr.country || 'India',
                                phone: '',
                                name: '',
                                email: ''
                              });
                            }}
                            style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
                          />
                          <div>
                            <p className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{addr.label || 'Saved Address'}</p>
                            <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px', lineHeight: 1.5 }}>
                              {addr.line1 || addr.street}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                              {addr.city}, {addr.state} {addr.pincode || addr.zip}<br />
                              {addr.country || 'India'}
                            </p>
                          </div>
                        </label>
                      ))}
                      <label className={`address-option-label ${selectedAddressId === 'new' ? 'selected' : ''}`}>
                        <input type="radio" name="saved_address" checked={selectedAddressId === 'new'}
                          onChange={() => {
                            setSelectedAddressId('new');
                            setAddress({ street: '', city: '', state: '', zip: '', country: '', phone: '', name: '', email: '' });
                          }}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: '#e5e2e0', fontSize: '14px' }}>Use a new address</span>
                      </label>
                    </div>
                  )}

                  {selectedAddressId === 'new' && (
                    <div className="shipping-address-grid" style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div className="shipping-address-full">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={address.street}
                          onChange={e => setAddress({ ...address, street: e.target.value })}
                          className="shipping-address-input"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          value={address.city}
                          onChange={e => setAddress({ ...address, city: e.target.value })}
                          className="shipping-address-input"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="State"
                          value={address.state}
                          onChange={e => setAddress({ ...address, state: e.target.value })}
                          className="shipping-address-input"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Zip / Pincode"
                          value={address.zip}
                          onChange={e => setAddress({ ...address, zip: e.target.value })}
                          className="shipping-address-input"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Country"
                          value={address.country}
                          onChange={e => setAddress({ ...address, country: e.target.value })}
                          className="shipping-address-input"
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(229,226,224,0.1)', paddingTop: '1.5rem' }}>
                    <h3 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '11px', letterSpacing: '0.2em' }}>Contact Information</h3>

                    <div className="shipping-address-grid" style={{ marginBottom: '1.25rem' }}>
                      <div>
                        <label className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem', fontSize: '9px', letterSpacing: '0.15em' }}>Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Jane Doe"
                          value={address.name}
                          onChange={e => setAddress({ ...address, name: e.target.value })}
                          className="shipping-address-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem', fontSize: '9px', letterSpacing: '0.15em' }}>Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. jane@example.com"
                          value={address.email}
                          onChange={e => setAddress({ ...address, email: e.target.value })}
                          className="shipping-address-input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem', fontSize: '9px', letterSpacing: '0.15em' }}>Contact Number *</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={address.phone}
                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                        className="shipping-address-input"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Panel */}
              <aside className="cart-summary-col">
                <div className="glass-panel" style={{ padding: '3rem', position: 'sticky', top: '140px' }}>
                  <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '2rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Order Summary</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {[
                      { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                      { label: 'Celestial Shipping', value: `₹${shipping.toFixed(2)}` },
                      { label: 'Tax (Estimated)', value: `₹${tax.toFixed(2)}` },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="font-body-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                        <span className="font-body-md" style={{ color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(71,71,65,0.2)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="font-label-caps" style={{ color: 'var(--primary)' }}>ESTIMATED TOTAL</span>
                      <span className="font-headline-md" style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}>PROMO CODE</label>
                    <input
                      type="text" placeholder="ENTER CODE"
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: '1px solid rgba(71,71,65,0.4)',
                        padding: '0.5rem 0', color: 'var(--primary)',
                        fontFamily: 'var(--font-body)', fontSize: '12px',
                        letterSpacing: '0.2em', fontWeight: 600, outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut || items.length === 0}
                      className="btn-primary"
                      style={{ width: '100%', padding: '1.25rem', letterSpacing: '0.3em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: isCheckingOut || items.length === 0 ? 0.5 : 1, cursor: isCheckingOut || items.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {isCheckingOut ? 'PROCESSING...' : 'SECURE CHECKOUT'}
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', transition: 'transform 0.3s' }}>arrow_forward</span>
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', paddingTop: '1rem', opacity: 0.4 }}>
                      {['security', 'credit_card', 'verified_user'].map(icon => (
                        <span key={icon} className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{icon}</span>
                      ))}
                    </div>
                    <p className="font-caption" style={{ color: 'var(--on-surface-variant)', textAlign: 'center', opacity: 0.6, fontStyle: 'italic', maxWidth: '280px', margin: '0 auto' }}>
                      All transactions are encrypted through our secure secure relay system.
                    </p>
                  </div>
                </div>
              </aside>

            </div>
          )}

          {/* Complete Your Ensemble */}
          <section style={{ marginTop: 'var(--section-gap)' }}>
            <h3 className="font-label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', letterSpacing: '0.3em' }}>
              COMPLETE YOUR ENSEMBLE
            </h3>
            <div className="cross-sell-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gutter)' }}>
              {crossSell.map(p => (
                <Link href={`/products/${p.id}`} key={p.id} className="product-card" style={{ display: 'block' }}>
                  <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1rem', backgroundColor: 'var(--surface-container)' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                    <button
                      className="material-symbols-outlined quick-add-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...p, id: String(p.id), subtitle: p.subtitle ?? '' }, 'OS', String(1) as any);
                        showToast(`${p.name} added to cart`, 'success');
                      }}

                      style={{
                        position: 'absolute', bottom: '1rem', right: '1rem',
                        backgroundColor: 'rgba(20,19,19,0.8)', backdropFilter: 'blur(8px)',
                        padding: '0.75rem', color: 'var(--primary)', fontSize: '20px',
                        opacity: 0, transition: 'opacity 0.3s',
                      }}
                    >add_shopping_cart</button>
                  </div>
                  <h4 className="font-body-md" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{p.name}</h4>
                  <p className="font-label-caps" style={{ color: 'var(--on-surface-variant)' }}>₹{p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}