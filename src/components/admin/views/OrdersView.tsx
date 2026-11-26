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
  AlertTriangle,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminOrder } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

export default function OrdersView() {
  const { orders, updateOrderStatus, createManualOrder, can, activeRole, currentUser, activeSubPage, setActiveSubPage, logAction } = useAdminStore();

  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'in_loom' | 'shipped' | 'delivered'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<AdminOrder['fulfillmentStatus']>('in_loom');
  const [statusNote, setStatusNote] = useState('');
  const [markPaymentReceived, setMarkPaymentReceived] = useState(false);
  const [paymentBankRef, setPaymentBankRef] = useState('');
  const [paymentJustification, setPaymentJustification] = useState('');

  // Manual Shipping & Fulfillment State
  const [shippingMethod, setShippingMethod] = useState<'in_house' | 'third_party_courier' | 'local_delivery' | 'other'>('third_party_courier');
  const [courierName, setCourierName] = useState('');
  const [trackingAwb, setTrackingAwb] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [expectedDispatchDate, setExpectedDispatchDate] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [actualDeliveryDate, setActualDeliveryDate] = useState('');
  const [customerShippingNote, setCustomerShippingNote] = useState('');
  const [internalStaffNote, setInternalStaffNote] = useState('');
  const [deliveryAttemptCount, setDeliveryAttemptCount] = useState<number>(0);
  const [deliveryFailureReason, setDeliveryFailureReason] = useState('');
  const [podReference, setPodReference] = useState('');

  const openOrderDrawer = (order: AdminOrder) => {
    setSelectedOrder(order);
    setStatusToUpdate(order.fulfillmentStatus);
    setStatusNote('');
    setShippingMethod(order.shippingMethod || (order.courier?.toLowerCase().includes('in-house') ? 'in_house' : 'third_party_courier'));
    setCourierName(order.courier || '');
    setTrackingAwb(order.trackingAwb || '');
    setTrackingUrl(order.trackingUrl || '');
    setExpectedDispatchDate(order.expectedDispatchDate || '');
    setDispatchDate(order.dispatchDate || '');
    setEstimatedDeliveryDate(order.estimatedDeliveryDate || '');
    setActualDeliveryDate(order.actualDeliveryDate || '');
    setCustomerShippingNote(order.customerShippingNote || '');
    setInternalStaffNote(order.internalStaffNote || '');
    setDeliveryAttemptCount(order.deliveryAttemptCount ?? 0);
    setDeliveryFailureReason(order.deliveryFailureReason || '');
    setPodReference(order.podReference || '');
  };

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
  const [payStatus, setPayStatus] = useState<AdminOrder['paymentStatus']>('paid');

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
      paymentStatus: payStatus,
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
                      onClick={() => openOrderDrawer(order)}
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
                          {order.shippingAddress?.city || 'India'}, {order.shippingAddress?.state || ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#76695F]">
                        {order.items?.map(i => `${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''} (x${i.quantity})`).join(', ') || 'No line items'}
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
                            openOrderDrawer(order);
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <div>
                <label className="block font-semibold mb-1 text-[#372921]">Payment Status</label>
                <select
                  value={payStatus}
                  onChange={e => setPayStatus(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  <option value="paid">Paid (Payment Received)</option>
                  <option value="unpaid">Unpaid (Pending Concierge / RTGS)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-[#372921]">Select Handcrafted Piece</label>
                <select
                  value={selectedProductSku}
                  onChange={e => setSelectedProductSku(e.target.value)}
                  className="w-full max-w-full truncate text-ellipsis bg-[#FAF8F5] border border-[#DED3C5] rounded-lg p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.code} value={p.code} className="truncate">
                      [{p.code}] {p.name.length > 28 ? p.name.slice(0, 28) + '…' : p.name} · ₹{p.price.toLocaleString('en-IN')}
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
                        <span className="text-[11px] text-[#76695F]">{o.shippingAddress?.state || o.shippingAddress?.city || 'India'}</span>
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
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.open(`/api/orders/${o.id}/invoice?print=1`, '_blank');
                            }
                          }}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Order #${selectedOrder.id} Details`}
          data-lenis-prevent="true"
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full border border-[#DED3C5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            data-lenis-prevent="true"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between shrink-0">
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

            <div
              className="p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-5 text-xs"
              data-lenis-prevent="true"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#76695F]">Purchased Pieces</span>
                {selectedOrder.items?.map(i => (
                  <div key={i.productId || i.sku} className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                    <div>
                      <strong className="text-[#372921] block">{i.name}</strong>
                      <span className="text-[11px] text-[#76695F]">
                        SKU: {i.sku} · Qty: {i.quantity}
                        {i.variantLabel ? ` · Finish: ${i.variantLabel}` : ''}
                      </span>
                      {i.attributes && Object.keys(i.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(i.attributes).map(([attr, val]) => (
                            <span key={attr} className="text-[10px] px-1.5 py-0.5 bg-[#EAE2D8] text-[#372921] rounded font-medium">
                              {attr}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-serif font-bold text-[#372921]">₹{(i.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Address */}
              <div className="p-3 bg-[#F7F3EC] rounded-xl border border-[#DED3C5] text-xs">
                <span className="font-bold block text-[#372921]">Delivery Destination:</span>
                <p className="text-[#76695F] mt-0.5">
                  {selectedOrder.shippingAddress?.addressLine || ''}, {selectedOrder.shippingAddress?.city || 'India'}, {selectedOrder.shippingAddress?.state || ''} - {selectedOrder.shippingAddress?.pincode || ''}
                </p>
                <span className="text-[#76695F] block mt-1">Contact: {selectedOrder.customerPhone} ({selectedOrder.customerEmail})</span>
              </div>

              {/* Status Update Control */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DED3C5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#76695F]">
                    Update Fulfillment Status &amp; Tracking
                  </span>
                  <span className="text-[10px] text-[#9E5430] font-medium">Syncs live to Firestore</span>
                </div>

                {/* Requirement 5 & 7: Payment Verification Safeguard & Role Enforcement */}
                {selectedOrder.paymentStatus !== 'paid' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Payment Pending Verification ({selectedOrder.paymentMethod})</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      This order is not marked paid. In accordance with e-commerce security standards, dispatch and loom staging are locked until payment receipt is confirmed.
                    </p>

                    {/* Role Gate: Only Superadmin and Store Manager can reconcile payments */}
                    {(activeRole?.id === 'role-super-admin' || activeRole?.id === 'role-store-manager') ? (
                      <div className="space-y-2.5 pt-1">
                        <label className="flex items-center gap-2 text-amber-950 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={markPaymentReceived}
                            onChange={(e) => setMarkPaymentReceived(e.target.checked)}
                            className="w-4 h-4 text-[#9E5430] rounded accent-[#9E5430]"
                          />
                          <span>Confirm manual bank / gateway settlement (Mark as Paid)</span>
                        </label>

                        {markPaymentReceived && (
                          <div className="bg-white/80 p-3 rounded border border-amber-300 space-y-2 animate-fade-in text-[11px]">
                            <div>
                              <label className="block font-semibold text-[#372921] mb-1">
                                Bank Reference / UTR Number <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={paymentBankRef}
                                onChange={e => setPaymentBankRef(e.target.value)}
                                placeholder="e.g. HDFC-UTR-89230498 or RZP-PAY-98124"
                                className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded p-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-[#372921] mb-1">
                                Reconciliation Justification <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={paymentJustification}
                                onChange={e => setPaymentJustification(e.target.value)}
                                placeholder="e.g. Verified in HDFC current account credits statement."
                                className="w-full bg-[#FAF8F5] border border-[#DED3C5] rounded p-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                            </div>
                            <span className="text-[10px] text-[#76695F] block italic">
                              Audited Action: Actor ({currentUser?.id || 'STAFF'}), timestamp, and bank UTR will be permanently logged to /audit_logs.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10.5px] text-amber-700 bg-amber-100/60 p-2 rounded border border-amber-200/80">
                        Restricted: Only Super Administrators and Store Managers possess privilege to manually reconcile unconfirmed payments.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#372921] mb-1">Status Milestone</label>
                    <select
                      value={statusToUpdate}
                      onChange={(e) => setStatusToUpdate(e.target.value as AdminOrder['fulfillmentStatus'])}
                      className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    >
                      <option value="unfulfilled">Unfulfilled / Order Queued</option>
                      <option value="in_loom">In Atelier Loom (Bihar)</option>
                      <option value="quality_checked">Quality Inspected &amp; Wax-Sealed (Mumbai)</option>
                      <option value="shipped">Dispatched &amp; In Transit</option>
                      <option value="out_for_delivery">Out for Delivery (Concierge / Partner)</option>
                      <option value="delivered">Delivered to Patron</option>
                      <option value="delivery_attempt_failed">Delivery Attempt Failed (Reschedule)</option>
                      <option value="cancelled">Cancelled &amp; Restocked</option>
                      <option value="rto">Return to Origin (RTO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#372921] mb-1">Milestone Transition Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Inspected, sealed, and handed to dispatch"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>
                </div>

                {/* Manual Shipping & Logistics Details */}
                <div className="pt-2 border-t border-[#DED3C5]/60 space-y-3">
                  <span className="font-bold uppercase tracking-wider text-[10.5px] text-[#9E5430] block">
                    Manual Shipping &amp; Logistics Management
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Shipping Method</label>
                      <select
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value as any)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      >
                        <option value="third_party_courier">Commercial Courier (Blue Dart, Delhivery, DTDC, etc.)</option>
                        <option value="in_house">Kalajay In-House Delivery Team</option>
                        <option value="local_delivery">Local White-Glove Concierge Handover</option>
                        <option value="other">Other Transport / Self Pickup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Courier / Carrier Partner</label>
                      <input
                        type="text"
                        placeholder="e.g. Blue Dart, Delhivery, DTDC, In-House Team"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                        Tracking / AWB Number <span className="text-[#76695F] font-normal">(Optional for In-House)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7829103982 or leave empty"
                        value={trackingAwb}
                        onChange={(e) => setTrackingAwb(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] font-mono focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Carrier Tracking Portal URL</label>
                      <input
                        type="url"
                        placeholder="https://www.carrier.com/track/..."
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Dispatch Date</label>
                      <input
                        type="date"
                        value={dispatchDate}
                        onChange={(e) => setDispatchDate(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Estimated Delivery Date</label>
                      <input
                        type="date"
                        value={estimatedDeliveryDate}
                        onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Delivery Attempt Count</label>
                      <input
                        type="number"
                        min="0"
                        value={deliveryAttemptCount}
                        onChange={(e) => setDeliveryAttemptCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">Proof of Delivery (POD) Ref</label>
                      <input
                        type="text"
                        placeholder="e.g. Signed by recipient / Security gate ack"
                        value={podReference}
                        onChange={(e) => setPodReference(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                        Customer Shipping Note <span className="text-[#15803D] font-normal">(Visible to Customer on Tracking &amp; Emails)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Parcel sealed with wax medallion. Handover scheduled between 2 PM - 5 PM."
                        value={customerShippingNote}
                        onChange={(e) => setCustomerShippingNote(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                        Internal Staff Note <span className="text-[#B91C1C] font-normal">(Confidential / Private Staff Audit Only)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Special high-value packaging verified by head artisan; driver contacted guard."
                        value={internalStaffNote}
                        onChange={(e) => setInternalStaffNote(e.target.value)}
                        className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedOrder) return;

                    // URL Validation for trackingUrl
                    if (trackingUrl.trim()) {
                      try {
                        const parsed = new URL(trackingUrl.trim());
                        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                          showToast('Validation Error: Tracking URL must use http:// or https://');
                          return;
                        }
                      } catch {
                        showToast('Validation Error: Tracking URL must be a valid HTTP or HTTPS URL.');
                        return;
                      }
                    }

                    // Payment Safeguard: Block fulfillment/dispatch of unpaid orders (Requirement 5)
                    const isUnpaid = selectedOrder.paymentStatus !== 'paid' && !markPaymentReceived;
                    if (isUnpaid && statusToUpdate !== 'unfulfilled') {
                      showToast('Payment Safeguard: Cannot allocate loom, quality-inspect, or dispatch an unpaid order. Payment must be confirmed first.');
                      return;
                    }

                    // Role & reconciliation validation
                    if (markPaymentReceived) {
                      const canReconcile = activeRole?.id === 'role-super-admin' || activeRole?.id === 'role-store-manager';
                      if (!canReconcile) {
                        showToast('Access Denied: Only Super Administrators and Store Managers can verify payments.');
                        return;
                      }
                      if (!paymentBankRef.trim()) {
                        showToast('Reconciliation Error: Bank Reference / UTR number is mandatory.');
                        return;
                      }
                      if (!paymentJustification.trim()) {
                        showToast('Reconciliation Error: Justification for payment confirmation is mandatory.');
                        return;
                      }
                    }

                    const reconciliationData = markPaymentReceived ? {
                      confirmedBy: currentUser?.id || 'KJ-ADM-001',
                      confirmedByName: currentUser?.name || 'Administrator',
                      confirmedByRole: activeRole?.name || 'Super Administrator',
                      bankReference: paymentBankRef.trim(),
                      justification: paymentJustification.trim(),
                      source: selectedOrder.paymentMethod === 'WhatsApp Direct' ? 'manual_bank_transfer' : 'manual_gateway_override',
                      timestamp: new Date().toISOString(),
                    } : undefined;

                    const nextPaymentStatus = markPaymentReceived ? 'paid' : undefined;

                    const shipmentData: Partial<AdminOrder> = {
                      shippingMethod,
                      courier: courierName.trim() || undefined,
                      trackingAwb: trackingAwb.trim() || undefined,
                      trackingUrl: trackingUrl.trim() || undefined,
                      expectedDispatchDate: expectedDispatchDate || undefined,
                      dispatchDate: dispatchDate || undefined,
                      estimatedDeliveryDate: estimatedDeliveryDate || undefined,
                      actualDeliveryDate: actualDeliveryDate || undefined,
                      customerShippingNote: customerShippingNote.trim() || undefined,
                      internalStaffNote: internalStaffNote.trim() || undefined,
                      deliveryAttemptCount: Number(deliveryAttemptCount) || 0,
                      deliveryFailureReason: deliveryFailureReason.trim() || undefined,
                      podReference: podReference.trim() || undefined,
                    };

                    updateOrderStatus(
                      selectedOrder.id,
                      statusToUpdate,
                      statusNote || customerShippingNote || undefined,
                      nextPaymentStatus,
                      reconciliationData,
                      shipmentData
                    );

                    setSelectedOrder(prev => prev ? {
                      ...prev,
                      ...shipmentData,
                      fulfillmentStatus: statusToUpdate,
                      ...(nextPaymentStatus ? { paymentStatus: nextPaymentStatus } : {}),
                      timeline: [
                        ...prev.timeline,
                        {
                          title: `Fulfillment Status: ${statusToUpdate.toUpperCase()}${nextPaymentStatus ? ' (Payment Confirmed)' : ''}`,
                          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                          note: customerShippingNote || statusNote || undefined,
                        }
                      ]
                    } : null);
                    showToast(`Order #${selectedOrder.id} status & shipment updated.`);
                    setStatusNote('');
                    setMarkPaymentReceived(false);
                    setPaymentBankRef('');
                    setPaymentJustification('');
                  }}
                  className="w-full py-2 bg-[#9E5430] hover:bg-[#874427] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Apply Status &amp; Shipment Update
                </button>
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
