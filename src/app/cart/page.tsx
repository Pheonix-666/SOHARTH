'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { getProductPricing } from '@/lib/pricing';

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

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates', 'Germany', 'Singapore', 'Other'
];

export default function CartPage() {
  const { cart: items, updateQty, removeFromCart, clearCart, isHydrated, addToCart } = useCart();
  const { showToast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState<Address>({ street: '', city: '', state: 'Maharashtra', zip: '', country: 'India', phone: '', name: '', email: '' });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>('new');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [tempRef, setTempRef] = useState('');
  const [submittedMethod, setSubmittedMethod] = useState('');
  const [submittedUtr, setSubmittedUtr] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'payments@soharth';
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'SOHARTH ATELIER';

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAllProducts(data); })
      .catch(() => { });
  }, []);

  const getShippingCost = () => {
    if (items.length === 0) return 0;
    const country = (address.country || 'India').trim().toLowerCase();
    if (country !== 'india') {
      return 500;
    }
    const state = (address.state || '').trim().toLowerCase();
    if (state === 'maharashtra') {
      return 40;
    }
    return 80;
  };

  const shipping = getShippingCost();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round((subtotal * 0.03) * 100) / 100;
  const total = subtotal + tax + shipping;

  // Initialize or re-use active payment transaction reference
  const currentRef = tempRef || ('SOH' + Math.random().toString(36).substring(2, 8).toUpperCase());

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${currentRef}`)}`;
  const gpayLink = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${currentRef}`)}`;
  const phonepeLink = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${currentRef}`)}`;
  const paytmLink = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${currentRef}`)}`;

  const validateAddressAndContact = () => {
    const { street, city, state, zip, country, phone, name, email } = address;

    if (!name || !email) {
      showToast('Please fill out your name and email address.', 'error');
      return false;
    }

    if (selectedAddressId === 'new') {
      if (!street || !city || !state || !zip || !country || !phone) {
        showToast('Please complete your shipping address and contact phone.', 'error');
        return false;
      }
    }

    if (items.length === 0) {
      showToast('Your bag is empty.', 'error');
      return false;
    }

    return true;
  };

  const handleInitiateCheckout = () => {
    if (!validateAddressAndContact()) return;

    if (paymentMethod === 'upi') {
      if (!tempRef) setTempRef(currentRef);
      setUpiModalOpen(true);
      return;
    }

    // Cash on Delivery direct placement
    executeOrderPlacement('Cash on Delivery', 'Pending', '');
  };

  const executeOrderPlacement = async (selectedMethod: string, status: string, utr: string) => {
    setIsCheckingOut(true);
    try {
      const { street, city, state, zip, country, phone, name, email } = address;
      const customer = { name, email, phone };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal,
          tax,
          total,
          customer,
          shippingAddress: { street, city, state, zip, country },
          userId: null,
          paymentMethod: selectedMethod,
          paymentStatus: status,
          transactionId: utr,
          internalNotes: utr ? `UPI UTR: ${utr} | Ref: ${currentRef}` : 'Cash on Delivery Order',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setSubmittedMethod(selectedMethod);
        setSubmittedUtr(utr);
        setUpiModalOpen(false);
        setOrderPlaced(true);
        clearCart();
        showToast(selectedMethod.toLowerCase().includes('online') || selectedMethod.includes('UPI') ? 'Online payment reference registered! Order placed.' : 'Order placed successfully!', 'success');
      } else {
        showToast(data.error || 'Order processing failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('A network error occurred. Please try again.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleConfirmUpiPayment = () => {
    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    if (cleanUtr.length < 10) {
      showToast('Please enter a valid 12-digit transaction UTR reference number from your payment app.', 'error');
      return;
    }
    executeOrderPlacement('Online Payment Option (GPay / PhonePe / Paytm / UPI)', 'Verification Pending', cleanUtr);
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
    const isOnlineOrder = submittedMethod.toLowerCase().includes('online') || submittedMethod.toLowerCase().includes('upi');
    const waVerificationText = encodeURIComponent(`Hi SOHARTH Atelier, I have placed Order #${orderId} for ₹${total.toFixed(2)} via Online Payment. My 12-digit UTR is: ${submittedUtr || 'N/A'}. Please confirm dispatch!`);
    const waVerificationUrl = `https://wa.me/919137773967?text=${waVerificationText}`;

    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '10rem', paddingBottom: 'var(--section-gap)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '4.5rem', color: isOnlineOrder ? '#10b981' : 'var(--primary)', animation: 'scaleIn 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
              {isOnlineOrder ? 'verified' : 'task_alt'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="font-label-caps" style={{ color: isOnlineOrder ? '#34d399' : 'var(--on-surface-variant)', letterSpacing: '0.3em', fontSize: '11px' }}>
                {isOnlineOrder ? '● ONLINE PAYMENT SUBMITTED · ORDER REGISTERED' : 'ORDER CONFIRMED'}
              </span>
              <h1 className="font-headline-lg" style={{ color: 'var(--primary)' }}>THANK YOU FOR YOUR PATRONAGE</h1>
            </div>

            {/* Order & Payment Summary Card */}
            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(229,226,224,0.12)', textAlign: 'left', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <span className="font-caption" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>ORDER REFERENCE</span>
                <strong style={{ color: '#fde047', fontFamily: 'monospace', fontSize: '14px' }}>#{orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <span className="font-caption" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>PAYMENT METHOD</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{submittedMethod}</span>
              </div>
              {submittedUtr && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span className="font-caption" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>SUBMITTED UTR NO.</span>
                  <strong style={{ color: '#34d399', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.05em' }}>{submittedUtr}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-caption" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>FULFILLMENT STATUS</span>
                <span style={{ color: isOnlineOrder ? '#fde047' : 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>
                  {isOnlineOrder ? 'Verification Pending · Priority Queue Active' : 'Processing for Dispatch'}
                </span>
              </div>
            </div>

            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.8 }}>
              {isOnlineOrder
                ? 'Your 12-digit transaction UTR reference has been transmitted to our accounts desk. Once verified against our bank statement, your express AWB courier link will be triggered via SMS/WhatsApp.'
                : `Your order #${orderId} has been successfully broadcast to our fulfillment hub. Please keep exact cash or payment app ready upon doorstep delivery.`}
            </p>

            {isOnlineOrder && (
              <a
                href={waVerificationUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.35)',
                  color: '#25D366',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                OPTIONAL: SEND PAYMENT RECEIPT ON WHATSAPP (+91 91377 73967)
              </a>
            )}

            <div style={{ marginTop: '0.5rem' }}>
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
      <main className="cart-page-main" style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)' }}>
        <div className="container">

          {/* Header */}
          <div className="void-bag-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Link href="/products" style={{ display: 'flex', alignItems: 'center', color: 'var(--on-surface-variant)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
              </Link>
              <div className="void-bag-status">
                <span className="void-bag-status-dot"></span>
                ACTIVE SESSION
              </div>
            </div>
            <h1 className="void-bag-title">YOUR PRODUCTS</h1>
          </div>

          {/* Shipping Progress Tracker */}
          {items.length > 0 && (
            <div className="void-shipping-indicator">
              <div className="void-shipping-text-row">
                <span>ESTIMATED DELIVERY</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  ₹{shipping} ({address.country?.toLowerCase() !== 'india' ? 'International' : address.state})
                </span>
              </div>
              <div className="void-shipping-progress-track">
                <div
                  className="void-shipping-progress-bar"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="void-shipping-subtext">
                Standard Shipping: ₹40 (Maharashtra) • ₹80 (Other Indian States) • ₹500 (International) | 3% GST on subtotal
              </p>
            </div>
          )}

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
                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {items.map((item, idx) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color || 'none'}`}
                      className="void-cart-item"
                      style={{
                        animation: `fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 100}ms both`,
                      }}
                    >
                      {/* Image Column */}
                      <Link href={`/products/${item.id}`} className="void-cart-item-image-wrapper">
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                        />
                      </Link>

                      {/* Details Column */}
                      <div className="void-cart-item-details">
                        <div>
                          <div className="void-cart-item-header">
                            <h3 className="void-cart-item-title">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id, item.size, item.color)}
                              className="void-cart-item-delete"
                              aria-label="Remove item"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                            </button>
                          </div>

                          {item.subtitle && (
                            <p className="void-cart-item-spec">VOID-SPEC: {item.subtitle}</p>
                          )}

                          <div className="void-cart-item-attributes">
                            <div className="void-cart-item-attr">
                              SIZE: <span>{item.size}</span>
                            </div>
                            {item.color && (
                              <div className="void-cart-item-attr">
                                COLOR: <span>{item.color}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="void-cart-item-price">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Card Footer Row */}
                      <div className="void-cart-item-actions">
                        {/* Pill Qty Selector */}
                        <div className="void-qty-selector">
                          <button
                            onClick={() => updateQty(item.id, item.size, -1, item.color)}
                            className="void-qty-btn"
                            aria-label="Decrease quantity"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
                          </button>
                          <span className="void-qty-value">{String(item.qty).padStart(2, '0')}</span>
                          <button
                            onClick={() => updateQty(item.id, item.size, 1, item.color)}
                            className="void-qty-btn"
                            aria-label="Increase quantity"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                          </button>
                        </div>

                        {/* Save for later link */}
                        <button
                          onClick={() => {
                            showToast(`${item.name} saved for later`, 'success');
                          }}
                          className="void-save-link"
                          style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center', padding: '0 8px' }}
                        >
                          SAVE FOR LATER
                        </button>
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
                            setAddress({ street: '', city: '', state: 'Maharashtra', zip: '', country: 'India', phone: '', name: '', email: '' });
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
                        {address.country === 'India' ? (
                          <select
                            value={address.state}
                            onChange={e => setAddress({ ...address, state: e.target.value })}
                            className="shipping-address-input"
                            style={{ background: '#080808', color: '#e5e2e0', cursor: 'pointer' }}
                          >
                            <option value="" disabled style={{ background: '#161515', color: '#888' }}>Select State</option>
                            {INDIAN_STATES.map(s => (
                              <option key={s} value={s} style={{ background: '#161515', color: '#e5e2e0' }}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="State / Province"
                            value={address.state}
                            onChange={e => setAddress({ ...address, state: e.target.value })}
                            className="shipping-address-input"
                          />
                        )}
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
                        <select
                          value={address.country}
                          onChange={e => {
                            const newCountry = e.target.value;
                            setAddress({
                              ...address,
                              country: newCountry,
                              state: newCountry === 'India' ? 'Maharashtra' : ''
                            });
                          }}
                          className="shipping-address-input"
                          style={{ background: '#080808', color: '#e5e2e0', cursor: 'pointer' }}
                        >
                          <option value="" disabled style={{ background: '#161515', color: '#888' }}>Select Country</option>
                          {COUNTRIES.map(c => (
                            <option key={c} value={c} style={{ background: '#161515', color: '#e5e2e0' }}>{c}</option>
                          ))}
                        </select>
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

                  {/* ─── PAYMENT METHOD SELECTION ─── */}
                  <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(229,226,224,0.1)', paddingTop: '1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 className="font-label-caps" style={{ color: 'var(--primary)', fontSize: '11px', letterSpacing: '0.2em' }}>
                        SELECT PAYMENT METHOD
                      </h3>
                      <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                        DIRECT BANK ENCRYPTION
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {/* Option 1: Online Payment Option */}
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: paymentMethod === 'upi' ? '2px solid #fde047' : '1px solid rgba(255,255,255,0.08)',
                          backgroundColor: paymentMethod === 'upi' ? 'rgba(253, 224, 71, 0.04)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              width: '18px', height: '18px', borderRadius: '50%',
                              border: paymentMethod === 'upi' ? '5px solid #fde047' : '2px solid rgba(255,255,255,0.3)',
                              backgroundColor: paymentMethod === 'upi' ? '#080808' : 'transparent',
                              display: 'inline-block'
                            }}></span>
                            <div>
                              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>
                                ⚡ ONLINE PAYMENT OPTION
                              </span>
                              <span style={{ marginLeft: '8px', fontSize: '9px', fontWeight: 800, color: '#fde047', background: 'rgba(253, 224, 71, 0.15)', border: '1px solid rgba(253, 224, 71, 0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                                RECOMMENDED · 0% FEES
                              </span>
                            </div>
                          </div>
                          <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 700 }}>PRIORITY DISPATCH</span>
                        </div>

                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '12px', lineHeight: 1.5, margin: '0 0 0.75rem 28px' }}>
                          Pay securely online with Google Pay, PhonePe, Paytm, or any UPI app. Scan dynamic QR or tap to open app directly.
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '28px', flexWrap: 'wrap' }}>
                          {['Google Pay', 'PhonePe', 'Paytm', 'Any UPI App'].map(app => (
                            <span key={app} style={{ fontSize: '10px', color: '#e5e2e0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Option 2: Cash on Delivery */}
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: paymentMethod === 'cod' ? '2px solid #fde047' : '1px solid rgba(255,255,255,0.08)',
                          backgroundColor: paymentMethod === 'cod' ? 'rgba(253, 224, 71, 0.04)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              width: '18px', height: '18px', borderRadius: '50%',
                              border: paymentMethod === 'cod' ? '5px solid #fde047' : '2px solid rgba(255,255,255,0.3)',
                              backgroundColor: paymentMethod === 'cod' ? '#080808' : 'transparent',
                              display: 'inline-block'
                            }}></span>
                            <div>
                              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>
                                CASH ON DELIVERY (COD)
                              </span>
                            </div>
                          </div>
                          <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>DOORSTEP VERIFICATION</span>
                        </div>

                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '12px', lineHeight: 1.5, margin: '0 0 0 28px' }}>
                          Pay upon delivery at your doorstep via cash or courier-assisted UPI scan.
                        </p>
                      </div>
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
                      { label: 'Subtotal', value: `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                      {
                        label: `Shipping (${(address.country || 'India').toLowerCase() !== 'india' ? 'International' : (address.state || 'Maharashtra')})`,
                        value: `₹${shipping.toFixed(2)}`
                      },
                      { label: 'Estimated Tax (3% GST)', value: `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="font-body-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                        <span className="font-body-md" style={{ color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(71,71,65,0.2)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span className="font-label-caps" style={{ color: 'var(--primary)' }}>ESTIMATED TOTAL</span>
                      <span className="font-headline-md" style={{ color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                      onClick={handleInitiateCheckout}
                      disabled={isCheckingOut || items.length === 0}
                      className="btn-primary"
                      style={{ width: '100%', padding: '1.25rem', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: isCheckingOut || items.length === 0 ? 0.5 : 1, cursor: isCheckingOut || items.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {isCheckingOut ? (
                        'PROCESSING...'
                      ) : paymentMethod === 'upi' ? (
                        `PROCEED TO PAY ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ONLINE`
                      ) : (
                        `PLACE CASH ON DELIVERY ORDER`
                      )}
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', transition: 'transform 0.3s' }}>arrow_forward</span>
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', paddingTop: '1rem', opacity: 0.4 }}>
                      {['security', 'credit_card', 'verified_user'].map(icon => (
                        <span key={icon} className="material-symbols-outlined" style={{ fontSize: '2rem' }}>{icon}</span>
                      ))}
                    </div>
                    <p className="font-caption" style={{ color: 'var(--on-surface-variant)', textAlign: 'center', opacity: 0.6, fontStyle: 'italic', maxWidth: '280px', margin: '0 auto' }}>
                      Direct merchant online payments are protected by RBI encryption standards with zero payment gateway markups.
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
              {crossSell.map(p => {
                const pricing = getProductPricing(p);
                return (
                  <Link href={`/products/${p.id}`} key={p.id} className="product-card" style={{ display: 'block', position: 'relative' }}>
                    <div className="card-image" style={{ aspectRatio: '3/4', position: 'relative', marginBottom: '1rem', backgroundColor: 'var(--surface-container)' }}>
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      <span className="product-discount-badge" style={{
                        position: 'absolute', top: '8px', right: '8px',
                        fontSize: '9px', padding: '3px 7px'
                      }}>
                        <span className="material-symbols-outlined badge-fire-icon" style={{ fontSize: '10px' }}>local_fire_department</span>
                        {pricing.discountPercent}% OFF
                      </span>
                      <button
                        className="material-symbols-outlined quick-add-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({ ...p, id: String(p.id), subtitle: p.subtitle ?? '', price: pricing.discountedPrice }, 'OS');
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
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <span className="font-label-caps" style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{pricing.discountedPrice.toLocaleString()}</span>
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px', textDecoration: 'line-through', opacity: 0.6 }}>₹{pricing.originalPrice.toLocaleString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* Sticky Mobile Checkout Panel */}
      {items.length > 0 && (
        <div className="void-mobile-checkout-panel">
          <div className="void-mobile-checkout-content">
            <div className="void-mobile-estimate-col">
              <span className="void-mobile-estimate-label">TOTAL ({paymentMethod === 'upi' ? 'ONLINE' : 'COD'})</span>
              <span className="void-mobile-estimate-amount">
                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={handleInitiateCheckout}
              disabled={isCheckingOut}
              className="void-mobile-checkout-btn"
            >
              {isCheckingOut ? (
                'PROCESSING...'
              ) : (
                <>
                  <span>{paymentMethod === 'upi' ? 'PROCEED TO PAY ONLINE' : 'CONFIRM COD'}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── DYNAMIC INSTANT UPI PAYMENT MODAL ─── */}
      {upiModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isCheckingOut) setUpiModalOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              background: '#0e0e0e',
              border: '1px solid rgba(253, 224, 71, 0.3)',
              borderRadius: '24px',
              padding: '2rem',
              maxWidth: '520px',
              width: '100%',
              position: 'relative',
              margin: 'auto',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(253, 224, 71, 0.15)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => !isCheckingOut && setUpiModalOpen(false)}
              disabled={isCheckingOut}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--on-surface-variant)',
                cursor: isCheckingOut ? 'not-allowed' : 'pointer'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(253, 224, 71, 0.15)', border: '1px solid rgba(253, 224, 71, 0.3)', padding: '4px 10px', borderRadius: '100px', marginBottom: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fde047' }}>bolt</span>
                <span className="font-label-caps" style={{ color: '#fde047', fontSize: '9px', letterSpacing: '0.15em' }}>
                  ONLINE PAYMENT GATEWAY
                </span>
              </div>
              <h2 className="font-headline-md" style={{ color: '#fff', fontSize: '20px', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                PAY TO SOHARTH ATELIER
              </h2>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>TOTAL PAYABLE:</span>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#fde047', letterSpacing: '-0.02em' }}>
                  ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Step 1: Scan Dynamic QR or Tap Mobile Apps */}
            <div style={{ background: '#161515', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="font-label-caps" style={{ fontSize: '9px', letterSpacing: '0.2em', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.75rem' }}>
                STEP 1: SCAN SECURE QR CODE WITH ANY PAYMENT APP
              </span>

              {/* Dynamic QR Display */}
              <div style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                display: 'inline-block',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                marginBottom: '0.75rem'
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}&margin=8`}
                  alt="SOHARTH Dynamic UPI Payment QR"
                  width={180}
                  height={180}
                  style={{ display: 'block', margin: '0 auto' }}
                />
              </div>

              {/* 1-Click Mobile App Deep Links */}
              <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="font-caption" style={{ color: 'var(--on-surface-variant)', fontSize: '11px', display: 'block', marginBottom: '0.5rem' }}>
                  On phone? Tap your preferred app to pay directly:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  <a
                    href={gpayLink}
                    style={{
                      background: '#1f1e1e',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4285F4' }}>account_balance_wallet</span>
                    GPay
                  </a>
                  <a
                    href={phonepeLink}
                    style={{
                      background: '#1f1e1e',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#a855f7' }}>payments</span>
                    PhonePe
                  </a>
                  <a
                    href={paytmLink}
                    style={{
                      background: '#1f1e1e',
                      border: '1px solid rgba(255,255,255,0.12)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#00BAF2' }}>credit_card</span>
                    Paytm
                  </a>
                  <a
                    href={upiDeepLink}
                    style={{
                      background: '#1f1e1e',
                      border: '1px solid rgba(253, 224, 71, 0.4)',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      color: '#fde047',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fde047' }}>qr_code_scanner</span>
                    Any App
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: 12-Digit UTR Input Form */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <label className="font-label-caps" style={{ color: '#fff', fontSize: '10px', letterSpacing: '0.15em' }}>
                  STEP 2: ENTER 12-DIGIT TRANSACTION REFERENCE (UTR) NO. *
                </label>
                <span style={{ fontSize: '10px', color: utrNumber.trim().length >= 12 ? '#34d399' : 'var(--on-surface-variant)', fontWeight: 600 }}>
                  {utrNumber.trim().length}/12 Digits
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="e.g. 429182749182"
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ''))}
                  style={{
                    width: '100%',
                    background: '#161515',
                    border: utrNumber.trim().length >= 10 ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {utrNumber.trim().length >= 10 && (
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#34d399', fontSize: '20px' }}>
                    check_circle
                  </span>
                )}
              </div>
              <p className="font-caption" style={{ color: 'var(--on-surface-variant)', fontSize: '10.5px', marginTop: '0.4rem', lineHeight: 1.4 }}>
                Find the 12-digit UTR / Transaction Reference ID in your Google Pay, PhonePe, or Paytm receipt after payment.
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleConfirmUpiPayment}
                disabled={isCheckingOut || utrNumber.trim().length < 10}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  fontSize: '12px',
                  letterSpacing: '0.2em',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isCheckingOut || utrNumber.trim().length < 10 ? 0.45 : 1,
                  cursor: isCheckingOut || utrNumber.trim().length < 10 ? 'not-allowed' : 'pointer'
                }}
              >
                {isCheckingOut ? (
                  'VERIFYING & REGISTERING ORDER...'
                ) : (
                  <>
                    <span>I HAVE PAID · CONFIRM ORDER</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => !isCheckingOut && setUpiModalOpen(false)}
                disabled={isCheckingOut}
                className="btn-ghost"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  color: 'var(--on-surface-variant)',
                  border: 'none',
                  cursor: isCheckingOut ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel / Return to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}