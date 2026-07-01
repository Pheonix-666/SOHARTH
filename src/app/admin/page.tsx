'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/context/ToastContext';

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  tag: string;
  image: string;
  images: string[];
  description: string;
  collection: string;
  material: string;
  shipping: string;
}

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  size: string;
  price: number;
}

interface Order {
  id: string;
  timestamp: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    street?: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    pincode?: string;
    country?: string;
  };
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  internalNotes?: string;
}

interface Category {
  value: string;
  label: string;
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(229,226,224,0.2)',
  padding: '0.75rem 0',
  color: 'var(--primary)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  fontSize: '13px',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#1c1b1b',
  cursor: 'pointer',
};

// ─── Label component ──────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="font-label-caps"
      style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem' }}
    >
      {children}
    </label>
  );
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'orders' | 'categories'>('inventory');
  const [isLoading, setIsLoading] = useState(true);

  // ── Add Product Form ──────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', subtitle: '', price: '', category: '',
    tag: '', image: '', images: [''], description: '',
    collection: 'COLLECTION 01: NEBULA', material: '', shipping: '',
  });

  // ── Inline "Create Category" panel (visible inside Add tab) ───────────────
  const [showCatPanel, setShowCatPanel] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catMsg, setCatMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Categories tab ─────────────────────────────────────────────────────────
  const [catTabLabel, setCatTabLabel] = useState('');

  // ── Edit Modal ─────────────────────────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ── Image Upload ───────────────────────────────────────────────────────────
  const [uploadingIdx, setUploadingIdx] = useState<{idx: number, isEdit: boolean} | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx({ idx, isEdit });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (isEdit && editingProduct) {
          const newImages = [...(editingProduct.images || [editingProduct.image || ''])];
          newImages[idx] = data.url;
          setEditingProduct({ ...editingProduct, images: newImages, image: newImages[0] });
        } else {
          const newImages = [...form.images];
          newImages[idx] = data.url;
          setForm({ ...form, images: newImages, image: newImages[0] });
        }
      } else {
        showToast('Upload failed: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Upload failed.', 'error');
    } finally {
      setUploadingIdx(null);
    }
  };

  // ─── Fetch everything ──────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data: Category[] = await res.json();
      setCategories(data);
      // seed form default to first category
      if (data.length > 0) {
        setForm(prev => ({ ...prev, category: prev.category || data[0].value }));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/orders'),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      setProducts(prodData);
      setOrders(ordData);
    } catch (err) {
      console.error('Error fetching admin workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, []);

  // ── Orders Search & Filter States ─────────────────────────────────────────
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    const searchLower = orderSearch.toLowerCase();
    const matchesSearch = !orderSearch || 
      o.id.toLowerCase().includes(searchLower) ||
      (o.customer?.name || '').toLowerCase().includes(searchLower) ||
      (o.customer?.email || '').toLowerCase().includes(searchLower) ||
      (o.customer?.phone || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter || (!o.orderStatus && statusFilter === 'Pending');
    return matchesSearch && matchesStatus;
  });

  const downloadCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'Status', 'Payment Method', 'Tracking', 'Items', 'Total'];
    const rows = filteredOrders.map(o => {
      const itemsStr = o.items.map(i => `${i.qty}x ${i.name} (${i.size})`).join('; ');
      const addr = o.shippingAddress ? `${o.shippingAddress.street || o.shippingAddress.line1 || ''}, ${o.shippingAddress.city}, ${o.shippingAddress.state} ${o.shippingAddress.zip || o.shippingAddress.pincode || ''}, ${o.shippingAddress.country}` : '';
      return [
        o.id,
        new Date(o.timestamp).toLocaleString().replace(/,/g, ''),
        o.customer?.name || '',
        o.customer?.email || '',
        o.customer?.phone || '',
        `"${addr.replace(/"/g, '""')}"`,
        o.orderStatus || 'Pending',
        o.paymentMethod || 'Cash on Delivery',
        o.trackingNumber || '',
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.total
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soharth_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateOrder = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        // update local state
        setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
      } else {
        showToast('Failed to update order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating order', 'error');
    }
  };

  // ─── Create Category (shared handler) ─────────────────────────────────────
  const handleCreateCategory = async (
    labelValue: string,
    onSuccess?: (cat: Category) => void,
  ) => {
    if (!labelValue.trim()) return;
    setCatLoading(true);
    setCatMsg(null);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: labelValue.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        setCatMsg({ type: 'ok', text: `"${data.category.label}" registered in the catalogue.` });
        onSuccess?.(data.category);
      } else {
        setCatMsg({ type: 'err', text: data.error || 'Registration failed.' });
      }
    } catch {
      setCatMsg({ type: 'err', text: 'Network transmission failed.' });
    } finally {
      setCatLoading(false);
    }
  };

  // ─── Delete Category ───────────────────────────────────────────────────────
  const handleDeleteCategory = async (value: string) => {
    if (!confirm(`Remove category "${value}" from the registry? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/categories?value=${encodeURIComponent(value)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
      } else {
        showToast(data.error || 'Deletion failed.', 'error');
      }
    } catch {
      showToast('Network transmission failed.', 'error');
    }
  };

  // ─── Add Product ───────────────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      showToast('Please configure the mandatory fields (Name, Price, Category).', 'error');
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${data.product.name} successfully registered in the celestial registry!`, 'success');
        setForm({
          name: '', subtitle: '', price: '', category: categories[0]?.value || '',
          tag: '', image: '', images: [''], description: '',
          collection: 'COLLECTION 01: NEBULA', material: '', shipping: '',
        });
        setShowCatPanel(false);
        setActiveTab('inventory');
        fetchData();
      } else {
        showToast('Registration failed: ' + data.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network transmission failed.', 'error');
    }
  };

  // ─── Edit Product ──────────────────────────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.image.match(/^[a-zA-Z]:\\/)) {
      showToast('Error: Please provide a valid web URL (http/https) or relative path (/image.jpg), not a local file path.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product successfully updated!', 'success');
        setEditingProduct(null);
        fetchData();
      } else {
        showToast('Update failed: ' + data.error, 'error');
      }
    } catch {
      showToast('Network transmission failed.', 'error');
    }
  };

  // ─── Delete Product ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Remove this garment from the catalogue? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { fetchData(); showToast('Product deleted.', 'info'); }
      else { showToast('Decommissioning failed: ' + data.error, 'error'); }
    } catch { showToast('Network transmission failed.', 'error'); }
  };

  const loadPreset = () => {
    setForm({
      name: 'SUPERNOVA HOODIE',
      subtitle: 'Technical Spacer Crepe / Cosmic Dust',
      price: '340',
      category: categories[0]?.value || 'essentials',
      tag: 'NEW',
      image: '/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg',
      images: ['/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg', '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg'],
      description: 'A heavyweight, architectural technical hoodie detailed with double-bonded dynamic spacer crepe lines.',
      collection: 'COLLECTION 02: HORIZON',
      material: '60% Rayon technical blend, 35% Recycled Spacer fiber, 5% Elastane.',
      shipping: 'Complimentary express shipping on orders over ₹500.',
    });
  };

  // ─── Shared category <select> ──────────────────────────────────────────────
  // Category selection is now inlined where needed to prevent render-time component creation

  // ─── Tab definitions ───────────────────────────────────────────────────────
  const tabs = [
    { id: 'inventory', label: 'INVENTORY' },
    { id: 'add', label: 'ADD APPAREL' },
    { id: 'categories', label: 'CATEGORIES' },
    { id: 'orders', label: 'ORDER RELAY' },
  ] as const;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '8.75rem', paddingBottom: 'var(--section-gap)', minHeight: '90vh' }}>
        <div className="container">

          {/* Header */}
          <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.4em', display: 'block', marginBottom: '0.5rem' }}>SOHARTH MANAGEMENT CONSOLE</span>
              <h1 className="font-headline-lg" style={{ color: 'var(--primary)' }}>Control Relay</h1>
            </div>
            <div style={{ display: 'flex', border: '1px solid rgba(229,226,224,0.15)', padding: '4px', flexWrap: 'wrap', gap: '2px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="font-label-caps"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--on-primary)' : 'var(--primary)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div className="font-label-caps" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>Synchronizing cosmic array...</div>
            </div>
          ) : (
            <div className="fade-in-up">

              {/* ─── TAB 1: INVENTORY ─── */}
              {activeTab === 'inventory' && (
                <section>
                  {products.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', border: '1px solid rgba(229,226,224,0.1)' }}>
                      <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>The database is void of catalogue items.</p>
                      <button onClick={() => setActiveTab('add')} className="btn-primary">Create First Product</button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }} className="hide-scrollbar">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(229,226,224,0.2)' }}>
                            {['APPAREL', 'COLLECTION', 'CATEGORY', 'PRICE', 'ACTIONS'].map((h, i) => (
                              <th key={h} className="font-label-caps" style={{ padding: '1rem', opacity: 0.5, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(229,226,224,0.06)' }}>
                              <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ position: 'relative', width: '50px', height: '65px', overflow: 'hidden', backgroundColor: 'var(--surface-container)', flexShrink: 0 }}>
                                  <Image src={product.image || '/logo.jpg'} alt={product.name} fill style={{ objectFit: 'cover' }} />
                                </div>
                                <div>
                                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '4px' }}>{product.name}</h4>
                                  <span className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>{product.subtitle}</span>
                                </div>
                              </td>
                              <td className="font-body-md" style={{ padding: '1rem', color: 'var(--primary)' }}>{product.collection}</td>
                              <td className="font-label-caps" style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '10px' }}>{product.category}</td>
                              <td className="font-body-md" style={{ padding: '1rem', color: 'var(--primary)' }}>₹{product.price.toLocaleString()}</td>

                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
                                  <button
                                    onClick={() => setEditingProduct(product)}
                                    className="font-label-caps"
                                    style={{ border: '1px solid rgba(229,226,224,0.3)', padding: '0.5rem 1.25rem', fontSize: '9px', color: 'var(--primary)', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,226,224,0.3)'}
                                  >EDIT</button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="font-label-caps"
                                    style={{ border: '1px solid rgba(255,75,75,0.3)', padding: '0.5rem 1.25rem', fontSize: '9px', color: '#ff4b4b', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,75,75,0.1)'; e.currentTarget.style.borderColor = '#ff4b4b'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,75,75,0.3)'; }}
                                  >DELETE</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* ─── TAB 2: ADD PRODUCT ─── */}
              {activeTab === 'add' && (
                <section style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div className="glass-panel" style={{ padding: '3.5rem', border: '1px solid rgba(229,226,224,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h2 className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.2em' }}>ADD NEW GARMENT</h2>
                      <button
                        type="button" onClick={loadPreset} className="font-label-caps"
                        style={{ border: '1px solid var(--primary)', padding: '0.5rem 1rem', fontSize: '9px', color: 'var(--primary)', background: 'transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--on-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                      >⚡ LOAD TEST MOCKUP</button>
                    </div>

                    <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <FieldLabel>GARMENT NAME *</FieldLabel>
                          <input type="text" required placeholder="e.g., ASTRAL CREW" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <FieldLabel>PRICE (USD) *</FieldLabel>
                          <input type="number" required placeholder="e.g., 295" value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <FieldLabel>SUBTITLE / SPECIFICATION</FieldLabel>
                          <input type="text" placeholder="e.g., Pima Cotton Blend / Starlight Silver" value={form.subtitle}
                            onChange={e => setForm({ ...form, subtitle: e.target.value })} style={inputStyle} />
                        </div>

                        {/* ── Category select + inline create ── */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <FieldLabel>CATEGORY *</FieldLabel>
                            <button
                              type="button"
                              onClick={() => { setShowCatPanel(v => !v); setCatMsg(null); setNewCatLabel(''); }}
                              className="font-label-caps"
                              style={{
                                fontSize: '9px', letterSpacing: '0.15em', padding: '3px 10px',
                                border: '1px solid rgba(229,226,224,0.25)', background: 'transparent',
                                color: 'var(--on-surface-variant)', cursor: 'pointer', transition: 'all 0.3s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(229,226,224,0.25)'}
                            >
                              {showCatPanel ? '✕ CLOSE' : '+ NEW'}
                            </button>
                          </div>
                          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={selectStyle}>
                            {categories.length === 0 && (
                              <option value="" disabled>No categories yet — create one below</option>
                            )}
                            {categories.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>

                          {/* Inline create-category panel */}
                          {showCatPanel && (
                            <div style={{
                              marginTop: '1rem', padding: '1.25rem',
                              border: '1px solid rgba(229,226,224,0.12)',
                              background: 'rgba(229,226,224,0.03)',
                              display: 'flex', flexDirection: 'column', gap: '0.75rem',
                            }}>
                              <span className="font-label-caps" style={{ fontSize: '9px', letterSpacing: '0.3em', opacity: 0.5 }}>NEW CATEGORY</span>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                                <input
                                  type="text"
                                  placeholder="e.g., Loungewear"
                                  value={newCatLabel}
                                  onChange={e => { setNewCatLabel(e.target.value); setCatMsg(null); }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleCreateCategory(newCatLabel, cat => {
                                        setForm(prev => ({ ...prev, category: cat.value }));
                                        setNewCatLabel('');
                                        setShowCatPanel(false);
                                      });
                                    }
                                  }}
                                  style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                  type="button"
                                  disabled={catLoading || !newCatLabel.trim()}
                                  onClick={() => handleCreateCategory(newCatLabel, cat => {
                                    setForm(prev => ({ ...prev, category: cat.value }));
                                    setNewCatLabel('');
                                    setShowCatPanel(false);
                                  })}
                                  className="font-label-caps"
                                  style={{
                                    padding: '0.5rem 1rem', fontSize: '9px', letterSpacing: '0.15em',
                                    border: '1px solid var(--primary)', color: 'var(--primary)',
                                    background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
                                    opacity: catLoading || !newCatLabel.trim() ? 0.4 : 1, transition: 'all 0.3s',
                                  }}
                                >
                                  {catLoading ? '...' : 'REGISTER'}
                                </button>
                              </div>
                              {catMsg && (
                                <span className="font-caption" style={{ color: catMsg.type === 'ok' ? '#7fcf9f' : '#ff4b4b', fontSize: '10px' }}>
                                  {catMsg.type === 'ok' ? '✓' : '✗'} {catMsg.text}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <FieldLabel>IMAGES (PRIMARY FIRST)</FieldLabel>
                          {form.images.map((img, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                              {img && <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                              <div style={{ flex: 1 }}>
                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, idx, false)} style={{ color: 'var(--primary)', fontSize: '12px' }} />
                                {uploadingIdx?.idx === idx && !uploadingIdx.isEdit && <span style={{ fontSize: '10px', color: 'var(--primary)', marginLeft: '8px' }}>Uploading...</span>}
                              </div>
                              {form.images.length > 1 && (
                                <button type="button" onClick={() => {
                                  const newImages = form.images.filter((_, i) => i !== idx);
                                  setForm({ ...form, images: newImages, image: newImages[0] || '' });
                                }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer' }}>✕</button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ''] })}
                            style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', fontSize: '10px', marginTop: '0.5rem', cursor: 'pointer' }}>
                            + ADD ANOTHER IMAGE
                          </button>
                        </div>
                      </div>

                      <div>
                        <FieldLabel>COLLECTION NAME</FieldLabel>
                        <input type="text" placeholder="e.g., COLLECTION 01: NEBULA" value={form.collection}
                          onChange={e => setForm({ ...form, collection: e.target.value })} style={inputStyle} />
                      </div>

                      <div>
                        <FieldLabel>DESCRIPTION</FieldLabel>
                        <textarea
                          placeholder="Write the architectural and design rationale for this piece..."
                          value={form.description}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                          <FieldLabel>MATERIALS &amp; CARE</FieldLabel>
                          <input type="text" placeholder="e.g., 85% Virgin Wool, 15% Mulberry Silk." value={form.material}
                            onChange={e => setForm({ ...form, material: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <FieldLabel>SHIPPING &amp; LOGISTICS</FieldLabel>
                          <input type="text" placeholder="e.g., Complimentary express shipping." value={form.shipping}
                            onChange={e => setForm({ ...form, shipping: e.target.value })} style={inputStyle} />
                        </div>
                      </div>

                      <div style={{ paddingTop: '1.5rem' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.5rem', letterSpacing: '0.3em' }}>
                          BROADCAST TO CATALOGUE
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              )}

              {/* ─── TAB 3: CATEGORIES ─── */}
              {activeTab === 'categories' && (
                <section style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                  {/* Create new category */}
                  <div className="glass-panel" style={{ padding: '3rem', border: '1px solid rgba(229,226,224,0.1)' }}>
                    <h2 className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.2em', marginBottom: '2rem' }}>REGISTER NEW CATEGORY</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <FieldLabel>CATEGORY LABEL</FieldLabel>
                        <input
                          type="text"
                          placeholder="e.g., Loungewear, Accessories, Knitwear"
                          value={catTabLabel}
                          onChange={e => { setCatTabLabel(e.target.value); setCatMsg(null); }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateCategory(catTabLabel, () => setCatTabLabel(''));
                            }
                          }}
                          style={inputStyle}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={catLoading || !catTabLabel.trim()}
                        onClick={() => handleCreateCategory(catTabLabel, () => setCatTabLabel(''))}
                        className="btn-primary font-label-caps"
                        style={{ padding: '0.85rem 2rem', opacity: catLoading || !catTabLabel.trim() ? 0.4 : 1, transition: 'opacity 0.3s' }}
                      >
                        {catLoading ? '...' : 'REGISTER'}
                      </button>
                    </div>
                    {catMsg && (
                      <p className="font-caption" style={{ marginTop: '1rem', color: catMsg.type === 'ok' ? '#7fcf9f' : '#ff4b4b' }}>
                        {catMsg.type === 'ok' ? '✓' : '✗'} {catMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Existing categories list */}
                  <div className="glass-panel" style={{ padding: '3rem', border: '1px solid rgba(229,226,224,0.1)' }}>
                    <h2 className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.2em', marginBottom: '2rem' }}>
                      ACTIVE CATEGORIES
                      <span className="font-label-caps" style={{ fontSize: '10px', opacity: 0.4, marginLeft: '1rem' }}>{categories.length} registered</span>
                    </h2>
                    {categories.length === 0 ? (
                      <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', opacity: 0.5 }}>No categories registered yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {categories.map((cat, idx) => (
                          <div
                            key={cat.value}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '1.25rem 0',
                              borderBottom: idx < categories.length - 1 ? '1px solid rgba(229,226,224,0.06)' : 'none',
                            }}
                          >
                            <div>
                              <span className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.15em' }}>{cat.label}</span>
                              <span className="font-caption" style={{ color: 'var(--on-surface-variant)', marginLeft: '1rem', opacity: 0.4, fontSize: '10px' }}>
                                slug: {cat.value}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(cat.value)}
                              className="font-label-caps"
                              style={{
                                border: '1px solid rgba(255,75,75,0.25)', padding: '0.4rem 1rem',
                                fontSize: '9px', color: '#ff4b4b', background: 'transparent',
                                cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.1em',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,75,75,0.1)'; e.currentTarget.style.borderColor = '#ff4b4b'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,75,75,0.25)'; }}
                            >
                              REMOVE
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ─── TAB 4: ORDER RELAY ─── */}
              {activeTab === 'orders' && (
                <section>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
                      <input 
                        type="text" 
                        placeholder="Search by ID, Name, Email, Phone..." 
                        value={orderSearch} 
                        onChange={e => setOrderSearch(e.target.value)} 
                        style={{ ...inputStyle, flex: 2 }} 
                      />
                      <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)} 
                        style={{ ...selectStyle, flex: 1 }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={downloadCSV} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '11px', letterSpacing: '0.1em' }}>
                        EXPORT CSV
                      </button>
                      <button onClick={() => window.print()} className="btn-ghost" style={{ padding: '0.75rem 1.5rem', fontSize: '11px', letterSpacing: '0.1em' }}>
                        PRINT
                      </button>
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', border: '1px solid rgba(229,226,224,0.1)' }}>
                      <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>No transaction logs match your criteria.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {filteredOrders.map(order => {
                        const isExpanded = expandedOrderId === order.id;
                        const addr = order.shippingAddress || {};
                        return (
                          <div key={order.id} className="glass-panel" style={{
                            padding: '2.5rem', border: '1px solid rgba(229,226,224,0.1)',
                            display: 'flex', flexDirection: 'column', gap: '2rem'
                          }}>
                            {/* Summary Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.2em' }}>ORDER REF</span>
                                  <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>#{order.id}</strong>
                                </div>
                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.2em' }}>DATE</span>
                                  <span className="font-body-md" style={{ color: 'var(--primary)' }}>{new Date(order.timestamp).toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.2em' }}>STATUS</span>
                                  <span className="font-body-md" style={{ color: order.orderStatus === 'Cancelled' ? '#ff4b4b' : order.orderStatus === 'Delivered' ? '#4bff8e' : 'var(--primary)' }}>
                                    {order.orderStatus || 'Pending'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.2em' }}>CUSTOMER</span>
                                  <span className="font-body-md" style={{ color: 'var(--primary)' }}>{order.customer?.name || 'Guest'}</span>
                                </div>
                              </div>
                              <div style={{ borderLeft: '1px solid rgba(229,226,224,0.1)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'right' }}>
                                <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '9px' }}>TOTAL</span>
                                <span className="font-headline-md" style={{ color: 'var(--primary)', fontSize: '24px' }}>₹{order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div style={{ borderTop: '1px solid rgba(229,226,224,0.06)', paddingTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                
                                {/* Left Column: Customer & Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                  <div>
                                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.2em' }}>Customer Details</h4>
                                    <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                                      <strong>Name:</strong> {order.customer?.name}<br/>
                                      <strong>Email:</strong> {order.customer?.email}<br/>
                                      <strong>Phone:</strong> {order.customer?.phone}<br/>
                                    </p>
                                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem', letterSpacing: '0.2em' }}>Shipping Address</h4>
                                    <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                                      {addr.street || addr.line1}<br/>
                                      {addr.city}, {addr.state} {addr.zip || addr.pincode}<br/>
                                      {addr.country}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.2em' }}>Items Ordered</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(229,226,224,0.05)' }}>
                                          <span className="font-body-md" style={{ color: 'var(--primary)' }}>
                                            {item.qty}x <span className="font-label-caps" style={{ fontSize: '11px', letterSpacing: '0.1em' }}>{item.name}</span>
                                            <strong style={{ color: 'var(--on-surface-variant)', fontSize: '9px', marginLeft: '8px', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 4px' }}>SIZE {item.size}</strong>
                                          </span>
                                          <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column: Management */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '4px' }}>
                                  <h4 className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.2em' }}>Order Management</h4>
                                  
                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Order Status</label>
                                    <select 
                                      value={order.orderStatus || 'Pending'} 
                                      onChange={e => handleUpdateOrder(order.id, { orderStatus: e.target.value })}
                                      style={{ ...selectStyle, padding: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Payment Status (Method: {order.paymentMethod || 'Cash on Delivery'})</label>
                                    <select 
                                      value={order.paymentStatus || 'Pending'} 
                                      onChange={e => handleUpdateOrder(order.id, { paymentStatus: e.target.value })}
                                      style={{ ...selectStyle, padding: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Paid">Paid</option>
                                      <option value="Failed">Failed</option>
                                      <option value="Refunded">Refunded</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Tracking Number</label>
                                    <input 
                                      type="text" 
                                      value={order.trackingNumber || ''} 
                                      onChange={e => handleUpdateOrder(order.id, { trackingNumber: e.target.value })}
                                      placeholder="e.g. 1Z9999999999999999"
                                      style={{ ...inputStyle, padding: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
                                    />
                                  </div>

                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.25rem' }}>Internal Notes</label>
                                    <textarea 
                                      value={order.internalNotes || ''} 
                                      onChange={e => handleUpdateOrder(order.id, { internalNotes: e.target.value })}
                                      placeholder="Customer called regarding..."
                                      style={{ ...inputStyle, padding: '0.5rem', background: 'rgba(0,0,0,0.5)', minHeight: '80px', resize: 'vertical' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

            </div>
          )}
        </div>
      </main>

      {/* ─── EDIT PRODUCT MODAL ─── */}
      {editingProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(10,9,9,0.9)', backdropFilter: 'blur(15px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}>
          <div className="glass-panel fade-in-up" style={{
            maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            padding: '3rem', border: '1px solid rgba(229,226,224,0.15)', position: 'relative',
          }}>
            <button
              onClick={() => setEditingProduct(null)}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>close</span>
            </button>

            <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '2.5rem', letterSpacing: '0.2em' }}>EDIT APPAREL PIECE</h2>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <FieldLabel>GARMENT NAME *</FieldLabel>
                  <input type="text" required value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>PRICE (USD) *</FieldLabel>
                  <input type="number" required value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <FieldLabel>SUBTITLE / SPECIFICATION</FieldLabel>
                  <input type="text" value={editingProduct.subtitle}
                    onChange={e => setEditingProduct({ ...editingProduct, subtitle: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>CATEGORY *</FieldLabel>
                  <select 
                    value={editingProduct.category} 
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} 
                    style={selectStyle}
                  >
                    {categories.length === 0 && (
                      <option value="" disabled>No categories yet — create one below</option>
                    )}
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <FieldLabel>IMAGES (PRIMARY FIRST)</FieldLabel>
                  {(editingProduct.images || [editingProduct.image || '']).map((img, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      {img && <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div style={{ flex: 1 }}>
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, idx, true)} style={{ color: 'var(--primary)', fontSize: '12px' }} />
                        {uploadingIdx?.idx === idx && uploadingIdx.isEdit && <span style={{ fontSize: '10px', color: 'var(--primary)', marginLeft: '8px' }}>Uploading...</span>}
                      </div>
                      {(editingProduct.images || []).length > 1 && (
                        <button type="button" onClick={() => {
                          const newImages = (editingProduct.images || []).filter((_, i) => i !== idx);
                          setEditingProduct({ ...editingProduct, images: newImages, image: newImages[0] || '' });
                        }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || [editingProduct.image || '']), ''] })}
                    style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', fontSize: '10px', marginTop: '0.5rem', cursor: 'pointer' }}>
                    + ADD ANOTHER IMAGE
                  </button>
                </div>
              </div>

              <div>
                <FieldLabel>COLLECTION NAME</FieldLabel>
                <input type="text" value={editingProduct.collection}
                  onChange={e => setEditingProduct({ ...editingProduct, collection: e.target.value })} style={inputStyle} />
              </div>

              <div>
                <FieldLabel>DESCRIPTION</FieldLabel>
                <textarea value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <FieldLabel>MATERIALS &amp; CARE</FieldLabel>
                  <input type="text" value={editingProduct.material}
                    onChange={e => setEditingProduct({ ...editingProduct, material: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>SHIPPING &amp; LOGISTICS</FieldLabel>
                  <input type="text" value={editingProduct.shipping}
                    onChange={e => setEditingProduct({ ...editingProduct, shipping: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1.25rem', letterSpacing: '0.2em' }}>SAVE CHANGES</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="btn-ghost" style={{ flex: 1, padding: '1.25rem', letterSpacing: '0.2em' }}>CANCEL</button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
