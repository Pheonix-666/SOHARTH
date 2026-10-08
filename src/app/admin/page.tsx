'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/context/ToastContext';

interface ColorVariation {
  name: string;
  hex: string;
  images?: string[];
}

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  category: string;
  tag: string;
  image: string;
  images: string[];
  description: string;
  collection?: string;
  material: string;
  shipping: string;
  colors?: ColorVariation[];
}

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  size: string;
  price: number;
}

export interface SizeOrderEntry {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  timestamp: string;
  qty: number;
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
}

export interface GarmentDemandData {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  totalUnits: number;
  pendingUnits: number;
  fulfilledUnits: number;
  revenue: number;
  sizes: {
    [size: string]: {
      total: number;
      pending: number;
      fulfilled: number;
      orders: SizeOrderEntry[];
    };
  };
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
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'orders' | 'categories' | 'demand'>('inventory');
  const [isLoading, setIsLoading] = useState(true);

  // ── Add Product Form ──────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', subtitle: '', original_price: '', price: '', category: '',
    tag: '', image: '', images: [''], description: '',
    material: '', shipping: '',
    colors: [] as ColorVariation[],
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
  const [uploadingColorIdx, setUploadingColorIdx] = useState<{ colorIdx: number; imgIdx: number; isEdit: boolean } | null>(null);

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

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, colorIdx: number, imgIdx: number, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColorIdx({ colorIdx, imgIdx, isEdit });
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
          const newColors = [...(editingProduct.colors || [])];
          const newColorImages = [...(newColors[colorIdx].images || [])];
          newColorImages[imgIdx] = data.url;
          newColors[colorIdx] = {
            ...newColors[colorIdx],
            images: newColorImages,
          };
          setEditingProduct({ ...editingProduct, colors: newColors });
        } else {
          const newColors = [...form.colors];
          const newColorImages = [...(newColors[colorIdx].images || [])];
          newColorImages[imgIdx] = data.url;
          newColors[colorIdx] = {
            ...newColors[colorIdx],
            images: newColorImages,
          };
          setForm({ ...form, colors: newColors });
        }
      } else {
        showToast('Upload failed: ' + data.error, 'error');
      }
    } catch (err) {
      showToast('Upload failed.', 'error');
    } finally {
      setUploadingColorIdx(null);
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
  const [orderRelayTab, setOrderRelayTab] = useState<'all' | 'not_given' | 'shipped' | 'given' | 'cancelled'>('all');
  const [orderSort, setOrderSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // ── Metrics & Aggregations ────────────────────────────────────────────────
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const givenOrders = orders.filter(o => o.orderStatus === 'Delivered');
  const givenCount = givenOrders.length;
  const givenRevenue = givenOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const notGivenOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const notGivenCount = notGivenOrders.length;
  const notGivenRevenue = notGivenOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const shippedOrders = orders.filter(o => o.orderStatus === 'Shipped');
  const shippedCount = shippedOrders.length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled');
  const cancelledCount = cancelledOrders.length;
  const effectiveTotal = totalOrdersCount - cancelledCount;
  const fulfillmentRate = effectiveTotal > 0 ? Math.round((givenCount / effectiveTotal) * 100) : 0;

  const filteredOrders = orders.filter(o => {
    const searchLower = orderSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      o.id.toLowerCase().includes(searchLower) ||
      (o.customer?.name || '').toLowerCase().includes(searchLower) ||
      (o.customer?.email || '').toLowerCase().includes(searchLower) ||
      (o.customer?.phone || '').includes(searchLower) ||
      (o.shippingAddress?.city || '').toLowerCase().includes(searchLower) ||
      (o.shippingAddress?.state || '').toLowerCase().includes(searchLower) ||
      (o.shippingAddress?.zip || o.shippingAddress?.pincode || '').includes(searchLower) ||
      (o.trackingNumber || '').toLowerCase().includes(searchLower) ||
      (o.items || []).some(item => item.name?.toLowerCase().includes(searchLower));
    
    // Status Tab filter
    let matchesTab = true;
    if (orderRelayTab === 'not_given') {
      matchesTab = o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled';
    } else if (orderRelayTab === 'given') {
      matchesTab = o.orderStatus === 'Delivered';
    } else if (orderRelayTab === 'shipped') {
      matchesTab = o.orderStatus === 'Shipped';
    } else if (orderRelayTab === 'cancelled') {
      matchesTab = o.orderStatus === 'Cancelled';
    }

    // Payment Filter
    const matchesPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter || (!o.paymentStatus && paymentFilter === 'Pending');

    return matchesSearch && matchesTab && matchesPayment;
  }).sort((a, b) => {
    if (orderSort === 'newest') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (orderSort === 'oldest') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (orderSort === 'highest') {
      return (Number(b.total) || 0) - (Number(a.total) || 0);
    }
    if (orderSort === 'lowest') {
      return (Number(a.total) || 0) - (Number(b.total) || 0);
    }
    return 0;
  });

  const downloadCSV = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Delivery Address',
      'Order Status',
      'Given / Delivered State',
      'Payment Status',
      'Payment Method',
      'Tracking Number',
      'Internal Notes',
      'Items Ordered',
      'Subtotal',
      'Tax',
      'Total Amount (INR)'
    ];
    const rows = filteredOrders.map(o => {
      const itemsStr = (o.items || []).map(i => `${i.qty}x ${i.name} (Size: ${i.size})`).join('; ');
      const addr = o.shippingAddress ? `${o.shippingAddress.street || o.shippingAddress.line1 || ''}, ${o.shippingAddress.city || ''}, ${o.shippingAddress.state || ''} ${o.shippingAddress.zip || o.shippingAddress.pincode || ''}, ${o.shippingAddress.country || ''}` : '';
      const isGiven = o.orderStatus === 'Delivered' ? 'GIVEN / DELIVERED' : 'NOT GIVEN / PENDING';
      return [
        o.id,
        new Date(o.timestamp).toLocaleString().replace(/,/g, ''),
        o.customer?.name || 'Guest',
        o.customer?.email || '',
        o.customer?.phone || '',
        `"${addr.replace(/"/g, '""')}"`,
        o.orderStatus || 'Pending',
        isGiven,
        o.paymentStatus || 'Pending',
        o.paymentMethod || 'Cash on Delivery',
        o.trackingNumber || '',
        `"${(o.internalNotes || '').replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.subtotal || 0,
        o.tax || 0,
        o.total || 0
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soharth_order_relay_${new Date().toISOString().split('T')[0]}.csv`);
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
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
        if (editingOrder && editingOrder.id === id) {
          setEditingOrder(prev => prev ? { ...prev, ...updates } : null);
        }
      } else {
        showToast('Failed to update order: ' + (data.error || 'Server error'), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while updating order', 'error');
    }
  };

  const handleQuickMarkGiven = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await handleUpdateOrder(id, { orderStatus: 'Delivered' });
    showToast('Order confirmed as GIVEN / DELIVERED! ✅', 'success');
  };

  const handleQuickMarkShipped = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const tracking = prompt('Enter tracking or AWB number (optional):') || '';
    await handleUpdateOrder(id, { orderStatus: 'Shipped', trackingNumber: tracking });
    showToast('Order marked as SHIPPED 🚚', 'success');
  };

  const handleQuickMarkProcessing = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await handleUpdateOrder(id, { orderStatus: 'Processing' });
    showToast('Order marked as PROCESSING ⚙️', 'info');
  };

  const handleSaveOrderModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: editingOrder.orderStatus,
          paymentStatus: editingOrder.paymentStatus,
          trackingNumber: editingOrder.trackingNumber,
          internalNotes: editingOrder.internalNotes,
          shippingMethod: editingOrder.shippingMethod,
          customer: editingOrder.customer,
          shippingAddress: editingOrder.shippingAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...editingOrder } : o));
        showToast('Order settings saved successfully!', 'success');
        setEditingOrder(null);
      } else {
        showToast('Failed to save order: ' + (data.error || 'Error'), 'error');
      }
    } catch {
      showToast('Network error while saving order', 'error');
    }
  };

  const copyToClipboard = (text: string, label: string = 'Copied') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  // ─── Garment Demand & Sizing Matrix State ─────────────────────────────────
  const [demandSearch, setDemandSearch] = useState('');
  const [demandCategoryFilter, setDemandCategoryFilter] = useState('All');
  const [demandStatusFilter, setDemandStatusFilter] = useState<'all' | 'pending' | 'fulfilled'>('all');
  const [demandSort, setDemandSort] = useState<'most_pending' | 'most_demand' | 'highest_rev' | 'name'>('most_pending');
  const [demandSelectedSizeFilter, setDemandSelectedSizeFilter] = useState<string>('All');
  const [selectedSizeDetail, setSelectedSizeDetail] = useState<{
    garmentId: string;
    garmentName: string;
    garmentImage: string;
    size: string;
    total: number;
    pending: number;
    fulfilled: number;
    orders: SizeOrderEntry[];
  } | null>(null);
  const [isPrintingManifest, setIsPrintingManifest] = useState(false);

  // ─── Garment Demand & Sizing Matrix Calculations ──────────────────────────
  const garmentDemandList = useMemo<GarmentDemandData[]>(() => {
    const map = new Map<string, GarmentDemandData>();

    // 1. Seed with active catalog products
    products.forEach(p => {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        image: p.image || (p.images && p.images[0]) || '/logo.jpg',
        price: Number(p.price) || 0,
        totalUnits: 0,
        pendingUnits: 0,
        fulfilledUnits: 0,
        revenue: 0,
        sizes: {},
      });
    });

    // 2. Iterate orders and aggregate item demand
    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled') return;
      const isDelivered = order.orderStatus === 'Delivered';

      (order.items || []).forEach(item => {
        let matchedId = item.id;
        if (!map.has(matchedId)) {
          // Fallback search by normalized name
          const found = products.find(p => p.name.trim().toLowerCase() === (item.name || '').trim().toLowerCase());
          if (found) {
            matchedId = found.id;
          } else {
            matchedId = item.id || item.name;
            if (!map.has(matchedId)) {
              map.set(matchedId, {
                id: matchedId,
                name: item.name || 'Custom Garment',
                category: 'Apparel',
                image: '/logo.jpg',
                price: Number(item.price) || 0,
                totalUnits: 0,
                pendingUnits: 0,
                fulfilledUnits: 0,
                revenue: 0,
                sizes: {},
              });
            }
          }
        }

        const garment = map.get(matchedId)!;
        const qty = Number(item.qty) || 1;
        const sizeKey = (item.size || 'M').trim().toUpperCase();
        const price = Number(item.price) || garment.price || 0;

        garment.totalUnits += qty;
        garment.revenue += price * qty;
        if (isDelivered) {
          garment.fulfilledUnits += qty;
        } else {
          garment.pendingUnits += qty;
        }

        if (!garment.sizes[sizeKey]) {
          garment.sizes[sizeKey] = {
            total: 0,
            pending: 0,
            fulfilled: 0,
            orders: [],
          };
        }

        garment.sizes[sizeKey].total += qty;
        if (isDelivered) {
          garment.sizes[sizeKey].fulfilled += qty;
        } else {
          garment.sizes[sizeKey].pending += qty;
        }

        garment.sizes[sizeKey].orders.push({
          orderId: order.id,
          orderStatus: order.orderStatus || 'Pending',
          paymentStatus: order.paymentStatus || 'Pending',
          timestamp: order.timestamp,
          qty: qty,
          customer: order.customer,
          shippingAddress: order.shippingAddress,
        });
      });
    });

    return Array.from(map.values());
  }, [products, orders]);

  // Global Brand-wide Size Distribution
  const globalSizeStats = useMemo(() => {
    const sizeMap: { [size: string]: { total: number; pending: number; fulfilled: number } } = {
      'XS': { total: 0, pending: 0, fulfilled: 0 },
      'S': { total: 0, pending: 0, fulfilled: 0 },
      'M': { total: 0, pending: 0, fulfilled: 0 },
      'L': { total: 0, pending: 0, fulfilled: 0 },
      'XL': { total: 0, pending: 0, fulfilled: 0 },
      'XXL': { total: 0, pending: 0, fulfilled: 0 },
    };

    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled') return;
      const isDelivered = order.orderStatus === 'Delivered';

      (order.items || []).forEach(item => {
        const sizeKey = (item.size || 'M').trim().toUpperCase();
        const qty = Number(item.qty) || 1;

        if (!sizeMap[sizeKey]) {
          sizeMap[sizeKey] = { total: 0, pending: 0, fulfilled: 0 };
        }
        sizeMap[sizeKey].total += qty;
        if (isDelivered) {
          sizeMap[sizeKey].fulfilled += qty;
        } else {
          sizeMap[sizeKey].pending += qty;
        }
      });
    });

    return sizeMap;
  }, [orders]);

  // Filtered Garments for Matrix Grid
  const filteredDemandList = useMemo(() => {
    return garmentDemandList
      .filter(g => {
        const searchLower = demandSearch.toLowerCase().trim();
        const matchesSearch = !searchLower ||
          g.name.toLowerCase().includes(searchLower) ||
          g.category.toLowerCase().includes(searchLower);

        const matchesCategory = demandCategoryFilter === 'All' || g.category.toLowerCase() === demandCategoryFilter.toLowerCase();

        let matchesStatus = true;
        if (demandStatusFilter === 'pending') {
          matchesStatus = g.pendingUnits > 0;
        } else if (demandStatusFilter === 'fulfilled') {
          matchesStatus = g.totalUnits > 0 && g.pendingUnits === 0;
        }

        let matchesSize = true;
        if (demandSelectedSizeFilter !== 'All') {
          matchesSize = Boolean(g.sizes[demandSelectedSizeFilter] && g.sizes[demandSelectedSizeFilter].total > 0);
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesSize;
      })
      .sort((a, b) => {
        if (demandSort === 'most_pending') return b.pendingUnits - a.pendingUnits || b.totalUnits - a.totalUnits;
        if (demandSort === 'most_demand') return b.totalUnits - a.totalUnits;
        if (demandSort === 'highest_rev') return b.revenue - a.revenue;
        if (demandSort === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [garmentDemandList, demandSearch, demandCategoryFilter, demandStatusFilter, demandSort, demandSelectedSizeFilter]);

  // Aggregate Metrics for Demand KPI cards
  const totalGarmentsUnitsOrdered = garmentDemandList.reduce((sum, g) => sum + g.totalUnits, 0);
  const totalGarmentsUnitsPending = garmentDemandList.reduce((sum, g) => sum + g.pendingUnits, 0);
  const totalGarmentsUnitsFulfilled = garmentDemandList.reduce((sum, g) => sum + g.fulfilledUnits, 0);
  const topDemandedGarment = [...garmentDemandList].sort((a, b) => b.totalUnits - a.totalUnits)[0];
  const topDemandedSizeEntry = Object.entries(globalSizeStats).sort((a, b) => b[1].total - a[1].total)[0];

  const downloadSizingCSV = () => {
    const headers = [
      'Garment Name',
      'Category',
      'Unit Price (INR)',
      'Total Units Ordered',
      'Pending Units (To Pack)',
      'Fulfilled Units (Delivered)',
      'Total Sizing Breakdown',
      'Pending Sizes Breakdown',
      'Total Revenue (INR)'
    ];

    const rows = filteredDemandList.map(g => {
      const allSizesStr = Object.entries(g.sizes)
        .map(([size, stat]) => `${size}: ${stat.total} units (${stat.pending} pending, ${stat.fulfilled} done)`)
        .join('; ');
      
      const pendingSizesStr = Object.entries(g.sizes)
        .filter(([_, stat]) => stat.pending > 0)
        .map(([size, stat]) => `${size}: ${stat.pending} pending`)
        .join('; ') || 'None';

      return [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.category.replace(/"/g, '""')}"`,
        g.price,
        g.totalUnits,
        g.pendingUnits,
        g.fulfilledUnits,
        `"${allSizesStr.replace(/"/g, '""')}"`,
        `"${pendingSizesStr.replace(/"/g, '""')}"`,
        g.revenue
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `soharth_garment_size_demand_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    const cleanedImages = form.images.filter(img => img && img.trim() !== '');
    const primaryImage = form.image || cleanedImages[0] || '';
    const origNum = parseFloat(form.original_price);
    const discNum = parseFloat(form.price) || 0;

    const payload = {
      ...form,
      price: discNum,
      original_price: !isNaN(origNum) && origNum > 0 ? origNum : null,
      image: primaryImage,
      images: cleanedImages.length > 0 ? cleanedImages : (primaryImage ? [primaryImage] : []),
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${data.product.name} successfully registered in the catalogue!`, 'success');
        setForm({
          name: '', subtitle: '', original_price: '', price: '', category: categories[0]?.value || '',
          tag: '', image: '', images: [''], description: '',
          material: '', shipping: '',
          colors: [],
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

    if (editingProduct.image && editingProduct.image.match(/^[a-zA-Z]:\\/)) {
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
      original_price: '599',
      price: '349',
      category: categories[0]?.value || 'essentials',
      tag: 'NEW',
      image: '/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg',
      images: ['/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg', '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg'],
      description: 'A heavyweight, architectural technical hoodie detailed with double-bonded dynamic spacer crepe lines.',
      material: '60% Rayon technical blend, 35% Recycled Spacer fiber, 5% Elastane.',
      shipping: 'Complimentary express shipping on orders over ₹500.',
      colors: [
        { name: 'Cosmic Black', hex: '#0B0B0B', images: ['/WhatsApp Image 2026-05-29 at 12.50.13 PM.jpeg'] },
        { name: 'Stardust White', hex: '#F0F0F0', images: ['/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg'] }
      ],
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
    { id: 'demand', label: 'GARMENT & SIZE DEMAND' },
  ] as const;

  return (
    <>
      <Navbar />
      <main className="admin-main-container">
        <div className="container">

          {/* Header */}
          <header className="admin-header-wrapper">
            <div>
              <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.3em', display: 'block', marginBottom: '0.5rem', fontSize: '11px' }}>
                <span className="soharth-font">SOHARTH</span> MANAGEMENT CONSOLE
              </span>
              <h1 className="font-headline-lg" style={{ color: 'var(--primary)' }}>Control Relay</h1>
            </div>
            <div className="admin-tabs-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="font-label-caps admin-tab-btn"
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--on-primary)' : 'var(--primary)',
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
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(229,226,224,0.2)' }}>
                            {['APPAREL', 'CATEGORY', 'REAL PRICE (MRP)', 'SELLING PRICE', 'DISCOUNT', 'ACTIONS'].map((h, i) => (
                              <th key={h} className="font-label-caps" style={{ padding: '1rem', opacity: 0.5, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => {
                            const orig = Number(product.original_price ?? (product as any).originalPrice) || 0;
                            const price = Number(product.price) || 0;
                            const discountPct = orig > price && orig > 0 ? Math.round(((orig - price) / orig) * 100) : null;

                            return (
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
                                <td className="font-label-caps" style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '10px' }}>{product.category}</td>
                                <td className="font-body-md" style={{ padding: '1rem', color: 'var(--on-surface-variant)', textDecoration: orig > 0 ? 'line-through' : 'none', opacity: 0.65 }}>
                                  {orig > 0 ? `₹${orig.toLocaleString()}` : '—'}
                                </td>
                                <td className="font-body-md" style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>₹{price.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                  {discountPct ? (
                                    <span style={{
                                      backgroundColor: 'rgba(75, 255, 142, 0.15)',
                                      color: '#4bff8e',
                                      border: '1px solid rgba(75, 255, 142, 0.3)',
                                      padding: '3px 8px',
                                      borderRadius: '2px',
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      letterSpacing: '0.05em'
                                    }}>
                                      {discountPct}% OFF
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px', opacity: 0.5 }}>Standard</span>
                                  )}
                                </td>

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
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {/* ─── TAB 2: ADD PRODUCT ─── */}
              {activeTab === 'add' && (
                <section style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div className="glass-panel admin-form-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <h2 className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.2em', fontSize: '18px' }}>ADD NEW GARMENT</h2>
                      <button
                        type="button" onClick={loadPreset} className="font-label-caps"
                        style={{ border: '1px solid var(--primary)', padding: '0.5rem 1rem', fontSize: '9px', color: 'var(--primary)', background: 'transparent', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--on-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                      >⚡ LOAD TEST MOCKUP</button>
                    </div>

                    <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                      <div className="admin-responsive-grid-2col">
                        <div>
                          <FieldLabel>GARMENT NAME *</FieldLabel>
                          <input type="text" required placeholder="e.g., ASTRAL CREW" value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                          <FieldLabel>SUBTITLE / SPECIFICATION</FieldLabel>
                          <input type="text" placeholder="e.g., Pima Cotton Blend / Starlight Silver" value={form.subtitle}
                            onChange={e => setForm({ ...form, subtitle: e.target.value })} style={inputStyle} />
                        </div>
                      </div>

                      {/* ── Pricing & Live % OFF Calculation ── */}
                      <div style={{
                        padding: '1.5rem',
                        border: '1px solid rgba(229,226,224,0.12)',
                        backgroundColor: 'rgba(255,255,255,0.015)',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                      }}>
                        <div className="admin-responsive-grid-2col">
                          <div>
                            <FieldLabel>REAL PRICE / MRP (₹)</FieldLabel>
                            <input
                              type="number"
                              placeholder="e.g., 999 (Original sticker price)"
                              value={form.original_price}
                              onChange={e => setForm({ ...form, original_price: e.target.value })}
                              style={inputStyle}
                            />
                            <span className="font-caption" style={{ color: 'var(--on-surface-variant)', opacity: 0.6, fontSize: '10px' }}>
                              Original price before discount
                            </span>
                          </div>
                          <div>
                            <FieldLabel>PRICE AFTER DISCOUNT / SELLING PRICE (₹) *</FieldLabel>
                            <input
                              type="number"
                              required
                              placeholder="e.g., 699 (Actual charge)"
                              value={form.price}
                              onChange={e => setForm({ ...form, price: e.target.value })}
                              style={inputStyle}
                            />
                            <span className="font-caption" style={{ color: 'var(--on-surface-variant)', opacity: 0.6, fontSize: '10px' }}>
                              Final price customer pays
                            </span>
                          </div>
                        </div>

                        {/* Dynamic Live % Off Badge */}
                        {(() => {
                          const orig = parseFloat(form.original_price) || 0;
                          const disc = parseFloat(form.price) || 0;
                          if (orig > 0 && disc > 0) {
                            if (orig > disc) {
                              const savings = orig - disc;
                              const pct = Math.round((savings / orig) * 100);
                              return (
                                <div style={{
                                  padding: '0.85rem 1.25rem',
                                  backgroundColor: 'rgba(75, 255, 142, 0.08)',
                                  border: '1px solid rgba(75, 255, 142, 0.25)',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '0.5rem',
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{
                                      backgroundColor: '#4bff8e',
                                      color: '#000',
                                      fontWeight: 700,
                                      fontSize: '11px',
                                      padding: '3px 8px',
                                      borderRadius: '2px',
                                      letterSpacing: '0.05em'
                                    }}>
                                      {pct}% OFF
                                    </span>
                                    <span className="font-body-md" style={{ color: 'var(--primary)', fontSize: '13px' }}>
                                      Live Preview: Customer will see <strong>₹{disc.toLocaleString()}</strong> <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>₹{orig.toLocaleString()}</span>
                                    </span>
                                  </div>
                                  <span className="font-label-caps" style={{ color: '#4bff8e', fontSize: '11px', fontWeight: 600 }}>
                                    Savings: ₹{savings.toLocaleString()}
                                  </span>
                                </div>
                              );
                            } else if (disc > orig) {
                              return (
                                <div style={{
                                  padding: '0.75rem 1rem',
                                  backgroundColor: 'rgba(255, 75, 75, 0.08)',
                                  border: '1px solid rgba(255, 75, 75, 0.25)',
                                  borderRadius: '4px',
                                  color: '#ff4b4b',
                                  fontSize: '11px'
                                }}>
                                  ⚠️ Note: Selling price (₹{disc}) is greater than Real MRP (₹{orig}). Real price will be shown as standard.
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
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

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
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
                        <FieldLabel>DESCRIPTION</FieldLabel>
                        <textarea
                          placeholder="Write the architectural and design rationale for this piece..."
                          value={form.description}
                          onChange={e => setForm({ ...form, description: e.target.value })}
                          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                        />
                      </div>

                      <div className="admin-responsive-grid-2col">
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

                      <div>
                        <FieldLabel>COLOR VARIATIONS</FieldLabel>
                        {form.colors && form.colors.map((color, colorIdx) => (
                          <div key={colorIdx} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(229,226,224,0.1)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                              <input type="text" placeholder="Color Name (e.g. White)" value={color.name}
                                onChange={e => {
                                  const newColors = [...form.colors];
                                  newColors[colorIdx].name = e.target.value;
                                  setForm({ ...form, colors: newColors });
                                }} style={{ ...inputStyle, flex: 1 }} />
                              <input type="text" placeholder="Hex (e.g. #FFFFFF)" value={color.hex}
                                onChange={e => {
                                  const newColors = [...form.colors];
                                  newColors[colorIdx].hex = e.target.value;
                                  setForm({ ...form, colors: newColors });
                                }} style={{ ...inputStyle, flex: 1 }} />
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color.hex || '#000', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                              <button type="button" onClick={() => {
                                const newColors = form.colors.filter((_, i) => i !== colorIdx);
                                setForm({ ...form, colors: newColors });
                              }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.1em' }}>✕ REMOVE COLOR</button>
                            </div>

                            {/* Color-specific images */}
                            <div style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(229,226,224,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <span className="font-label-caps" style={{ fontSize: '9px', display: 'block', opacity: 0.5, letterSpacing: '0.15em' }}>Images for {color.name || 'this color'}</span>
                              {(color.images || []).map((img, imgIdx) => (
                                <div key={imgIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {img && <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                                  <div style={{ flex: 1 }}>
                                    <input type="file" accept="image/*" onChange={e => handleColorImageUpload(e, colorIdx, imgIdx, false)} style={{ color: 'var(--primary)', fontSize: '12px' }} />
                                    {uploadingColorIdx?.colorIdx === colorIdx && uploadingColorIdx?.imgIdx === imgIdx && !uploadingColorIdx.isEdit && <span style={{ fontSize: '10px', color: 'var(--primary)', marginLeft: '8px' }}>Uploading...</span>}
                                  </div>
                                  <button type="button" onClick={() => {
                                    const newColors = [...form.colors];
                                    const newImages = (color.images || []).filter((_, i) => i !== imgIdx);
                                    newColors[colorIdx] = { ...color, images: newImages };
                                    setForm({ ...form, colors: newColors });
                                  }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                </div>
                              ))}
                              <button type="button" onClick={() => {
                                const newColors = [...form.colors];
                                const currentImages = color.images || [];
                                newColors[colorIdx] = { ...color, images: [...currentImages, ''] };
                                setForm({ ...form, colors: newColors });
                              }} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', fontSize: '9px', cursor: 'pointer', letterSpacing: '0.1em' }}>
                                + ADD COLOR IMAGE
                              </button>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => setForm({ ...form, colors: [...(form.colors || []), { name: '', hex: '', images: [''] }] })}
                          style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', fontSize: '10px', marginTop: '0.5rem', cursor: 'pointer', letterSpacing: '0.1em' }}>
                          + ADD COLOR VARIATION
                        </button>
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

              {/* ─── TAB 4: ORDER RELAY COMMAND CENTER ─── */}
              {activeTab === 'orders' && (
                <section className="order-relay-dashboard">

                  {/* ── Top KPI Relay Command Center ── */}
                  <div className="order-relay-kpi-grid">
                    {/* Total Orders */}
                    <div className="order-kpi-card kpi-total">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '10px', letterSpacing: '0.15em' }}>
                          TOTAL ORDERS
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff', opacity: 0.8 }}>
                          inventory_2
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                          {totalOrdersCount}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          all-time
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                        ₹{totalRevenue.toLocaleString()} Total Sales
                      </div>
                    </div>

                    {/* Orders Given / Delivered */}
                    <div className="order-kpi-card kpi-given" style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 21, 21, 0.8) 100%)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: '#34d399', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700 }}>
                          GIVEN / DELIVERED
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#34d399' }}>
                          task_alt
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
                          {givenCount}
                        </span>
                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                          FULFILLED
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(52, 211, 153, 0.9)', fontWeight: 600 }}>
                        ₹{givenRevenue.toLocaleString()} Handed Over
                      </div>
                    </div>

                    {/* Orders Not Given / Action Required */}
                    <div className="order-kpi-card kpi-pending" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(22, 21, 21, 0.8) 100%)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: '#fbbf24', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700 }}>
                          NOT GIVEN YET
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#fbbf24' }}>
                          pending_actions
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                          {notGivenCount}
                        </span>
                        <span style={{ fontSize: '11px', color: '#000', fontWeight: 800, backgroundColor: '#fbbf24', padding: '2px 6px', borderRadius: '4px' }}>
                          NEEDS ACTION
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(251, 191, 36, 0.9)', fontWeight: 600 }}>
                        ₹{notGivenRevenue.toLocaleString()} Pending Fulfillment
                      </div>
                    </div>

                    {/* In Transit / Shipped */}
                    <div className="order-kpi-card kpi-shipped">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: '#38bdf8', fontSize: '10px', letterSpacing: '0.15em' }}>
                          IN TRANSIT
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#38bdf8' }}>
                          local_shipping
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
                          {shippedCount}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                          with courier
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(56, 189, 248, 0.9)', fontWeight: 600 }}>
                        {cancelledCount} Cancelled
                      </div>
                    </div>
                  </div>

                  {/* ── Order Delivery Progress Bar ── */}
                  <div style={{
                    background: 'rgba(22, 21, 21, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="font-label-caps" style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '0.1em' }}>
                        ORDER FULFILLMENT STATUS: <strong>{givenCount} of {effectiveTotal || totalOrdersCount} Orders Handed Over ({fulfillmentRate}%)</strong>
                      </span>
                      <span style={{ fontSize: '11px', color: notGivenCount > 0 ? '#fbbf24' : '#34d399', fontWeight: 700 }}>
                        {notGivenCount > 0 ? `⚠️ ${notGivenCount} Orders waiting to be given` : '✨ All active orders have been handed over!'}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, fulfillmentRate)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                        borderRadius: '999px',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }} />
                    </div>
                  </div>

                  {/* ── Status Quick-Pill Navigation ── */}
                  <div className="order-filter-pill-nav">
                    <button
                      onClick={() => setOrderRelayTab('all')}
                      className={`order-filter-pill ${orderRelayTab === 'all' ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>list_alt</span>
                      ALL ORDERS ({totalOrdersCount})
                    </button>
                    <button
                      onClick={() => setOrderRelayTab('not_given')}
                      className={`order-filter-pill pill-pending ${orderRelayTab === 'not_given' ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>hourglass_empty</span>
                      ⏳ NOT GIVEN / NEEDS ACTION ({notGivenCount})
                    </button>
                    <button
                      onClick={() => setOrderRelayTab('shipped')}
                      className={`order-filter-pill ${orderRelayTab === 'shipped' ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_shipping</span>
                      🚚 IN TRANSIT ({shippedCount})
                    </button>
                    <button
                      onClick={() => setOrderRelayTab('given')}
                      className={`order-filter-pill pill-given ${orderRelayTab === 'given' ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      ✅ GIVEN / DELIVERED ({givenCount})
                    </button>
                    <button
                      onClick={() => setOrderRelayTab('cancelled')}
                      className={`order-filter-pill ${orderRelayTab === 'cancelled' ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                      ❌ CANCELLED ({cancelledCount})
                    </button>
                  </div>

                  {/* ── Search & Filter Controls Toolbar ── */}
                  <div className="order-relay-toolbar" style={{ backgroundColor: 'rgba(22, 21, 21, 0.5)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="order-filter-group" style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--on-surface-variant)' }}>
                          search
                        </span>
                        <input 
                          type="text" 
                          placeholder="Search Order ID, Name, Phone, Email, City, Items..." 
                          value={orderSearch} 
                          onChange={e => setOrderSearch(e.target.value)} 
                          style={{ ...inputStyle, paddingLeft: '28px', paddingRight: '10px' }} 
                        />
                      </div>
                      
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <select 
                          value={paymentFilter} 
                          onChange={e => setPaymentFilter(e.target.value)} 
                          style={{ ...selectStyle, padding: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="All">All Payments</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Payment Pending</option>
                          <option value="Failed">Payment Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>

                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <select 
                          value={orderSort} 
                          onChange={e => setOrderSort(e.target.value as any)} 
                          style={{ ...selectStyle, padding: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="newest">Sort: Newest First</option>
                          <option value="oldest">Sort: Oldest First</option>
                          <option value="highest">Sort: Highest Value</option>
                          <option value="lowest">Sort: Lowest Value</option>
                        </select>
                      </div>
                    </div>

                    <div className="order-actions-group" style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={downloadCSV} className="btn-primary" style={{ padding: '0.75rem 1.25rem', fontSize: '11px', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                        EXPORT CSV
                      </button>
                      <button onClick={() => window.print()} className="btn-ghost" style={{ padding: '0.75rem 1.25rem', fontSize: '11px', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                        PRINT SUMMARY
                      </button>
                    </div>
                  </div>

                  {/* ── Order List ── */}
                  {filteredOrders.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem 1.5rem', textAlign: 'center', border: '1px solid rgba(229,226,224,0.1)', borderRadius: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '1rem' }}>
                        search_off
                      </span>
                      <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>No transaction logs match your criteria.</p>
                      {orderSearch && (
                        <button onClick={() => setOrderSearch('')} className="btn-ghost" style={{ marginTop: '1rem', fontSize: '11px', padding: '0.5rem 1rem' }}>
                          Clear Search Filter
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {filteredOrders.map(order => {
                        const isExpanded = expandedOrderId === order.id;
                        const addr = order.shippingAddress || {};
                        const isGiven = order.orderStatus === 'Delivered';
                        const isCancelled = order.orderStatus === 'Cancelled';
                        const isShipped = order.orderStatus === 'Shipped';
                        const isPaid = order.paymentStatus === 'Paid';
                        const totalItemsCount = (order.items || []).reduce((acc, i) => acc + (Number(i.qty) || 1), 0);
                        const fullAddressString = `${addr.street || addr.line1 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || addr.pincode || ''}, ${addr.country || ''}`.trim().replace(/^,\s*/, '');
                        const rawPhone = order.customer?.phone?.replace(/[^0-9]/g, '') || '';
                        const waLink = rawPhone ? `https://wa.me/${rawPhone.length === 10 ? '91' + rawPhone : rawPhone}?text=${encodeURIComponent(`Hello ${order.customer?.name || ''}, this is regarding your Soharth order #${order.id.slice(0, 8)}.`)}` : null;

                        return (
                          <div 
                            key={order.id} 
                            className="order-card-container" 
                            style={{ 
                              border: isGiven ? '1px solid rgba(16, 185, 129, 0.35)' : isCancelled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.35)',
                              boxShadow: isGiven ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 24px rgba(245, 158, 11, 0.08)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: 'rgba(20, 19, 19, 0.8)'
                            }}
                          >
                            {/* ── Prominent Given / Not Given Delivery Banner ── */}
                            <div style={{
                              padding: '0.65rem 1.25rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: isGiven 
                                ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
                                : isCancelled 
                                  ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)'
                                  : 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)',
                              borderBottom: '1px solid rgba(255,255,255,0.06)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ 
                                  fontSize: '18px', 
                                  color: isGiven ? '#34d399' : isCancelled ? '#f87171' : '#fbbf24' 
                                }}>
                                  {isGiven ? 'check_circle' : isCancelled ? 'cancel' : 'hourglass_top'}
                                </span>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  letterSpacing: '0.06em',
                                  color: isGiven ? '#34d399' : isCancelled ? '#f87171' : '#fbbf24',
                                  textTransform: 'uppercase'
                                }}>
                                  {isGiven 
                                    ? '✅ ORDER GIVEN / DELIVERED TO CUSTOMER'
                                    : isCancelled 
                                      ? '❌ ORDER CANCELLED'
                                      : '⏳ NOT GIVEN YET — PENDING FULFILLMENT'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: isPaid ? '#34d399' : '#fbbf24',
                                  border: isPaid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                                }}>
                                  {order.paymentMethod || 'Cash on Delivery'} • {isPaid ? 'PAID' : (order.paymentStatus || 'PAYMENT PENDING').toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Summary Row */}
                            <div className="order-summary-row" style={{ padding: '1.25rem' }} onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                              <div className="order-summary-chips" style={{ flex: 1 }}>
                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.15em' }}>ORDER REF</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ color: 'var(--primary)', fontSize: '14px', letterSpacing: '0.04em' }}>#{order.id.slice(0, 8)}</strong>
                                    <button
                                      type="button"
                                      title="Copy Order ID"
                                      onClick={(e) => { e.stopPropagation(); copyToClipboard(order.id, 'Order ID'); }}
                                      style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'inline-flex', padding: '2px' }}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.15em' }}>DATE &amp; TIME</span>
                                  <span className="font-body-md" style={{ color: 'var(--primary)', fontSize: '13px' }}>
                                    {new Date(order.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px', marginLeft: '4px' }}>
                                      {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </span>
                                </div>

                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.15em' }}>CUSTOMER</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="font-body-md" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>
                                      {order.customer?.name || 'Guest Customer'}
                                    </span>
                                    {waLink && (
                                      <a
                                        href={waLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Chat on WhatsApp"
                                        onClick={e => e.stopPropagation()}
                                        style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chat</span>
                                      </a>
                                    )}
                                    {order.customer?.phone && (
                                      <a
                                        href={`tel:${order.customer.phone}`}
                                        title="Call Customer"
                                        onClick={e => e.stopPropagation()}
                                        style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>call</span>
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: '9px', letterSpacing: '0.15em' }}>STATUS</span>
                                  <span className={`order-status-badge ${
                                    isGiven ? 'status-delivered' : isShipped ? 'status-shipped' : isCancelled ? 'status-cancelled' : 'status-pending'
                                  }`}>
                                    ● {order.orderStatus || 'Pending'}
                                  </span>
                                </div>
                              </div>

                              <div className="order-total-display">
                                <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '9px' }}>
                                  TOTAL ({totalItemsCount} {totalItemsCount === 1 ? 'ITEM' : 'ITEMS'})
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span className="font-headline-md" style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>
                                    ₹{order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span style={{ color: 'var(--on-surface-variant)', fontSize: '14px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    ▼
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* ── Quick One-Click Action Bar on Card ── */}
                            <div style={{
                              padding: '0.75rem 1.25rem',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderTop: '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.75rem'
                            }}>
                              {/* Left: Quick Confirmation Controls */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {!isGiven ? (
                                  <button
                                    onClick={(e) => handleQuickMarkGiven(order.id, e)}
                                    className="btn-primary"
                                    style={{
                                      backgroundColor: '#10b981',
                                      color: '#000000',
                                      fontWeight: 800,
                                      fontSize: '11px',
                                      padding: '0.5rem 1rem',
                                      letterSpacing: '0.05em',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>task_alt</span>
                                    CONFIRM GIVEN / DELIVERED
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => handleQuickMarkProcessing(order.id, e)}
                                    className="btn-ghost"
                                    style={{
                                      fontSize: '10px',
                                      padding: '0.4rem 0.8rem',
                                      color: 'var(--on-surface-variant)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>undo</span>
                                    Revert to In-Progress
                                  </button>
                                )}

                                {!isShipped && !isGiven && (
                                  <button
                                    onClick={(e) => handleQuickMarkShipped(order.id, e)}
                                    className="btn-ghost"
                                    style={{
                                      borderColor: 'rgba(56, 189, 248, 0.5)',
                                      color: '#38bdf8',
                                      fontSize: '10px',
                                      padding: '0.45rem 0.85rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_shipping</span>
                                    Mark Shipped
                                  </button>
                                )}
                              </div>

                              {/* Right: Detailed Edit & Slip buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingOrder(order); }}
                                  className="btn-ghost"
                                  style={{
                                    borderColor: 'rgba(235, 195, 75, 0.5)',
                                    color: '#fde047',
                                    fontSize: '11px',
                                    padding: '0.45rem 0.9rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                                  EDIT SETTINGS &amp; DETAILS
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); setPrintingOrder(order); }}
                                  className="btn-ghost"
                                  style={{
                                    fontSize: '11px',
                                    padding: '0.45rem 0.9rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>receipt_long</span>
                                  PACKING SLIP
                                </button>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="order-expanded-grid" style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                
                                {/* Left Column: Customer & Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                      <h4 className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.15em' }}>Customer &amp; Contact</h4>
                                      {fullAddressString && (
                                        <button
                                          type="button"
                                          onClick={() => copyToClipboard(fullAddressString, 'Full Delivery Address')}
                                          className="btn-ghost"
                                          style={{ fontSize: '10px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>content_copy</span>
                                          Copy Address
                                        </button>
                                      )}
                                    </div>

                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                      <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6, fontSize: '13px', margin: 0 }}>
                                        <strong style={{ color: '#fff' }}>Name:</strong> {order.customer?.name || '—'}<br/>
                                        <strong style={{ color: '#fff' }}>Email:</strong> {order.customer?.email || '—'}<br/>
                                        <strong style={{ color: '#fff' }}>Phone:</strong> {order.customer?.phone || '—'}<br/>
                                        <strong style={{ color: '#fff' }}>Address:</strong> {fullAddressString || 'No address specified'}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', marginBottom: '0.85rem', letterSpacing: '0.15em' }}>
                                      Items Ordered ({totalItemsCount})
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {(order.items || []).map((item, idx) => {
                                        // Try to lookup product image
                                        const matchedProduct = products.find(p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase());
                                        const itemImg = matchedProduct?.image;
                                        return (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                              {itemImg && (
                                                <img src={itemImg} alt="" style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px' }} />
                                              )}
                                              <div>
                                                <span className="font-body-md" style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                                                  {item.qty}x {item.name}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                  <span style={{ color: '#fde047', fontSize: '9px', fontWeight: 700, border: '1px solid rgba(253, 224, 71, 0.3)', padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase' }}>
                                                    SIZE {item.size}
                                                  </span>
                                                  <span style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>
                                                    @ ₹{Number(item.price).toLocaleString()} each
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                            <span className="font-body-md" style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                                              ₹{(Number(item.price) * Number(item.qty)).toLocaleString()}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column: Quick Status Update & Notes */}
                                <div className="order-mgmt-panel">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 className="font-label-caps" style={{ color: 'var(--primary)', letterSpacing: '0.15em' }}>Order Fulfillment Controls</h4>
                                    <button
                                      type="button"
                                      onClick={() => setEditingOrder(order)}
                                      className="btn-ghost"
                                      style={{ fontSize: '10px', padding: '3px 8px', color: '#fde047', borderColor: 'rgba(253, 224, 71, 0.4)' }}
                                    >
                                      Full Settings
                                    </button>
                                  </div>
                                  
                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>
                                      Order Status (Delivery State)
                                    </label>
                                    <select 
                                      value={order.orderStatus || 'Pending'} 
                                      onChange={e => handleUpdateOrder(order.id, { orderStatus: e.target.value })}
                                      style={{ ...selectStyle, padding: '0.65rem', background: '#1c1b1b', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                      <option value="Pending">Pending (Not Given)</option>
                                      <option value="Confirmed">Confirmed (Not Given)</option>
                                      <option value="Processing">Processing (Packaging)</option>
                                      <option value="Shipped">Shipped (In Transit)</option>
                                      <option value="Delivered">Delivered (Given to Customer ✅)</option>
                                      <option value="Cancelled">Cancelled ❌</option>
                                      <option value="Refunded">Refunded ↩️</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>
                                      Payment Status (Method: {order.paymentMethod || 'Cash on Delivery'})
                                    </label>
                                    <select 
                                      value={order.paymentStatus || 'Pending'} 
                                      onChange={e => handleUpdateOrder(order.id, { paymentStatus: e.target.value })}
                                      style={{ ...selectStyle, padding: '0.65rem', background: '#1c1b1b', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                      <option value="Pending">Payment Pending</option>
                                      <option value="Paid">Paid ✅</option>
                                      <option value="Failed">Failed ❌</option>
                                      <option value="Refunded">Refunded</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Tracking / Courier Number</label>
                                    <input 
                                      type="text" 
                                      value={order.trackingNumber || ''} 
                                      onChange={e => handleUpdateOrder(order.id, { trackingNumber: e.target.value })}
                                      placeholder="e.g., DEL12345678 or Hand Delivery"
                                      style={{ ...inputStyle, padding: '0.65rem', background: '#1c1b1b', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                  </div>

                                  <div>
                                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Internal Notes &amp; Handover Log</label>
                                    <textarea 
                                      value={order.internalNotes || ''} 
                                      onChange={e => handleUpdateOrder(order.id, { internalNotes: e.target.value })}
                                      placeholder="e.g., Handed over to customer on Oct 8 / Special packaging request..."
                                      style={{ ...inputStyle, padding: '0.65rem', background: '#1c1b1b', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', minHeight: '80px', resize: 'vertical' }}
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

              {/* ─── TAB 5: GARMENT DEMAND & SIZING MATRIX DASHBOARD ─── */}
              {activeTab === 'demand' && (
                <section className="size-matrix-dashboard">

                  {/* ── Top Production Command KPI Grid ── */}
                  <div className="order-relay-kpi-grid">
                    {/* Total Garment Units */}
                    <div className="order-kpi-card kpi-total">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '10px', letterSpacing: '0.15em' }}>
                          TOTAL GARMENTS DEMAND
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff', opacity: 0.8 }}>
                          checkroom
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                          {totalGarmentsUnitsOrdered}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                          units ordered
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                        Across {products.length} Catalogue Garments
                      </div>
                    </div>

                    {/* Units to Pack / Hand Over */}
                    <div className="order-kpi-card kpi-pending" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.12) 0%, rgba(22, 21, 21, 0.85) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: '#fbbf24', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700 }}>
                          UNITS TO PACK / MAKE
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#fbbf24' }}>
                          precision_manufacturing
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                          {totalGarmentsUnitsPending}
                        </span>
                        <span style={{ fontSize: '11px', color: '#000', fontWeight: 800, backgroundColor: '#fbbf24', padding: '2px 6px', borderRadius: '4px' }}>
                          NEEDS ACTION
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(251, 191, 36, 0.9)', fontWeight: 600 }}>
                        {totalGarmentsUnitsPending > 0 ? `${totalGarmentsUnitsPending} apparel units awaiting fulfillment` : 'All units packed & delivered!'}
                      </div>
                    </div>

                    {/* Fulfilled / Handed Over Units */}
                    <div className="order-kpi-card kpi-given" style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(22, 21, 21, 0.85) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: '#34d399', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700 }}>
                          COMPLETED &amp; GIVEN
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#34d399' }}>
                          done_all
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
                          {totalGarmentsUnitsFulfilled}
                        </span>
                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                          HANDED OVER
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(52, 211, 153, 0.9)', fontWeight: 600 }}>
                        {totalGarmentsUnitsOrdered > 0 ? `${Math.round((totalGarmentsUnitsFulfilled / totalGarmentsUnitsOrdered) * 100)}% production fulfillment rate` : '100%'}
                      </div>
                    </div>

                    {/* Top Demand Velocity Piece */}
                    <div className="order-kpi-card kpi-shipped" style={{ background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(22, 21, 21, 0.85) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="font-label-caps" style={{ color: '#c084fc', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700 }}>
                          TOP DEMAND &amp; VELOCITY
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#c084fc' }}>
                          trending_up
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#c084fc', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topDemandedGarment ? topDemandedGarment.name : 'No Orders'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(192, 132, 252, 0.9)', fontWeight: 600 }}>
                        {topDemandedGarment ? `${topDemandedGarment.totalUnits} units • Top Size: ${topDemandedSizeEntry ? topDemandedSizeEntry[0] : 'N/A'}` : 'Awaiting demand'}
                      </div>
                    </div>
                  </div>

                  {/* ── Brand Global Size Velocity Tray ── */}
                  <div style={{
                    background: 'rgba(22, 21, 21, 0.7)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fde047' }}>straighten</span>
                        <span className="font-label-caps" style={{ fontSize: '11px', color: 'var(--primary)', letterSpacing: '0.15em', fontWeight: 700 }}>
                          BRAND SIZING DEMAND OVERVIEW (CLICK ANY SIZE TO FILTER)
                        </span>
                      </div>
                      {demandSelectedSizeFilter !== 'All' && (
                        <button
                          onClick={() => setDemandSelectedSizeFilter('All')}
                          style={{ background: 'transparent', border: 'none', color: '#fde047', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>filter_alt_off</span>
                          Reset Size Filter ({demandSelectedSizeFilter})
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                      {Object.entries(globalSizeStats).map(([size, stat]) => {
                        const isSelected = demandSelectedSizeFilter === size;
                        return (
                          <div
                            key={size}
                            onClick={() => setDemandSelectedSizeFilter(isSelected ? 'All' : size)}
                            className="global-size-badge"
                            style={{
                              borderColor: isSelected ? '#fde047' : (stat.pending > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)'),
                              backgroundColor: isSelected ? 'rgba(253, 224, 71, 0.12)' : (stat.pending > 0 ? 'rgba(245, 158, 11, 0.04)' : 'rgba(255, 255, 255, 0.02)'),
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#fde047' : '#fff', letterSpacing: '0.1em' }}>
                              SIZE {size}
                            </span>
                            <span style={{ fontSize: '20px', fontWeight: 900, color: stat.total > 0 ? '#fff' : 'var(--on-surface-variant)', margin: '4px 0' }}>
                              {stat.total}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', fontSize: '9px', fontWeight: 700 }}>
                              {stat.pending > 0 && (
                                <span style={{ color: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.2)', padding: '1px 5px', borderRadius: '3px' }}>
                                  {stat.pending} pending
                                </span>
                              )}
                              {stat.fulfilled > 0 && (
                                <span style={{ color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '1px 5px', borderRadius: '3px' }}>
                                  {stat.fulfilled} done
                                </span>
                              )}
                              {stat.total === 0 && (
                                <span style={{ color: 'var(--on-surface-variant)', opacity: 0.5 }}>0 orders</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Toolbar: Search, Filters, Sizing Export & Manifest ── */}
                  <div className="order-relay-toolbar" style={{ backgroundColor: 'rgba(22, 21, 21, 0.5)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="order-filter-group" style={{ flex: 1, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Search */}
                      <div style={{ position: 'relative', flex: 2, minWidth: '220px' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--on-surface-variant)' }}>
                          search
                        </span>
                        <input
                          type="text"
                          placeholder="Search Garment Name, Category..."
                          value={demandSearch}
                          onChange={e => setDemandSearch(e.target.value)}
                          style={{ ...inputStyle, paddingLeft: '28px', paddingRight: '10px' }}
                        />
                      </div>

                      {/* Category Filter */}
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <select
                          value={demandCategoryFilter}
                          onChange={e => setDemandCategoryFilter(e.target.value)}
                          style={{ ...selectStyle, padding: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="All">All Categories</option>
                          {categories.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <select
                          value={demandStatusFilter}
                          onChange={e => setDemandStatusFilter(e.target.value as any)}
                          style={{ ...selectStyle, padding: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="all">All Demand Statuses</option>
                          <option value="pending">⏳ Has Units To Pack ({garmentDemandList.filter(g => g.pendingUnits > 0).length})</option>
                          <option value="fulfilled">✅ Fully Fulfilled ({garmentDemandList.filter(g => g.totalUnits > 0 && g.pendingUnits === 0).length})</option>
                        </select>
                      </div>

                      {/* Sort */}
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <select
                          value={demandSort}
                          onChange={e => setDemandSort(e.target.value as any)}
                          style={{ ...selectStyle, padding: '0.65rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <option value="most_pending">Sort: Most Units To Pack</option>
                          <option value="most_demand">Sort: Highest Total Demand</option>
                          <option value="highest_rev">Sort: Highest Revenue</option>
                          <option value="name">Sort: Garment Name (A-Z)</option>
                        </select>
                      </div>
                    </div>

                    <div className="order-actions-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={downloadSizingCSV}
                        className="btn-primary"
                        style={{ padding: '0.75rem 1.25rem', fontSize: '11px', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>table_view</span>
                        SIZING SPREADSHEET
                      </button>
                      <button
                        onClick={() => setIsPrintingManifest(true)}
                        className="btn-ghost"
                        style={{ padding: '0.75rem 1.25rem', fontSize: '11px', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #fde047', color: '#fde047' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>print</span>
                        WORKSHOP MANIFEST
                      </button>
                    </div>
                  </div>

                  {/* ── Garment Sizing Matrix Grid ── */}
                  {filteredDemandList.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem 1.5rem', textAlign: 'center', border: '1px solid rgba(229,226,224,0.1)', borderRadius: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--on-surface-variant)', opacity: 0.4, marginBottom: '1rem' }}>
                        inventory
                      </span>
                      <p className="font-body-lg" style={{ color: 'var(--on-surface-variant)' }}>No garments match your current matrix filter.</p>
                      {(demandSearch || demandCategoryFilter !== 'All' || demandStatusFilter !== 'all' || demandSelectedSizeFilter !== 'All') && (
                        <button
                          onClick={() => {
                            setDemandSearch('');
                            setDemandCategoryFilter('All');
                            setDemandStatusFilter('all');
                            setDemandSelectedSizeFilter('All');
                          }}
                          className="btn-ghost"
                          style={{ marginTop: '1rem', fontSize: '11px', padding: '0.5rem 1rem' }}
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="size-matrix-grid">
                      {filteredDemandList.map(garment => {
                        const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'FREE SIZE', 'OS'];
                        // combine standard sizes with any custom sizes present in orders
                        const allProductSizes = Array.from(new Set([...standardSizes, ...Object.keys(garment.sizes)]));
                        const fulfillmentRate = garment.totalUnits > 0 ? Math.round((garment.fulfilledUnits / garment.totalUnits) * 100) : 0;

                        return (
                          <div key={garment.id} className="garment-demand-card">
                            {/* Card Top: Image + Info */}
                            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                              <div style={{ position: 'relative', width: '70px', height: '90px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)', flexShrink: 0 }}>
                                <Image
                                  src={garment.image || '/logo.jpg'}
                                  alt={garment.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>

                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span className="font-label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '9px', letterSpacing: '0.1em' }}>
                                      {garment.category.toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                                      ₹{garment.price.toLocaleString()}
                                    </span>
                                  </div>
                                  <h3 className="font-label-caps" style={{ color: '#fff', fontSize: '14px', margin: '4px 0 2px', lineHeight: 1.3 }}>
                                    {garment.name}
                                  </h3>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '4px' }}>
                                  <div>
                                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', display: 'block' }}>Total Ordered</span>
                                    <strong style={{ fontSize: '16px', color: '#fff' }}>{garment.totalUnits} <span style={{ fontSize: '11px', fontWeight: 400 }}>units</span></strong>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', display: 'block' }}>Revenue</span>
                                    <strong style={{ fontSize: '13px', color: '#34d399' }}>₹{garment.revenue.toLocaleString()}</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Pending vs Handed Over Alert Strip */}
                            <div style={{
                              padding: '0.65rem 1.25rem',
                              backgroundColor: garment.pendingUnits > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '11px'
                            }}>
                              <span style={{ color: garment.pendingUnits > 0 ? '#fbbf24' : '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  {garment.pendingUnits > 0 ? 'hourglass_top' : 'task_alt'}
                                </span>
                                {garment.pendingUnits > 0 ? `${garment.pendingUnits} Units To Pack & Hand Over` : 'All Ordered Units Handed Over!'}
                              </span>
                              <span style={{ color: 'var(--on-surface-variant)', fontSize: '10px' }}>
                                {garment.fulfilledUnits}/{garment.totalUnits} done ({fulfillmentRate}%)
                              </span>
                            </div>

                            {/* Sizing Breakdown Matrix */}
                            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                              <span className="font-label-caps" style={{ fontSize: '10px', color: 'var(--on-surface-variant)', letterSpacing: '0.1em' }}>
                                SIZING DEMAND MATRIX (CLICK FOR CUSTOMER LIST)
                              </span>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                {allProductSizes.map(size => {
                                  const sizeStat = garment.sizes[size] || { total: 0, pending: 0, fulfilled: 0, orders: [] };
                                  const hasOrders = sizeStat.total > 0;
                                  const hasPending = sizeStat.pending > 0;

                                  return (
                                    <div
                                      key={size}
                                      onClick={() => {
                                        if (hasOrders) {
                                          setSelectedSizeDetail({
                                            garmentId: garment.id,
                                            garmentName: garment.name,
                                            garmentImage: garment.image,
                                            size: size,
                                            total: sizeStat.total,
                                            pending: sizeStat.pending,
                                            fulfilled: sizeStat.fulfilled,
                                            orders: sizeStat.orders,
                                          });
                                        }
                                      }}
                                      className={`size-demand-chip ${hasPending ? 'has-pending' : (hasOrders ? 'all-fulfilled' : '')}`}
                                      style={{
                                        opacity: hasOrders ? 1 : 0.45,
                                        cursor: hasOrders ? 'pointer' : 'default',
                                        backgroundColor: hasPending ? 'rgba(245, 158, 11, 0.05)' : (hasOrders ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255,0.015)')
                                      }}
                                      title={hasOrders ? `Click to view ${sizeStat.total} customer orders for Size ${size}` : `No orders for Size ${size}`}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: hasOrders ? '#fff' : 'var(--on-surface-variant)' }}>
                                          {size}
                                        </span>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {hasOrders ? (
                                          <>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                                              {sizeStat.total}
                                            </span>
                                            {hasPending ? (
                                              <span style={{ fontSize: '9px', color: '#000', backgroundColor: '#fbbf24', fontWeight: 800, padding: '1px 4px', borderRadius: '2px' }}>
                                                {sizeStat.pending} to pack
                                              </span>
                                            ) : (
                                              <span style={{ fontSize: '9px', color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.2)', fontWeight: 700, padding: '1px 4px', borderRadius: '2px' }}>
                                                ✓ done
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span style={{ fontSize: '10px', color: 'var(--on-surface-variant)', opacity: 0.5 }}>0</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Card Progress Bar Footer */}
                            <div style={{ padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${fulfillmentRate}%`,
                                  height: '100%',
                                  background: garment.pendingUnits > 0 ? 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)' : '#10b981',
                                  borderRadius: '999px'
                                }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--on-surface-variant)' }}>
                                <span>{garment.totalUnits} Total Units</span>
                                <span>{fulfillmentRate}% Handed Over</span>
                              </div>
                            </div>
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

      {/* ─── GARMENT SIZE DRILL-DOWN MODAL ─── */}
      {selectedSizeDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 120,
          backgroundColor: 'rgba(10,9,9,0.94)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="admin-modal-card fade-in-up" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedSizeDetail(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ position: 'relative', width: '60px', height: '80px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--surface-container-low)', flexShrink: 0 }}>
                <Image
                  src={selectedSizeDetail.garmentImage || '/logo.jpg'}
                  alt={selectedSizeDetail.garmentName}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div>
                <span className="font-label-caps" style={{ color: '#fde047', fontSize: '11px', letterSpacing: '0.15em', display: 'block', marginBottom: '2px' }}>
                  GARMENT SIZE SPECIFIC BREAKDOWN
                </span>
                <h2 className="font-headline-md" style={{ color: '#fff', fontSize: '18px', margin: 0 }}>
                  {selectedSizeDetail.garmentName} — SIZE {selectedSizeDetail.size}
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    {selectedSizeDetail.total} Total Units
                  </span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                    • {selectedSizeDetail.pending} Pending Fulfillment
                  </span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    • {selectedSizeDetail.fulfilled} Delivered
                  </span>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '0.75rem', color: 'var(--on-surface-variant)' }}>ORDER ID &amp; DATE</th>
                    <th style={{ padding: '0.75rem', color: 'var(--on-surface-variant)' }}>CUSTOMER &amp; CONTACT</th>
                    <th style={{ padding: '0.75rem', color: 'var(--on-surface-variant)' }}>DESTINATION</th>
                    <th style={{ padding: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center' }}>QTY</th>
                    <th style={{ padding: '0.75rem', color: 'var(--on-surface-variant)' }}>STATUS</th>
                    <th style={{ padding: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'right' }}>QUICK ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSizeDetail.orders.map((entry, idx) => {
                    const isDelivered = entry.orderStatus === 'Delivered';
                    const cleanPhone = (entry.customer?.phone || '').replace(/\D/g, '');

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: '#fff', display: 'block' }}>
                            #{entry.orderId.slice(0, 8).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <strong style={{ color: 'var(--primary)', display: 'block' }}>
                            {entry.customer?.name || 'Guest'}
                          </strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                            <span>{entry.customer?.phone || '—'}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi ${entry.customer?.name || ''}, regarding your order #${entry.orderId.slice(0, 8)} for ${selectedSizeDetail.garmentName} (Size: ${selectedSizeDetail.size}) from SOHARTH:`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center' }}
                                title="Chat on WhatsApp"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat</span>
                              </a>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem', color: 'var(--on-surface-variant)', fontSize: '11px' }}>
                          {entry.shippingAddress?.city ? `${entry.shippingAddress.city}, ` : ''}{entry.shippingAddress?.state || 'India'}
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, color: '#fff' }}>
                            {entry.qty}x
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <span className={`order-status-badge status-${(entry.orderStatus || 'pending').toLowerCase()}`}>
                            {entry.orderStatus || 'Pending'}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {!isDelivered ? (
                              <button
                                onClick={async () => {
                                  await handleQuickMarkGiven(entry.orderId);
                                  // Update local modal data
                                  setSelectedSizeDetail(prev => {
                                    if (!prev) return null;
                                    return {
                                      ...prev,
                                      pending: Math.max(0, prev.pending - entry.qty),
                                      fulfilled: prev.fulfilled + entry.qty,
                                      orders: prev.orders.map(o => o.orderId === entry.orderId ? { ...o, orderStatus: 'Delivered' } : o)
                                    };
                                  });
                                }}
                                style={{
                                  backgroundColor: '#10b981',
                                  color: '#000',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '3px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                MARK DELIVERED ✓
                              </button>
                            ) : (
                              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 700 }}>
                                Handed Over ✅
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedSizeDetail(null)}
                className="btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '11px' }}
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRINTABLE WORKSHOP CUTTING & PACKING MANIFEST MODAL ─── */}
      {isPrintingManifest && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 130,
          backgroundColor: 'rgba(10,9,9,0.96)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="admin-modal-card fade-in-up" style={{ maxWidth: '850px', backgroundColor: '#fff', color: '#000', borderRadius: '8px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <div>
                <strong style={{ fontWeight: 800, fontSize: '14px', color: '#000', letterSpacing: '0.1em' }}>
                  WORKSHOP PRODUCTION &amp; PACKING MANIFEST
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#666' }}>
                  High-density cutting, printing &amp; warehouse packing checklist
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{ background: '#000', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '11px' }}
                >
                  🖨️ PRINT MANIFEST
                </button>
                <button
                  onClick={() => setIsPrintingManifest(false)}
                  style={{ background: '#eee', color: '#000', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}
                >
                  CLOSE
                </button>
              </div>
            </div>

            {/* Printable Manifest Document */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'sans-serif', color: '#111' }}>
              {/* Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '0.2em' }}>SOHARTH</h1>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#444' }}>WORKSHOP PACKING &amp; PRODUCTION MANIFEST</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '14px', display: 'block' }}>LIVE MANIFEST</strong>
                  <span style={{ fontSize: '11px', color: '#666' }}>Generated: {new Date().toLocaleString()}</span><br/>
                  <span style={{ fontSize: '11px', color: '#666' }}>Total Units to Pack: <strong>{totalGarmentsUnitsPending} units</strong></span>
                </div>
              </div>

              {/* Garment Breakdown Checklist */}
              {garmentDemandList.filter(g => g.pendingUnits > 0).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#10b981' }}>✨ All orders are currently fulfilled and handed over!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {garmentDemandList.filter(g => g.pendingUnits > 0).map(garment => (
                    <div key={garment.id} style={{ border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#f0f0f0', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc' }}>
                        <div>
                          <strong style={{ fontSize: '13px', textTransform: 'uppercase' }}>{garment.name}</strong>
                          <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>({garment.category})</span>
                        </div>
                        <strong style={{ fontSize: '12px', color: '#b45309' }}>
                          {garment.pendingUnits} Units To Pack
                        </strong>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fafafa' }}>
                            <th style={{ padding: '6px 12px', width: '30px' }}>[✓]</th>
                            <th style={{ padding: '6px 12px' }}>SIZE</th>
                            <th style={{ padding: '6px 12px', textAlign: 'center' }}>PENDING UNITS</th>
                            <th style={{ padding: '6px 12px' }}>ORDER REFS / DESTINATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(garment.sizes)
                            .filter(([_, stat]) => stat.pending > 0)
                            .map(([size, stat]) => {
                              const orderRefs = stat.orders
                                .filter(o => o.orderStatus !== 'Delivered')
                                .map(o => `#${o.orderId.slice(0, 6)} (${o.customer?.name || 'Guest'} - ${o.shippingAddress?.city || 'India'})`)
                                .join(', ');

                              return (
                                <tr key={size} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '1px solid #000' }} />
                                  </td>
                                  <td style={{ padding: '8px 12px', fontWeight: 800 }}>
                                    SIZE {size}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, fontSize: '13px' }}>
                                    {stat.pending}
                                  </td>
                                  <td style={{ padding: '8px 12px', color: '#444' }}>
                                    {orderRefs}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Signoff block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem', borderTop: '2px solid #000', paddingTop: '1.5rem', fontSize: '11px' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '1.5rem' }}>WORKSHOP PICKER SIGNATURE:</strong>
                  <div style={{ borderBottom: '1px solid #000', width: '200px' }} />
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '1.5rem' }}>PACKING SUPERVISOR SIGNATURE:</strong>
                  <div style={{ borderBottom: '1px solid #000', width: '200px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT ORDER SETTINGS MODAL ─── */}
      {editingOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          backgroundColor: 'rgba(10,9,9,0.92)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="admin-modal-card fade-in-up" style={{ maxWidth: '780px' }}>
            <button
              onClick={() => setEditingOrder(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#fde047', fontSize: '22px' }}>settings</span>
              <h2 className="font-headline-md" style={{ color: 'var(--primary)', letterSpacing: '0.15em', fontSize: '18px', margin: 0 }}>
                EDIT ORDER SETTINGS #{editingOrder.id.slice(0, 8)}
              </h2>
            </div>
            <p className="font-caption" style={{ color: 'var(--on-surface-variant)', marginBottom: '1.75rem' }}>
              Adjust delivery confirmation, courier details, customer address, and payment status.
            </p>

            <form onSubmit={handleSaveOrderModal} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* ── Delivery / Handover Status ── */}
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                <FieldLabel>ORDER DELIVERY STATE (GIVEN / NOT GIVEN)</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingOrder({ ...editingOrder, orderStatus: 'Delivered' })}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '6px',
                      border: editingOrder.orderStatus === 'Delivered' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: editingOrder.orderStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: editingOrder.orderStatus === 'Delivered' ? '#34d399' : 'var(--on-surface-variant)',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                    GIVEN TO CUSTOMER (DELIVERED)
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingOrder({ ...editingOrder, orderStatus: editingOrder.orderStatus === 'Delivered' ? 'Pending' : editingOrder.orderStatus })}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '6px',
                      border: editingOrder.orderStatus !== 'Delivered' && editingOrder.orderStatus !== 'Cancelled' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: editingOrder.orderStatus !== 'Delivered' && editingOrder.orderStatus !== 'Cancelled' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                      color: editingOrder.orderStatus !== 'Delivered' && editingOrder.orderStatus !== 'Cancelled' ? '#fbbf24' : 'var(--on-surface-variant)',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>hourglass_top</span>
                    NOT GIVEN (IN PROGRESS / PENDING)
                  </button>
                </div>

                <div className="admin-responsive-grid-2col">
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Specific Status</label>
                    <select
                      value={editingOrder.orderStatus || 'Pending'}
                      onChange={e => setEditingOrder({ ...editingOrder, orderStatus: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="Pending">Pending (Not Handed Over)</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing (Packaging)</option>
                      <option value="Shipped">Shipped (In Transit)</option>
                      <option value="Delivered">Delivered (Handed Over / Completed ✅)</option>
                      <option value="Cancelled">Cancelled ❌</option>
                      <option value="Refunded">Refunded ↩️</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Payment Status</label>
                    <select
                      value={editingOrder.paymentStatus || 'Pending'}
                      onChange={e => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })}
                      style={selectStyle}
                    >
                      <option value="Pending">Payment Pending</option>
                      <option value="Paid">Paid ✅</option>
                      <option value="Failed">Failed ❌</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Logistics & Shipping ── */}
              <div className="admin-responsive-grid-2col">
                <div>
                  <FieldLabel>COURIER / DELIVERY METHOD</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart, Delhivery, Local Handover"
                    value={editingOrder.shippingMethod || ''}
                    onChange={e => setEditingOrder({ ...editingOrder, shippingMethod: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <FieldLabel>TRACKING / AWB NUMBER</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. 1Z9999999999999999"
                    value={editingOrder.trackingNumber || ''}
                    onChange={e => setEditingOrder({ ...editingOrder, trackingNumber: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* ── Customer Details ── */}
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                <FieldLabel>CUSTOMER INFORMATION</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Full Name</label>
                    <input
                      type="text"
                      value={editingOrder.customer?.name || ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        customer: { ...(editingOrder.customer || { email: '', phone: '' }), name: e.target.value }
                      })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Email</label>
                    <input
                      type="email"
                      value={editingOrder.customer?.email || ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        customer: { ...(editingOrder.customer || { name: '', phone: '' }), email: e.target.value }
                      })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Phone</label>
                    <input
                      type="text"
                      value={editingOrder.customer?.phone || ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        customer: { ...(editingOrder.customer || { name: '', email: '' }), phone: e.target.value }
                      })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>Street / House / Landmark</label>
                  <input
                    type="text"
                    value={editingOrder.shippingAddress?.street || editingOrder.shippingAddress?.line1 || ''}
                    onChange={e => setEditingOrder({
                      ...editingOrder,
                      shippingAddress: { ...(editingOrder.shippingAddress || {}), street: e.target.value, line1: e.target.value }
                    })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>City</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.city || ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...(editingOrder.shippingAddress || {}), city: e.target.value }
                      })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>State</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.state || ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...(editingOrder.shippingAddress || {}), state: e.target.value }
                      })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="font-caption" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.35rem', fontSize: '11px' }}>PIN Code</label>
                    <input
                      type="text"
                      value={editingOrder.shippingAddress?.zip || editingOrder.shippingAddress?.pincode || ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        shippingAddress: { ...(editingOrder.shippingAddress || {}), zip: e.target.value, pincode: e.target.value }
                      })}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ── Internal Notes ── */}
              <div>
                <FieldLabel>INTERNAL MANAGEMENT NOTES / AUDIT LOG</FieldLabel>
                <textarea
                  placeholder="Record customer calls, special instructions, parcel handover time..."
                  value={editingOrder.internalNotes || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, internalNotes: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem', letterSpacing: '0.15em' }}>
                  SAVE ORDER SETTINGS
                </button>
                <button type="button" onClick={() => setEditingOrder(null)} className="btn-ghost" style={{ flex: 1, padding: '1rem', letterSpacing: '0.15em' }}>
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PRINTABLE PACKING SLIP / INVOICE MODAL ─── */}
      {printingOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          backgroundColor: 'rgba(10,9,9,0.95)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="admin-modal-card fade-in-up" style={{ maxWidth: '650px', backgroundColor: '#fff', color: '#000', borderRadius: '8px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '13px', color: '#000', letterSpacing: '0.1em' }}>DISPATCH PACKING SLIP PREVIEW</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} style={{ background: '#000', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>
                  PRINT SLIP
                </button>
                <button onClick={() => setPrintingOrder(null)} style={{ background: '#eee', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>
                  CLOSE
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'sans-serif', color: '#111' }}>
              {/* Slip Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '0.2em' }}>SOHARTH</h1>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#666' }}>CELESTIAL MINIMALIST APPAREL</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '16px', display: 'block' }}>PACKING SLIP</strong>
                  <span style={{ fontSize: '12px', color: '#444' }}>Ref: #{printingOrder.id.slice(0, 8).toUpperCase()}</span><br/>
                  <span style={{ fontSize: '11px', color: '#666' }}>{new Date(printingOrder.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '6px' }}>
                <div>
                  <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>SHIP TO:</strong>
                  <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
                    <strong>{printingOrder.customer?.name || 'Customer'}</strong><br/>
                    {printingOrder.shippingAddress?.street || printingOrder.shippingAddress?.line1 || ''}<br/>
                    {printingOrder.shippingAddress?.city ? `${printingOrder.shippingAddress.city}, ` : ''}{printingOrder.shippingAddress?.state || ''} {printingOrder.shippingAddress?.zip || printingOrder.shippingAddress?.pincode || ''}<br/>
                    Phone: {printingOrder.customer?.phone || '—'}
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px' }}>ORDER DETAILS:</strong>
                  <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                    <strong>Status:</strong> {(printingOrder.orderStatus || 'Pending').toUpperCase()}<br/>
                    <strong>Payment:</strong> {printingOrder.paymentMethod || 'Cash on Delivery'} ({printingOrder.paymentStatus || 'Pending'})<br/>
                    <strong>Courier:</strong> {printingOrder.shippingMethod || 'Standard Express'}<br/>
                    {printingOrder.trackingNumber && <span><strong>AWB:</strong> {printingOrder.trackingNumber}</span>}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '8px 4px' }}>ITEM DESCRIPTION</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>SIZE</th>
                    <th style={{ padding: '8px 4px', textAlign: 'center' }}>QTY</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {(printingOrder.items || []).map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'center' }}>{item.size}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 700 }}>₹{(Number(item.price) * Number(item.qty)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total & Signoff */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000', paddingTop: '1rem' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Thank you for your patronage.<br/>
                  For customer care: care@soharth.com
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>TOTAL AMOUNT</span>
                  <span style={{ fontSize: '20px', fontWeight: 900 }}>₹{printingOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT PRODUCT MODAL ─── */}
      {editingProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(10,9,9,0.92)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="admin-modal-card fade-in-up">
            <button
              onClick={() => setEditingProduct(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>

            <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: '2rem', letterSpacing: '0.2em', fontSize: '18px' }}>EDIT APPAREL PIECE</h2>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              <div className="admin-responsive-grid-2col">
                <div>
                  <FieldLabel>GARMENT NAME *</FieldLabel>
                  <input type="text" required value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <FieldLabel>SUBTITLE / SPECIFICATION</FieldLabel>
                  <input type="text" value={editingProduct.subtitle}
                    onChange={e => setEditingProduct({ ...editingProduct, subtitle: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* ── Edit Pricing & Live % OFF Calculation ── */}
              <div style={{
                padding: '1.5rem',
                border: '1px solid rgba(229,226,224,0.12)',
                backgroundColor: 'rgba(255,255,255,0.015)',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}>
                <div className="admin-responsive-grid-2col">
                  <div>
                    <FieldLabel>REAL PRICE / MRP (₹)</FieldLabel>
                    <input
                      type="number"
                      placeholder="e.g., 999 (Original sticker price)"
                      value={editingProduct.original_price ?? ''}
                      onChange={e => setEditingProduct({
                        ...editingProduct,
                        original_price: e.target.value ? Number(e.target.value) : undefined
                      })}
                      style={inputStyle}
                    />
                    <span className="font-caption" style={{ color: 'var(--on-surface-variant)', opacity: 0.6, fontSize: '10px' }}>
                      Original price before discount
                    </span>
                  </div>
                  <div>
                    <FieldLabel>PRICE AFTER DISCOUNT / SELLING PRICE (₹) *</FieldLabel>
                    <input
                      type="number"
                      required
                      placeholder="e.g., 699 (Actual charge)"
                      value={editingProduct.price ?? ''}
                      onChange={e => setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value)
                      })}
                      style={inputStyle}
                    />
                    <span className="font-caption" style={{ color: 'var(--on-surface-variant)', opacity: 0.6, fontSize: '10px' }}>
                      Final price customer pays
                    </span>
                  </div>
                </div>

                {/* Dynamic Live % Off Badge */}
                {(() => {
                  const orig = Number(editingProduct.original_price) || 0;
                  const disc = Number(editingProduct.price) || 0;
                  if (orig > 0 && disc > 0) {
                    if (orig > disc) {
                      const savings = orig - disc;
                      const pct = Math.round((savings / orig) * 100);
                      return (
                        <div style={{
                          padding: '0.85rem 1.25rem',
                          backgroundColor: 'rgba(75, 255, 142, 0.08)',
                          border: '1px solid rgba(75, 255, 142, 0.25)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{
                              backgroundColor: '#4bff8e',
                              color: '#000',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '2px',
                              letterSpacing: '0.05em'
                            }}>
                              {pct}% OFF
                            </span>
                            <span className="font-body-md" style={{ color: 'var(--primary)', fontSize: '13px' }}>
                              Live Preview: Customer will see <strong>₹{disc.toLocaleString()}</strong> <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>₹{orig.toLocaleString()}</span>
                            </span>
                          </div>
                          <span className="font-label-caps" style={{ color: '#4bff8e', fontSize: '11px', fontWeight: 600 }}>
                            Savings: ₹{savings.toLocaleString()}
                          </span>
                        </div>
                      );
                    } else if (disc > orig) {
                      return (
                        <div style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(255, 75, 75, 0.08)',
                          border: '1px solid rgba(255, 75, 75, 0.25)',
                          borderRadius: '4px',
                          color: '#ff4b4b',
                          fontSize: '11px'
                        }}>
                          ⚠️ Note: Selling price (₹{disc}) is greater than Real MRP (₹{orig}). Real price will be shown as standard.
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div>
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
                <FieldLabel>DESCRIPTION</FieldLabel>
                <textarea value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
              </div>

              <div className="admin-responsive-grid-2col">
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
              <div>
                <FieldLabel>COLOR VARIATIONS</FieldLabel>
                {editingProduct.colors && editingProduct.colors.map((color, colorIdx) => (
                  <div key={colorIdx} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(229,226,224,0.1)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                      <input type="text" placeholder="Color Name (e.g. White)" value={color.name}
                        onChange={e => {
                          const newColors = [...(editingProduct.colors || [])];
                          newColors[colorIdx].name = e.target.value;
                          setEditingProduct({ ...editingProduct, colors: newColors });
                        }} style={{ ...inputStyle, flex: 1 }} />
                      <input type="text" placeholder="Hex (e.g. #FFFFFF)" value={color.hex}
                        onChange={e => {
                          const newColors = [...(editingProduct.colors || [])];
                          newColors[colorIdx].hex = e.target.value;
                          setEditingProduct({ ...editingProduct, colors: newColors });
                        }} style={{ ...inputStyle, flex: 1 }} />
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color.hex || '#000', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                      <button type="button" onClick={() => {
                        const newColors = (editingProduct.colors || []).filter((_, i) => i !== colorIdx);
                        setEditingProduct({ ...editingProduct, colors: newColors });
                      }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.1em' }}>✕ REMOVE COLOR</button>
                    </div>

                    {/* Color-specific images */}
                    <div style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(229,226,224,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span className="font-label-caps" style={{ fontSize: '9px', display: 'block', opacity: 0.5, letterSpacing: '0.15em' }}>Images for {color.name || 'this color'}</span>
                      {(color.images || []).map((img, imgIdx) => (
                        <div key={imgIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {img && <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                          <div style={{ flex: 1 }}>
                            <input type="file" accept="image/*" onChange={e => handleColorImageUpload(e, colorIdx, imgIdx, true)} style={{ color: 'var(--primary)', fontSize: '12px' }} />
                            {uploadingColorIdx?.colorIdx === colorIdx && uploadingColorIdx?.imgIdx === imgIdx && uploadingColorIdx.isEdit && <span style={{ fontSize: '10px', color: 'var(--primary)', marginLeft: '8px' }}>Uploading...</span>}
                          </div>
                          <button type="button" onClick={() => {
                            const newColors = [...(editingProduct.colors || [])];
                            const newImages = (color.images || []).filter((_, i) => i !== imgIdx);
                            newColors[colorIdx] = { ...color, images: newImages };
                            setEditingProduct({ ...editingProduct, colors: newColors });
                          }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const newColors = [...(editingProduct.colors || [])];
                        const currentImages = color.images || [];
                        newColors[colorIdx] = { ...color, images: [...currentImages, ''] };
                        setEditingProduct({ ...editingProduct, colors: newColors });
                      }} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', fontSize: '9px', cursor: 'pointer', letterSpacing: '0.1em' }}>
                        + ADD COLOR IMAGE
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setEditingProduct({ ...editingProduct, colors: [...(editingProduct.colors || []), { name: '', hex: '', images: [''] }] })}
                  style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.5rem', fontSize: '10px', marginTop: '0.5rem', cursor: 'pointer', letterSpacing: '0.1em' }}>
                  + ADD COLOR
                </button>
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
