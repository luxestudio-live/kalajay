'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  FileText,
  Printer,
  X,
  CreditCard,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminOrder } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

export default function OrdersView() {
  const { orders, updateOrderStatus, createManualOrder, can, activeSubPage, setActiveSubPage, logAction } = useAdminStore();

  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'in_loom' | 'shipped' | 'delivered'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual Order Builder State
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [selectedProductSku, setSelectedProductSku] = useState(PRODUCTS[0]?.code || '');
  const [orderQty, setOrderQty] = useState(1);
  const [addrLine, setAddrLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [payMethod, setPayMethod] = useState<AdminOrder['paymentMethod']>('UPI Instant');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isManualView = activeSubPage === 'orders.manual';
  const isInvoicesView = activeSubPage === 'orders.invoices';

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTab = fulfillmentFilter === 'all' || o.fulfillmentStatus === fulfillmentFilter;
    return matchesSearch && matchesTab;
  });

  const handleCreateManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = PRODUCTS.find(p => p.code === selectedProductSku) || PRODUCTS[0];
    const subtotal = prod.price * orderQty;
    const tax = Math.round(subtotal * 0.03); // 3% GST
    const total = subtotal + tax;

    const newOrder = createManualOrder({
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      items: [
        {
          productId: prod.code,
          name: prod.name,
          sku: prod.code,
          price: prod.price,
          quantity: orderQty,
          image: prod.images?.[0] || '',
        },
      ],
      subtotal,
      discount: 0,
      shipping: 0,
      tax,
      total,
      paymentStatus: 'paid',
      paymentMethod: payMethod,
      fulfillmentStatus: 'unfulfilled',
      shippingAddress: {
        addressLine: addrLine,
        city,
        state: stateName,
        pincode,
      },
      timeline: [
        { title: 'Manual Concierge Order Created', timestamp: new Date().toISOString().slice(0, 16) },
      ],
    });

    logAction('CREATE_MANUAL_ORDER', 'orders', `Created manual concierge order #${newOrder.id} for ${custName}`);
    showToast(`Order #${newOrder.id} created successfully for ${custName}`);
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setAddrLine('');
    setActiveSubPage('orders.all');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-white px-5 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 flex items-center gap-3 text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP SUBPAGE NAVIGATION TABS (Two-Way Sync with Sidebar) */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
        <button
          type="button"
          onClick={() => setActiveSubPage('orders.all')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            !isManualView && !isInvoicesView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>All Customer Orders ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubPage('orders.manual')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            isManualView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Manual Order</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubPage('orders.invoices')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            isInvoicesView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Invoices &amp; Receipts</span>
        </button>
      </div>

      {/* 2. VIEW: ALL ORDERS */}
      {!isManualView && !isInvoicesView && (
        <div className="space-y-4">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="font-serif text-2xl text-[#372921] font-semibold">
                Customer Orders &amp; Sales
              </h1>
              <p className="text-xs text-[#76695F] mt-0.5">
                Multi-status order tracking from Bihar loom allocation to Mumbai wax-seal packaging and in-house atelier direct dispatch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubPage('orders.manual')}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Manual Concierge Order</span>
            </button>
          </div>

          {/* Fulfillment Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: `All Orders (${orders.length})` },
              { id: 'in_loom', label: `In Atelier Loom (${orders.filter(o => o.fulfillmentStatus === 'in_loom').length})` },
              { id: 'shipped', label: `Dispatched & Transit (${orders.filter(o => o.fulfillmentStatus === 'shipped').length})` },
              { id: 'delivered', label: `Delivered (${orders.filter(o => o.fulfillmentStatus === 'delivered').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFulfillmentFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  fulfillmentFilter === tab.id
                    ? 'bg-[#372921] text-white font-semibold'
                    : 'bg-white border border-[#DED3C5] text-[#76695F] hover:bg-[#F7F3EC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="bg-white p-3 rounded-xl border border-[#DED3C5] flex items-center gap-3 text-xs shadow-2xs">
            <Search className="w-4 h-4 text-[#76695F] ml-1" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by Order ID (e.g. KJ-88219), customer name, or email..."
              className="w-full bg-transparent text-xs text-[#372921] focus:outline-none"
            />
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order ID &amp; Date</th>
                    <th className="py-3 px-4">Customer &amp; City</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Total &amp; Payment</th>
                    <th className="py-3 px-4">Fulfillment Stage</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {filteredOrders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-[#FFFCF7] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <strong className="text-[#372921] font-bold block">
                          #{order.id}
                        </strong>
                        <span className="text-[10.5px] text-[#76695F] font-mono">
                          {order.createdAt.slice(0, 10)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#372921] block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-[#76695F]">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#76695F]">
                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-serif font-bold text-[#372921] block">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                          {order.paymentStatus} ({order.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${
                            order.fulfillmentStatus === 'in_loom'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : order.fulfillmentStatus === 'shipped'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {order.fulfillmentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-2.5 py-1 rounded bg-[#F7F3EC] hover:bg-[#EAE2D8] text-[#372921] font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#9E5430]" />
                          <span>Timeline</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW: CREATE MANUAL ORDER (Dedicated View for orders.manual) */}
      {isManualView && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-6 shadow-xs max-w-3xl space-y-6">
          <div className="pb-4 border-b border-[#DED3C5]">
            <h2 className="font-serif text-xl font-bold text-[#372921]">
              Create Manual Concierge Order
            </h2>
            <p className="text-xs text-[#76695F] mt-1">
              Record a VIP phone order, private salon purchase, or direct WhatsApp concierge transaction.
            </p>
          </div>

          <form onSubmit={handleCreateManualOrderSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Patron Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Maharani Gayatri Devi"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Email Address</label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={e => setCustEmail(e.target.value)}
                  placeholder="patron@kalajay.in"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  <option value="UPI Instant">UPI Direct Transfer</option>
                  <option value="WhatsApp Direct">WhatsApp Concierge Settlement</option>
                  <option value="Credit/Debit Card">Credit/Debit Card (POS)</option>
                  <option value="NetBanking">NetBanking RTGS/NEFT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-[#372921]">Select Handcrafted Piece</label>
                <select
                  value={selectedProductSku}
                  onChange={e => setSelectedProductSku(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name} — ₹{p.price.toLocaleString('en-IN')} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#372921]">Delivery Address</label>
              <input
                type="text"
                required
                value={addrLine}
                onChange={e => setAddrLine(e.target.value)}
                placeholder="House/Flat No., Apartment, Street..."
                className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-[#372921]">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#372921]">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={e => setStateName(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="400018"
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#DED3C5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubPage('orders.all')}
                className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] hover:bg-[#F7F3EC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Place Order</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. VIEW: INVOICES & RECEIPTS (Dedicated View for orders.invoices) */}
      {isInvoicesView && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#372921]">
                GST Tax Invoices &amp; Commercial Receipts
              </h2>
              <p className="text-xs text-[#76695F] mt-0.5">
                Compliant commercial invoices for GSTIN: 27AAECK1294F1Z3 with handicraft HSN tax classifications.
              </p>
            </div>

            <button
              type="button"
              onClick={() => showToast('Exported Q3 GST Tax Invoices Batch ZIP')}
              className="px-4 py-2 rounded-full border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#EAE2D8] text-[#372921] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Batch Invoices</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice # &amp; Date</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Patron &amp; State</th>
                  <th className="py-3 px-4 text-right">Taxable Value</th>
                  <th className="py-3 px-4 text-right">GST (3% / 12%)</th>
                  <th className="py-3 px-4 text-right">Invoice Total</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {orders.map(o => {
                  const invNumber = `INV-2026-${o.id.replace('KJ-', '')}`;
                  return (
                    <tr key={o.id} className="hover:bg-[#FFFCF7]">
                      <td className="py-3 px-4">
                        <strong className="text-[#372921] font-mono font-bold block">{invNumber}</strong>
                        <span className="text-[10.5px] text-[#76695F]">{o.createdAt.slice(0, 10)}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#9E5430] font-semibold">
                        #{o.id}
                      </td>
                      <td className="py-3 px-4 text-[#372921]">
                        <span className="font-semibold block">{o.customerName}</span>
                        <span className="text-[11px] text-[#76695F]">{o.shippingAddress.state}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif text-[#372921]">
                        ₹{o.subtotal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#76695F]">
                        ₹{o.tax.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">
                        ₹{o.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Downloaded GST Tax Invoice ${invNumber}.pdf`)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-[#F7F3EC] border border-[#DED3C5] text-[#372921] text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#9E5430]" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ORDER DETAIL TIMELINE DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DED3C5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <span>Order #{selectedOrder.id}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] font-sans font-medium uppercase">
                    {selectedOrder.fulfillmentStatus.replace('_', ' ')}
                  </span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Placed {selectedOrder.createdAt.slice(0, 16).replace('T', ' ')} by {selectedOrder.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#76695F]">Purchased Pieces</span>
                {selectedOrder.items.map(i => (
                  <div key={i.productId} className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                    <div>
                      <strong className="text-[#372921] block">{i.name}</strong>
                      <span className="text-[11px] text-[#76695F]">SKU: {i.sku} · Qty: {i.quantity}</span>
                    </div>
                    <span className="font-serif font-bold text-[#372921]">₹{i.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="p-3 bg-[#F7F3EC] rounded-xl border border-[#DED3C5] text-xs">
                <span className="font-bold block text-[#372921]">Delivery Destination:</span>
                <p className="text-[#76695F] mt-0.5">
                  {selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
                <span className="text-[#76695F] block mt-1">Contact: {selectedOrder.customerPhone} ({selectedOrder.customerEmail})</span>
              </div>

              {/* Timeline Milestones */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#76695F]">Artisan &amp; Transit Milestones</span>
                <div className="border-l-2 border-[#9E5430] pl-4 space-y-3 py-1">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#9E5430] absolute -left-[21px] top-1" />
                      <strong className="text-[#372921] block">{step.title}</strong>
                      <span className="text-[10px] text-[#76695F] font-mono">{step.timestamp}</span>
                      {step.note && <p className="text-[11px] text-[#9E5430] mt-0.5 italic">{step.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-full bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold cursor-pointer"
              >
                Close Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
