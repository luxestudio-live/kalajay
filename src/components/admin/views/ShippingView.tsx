'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminOrder } from '@/data/adminTypes';

export default function ShippingView() {
  const { orders, updateOrderStatus, activeSubPage, setActiveSubPage, showModal } = useAdminStore();
  const activeTab: 'shipments' | 'rules' = activeSubPage === 'shipping.rules' ? 'rules' : 'shipments';

  const [selectedShipment, setSelectedShipment] = useState<AdminOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shipment editor state
  const [statusToUpdate, setStatusToUpdate] = useState<AdminOrder['fulfillmentStatus']>('shipped');
  const [shippingMethod, setShippingMethod] = useState<'in_house' | 'third_party_courier' | 'local_delivery' | 'other'>('third_party_courier');
  const [courierName, setCourierName] = useState('');
  const [trackingAwb, setTrackingAwb] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [actualDeliveryDate, setActualDeliveryDate] = useState('');
  const [customerShippingNote, setCustomerShippingNote] = useState('');
  const [internalStaffNote, setInternalStaffNote] = useState('');
  const [deliveryAttemptCount, setDeliveryAttemptCount] = useState<number>(0);
  const [deliveryFailureReason, setDeliveryFailureReason] = useState('');
  const [podReference, setPodReference] = useState('');

  const openShipmentEditor = (order: AdminOrder) => {
    setSelectedShipment(order);
    setStatusToUpdate(order.fulfillmentStatus);
    setShippingMethod(order.shippingMethod || (order.courier?.toLowerCase().includes('in-house') ? 'in_house' : 'third_party_courier'));
    setCourierName(order.courier || '');
    setTrackingAwb(order.trackingAwb || '');
    setTrackingUrl(order.trackingUrl || '');
    setDispatchDate(order.dispatchDate || '');
    setEstimatedDeliveryDate(order.estimatedDeliveryDate || '');
    setActualDeliveryDate(order.actualDeliveryDate || '');
    setCustomerShippingNote(order.customerShippingNote || '');
    setInternalStaffNote(order.internalStaffNote || '');
    setDeliveryAttemptCount(order.deliveryAttemptCount ?? 0);
    setDeliveryFailureReason(order.deliveryFailureReason || '');
    setPodReference(order.podReference || '');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const shipments = orders.filter(o =>
    ['shipped', 'out_for_delivery', 'delivered', 'delivery_attempt_failed', 'rto'].includes(o.fulfillmentStatus)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-[#F7F3EC] px-4 py-3 rounded-xl shadow-xl border border-[#9E5430] text-xs animate-slide-up flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C9A86A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Pan-India Logistics &amp; Dispatch Operations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Shipping &amp; Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage manual courier dispatches (any carrier), local deliveries, in-house White-Glove handovers, and tracking milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            showModal({
              title: 'Kalajay Dispatch Manifest',
              message: 'Generated Atelier Dispatch Manifest #KLJ-DISP-2026-BHR. Active shipments batched for handover.',
              icon: 'success',
            })
          }
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate Dispatch Manifest</span>
        </button>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
        <button
          type="button"
          onClick={() => setActiveSubPage('shipping.shipments')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'shipments'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          Active Shipments ({shipments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubPage('shipping.rules')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          Shipping Rules &amp; Zones
        </button>
      </div>

      {/* 3. SHIPMENTS TABLE */}
      {activeTab === 'shipments' ? (
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Consignment Ref</th>
                  <th className="py-3 px-4">Dispatch Handler / Carrier</th>
                  <th className="py-3 px-4">Recipient &amp; Destination</th>
                  <th className="py-3 px-4">Milestone Dates</th>
                  <th className="py-3 px-4">Transit Milestone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {shipments.map(s => (
                  <tr
                    key={s.id}
                    onClick={() => openShipmentEditor(s)}
                    className="hover:bg-[#FFFCF7] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-bold block">Order #{s.id}</strong>
                      <span className="text-[10.5px] text-[#9E5430] font-mono font-semibold">
                        {s.trackingAwb ? `AWB: ${s.trackingAwb}` : 'Direct Handover (No AWB)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#372921] font-medium">
                      <span>{s.courier || (s.shippingMethod === 'in_house' ? 'Kalajay In-House Delivery' : 'Unassigned Carrier')}</span>
                      {s.trackingUrl && (
                        <a
                          href={s.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="block text-[10px] text-[#9E5430] hover:underline"
                        >
                          External Tracking &rarr;
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#76695F]">
                      <span className="font-semibold text-[#372921] block">{s.customerName}</span>
                      <span>
                        {s.shippingAddress.city} ({s.shippingAddress.pincode})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#76695F] font-mono text-[10.5px]">
                      <div>Dispatch: {s.dispatchDate || s.createdAt.slice(0, 10)}</div>
                      {s.estimatedDeliveryDate && (
                        <div className="text-[10px] text-[#15803D]">Est: {s.estimatedDeliveryDate}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                          s.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.fulfillmentStatus === 'out_for_delivery'
                            ? 'bg-sky-100 text-sky-800'
                            : s.fulfillmentStatus === 'delivery_attempt_failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {s.fulfillmentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openShipmentEditor(s);
                        }}
                        className="px-2.5 py-1 rounded bg-[#F7F3EC] hover:bg-[#EAE2D8] text-[#372921] font-semibold text-[11px] cursor-pointer"
                      >
                        Edit Shipment
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showModal({
                            title: 'Thermal Dispatch Label',
                            message: `Generated 4x6" thermal barcoded dispatch label for Order #${s.id} (${s.courier || 'In-House Delivery'}, Ref: ${s.trackingAwb || 'Internal'}). Handcrafted piece destination: ${s.shippingAddress.city}, ${s.shippingAddress.state}.`,
                            icon: 'info',
                          });
                        }}
                        className="text-[11px] text-[#9E5430] hover:underline font-semibold cursor-pointer"
                      >
                        Print Label
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RULES TAB */
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4 text-xs text-[#372921]">
          <h3 className="font-serif text-base font-semibold">Pan-India Freight Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F7F3EC] border border-[#DED3C5] space-y-2">
              <strong className="block font-semibold">Complimentary Delivery Threshold:</strong>
              <p className="text-[#76695F]">
                All consumer cart orders with subtotal above <strong>₹599</strong> receive automatic free surface delivery across India.
              </p>
              <span className="text-[10px] font-mono text-[#9E5430] font-bold block">
                Rule ID: SHIP-RULE-FREE-599
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F3EC] border border-[#DED3C5] space-y-2">
              <strong className="block font-semibold">Standard Flat Freight (Below ₹599):</strong>
              <p className="text-[#76695F]">
                A nominal shipping fee of <strong>₹99</strong> is added for orders below the threshold to cover protective transit packaging.
              </p>
              <span className="text-[10px] font-mono text-[#9E5430] font-bold block">
                Rule ID: SHIP-RULE-STD-99
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHIPMENT EDIT DRAWER */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DED3C5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <span>Shipment for Order #{selectedShipment.id}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] font-sans font-medium uppercase">
                    {selectedShipment.fulfillmentStatus.replace('_', ' ')}
                  </span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Recipient: {selectedShipment.customerName} · {selectedShipment.shippingAddress.city}, {selectedShipment.shippingAddress.state} ({selectedShipment.shippingAddress.pincode})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="w-7 h-7 rounded-full bg-white hover:bg-[#DED3C5] text-[#372921] flex items-center justify-center font-bold text-sm cursor-pointer shadow-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#372921]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Fulfillment Status</label>
                  <select
                    value={statusToUpdate}
                    onChange={(e) => setStatusToUpdate(e.target.value as AdminOrder['fulfillmentStatus'])}
                    className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="shipped">Dispatched &amp; In Transit</option>
                    <option value="out_for_delivery">Out for Delivery (Concierge / Partner)</option>
                    <option value="delivered">Delivered to Patron</option>
                    <option value="delivery_attempt_failed">Delivery Attempt Failed (Reschedule)</option>
                    <option value="rto">Return to Origin (RTO)</option>
                  </select>
                </div>

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
                    placeholder="e.g. Recipient signature or security gate ack"
                    value={podReference}
                    onChange={(e) => setPodReference(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                    Customer Shipping Note <span className="text-[#15803D] font-normal">(Visible on Customer Tracking &amp; Emails)</span>
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
                    placeholder="e.g. High-value consignment checked by head artisan; driver confirmed handover coordinates."
                    value={internalStaffNote}
                    onChange={(e) => setInternalStaffNote(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] hover:bg-white text-[#372921] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedShipment) return;

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

                  const shipmentData: Partial<AdminOrder> = {
                    shippingMethod,
                    courier: courierName.trim() || undefined,
                    trackingAwb: trackingAwb.trim() || undefined,
                    trackingUrl: trackingUrl.trim() || undefined,
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
                    selectedShipment.id,
                    statusToUpdate,
                    customerShippingNote || undefined,
                    undefined,
                    undefined,
                    shipmentData
                  );

                  showToast(`Shipment for Order #${selectedShipment.id} updated.`);
                  setSelectedShipment(null);
                }}
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Save Shipment Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

