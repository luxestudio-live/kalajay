'use client';

import React, { useState, useMemo } from 'react';
import {
  Landmark,
  ReceiptText,
  Wallet,
  Users2,
  Paperclip,
  ExternalLink,
  BarChart3,
  Download,
  CreditCard,
  Building,
  Plus,
  Search,
  Filter,
  Sparkles,
  Eye,
  Printer,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Calculator,
  FileText,
  MapPin,
  Phone,
  User,
  Calendar,
  ChevronRight,
  AlertCircle,
  Store,
  Receipt,
  Percent,
  TrendingUp,
  Tag,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { TaxSlab, OfflineOrder, OfflineOrderItem, ExpenseRecord, VendorRecord, CategoryBudget, ExpenseTreatment } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

interface SettlementItem {
  id: string;
  orderId: string;
  gateway: 'Razorpay' | 'Cashfree' | 'UPI Direct';
  refId: string;
  mode: string;
  grossAmount: number;
  gatewayFee: number;
  netCredit: number;
  bankAccount: string;
  settledAt: string;
  status: 'settled' | 'pending';
}

const SEED_SETTLEMENTS: SettlementItem[] = [
  { id: 'SET-901', orderId: 'KJ-88219', gateway: 'UPI Direct', refId: 'UPI-RR-90812348', mode: 'UPI Instant', grossAmount: 2599, gatewayFee: 0, netCredit: 2599, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-11 14:12', status: 'settled' },
  { id: 'SET-902', orderId: 'KJ-88218', gateway: 'Razorpay', refId: 'pay_Nq8711AaB98', mode: 'Visa Infinite Card', grossAmount: 6797, gatewayFee: 135.94, netCredit: 6661.06, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-10 09:30', status: 'settled' },
  { id: 'SET-903', orderId: 'KJ-88217', gateway: 'UPI Direct', refId: 'UPI-RR-88712390', mode: 'UPI Instant', grossAmount: 3299, gatewayFee: 0, netCredit: 3299, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-06 09:32', status: 'settled' },
  { id: 'SET-904', orderId: 'KJ-88216', gateway: 'Cashfree', refId: 'CF-TXN-778921', mode: 'NetBanking (ICICI)', grossAmount: 5198, gatewayFee: 103.96, netCredit: 5094.04, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-05 11:45', status: 'settled' },
  { id: 'SET-905', orderId: 'KJ-88215', gateway: 'Razorpay', refId: 'pay_Np9912CcF11', mode: 'Mastercard Debit', grossAmount: 2899, gatewayFee: 57.98, netCredit: 2841.02, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-04 16:10', status: 'settled' },
];

export default function FinanceView() {
  const {
    logAction,
    activeSubPage,
    setActiveSubPage,
    taxSlabs,
    createTaxSlab,
    updateTaxSlab,
    deleteTaxSlab,
    offlineOrders,
    createOfflineOrder,
    updateOfflineOrderStatus,
    showModal,
    expenses,
    createExpense,
    updateExpense,
    deleteExpense,
    vendors,
    createVendor,
    updateVendor,
    categoryBudgets,
    updateCategoryBudget,
  } = useAdminStore();

  const activeTab: 'overview' | 'expenses' | 'vendors' | 'budgets' | 'offline' | 'gst' =
    activeSubPage === 'finance.expenses'
      ? 'expenses'
      : activeSubPage === 'finance.vendors'
      ? 'vendors'
      : activeSubPage === 'finance.budgets'
      ? 'budgets'
      : activeSubPage === 'finance.offline'
      ? 'offline'
      : activeSubPage === 'finance.gst'
      ? 'gst'
      : 'overview';

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Phase 2C: Expense Book State & Modals ---
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseTreatmentFilter, setExpenseTreatmentFilter] = useState<'all' | 'OPEX' | 'CAPEX'>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>('all');
  const [isRecordExpenseModalOpen, setIsRecordExpenseModalOpen] = useState(false);

  // New Expense Form State
  const [newExpenseParty, setNewExpenseParty] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Raw Materials & Minerals');
  const [newExpenseSubcategory, setNewExpenseSubcategory] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(5000);
  const [newExpenseTax, setNewExpenseTax] = useState<number>(250);
  const [newExpenseMethod, setNewExpenseMethod] = useState<ExpenseRecord['paymentMethod']>('Bank Transfer / NEFT');
  const [newExpenseTreatment, setNewExpenseTreatment] = useState<ExpenseTreatment>('OPEX');
  const [newExpenseInvoiceRef, setNewExpenseInvoiceRef] = useState('');
  const [newExpenseReceiptUrl, setNewExpenseReceiptUrl] = useState('');
  const [newExpenseNotes, setNewExpenseNotes] = useState('');

  // --- Phase 2C: Vendor Master State & Modals ---
  const [vendorSearch, setVendorSearch] = useState('');
  const [isRecordVendorModalOpen, setIsRecordVendorModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorGstin, setNewVendorGstin] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorAddress, setNewVendorAddress] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState<VendorRecord['category']>('raw_materials');
  const [newVendorContracts, setNewVendorContracts] = useState('');
  const [newVendorNotes, setNewVendorNotes] = useState('');

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (expenseTreatmentFilter !== 'all' && exp.treatment !== expenseTreatmentFilter) return false;
      if (expenseCategoryFilter !== 'all' && exp.category !== expenseCategoryFilter) return false;
      if (expenseStatusFilter !== 'all' && exp.status !== expenseStatusFilter) return false;
      if (expenseSearch.trim()) {
        const q = expenseSearch.toLowerCase();
        const matchParty = exp.party.toLowerCase().includes(q);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchRef = (exp.invoiceRef || '').toLowerCase().includes(q);
        if (!matchParty && !matchDesc && !matchRef) return false;
      }
      return true;
    });
  }, [expenses, expenseTreatmentFilter, expenseCategoryFilter, expenseStatusFilter, expenseSearch]);

  // Aggregate Expense Totals
  const expenseTotals = useMemo(() => {
    let opex = 0;
    let capex = 0;
    let pending = 0;
    filteredExpenses.forEach(exp => {
      if (exp.status !== 'void') {
        if (exp.treatment === 'OPEX') opex += exp.amount;
        if (exp.treatment === 'CAPEX') capex += exp.amount;
        if (exp.status === 'pending') pending += exp.amount;
      }
    });
    return { opex, capex, total: opex + capex, pending };
  }, [filteredExpenses]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      if (vendorSearch.trim()) {
        const q = vendorSearch.toLowerCase();
        const matchName = v.name.toLowerCase().includes(q);
        const matchContact = v.contactPerson.toLowerCase().includes(q);
        const matchGst = (v.gstin || '').toLowerCase().includes(q);
        if (!matchName && !matchContact && !matchGst) return false;
      }
      return true;
    });
  }, [vendors, vendorSearch]);

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseParty.trim() || newExpenseAmount <= 0) {
      showToast('Please provide vendor party name and valid expense amount');
      return;
    }
    createExpense({
      date: new Date().toISOString().slice(0, 10),
      amount: Number(newExpenseAmount),
      currency: 'INR',
      type: 'expense',
      status: 'paid',
      category: newExpenseCategory,
      subcategory: newExpenseSubcategory || undefined,
      party: newExpenseParty.trim(),
      description: newExpenseNotes || `Procurement from ${newExpenseParty}`,
      paymentMethod: newExpenseMethod,
      treatment: newExpenseTreatment,
      taxAmount: Number(newExpenseTax) || 0,
      invoiceRef: newExpenseInvoiceRef || undefined,
      receipts: newExpenseReceiptUrl ? [newExpenseReceiptUrl.trim()] : [],
      notes: newExpenseNotes || undefined,
      createdBy: 'Pooja Nair (Finance)',
    });
    setIsRecordExpenseModalOpen(false);
    showToast(`Logged ${newExpenseTreatment} expense of ₹${newExpenseAmount} for ${newExpenseParty}.`);
    setNewExpenseParty('');
    setNewExpenseAmount(5000);
    setNewExpenseInvoiceRef('');
    setNewExpenseReceiptUrl('');
    setNewExpenseNotes('');
  };

  const handleCreateVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim() || !newVendorContact.trim()) {
      showToast('Vendor name and contact person are required');
      return;
    }
    createVendor({
      name: newVendorName.trim(),
      gstin: newVendorGstin.trim() || undefined,
      contactPerson: newVendorContact.trim(),
      phone: newVendorPhone.trim() || '+91 98000 00000',
      email: newVendorEmail.trim() || 'vendor@example.com',
      address: newVendorAddress.trim() || undefined,
      category: newVendorCategory,
      relationshipStart: new Date().toISOString().slice(0, 10),
      contracts: newVendorContracts || undefined,
      notes: newVendorNotes || undefined,
      status: 'active',
    });
    setIsRecordVendorModalOpen(false);
    showToast(`Registered vendor ${newVendorName} in supplier master.`);
    setNewVendorName('');
    setNewVendorContact('');
    setNewVendorGstin('');
  };

  // --- Offline Sales State & Filters ---
  const [offlineSearch, setOfflineSearch] = useState('');
  const [offlineChannelFilter, setOfflineChannelFilter] = useState<string>('all');
  const [offlinePaymentFilter, setOfflinePaymentFilter] = useState<string>('all');
  const [isRecordOfflineModalOpen, setIsRecordOfflineModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<OfflineOrder | null>(null);

  // New Offline Order Form State
  const [newChannel, setNewChannel] = useState<OfflineOrder['channel']>('studio_walkin');
  const [newLocation, setNewLocation] = useState('Worli Sea Face Studio, Mumbai');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [selectedProductSku, setSelectedProductSku] = useState(PRODUCTS[0]?.code || 'KJ-DESK-001');
  const [customItemName, setCustomItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(PRODUCTS[0]?.price || 2899);
  const [itemQty, setItemQty] = useState<number>(1);
  const [selectedHsn, setSelectedHsn] = useState<string>(taxSlabs[0]?.hsnCode || 'HSN 5609 00');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [newPaymentMethod, setNewPaymentMethod] = useState<OfflineOrder['paymentMethod']>('Studio POS (Card Terminal)');
  const [newPaymentStatus, setNewPaymentStatus] = useState<OfflineOrder['paymentStatus']>('paid');
  const [newNotes, setNewNotes] = useState('');

  // Auto-fill price when product changes
  const handleProductChange = (sku: string) => {
    setSelectedProductSku(sku);
    if (sku === 'custom') {
      setItemPrice(1999);
      setCustomItemName('Bespoke Handcrafted Item');
    } else {
      const prod = PRODUCTS.find(p => p.code === sku);
      if (prod) {
        setItemPrice(prod.price);
        setCustomItemName('');
      }
    }
  };

  // Calculations for new offline order
  const calculatedSubtotal = itemPrice * itemQty;
  const calculatedDiscounted = Math.max(0, calculatedSubtotal - discountAmount);
  const currentSlab = taxSlabs.find(s => s.hsnCode === selectedHsn) || taxSlabs[0];
  const gstRate = currentSlab ? currentSlab.gstRate : 3.0;
  // Standard backward tax extraction or addition (in India MRP is often inclusive or exclusive; here we calculate base + tax)
  const calculatedTaxable = calculatedDiscounted / (1 + gstRate / 100);
  const calculatedTax = calculatedDiscounted - calculatedTaxable;
  const calculatedCgst = calculatedTax / 2;
  const calculatedSgst = calculatedTax / 2;

  const handleCreateOfflineOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      showModal({
        title: 'Patron Name Required',
        message: 'Please provide the patron or client name for this studio sale invoice.',
        icon: 'warning',
      });
      return;
    }
    if (!newCustPhone.trim()) {
      showModal({
        title: 'Contact Required',
        message: 'Please provide a valid patron contact phone number or WhatsApp handle for digital receipt dispatch.',
        icon: 'warning',
      });
      return;
    }

    const productName =
      selectedProductSku === 'custom'
        ? customItemName.trim() || 'Custom Handcrafted Piece'
        : PRODUCTS.find(p => p.code === selectedProductSku)?.name || 'Kalajay Atelier Item';

    const channelLabels: Record<OfflineOrder['channel'], string> = {
      studio_walkin: 'Mumbai Studio Walk-In',
      exhibition_popup: 'Exhibition Pop-Up Showcase',
      whatsapp_direct: 'Direct WhatsApp Concierge Sale',
      private_trunk_show: 'Private Bridal Trunk Show',
      b2b_consignment: 'B2B Wholesale / Studio Consignment',
    };

    const nextInvoiceNum = `INV-OFF-2026-${String(offlineOrders.length + 46).padStart(3, '0')}`;

    const newOrder = createOfflineOrder({
      invoiceNumber: nextInvoiceNum,
      channel: newChannel,
      channelLabel: channelLabels[newChannel],
      location: newLocation.trim() || 'Worli Sea Face Studio, Mumbai',
      customerName: newCustName.trim(),
      customerPhone: newCustPhone.trim(),
      customerEmail: newCustEmail.trim() || undefined,
      items: [
        {
          productId: selectedProductSku,
          name: productName,
          sku: selectedProductSku,
          hsnCode: selectedHsn,
          price: itemPrice,
          quantity: itemQty,
          total: calculatedSubtotal,
        },
      ],
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      taxableAmount: Number(calculatedTaxable.toFixed(2)),
      hsnCode: selectedHsn,
      gstRate: gstRate,
      cgst: Number(calculatedCgst.toFixed(2)),
      sgst: Number(calculatedSgst.toFixed(2)),
      igst: 0,
      total: calculatedDiscounted,
      paymentMethod: newPaymentMethod,
      paymentStatus: newPaymentStatus,
      receiptIssued: true,
      notes: newNotes.trim() || undefined,
      recordedBy: 'Soumya (Founder)',
    });

    setIsRecordOfflineModalOpen(false);
    showToast(`Recorded offline order ${newOrder.invoiceNumber} (₹${newOrder.total.toLocaleString('en-IN')}) successfully!`);

    // Reset inputs
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setDiscountAmount(0);
    setNewNotes('');
  };

  const filteredOfflineOrders = useMemo(() => {
    return offlineOrders.filter(o => {
      const matchesSearch =
        o.invoiceNumber.toLowerCase().includes(offlineSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(offlineSearch.toLowerCase()) ||
        o.customerPhone.includes(offlineSearch) ||
        o.location.toLowerCase().includes(offlineSearch.toLowerCase());

      const matchesChannel =
        offlineChannelFilter === 'all' || o.channel === offlineChannelFilter;

      const matchesPayment =
        offlinePaymentFilter === 'all' || o.paymentStatus === offlinePaymentFilter;

      return matchesSearch && matchesChannel && matchesPayment;
    });
  }, [offlineOrders, offlineSearch, offlineChannelFilter, offlinePaymentFilter]);

  const offlineTotals = useMemo(() => {
    const totalGmv = offlineOrders.reduce((sum, o) => sum + o.total, 0);
    const totalTax = offlineOrders.reduce((sum, o) => sum + (o.cgst + o.sgst + o.igst), 0);
    const posTotal = offlineOrders
      .filter(o => o.paymentMethod.includes('POS'))
      .reduce((sum, o) => sum + o.total, 0);
    const upiTotal = offlineOrders
      .filter(o => o.paymentMethod.includes('UPI'))
      .reduce((sum, o) => sum + o.total, 0);
    const cashTotal = offlineOrders
      .filter(o => o.paymentMethod.includes('Cash'))
      .reduce((sum, o) => sum + o.total, 0);
    return { totalGmv, totalTax, posTotal, upiTotal, cashTotal };
  }, [offlineOrders]);

  // --- Tax Slabs (HSN) State & Modals ---
  const [isTaxSlabModalOpen, setIsTaxSlabModalOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<TaxSlab | null>(null);

  // Tax Slab Form State
  const [slabHsn, setSlabHsn] = useState('');
  const [slabCategory, setSlabCategory] = useState('');
  const [slabDesc, setSlabDesc] = useState('');
  const [slabGstRate, setSlabGstRate] = useState<number>(3.0);
  const [slabEffectiveFrom, setSlabEffectiveFrom] = useState('2026-04-01');
  const [slabStatus, setSlabStatus] = useState<'active' | 'archived'>('active');
  const [slabNotes, setSlabNotes] = useState('');

  const openAddSlabModal = () => {
    setEditingSlab(null);
    setSlabHsn('HSN ');
    setSlabCategory('');
    setSlabDesc('');
    setSlabGstRate(3.0);
    setSlabEffectiveFrom(new Date().toISOString().slice(0, 10));
    setSlabStatus('active');
    setSlabNotes('');
    setIsTaxSlabModalOpen(true);
  };

  const openEditSlabModal = (slab: TaxSlab) => {
    setEditingSlab(slab);
    setSlabHsn(slab.hsnCode);
    setSlabCategory(slab.category);
    setSlabDesc(slab.description);
    setSlabGstRate(slab.gstRate);
    setSlabEffectiveFrom(slab.effectiveFrom);
    setSlabStatus(slab.status);
    setSlabNotes(slab.notes || '');
    setIsTaxSlabModalOpen(true);
  };

  const handleSaveTaxSlab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slabHsn.trim() || slabHsn.trim() === 'HSN') {
      showModal({
        title: 'HSN / SAC Code Required',
        message: 'Please enter a valid 4-to-8 digit HSN or SAC classification code for GST compliance.',
        icon: 'warning',
      });
      return;
    }
    if (!slabCategory.trim()) {
      showModal({
        title: 'Category Name Required',
        message: 'Please enter a category classification name for this tax rate entry.',
        icon: 'warning',
      });
      return;
    }

    const halfRate = Number((slabGstRate / 2).toFixed(2));

    if (editingSlab) {
      updateTaxSlab(editingSlab.id, {
        hsnCode: slabHsn.trim(),
        category: slabCategory.trim(),
        description: slabDesc.trim(),
        gstRate: slabGstRate,
        cgstRate: halfRate,
        sgstRate: halfRate,
        igstRate: slabGstRate,
        effectiveFrom: slabEffectiveFrom,
        status: slabStatus,
        notes: slabNotes.trim() || undefined,
      });
      showToast(`Updated tax slab ${slabHsn.trim()} successfully!`);
    } else {
      createTaxSlab({
        hsnCode: slabHsn.trim(),
        category: slabCategory.trim(),
        description: slabDesc.trim(),
        gstRate: slabGstRate,
        cgstRate: halfRate,
        sgstRate: halfRate,
        igstRate: slabGstRate,
        effectiveFrom: slabEffectiveFrom,
        status: slabStatus,
        notes: slabNotes.trim() || undefined,
      });
      showToast(`Added new tax slab ${slabHsn.trim()} (${slabGstRate}% GST)!`);
    }

    setIsTaxSlabModalOpen(false);
  };

  const handleDeleteSlab = (slab: TaxSlab) => {
    showModal({
      title: 'Archive Tax Slab',
      message: `Are you sure you want to archive or remove tax slab ${slab.hsnCode} (${slab.category})? Historical invoices and tax ledger filings will preserve this rate for audit continuity.`,
      icon: 'warning',
      confirmLabel: 'Archive Slab',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        deleteTaxSlab(slab.id);
        showToast(`Archived tax slab ${slab.hsnCode}`);
      },
    });
  };

  // --- Interactive Tax Estimator Widget State ---
  const [calcBaseAmount, setCalcBaseAmount] = useState<number>(5000);
  const [calcSelectedSlabId, setCalcSelectedSlabId] = useState<string>(taxSlabs[0]?.id || '');
  const [calcIsInterstate, setCalcIsInterstate] = useState<boolean>(false);

  const activeCalcSlab = taxSlabs.find(s => s.id === calcSelectedSlabId) || taxSlabs[0];
  const calcGstRate = activeCalcSlab ? activeCalcSlab.gstRate : 3.0;
  const calcTaxAmount = (calcBaseAmount * calcGstRate) / 100;
  const calcGrossTotal = calcBaseAmount + calcTaxAmount;

  // Total sums across all tax slabs
  const totalTurnoverAllSlabs = taxSlabs.reduce((sum, s) => sum + s.taxableTurnover, 0);
  const totalTaxAllSlabs = taxSlabs.reduce((sum, s) => sum + s.taxCollected, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-white px-5 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 flex items-center gap-3 text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Landmark className="w-3.5 h-3.5" />
            <span>Treasury, Margins &amp; Compliance</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Finance &amp; GST Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Reconcile online and offline GMV, manage government GST tax slabs, HSN classifications, and studio walk-in cash/POS invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'expenses' && (
            <button
              type="button"
              onClick={() => setIsRecordExpenseModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense Voucher</span>
            </button>
          )}

          {activeTab === 'vendors' && (
            <button
              type="button"
              onClick={() => setIsRecordVendorModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Supplier</span>
            </button>
          )}

          {activeTab === 'offline' && (
            <button
              type="button"
              onClick={() => setIsRecordOfflineModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Offline Sale</span>
            </button>
          )}

          {activeTab === 'gst' && (
            <button
              type="button"
              onClick={openAddSlabModal}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tax Slab / HSN</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              logAction('EXPORT_GSTR1_REPORT', 'finance', 'Exported monthly GSTR-1 summary for GSTIN 27AAECK1294F1Z3');
              showToast('Exported GSTR-1 Monthly Return (JSON & Excel format)');
            }}
            className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#76695F]" />
            <span>Export GSTR-1 Return</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubPage('finance.overview')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Financial Summary &amp; Treasury</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('finance.expenses')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span>Expense Book</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#9E5430]/10 text-[#9E5430]">
            {expenses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('finance.vendors')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'vendors'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Vendor Master</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#9E5430]/10 text-[#9E5430]">
            {vendors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('finance.budgets')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'budgets'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Category Budgets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('finance.offline')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'offline'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Offline &amp; Studio Sales</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#9E5430]/10 text-[#9E5430]">
            {offlineOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('finance.gst')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'gst'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Tax Slabs &amp; GST Reports (HSN)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#9E5430]/10 text-[#9E5430]">
            {taxSlabs.filter(s => s.status === 'active').length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: OVERVIEW & SETTLEMENTS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Combined Gross GMV</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">
                ₹{(842650 + offlineTotals.totalGmv).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">
                Online: ₹8,42,650 · Studio Offline: ₹{offlineTotals.totalGmv.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Net Bank Realized</span>
              <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">
                ₹{(788200 + offlineTotals.totalGmv).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[#76695F]">Settled into HDFC Bank &amp; POS terminals</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Handcraft COGS</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">₹3,12,000</div>
              <span className="text-[10px] text-[#76695F]">36.4% of total revenue (Materials + Looms)</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Gross Contribution</span>
              <div className="font-serif text-2xl text-emerald-600 font-bold mt-1">63.6%</div>
              <span className="text-[10px] text-[#76695F]">Luxury artisan margin benchmark</span>
            </div>
          </div>

          {/* Channel Revenue Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10.5px] uppercase font-semibold text-[#76695F] block">Website Digital Flagship</span>
                <span className="font-serif text-xl font-bold text-[#372921]">₹8,42,650</span>
                <span className="text-[10px] text-[#76695F] block">98.2% total volume</span>
              </div>
              <CreditCard className="w-8 h-8 text-[#9E5430]/40" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10.5px] uppercase font-semibold text-[#76695F] block">Studio &amp; Exhibition Sales</span>
                <span className="font-serif text-xl font-bold text-[#9E5430]">₹{offlineTotals.totalGmv.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-[#76695F] block">{offlineOrders.length} tax invoices recorded</span>
              </div>
              <Store className="w-8 h-8 text-[#9E5430]/40" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10.5px] uppercase font-semibold text-[#76695F] block">Total Handcraft GST Pool</span>
                <span className="font-serif text-xl font-bold text-[#372921]">₹{(24810 + offlineTotals.totalTax).toFixed(0)}</span>
                <span className="text-[10px] text-emerald-600 font-medium block">All HSN Slabs Reconciled</span>
              </div>
              <Building className="w-8 h-8 text-[#9E5430]/40" />
            </div>
          </div>

          {/* Settlements Table */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#372921]">
                  Payment Gateway Settlements (HDFC Current Account)
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Daily settlement batches from UPI QR, Razorpay, and NetBanking direct channels.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                All Payouts Reconciled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Settlement Ref &amp; Order</th>
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4 text-right">Gross Amount</th>
                    <th className="py-3 px-4 text-right">MDR / Gateway Fee</th>
                    <th className="py-3 px-4 text-right">Net Bank Credit</th>
                    <th className="py-3 px-4">Target Account</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {SEED_SETTLEMENTS.map(s => (
                    <tr key={s.id} className="hover:bg-[#FFFCF7] transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-[#372921] font-mono font-bold block">{s.refId}</strong>
                        <span className="text-[10.5px] text-[#9E5430] font-medium">Order #{s.orderId}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[#372921] font-medium block">{s.mode}</span>
                        <span className="text-[10.5px] text-[#76695F]">{s.gateway}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-serif text-[#372921] font-semibold">
                        ₹{s.grossAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-rose-700">
                        {s.gatewayFee > 0 ? `- ₹${s.gatewayFee.toFixed(2)}` : '₹0.00 (UPI)'}
                      </td>

                      <td className="py-3 px-4 text-right font-serif font-bold text-emerald-700 text-sm">
                        ₹{s.netCredit.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-[#76695F]">
                        {s.bankAccount}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Settled</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: OFFLINE & STUDIO SALES                                         */}
      {/* ========================================================================= */}
      {activeTab === 'offline' && (
        <div className="space-y-6">
          {/* Offline Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Total Offline GMV</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">
                ₹{offlineTotals.totalGmv.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">{offlineOrders.length} completed transactions</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">POS Card Terminal</span>
              <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">
                ₹{offlineTotals.posTotal.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[#76695F]">Swipe / Contactless studio terminal</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Direct UPI QR</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">
                ₹{offlineTotals.upiTotal.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[#76695F]">Instant QR desk settlements</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">GST Collected</span>
              <div className="font-serif text-2xl text-emerald-700 font-bold mt-1">
                ₹{offlineTotals.totalTax.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#76695F]">CGST + SGST tax pool</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#76695F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={offlineSearch}
                onChange={e => setOfflineSearch(e.target.value)}
                placeholder="Search by invoice #, patron name, phone, or location..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430] text-[#372921]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded-xl border border-[#DED3C5]">
                <Filter className="w-3.5 h-3.5 text-[#76695F]" />
                <select
                  value={offlineChannelFilter}
                  onChange={e => setOfflineChannelFilter(e.target.value)}
                  className="bg-transparent text-xs text-[#372921] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Channels</option>
                  <option value="studio_walkin">Mumbai Studio Walk-In</option>
                  <option value="exhibition_popup">Exhibition Pop-Up</option>
                  <option value="whatsapp_direct">Direct WhatsApp Concierge</option>
                  <option value="private_trunk_show">Private Bridal Trunk Show</option>
                  <option value="b2b_consignment">B2B Consignment</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded-xl border border-[#DED3C5]">
                <CreditCard className="w-3.5 h-3.5 text-[#76695F]" />
                <select
                  value={offlinePaymentFilter}
                  onChange={e => setOfflinePaymentFilter(e.target.value)}
                  className="bg-transparent text-xs text-[#372921] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Payment Status</option>
                  <option value="paid">Paid in Full</option>
                  <option value="partial">Partial Deposit</option>
                  <option value="credit">Store Credit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Offline Orders Table */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#372921]">
                  Studio Walk-in &amp; Offline Sales Ledger
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Direct physical and concierge orders recorded with tax invoice numbers and HSN breakdown.
                </p>
              </div>
              <span className="text-xs text-[#76695F] font-mono">
                Showing {filteredOfflineOrders.length} of {offlineOrders.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Invoice &amp; Date</th>
                    <th className="py-3 px-4">Channel &amp; Venue</th>
                    <th className="py-3 px-4">Patron Contact</th>
                    <th className="py-3 px-4">Items / SKU</th>
                    <th className="py-3 px-4">HSN &amp; GST</th>
                    <th className="py-3 px-4 text-right">Gross Total</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {filteredOfflineOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#76695F]">
                        No offline orders match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOfflineOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#FFFCF7] transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-[#372921] font-mono font-bold block">{order.invoiceNumber}</strong>
                          <span className="text-[10.5px] text-[#76695F]">
                            {order.createdAt.slice(0, 10)} {order.createdAt.slice(11, 16)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#9E5430] block">{order.channelLabel}</span>
                          <span className="text-[10.5px] text-[#76695F] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#76695F]" />
                            {order.location}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <strong className="text-[#372921] block">{order.customerName}</strong>
                          <span className="text-[10.5px] text-[#76695F] flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-[#76695F]" />
                            {order.customerPhone}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <span className="font-medium text-[#372921] block truncate max-w-[180px]">
                                {it.name}
                              </span>
                              <span className="text-[10px] text-[#76695F] font-mono">
                                Qty: {it.quantity} × ₹{it.price.toLocaleString('en-IN')} ({it.sku})
                              </span>
                            </div>
                          ))}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-[#9E5430] font-semibold block">{order.hsnCode}</span>
                          <span className="text-[10.5px] text-[#76695F]">
                            {order.gstRate}% GST (₹{(order.cgst + order.sgst + order.igst).toFixed(2)})
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="font-serif font-bold text-sm text-[#372921] block">
                            ₹{order.total.toLocaleString('en-IN')}
                          </span>
                          {order.discount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              -₹{order.discount} Disc
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-[#372921] block">{order.paymentMethod}</span>
                          <span
                            className={`inline-block text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingInvoice(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#9E5430] border border-[#DED3C5] font-semibold text-[11px] cursor-pointer transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Tax Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: TAX SLABS & GST COMPLIANCE (HSN CODES)                         */}
      {/* ========================================================================= */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          {/* Entity & Tax Registration Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#9E5430] px-2.5 py-0.5 rounded bg-[#9E5430]/10">
                  GSTIN: 27AAECK1294F1Z3
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Active Regular Taxpayer
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#372921] mt-1.5">
                Kalajay Creations LLP (Maharashtra &amp; Bihar Operations)
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Principal Place of Business: Worli Sea Face, Mumbai 400018 | Atelier Loom Hub: Madhubani, Bihar 847211
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#76695F] block uppercase tracking-wider">Estimated Q3 GST Liability</span>
              <span className="font-serif text-2xl font-bold text-[#372921]">
                ₹{(totalTaxAllSlabs).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#76695F] block">GSTR-3B Due by 20th Nov 2026</span>
            </div>
          </div>

          {/* Slabs KPI Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Configured Slabs</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">
                {taxSlabs.length} HSN Codes
              </div>
              <span className="text-[10px] text-[#76695F]">
                {taxSlabs.filter(s => s.status === 'active').length} active, {taxSlabs.filter(s => s.status === 'archived').length} archived
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Total Taxable Turnover</span>
              <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">
                ₹{totalTurnoverAllSlabs.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Across all product lines</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Total Tax Collected</span>
              <div className="font-serif text-2xl text-emerald-700 font-bold mt-1">
                ₹{totalTaxAllSlabs.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-[#76695F]">CGST + SGST + IGST</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Standard Split</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">50 / 50</div>
              <span className="text-[10px] text-[#76695F]">Intra-state CGST &amp; SGST</span>
            </div>
          </div>

          {/* Slabs Breakdown Table with Action Buttons */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-serif font-semibold text-[#372921] text-sm">
                  Handicrafts HSN Classification &amp; Applicable GST Slabs
                </h4>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Add, edit, or archive government tax slabs and HSN codes as your product catalogue expands.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddSlabModal}
                className="px-3.5 py-1.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tax Slab</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">HSN Code</th>
                    <th className="py-3 px-4">Product Category &amp; Scope</th>
                    <th className="py-3 px-4 text-center">GST Rate</th>
                    <th className="py-3 px-4">CGST / SGST Split</th>
                    <th className="py-3 px-4 text-right">Taxable Turnover</th>
                    <th className="py-3 px-4 text-right">Tax Collected</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {taxSlabs.map(slab => (
                    <tr key={slab.id} className="hover:bg-[#FFFCF7] transition-colors">
                      <td className="py-3 px-4">
                        <strong className="font-mono font-bold text-[#9E5430] block">{slab.hsnCode}</strong>
                        <span className="text-[10px] text-[#76695F] font-mono">Eff: {slab.effectiveFrom}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#372921] block">{slab.category}</span>
                        <p className="text-[11px] text-[#76695F] max-w-sm leading-relaxed">{slab.description}</p>
                        {slab.notes && (
                          <span className="text-[10px] text-[#9E5430] italic block mt-0.5">
                            Note: {slab.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-[#372921] font-mono text-sm">
                        {slab.gstRate.toFixed(1)}%
                      </td>

                      <td className="py-3 px-4 text-[#76695F] font-mono text-[11px]">
                        {slab.cgstRate.toFixed(1)}% CGST + {slab.sgstRate.toFixed(1)}% SGST
                      </td>

                      <td className="py-3 px-4 text-right font-serif font-medium text-[#372921]">
                        ₹{slab.taxableTurnover.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">
                        ₹{slab.taxCollected.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            slab.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {slab.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => openEditSlabModal(slab)}
                            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#76695F] hover:text-[#9E5430] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
                            title="Edit Tax Slab"
                            aria-label={`Edit tax slab ${slab.hsnCode}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlab(slab)}
                            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#76695F] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Archive/Delete Tax Slab"
                            aria-label={`Archive tax slab ${slab.hsnCode}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Tax & HSN Estimator Tool */}
          <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EAE2D8] pb-3">
              <Calculator className="w-4 h-4 text-[#9E5430]" />
              <h4 className="font-serif font-semibold text-[#372921] text-sm">
                Live Tax &amp; HSN Calculator Tool
              </h4>
              <span className="text-[10px] text-[#76695F] ml-auto font-mono">
                Real-time intra/inter-state tax breakdown
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Taxable Base Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={calcBaseAmount}
                  onChange={e => setCalcBaseAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430] font-mono text-sm text-[#372921]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Applicable HSN / GST Slab
                </label>
                <select
                  value={calcSelectedSlabId}
                  onChange={e => setCalcSelectedSlabId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430] text-[#372921]"
                >
                  {taxSlabs.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.hsnCode} ({s.gstRate}% GST) — {s.category.slice(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Supply Type
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcIsInterstate(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      !calcIsInterstate
                        ? 'bg-[#9E5430] text-white border-[#9E5430] font-semibold'
                        : 'bg-[#FAF8F5] text-[#76695F] border-[#DED3C5]'
                    }`}
                  >
                    Intra-State (MH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcIsInterstate(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                      calcIsInterstate
                        ? 'bg-[#9E5430] text-white border-[#9E5430] font-semibold'
                        : 'bg-[#FAF8F5] text-[#76695F] border-[#DED3C5]'
                    }`}
                  >
                    Inter-State (IGST)
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F3EC] border border-[#DED3C5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#76695F] uppercase font-semibold block">Total Invoice Payable</span>
                  <span className="font-serif text-lg font-bold text-[#372921]">
                    ₹{calcGrossTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right text-[10.5px] font-mono text-[#9E5430]">
                  {!calcIsInterstate ? (
                    <>
                      <div>CGST: ₹{(calcTaxAmount / 2).toFixed(2)}</div>
                      <div>SGST: ₹{(calcTaxAmount / 2).toFixed(2)}</div>
                    </>
                  ) : (
                    <div>IGST ({calcGstRate}%): ₹{calcTaxAmount.toFixed(2)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: RECORD OFFLINE SALE                                            */}
      {/* ========================================================================= */}
      {isRecordOfflineModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#372921]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-2xl max-w-2xl w-full overflow-hidden my-8">
            <div className="p-5 bg-[#F7F3EC] border-b border-[#DED3C5] flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10px] font-semibold uppercase tracking-wider mb-1">
                  <Store className="w-3 h-3" />
                  <span>Physical &amp; Atelier Sales</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#372921]">
                  Record Offline Sale / Studio Tax Invoice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordOfflineModalOpen(false)}
                className="p-1.5 rounded-lg text-[#76695F] hover:text-[#372921] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOfflineOrder} className="p-6 space-y-4 text-xs text-[#372921]">
              {/* Channel & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    Offline Channel *
                  </label>
                  <select
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value as OfflineOrder['channel'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="studio_walkin">Mumbai Studio Walk-In</option>
                    <option value="exhibition_popup">Exhibition Pop-Up Showcase</option>
                    <option value="whatsapp_direct">Direct WhatsApp Concierge Sale</option>
                    <option value="private_trunk_show">Private Bridal Trunk Show</option>
                    <option value="b2b_consignment">B2B Wholesale / Studio Consignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    Studio Venue / Location *
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    required
                    placeholder="e.g. Worli Sea Face Studio, Mumbai"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              {/* Patron Details */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] space-y-3">
                <span className="font-semibold text-xs text-[#372921] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#9E5430]" />
                  Patron Information (for Tax Invoice &amp; WhatsApp Receipt)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      required
                      placeholder="e.g. Radhika Ruia"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      required
                      placeholder="+91 98200 XXXXX"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={newCustEmail}
                      onChange={e => setNewCustEmail(e.target.value)}
                      placeholder="patron@gmail.com"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] space-y-3">
                <span className="font-semibold text-xs text-[#372921] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#9E5430]" />
                  Item Sold &amp; Pricing
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Select Piece from Catalogue</label>
                    <select
                      value={selectedProductSku}
                      onChange={e => handleProductChange(e.target.value)}
                      className="w-full max-w-full truncate text-ellipsis px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                    >
                      {PRODUCTS.map(p => (
                        <option key={p.code} value={p.code} className="truncate">
                          [{p.code}] {p.name.length > 28 ? p.name.slice(0, 28) + '…' : p.name} — ₹{p.price.toLocaleString('en-IN')}
                        </option>
                      ))}
                      <option value="custom">★ Bespoke / Custom Atelier Piece</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={e => setItemQty(Math.max(1, Number(e.target.value)))}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430] font-mono"
                    />
                  </div>
                </div>

                {selectedProductSku === 'custom' && (
                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Custom Item Description</label>
                    <input
                      type="text"
                      value={customItemName}
                      onChange={e => setCustomItemName(e.target.value)}
                      placeholder="e.g. Custom Bridal Lehanga Pearl Tassel Set"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={itemPrice}
                      onChange={e => setItemPrice(Math.max(0, Number(e.target.value)))}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">HSN Tax Slab</label>
                    <select
                      value={selectedHsn}
                      onChange={e => setSelectedHsn(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                    >
                      {taxSlabs.map(s => (
                        <option key={s.id} value={s.hsnCode}>
                          {s.hsnCode} ({s.gstRate}% GST)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] text-[#76695F] mb-1">Studio Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#DED3C5] focus:outline-none focus:border-[#9E5430] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={e => setNewPaymentMethod(e.target.value as OfflineOrder['paymentMethod'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="Studio POS (Card Terminal)">Studio POS (Card Terminal)</option>
                    <option value="Direct UPI QR">Direct UPI QR (Desk Instant)</option>
                    <option value="Cash on Counter">Cash on Counter</option>
                    <option value="Bank NEFT/RTGS">Bank NEFT/RTGS Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={e => setNewPaymentStatus(e.target.value as OfflineOrder['paymentStatus'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="paid">Paid in Full</option>
                    <option value="partial">Partial Advance Deposit</option>
                    <option value="credit">Net-30 Store Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Studio Transaction Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Gift wrapped with ivory mulberry ribbon; wax seal stamp affixed."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              {/* Live Invoice Calculation Preview */}
              <div className="p-4 rounded-xl bg-[#F7F3EC] border border-[#DED3C5] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-[#76695F]">Calculated Breakdown</span>
                  <div className="text-[11px] text-[#76695F]">
                    Taxable Base: ₹{calculatedTaxable.toFixed(2)} | CGST: ₹{calculatedCgst.toFixed(2)} | SGST: ₹{calculatedSgst.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-[#76695F] block">Payable Total</span>
                  <span className="font-serif text-2xl font-bold text-[#9E5430]">
                    ₹{calculatedDiscounted.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED3C5]">
                <button
                  type="button"
                  onClick={() => setIsRecordOfflineModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] hover:bg-[#F7F3EC] text-[#76695F] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Issue Tax Invoice &amp; Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: ADD / EDIT TAX SLAB (HSN)                                      */}
      {/* ========================================================================= */}
      {isTaxSlabModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#372921]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-2xl max-w-lg w-full overflow-hidden my-8">
            <div className="p-5 bg-[#F7F3EC] border-b border-[#DED3C5] flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10px] font-semibold uppercase tracking-wider mb-1">
                  <Building className="w-3 h-3" />
                  <span>GSTIN Compliance</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#372921]">
                  {editingSlab ? 'Edit Tax Slab / HSN Classification' : 'Add New Government Tax Slab'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaxSlabModalOpen(false)}
                className="p-1.5 rounded-lg text-[#76695F] hover:text-[#372921] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxSlab} className="p-6 space-y-4 text-xs text-[#372921]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    HSN / SAC Code *
                  </label>
                  <input
                    type="text"
                    value={slabHsn}
                    onChange={e => setSlabHsn(e.target.value)}
                    required
                    placeholder="e.g. HSN 7117 90"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] font-mono text-[#9E5430] font-bold focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    GST Rate % *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={slabGstRate}
                    onChange={e => setSlabGstRate(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] font-mono font-bold focus:outline-none focus:border-[#9E5430]"
                  />
                  <span className="text-[10px] text-[#76695F] mt-0.5 block">
                    Split: {(slabGstRate / 2).toFixed(1)}% CGST + {(slabGstRate / 2).toFixed(1)}% SGST
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Product Category Title *
                </label>
                <input
                  type="text"
                  value={slabCategory}
                  onChange={e => setSlabCategory(e.target.value)}
                  required
                  placeholder="e.g. Imitation jewellery, crystal beaded charms & wedding tokens"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Technical Classification Scope / Description
                </label>
                <textarea
                  rows={2}
                  value={slabDesc}
                  onChange={e => setSlabDesc(e.target.value)}
                  placeholder="e.g. Hand-assembled glass seed beads, synthetic pearl drop accessories and hairpins."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    Effective From Date
                  </label>
                  <input
                    type="date"
                    value={slabEffectiveFrom}
                    onChange={e => setSlabEffectiveFrom(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                    Status
                  </label>
                  <select
                    value={slabStatus}
                    onChange={e => setSlabStatus(e.target.value as 'active' | 'archived')}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="active">Active Regular Slab</option>
                    <option value="archived">Archived / Deprecated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#76695F] mb-1">
                  Statutory Circular / Notification Reference (Optional)
                </label>
                <input
                  type="text"
                  value={slabNotes}
                  onChange={e => setSlabNotes(e.target.value)}
                  placeholder="e.g. CBIC Notification No. 11/2017 Handicrafts Concession"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED3C5]">
                <button
                  type="button"
                  onClick={() => setIsTaxSlabModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] hover:bg-[#F7F3EC] text-[#76695F] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingSlab ? 'Save Changes' : 'Create Tax Slab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: VIEW LUXURY PRINTABLE TAX INVOICE                              */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-[#372921]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-2xl max-w-2xl w-full overflow-hidden my-8 p-6 sm:p-8 space-y-6">
            {/* Top Bar with Print & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-[#DED3C5]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#9E5430]" />
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#372921]">
                  Official Tax Invoice · {viewingInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="p-1.5 rounded-lg text-[#76695F] hover:text-[#372921] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Letterhead */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-wider text-[#372921]">KALAJAY</h2>
                <span className="text-[10px] tracking-widest uppercase text-[#9E5430] font-semibold block">
                  Handcrafted Creations LLP
                </span>
                <p className="text-[11px] text-[#76695F] mt-1 leading-relaxed">
                  Worli Sea Face, Mumbai 400018, Maharashtra<br />
                  GSTIN: <strong>27AAECK1294F1Z3</strong> | State Code: 27<br />
                  WhatsApp Concierge: +91 97405 40847
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-[10.5px] uppercase font-semibold text-[#76695F] block">Invoice Details</span>
                <span className="font-mono font-bold text-sm text-[#372921] block">{viewingInvoice.invoiceNumber}</span>
                <span className="text-[#76695F] text-[11px] block">
                  Date: {viewingInvoice.createdAt.slice(0, 10)}
                </span>
                <span className="text-[#9E5430] font-semibold text-[11px] block mt-1">
                  Channel: {viewingInvoice.channelLabel}
                </span>
              </div>
            </div>

            {/* Patron Coordinates */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DED3C5] grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#76695F] block">Billed To (Patron):</span>
                <strong className="text-[#372921] font-bold text-sm block mt-0.5">{viewingInvoice.customerName}</strong>
                <span className="text-[#76695F] block">Phone: {viewingInvoice.customerPhone}</span>
                {viewingInvoice.customerEmail && (
                  <span className="text-[#76695F] block">Email: {viewingInvoice.customerEmail}</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-[#76695F] block">Place of Supply:</span>
                <span className="text-[#372921] font-medium block mt-0.5">{viewingInvoice.location}</span>
                <span className="text-[#76695F] block">Payment: {viewingInvoice.paymentMethod}</span>
                <span className="text-emerald-700 font-bold uppercase text-[10.5px] block mt-0.5">
                  ● Status: {viewingInvoice.paymentStatus}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF8F5] text-[#76695F] border-y border-[#DED3C5] text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Item Description &amp; SKU</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {viewingInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3">
                      <strong className="text-[#372921] block">{it.name}</strong>
                      <span className="text-[10px] text-[#76695F] font-mono">SKU: {it.sku}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[#9E5430]">{it.hsnCode}</td>
                    <td className="py-3 px-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-serif">₹{it.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-[#372921]">
                      ₹{it.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Tax Breakdown */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#76695F]">
                  <span>Subtotal:</span>
                  <span className="font-serif">₹{viewingInvoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {viewingInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-serif">- ₹{viewingInvoice.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#76695F] pt-1 border-t border-[#EAE2D8]">
                  <span>Taxable Value:</span>
                  <span className="font-serif">₹{viewingInvoice.taxableAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>CGST ({(viewingInvoice.gstRate / 2).toFixed(1)}%):</span>
                  <span className="font-mono">₹{viewingInvoice.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>SGST ({(viewingInvoice.gstRate / 2).toFixed(1)}%):</span>
                  <span className="font-mono">₹{viewingInvoice.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#372921] pt-2 border-t-2 border-[#9E5430]">
                  <span>Total Payable:</span>
                  <span className="font-serif text-[#9E5430]">₹{viewingInvoice.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer with Authenticity & Stamp */}
            <div className="pt-4 border-t border-[#DED3C5] flex items-center justify-between text-[11px] text-[#76695F]">
              <div>
                <span className="font-semibold text-[#372921] block">Authenticity &amp; Handcraft Warranty:</span>
                <span>Each glass bead and pearl is individually hand-tensioned by Kalajay artisans.</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#9E5430] font-mono block">Attendant: {viewingInvoice.recordedBy}</span>
                <span className="text-[10px] text-[#76695F] italic">Computer Generated Tax Invoice</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          MODAL 4: RECORD EXPENSE VOUCHER MODAL (Phase 2C)
          ========================================================================= */}
      {isRecordExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Treasury Voucher
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Record Expense Book Entry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordExpenseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Vendor / Party *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bohemian Crystal Imports"
                    value={newExpenseParty}
                    onChange={e => setNewExpenseParty(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Accounting Treatment</label>
                  <select
                    value={newExpenseTreatment}
                    onChange={e => setNewExpenseTreatment(e.target.value as ExpenseTreatment)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="OPEX">OPEX (Operating Material / Freight)</option>
                    <option value="CAPEX">CAPEX (Loom Frame / Equipment Asset)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Expense Category</label>
                  <select
                    value={newExpenseCategory}
                    onChange={e => setNewExpenseCategory(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="Raw Materials & Minerals">Raw Materials &amp; Minerals</option>
                    <option value="Packaging & Luxury Presentation">Packaging &amp; Luxury Presentation</option>
                    <option value="Atelier Capital Equipment">Atelier Capital Equipment</option>
                    <option value="Logistics & Courier Delivery">Logistics &amp; Courier Delivery</option>
                    <option value="Brand, PR & Photoshoots">Brand, PR &amp; Photoshoots</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Payment Method</label>
                  <select
                    value={newExpenseMethod}
                    onChange={e => setNewExpenseMethod(e.target.value as any)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="Direct UPI">Direct UPI</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cash / Petty">Cash / Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Gross Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newExpenseAmount}
                    onChange={e => setNewExpenseAmount(Number(e.target.value))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Bill / Invoice Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-BC-8921"
                    value={newExpenseInvoiceRef}
                    onChange={e => setNewExpenseInvoiceRef(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Bill / Receipt URL Attachment</label>
                <input
                  type="text"
                  placeholder="e.g. /docs/receipts/bill_bc_8921.pdf"
                  value={newExpenseReceiptUrl}
                  onChange={e => setNewExpenseReceiptUrl(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Justification / Notes</label>
                <textarea
                  rows={2}
                  value={newExpenseNotes}
                  onChange={e => setNewExpenseNotes(e.target.value)}
                  placeholder="Record purpose or batch allocation..."
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsRecordExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Commit to Expense Book</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: REGISTER VENDOR MODAL (Phase 2C)
          ========================================================================= */}
      {isRecordVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Supplier Master
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Register Trade Vendor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordVendorModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendorSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Company / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Firozabad Glass Works"
                    value={newVendorName}
                    onChange={e => setNewVendorName(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="27AABCB1234F1Z5"
                    value={newVendorGstin}
                    onChange={e => setNewVendorGstin(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={newVendorContact}
                    onChange={e => setNewVendorContact(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Vendor Category</label>
                  <select
                    value={newVendorCategory}
                    onChange={e => setNewVendorCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="raw_materials">Raw Materials</option>
                    <option value="beads_glass">Beads &amp; Czech Glass</option>
                    <option value="packaging_boxes">Packaging &amp; Rigid Boxes</option>
                    <option value="logistics_freight">Logistics &amp; Courier</option>
                    <option value="tools_looms">Tools &amp; Loom Frames</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98200 00000"
                    value={newVendorPhone}
                    onChange={e => setNewVendorPhone(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={newVendorEmail}
                    onChange={e => setNewVendorEmail(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Office / Factory Address</label>
                <input
                  type="text"
                  placeholder="Plot number, industrial area, city, pin..."
                  value={newVendorAddress}
                  onChange={e => setNewVendorAddress(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsRecordVendorModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Supplier Entity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
