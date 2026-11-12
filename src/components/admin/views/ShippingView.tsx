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

export default function ShippingView() {
  const { orders, activeSubPage, setActiveSubPage } = useAdminStore();
  const activeTab: 'shipments' | 'rules' = activeSubPage === 'shipping.rules' ? 'rules' : 'shipments';

  const shipments = orders.filter(o => o.fulfillmentStatus === 'shipped' || o.fulfillmentStatus === 'delivered');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>In-House Dispatch &amp; Logistics</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Shipping &amp; Fulfilment
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage in-house atelier dispatch, Kalajay self-managed delivery fleet, consignment generation, and Pan-India tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Atelier Dispatch: Generating Kalajay in-house delivery manifest...')}
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
                  <th className="py-3 px-4">Dispatch Handler</th>
                  <th className="py-3 px-4">Recipient &amp; Pincode</th>
                  <th className="py-3 px-4">Dispatch Timestamp</th>
                  <th className="py-3 px-4">Transit Milestone</th>
                  <th className="py-3 px-4 text-right">Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {shipments.map(s => (
                  <tr key={s.id} className="hover:bg-[#FFFCF7] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-bold block">Order #{s.id}</strong>
                      <span className="text-[10.5px] text-[#9E5430] font-mono font-semibold">
                        Consignment: {s.trackingAwb}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#372921] font-medium">
                      {s.courier}
                    </td>
                    <td className="py-3 px-4 text-[#76695F]">
                      <span className="font-semibold text-[#372921] block">{s.customerName}</span>
                      <span>
                        {s.shippingAddress.city} ({s.shippingAddress.pincode})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#76695F] font-mono text-[10.5px]">
                      {s.createdAt.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                          s.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {s.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Printing thermal dispatch label for Consignment ${s.trackingAwb}`)}
                        className="text-[11px] text-[#9E5430] hover:underline font-semibold"
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
    </div>
  );
}

