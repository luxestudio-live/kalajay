'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  FileText,
  User,
  MapPin,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminOrder } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

export default function OrdersView() {
  const { orders, updateOrderStatus, createManualOrder, can } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unfulfilled' | 'in_loom' | 'shipped' | 'delivered'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Manual Order Builder State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [selectedProductSku, setSelectedProductSku] = useState(PRODUCTS[0]?.code || '');
  const [orderQty, setOrderQty] = useState(1);
  const [addrLine, setAddrLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  const canEditOrders = can('orders.all', 'edit');

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || o.fulfillmentStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = PRODUCTS.find(p => p.code === selectedProductSku) || PRODUCTS[0];
    const sub = prod.price * orderQty;
    const tax = Math.round(sub * 0.03 * 100) / 100;

    createManualOrder({
      customerName: custName,
      customerEmail: custEmail,
      customerPhone: custPhone,
      items: [
        {
          productId: prod.id,
          name: prod.name,
          sku: prod.code,
          price: prod.price,
          quantity: orderQty,
          image: prod.coverImage,
        },
      ],
      subtotal: sub,
      discount: 0,
      shipping: 0,
      tax,
      total: sub + tax,
      paymentStatus: 'paid',
      paymentMethod: 'WhatsApp Direct',
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

    setManualModalOpen(false);
    setCustName('');
    setCustEmail('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Commerce Operations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Customer Orders &amp; Sales
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Track customer orders from loom threading in Bihar to courier transit and door delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setManualModalOpen(true)}
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Manual Concierge Order</span>
        </button>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Orders (${orders.length})` },
          { id: 'in_loom', label: `In Atelier Loom (${orders.filter(o => o.fulfillmentStatus === 'in_loom').length})` },
          { id: 'shipped', label: `Dispatched & Transit (${orders.filter(o => o.fulfillmentStatus === 'shipped').length})` },
          { id: 'delivered', label: `Delivered (${orders.filter(o => o.fulfillmentStatus === 'delivered').length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. SEARCH */}
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

      {/* 4. ORDERS TABLE */}
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
                <tr key={order.id} className="hover:bg-[#FFFCF7] transition-colors">
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
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        order.fulfillmentStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.fulfillmentStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.fulfillmentStatus === 'in_loom'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 rounded-full bg-[#F0E9DF] hover:bg-[#EAE2D8] text-[11px] font-semibold text-[#9E5430] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ORDER DETAIL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden p-6 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#372921]">
                    Order #{selectedOrder.id} Details
                  </h3>
                  <span className="text-xs text-[#76695F]">
                    Placed on {selectedOrder.createdAt} · Verified Payment: {selectedOrder.paymentMethod}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-[#76695F] hover:text-[#372921]"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-bold block">
                  Handcrafted Items Ordered:
                </span>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover border border-[#DED3C5]"
                      />
                      <div>
                        <strong className="text-xs font-semibold text-[#372921] block">
                          {item.name}
                        </strong>
                        <span className="text-[10.5px] text-[#76695F] font-mono">
                          SKU: {item.sku} · Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif text-xs font-bold text-[#372921]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping & Delivery Address */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFFCF7] p-3.5 rounded-xl border border-[#EAE2D8]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-bold block mb-1">
                    Customer Contact:
                  </span>
                  <strong className="text-[#372921] block">{selectedOrder.customerName}</strong>
                  <span className="text-[#76695F] block">{selectedOrder.customerEmail}</span>
                  <span className="text-[#76695F] block">{selectedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-bold block mb-1">
                    Dispatch Address:
                  </span>
                  <span className="text-[#372921] block leading-tight">
                    {selectedOrder.shippingAddress.addressLine}
                  </span>
                  <span className="text-[#76695F] block">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                    {selectedOrder.shippingAddress.pincode}
                  </span>
                  {selectedOrder.courier && (
                    <span className="text-[10px] text-[#9E5430] font-mono font-bold block mt-1">
                      Carrier: {selectedOrder.courier} (AWB: {selectedOrder.trackingAwb})
                    </span>
                  )}
                </div>
              </div>

              {/* Provenance Note */}
              {selectedOrder.artisanNote && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong className="font-semibold block mb-0.5">Master Artisan Provenance Log:</strong>
                  <p className="italic font-serif">&ldquo;{selectedOrder.artisanNote}&rdquo;</p>
                </div>
              )}

              {/* Stage Transition Control */}
              <div className="p-3 bg-[#F7F3EC] rounded-xl border border-[#DED3C5] space-y-2">
                <span className="text-xs font-bold text-[#372921] block">
                  Update Order Fulfillment Stage:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['unfulfilled', 'in_loom', 'quality_checked', 'shipped', 'delivered'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      disabled={!canEditOrders}
                      onClick={() => updateOrderStatus(selectedOrder.id, st)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        selectedOrder.fulfillmentStatus === st
                          ? 'bg-[#9E5430] text-white'
                          : 'bg-white border border-[#DED3C5] text-[#372921] hover:bg-[#F0E9DF]'
                      }`}
                    >
                      {st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EAE2D8]">
                <button
                  type="button"
                  onClick={() => alert(`Simulated GST Invoice generated for Order #${selectedOrder.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#9E5430] font-semibold hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Tax Invoice (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1.5 rounded-full bg-[#372921] text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE MANUAL ORDER MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setManualModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DED3C5] p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#372921] pb-2 border-b border-[#EAE2D8]">
                Create Manual Concierge Order (WhatsApp / Phone)
              </h3>

              <form onSubmit={handleManualOrderSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    placeholder="e.g. Shalini Roy"
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#372921]">Email</label>
                    <input
                      type="email"
                      required
                      value={custEmail}
                      onChange={e => setCustEmail(e.target.value)}
                      placeholder="e.g. shalini@gmail.com"
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#372921]">WhatsApp / Phone</label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={e => setCustPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1 text-[#372921]">Select Piece</label>
                    <select
                      value={selectedProductSku}
                      onChange={e => setSelectedProductSku(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    >
                      {PRODUCTS.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.name} (₹{p.price.toLocaleString('en-IN')})
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
                      onChange={e => setOrderQty(Number(e.target.value))}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
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
                    placeholder="Street, apartment, landmark"
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    placeholder="State"
                    className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    placeholder="Pincode"
                    className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setManualModalOpen(false)}
                    className="px-4 py-1.5 rounded-full border border-[#DED3C5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-[#9E5430] text-white font-semibold"
                  >
                    Generate Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

