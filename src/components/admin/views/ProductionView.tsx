'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Hammer,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Sliders,
  Settings,
  Award,
  FileCheck,
  FileText,
  BadgeCheck,
  Sparkle,
  Calendar,
  Warehouse,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  HeartHandshake,
  UserPlus,
  PhoneCall,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { adminFetch } from '@/lib/adminAuthClient';
import { WorkOrder, ArtisanProfile, ArtisanCapacity, ArtisanMembership } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

export interface ProductionStageDef {
  id: string;
  label: string;
  badgeLabel: string;
  color: string;
  percent: number;
  description: string;
  isCustom?: boolean;
}

const DEFAULT_STAGES: ProductionStageDef[] = [
  {
    id: 'loom_threading',
    label: '1. Loom Threading',
    badgeLabel: 'LOOM THREADING',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    percent: 20,
    description: 'Foundation high-tensile wire warp threaded on wooden loom.',
  },
  {
    id: 'bead_weaving',
    label: '2. Bead Weaving',
    badgeLabel: 'BEAD WEAVING',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    percent: 40,
    description: 'Precision hand-stringing of Czech faceted crystal and glass beads.',
  },
  {
    id: 'mirror_fitting',
    label: '3. Frame & Mirror Fitting',
    badgeLabel: 'FRAME & MIRROR',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    percent: 60,
    description: 'Internal structural brass framing, vanity mirrors, and clasp mounting.',
  },
  {
    id: 'quality_inspection',
    label: '4. Quality Inspection (QC)',
    badgeLabel: 'QUALITY INSPECTION',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    percent: 80,
    description: '4-point tension audit, knot concealment, and facet luster verification.',
  },
  {
    id: 'wax_sealed',
    label: '5. Wax-Sealed (Complete)',
    badgeLabel: 'WAX SEALED',
    color: 'bg-[#9E5430]/10 text-[#9E5430] border-[#9E5430]/30',
    percent: 100,
    description: 'Artisan signature card, cotton dust bag, and stamped terracotta wax seal.',
  },
];

interface QcAuditLog {
  id: string;
  workOrderId: string;
  productName: string;
  inspector: string;
  result: 'passed' | 'rework_required';
  checks: {
    tension: boolean;
    knots: boolean;
    luster: boolean;
    lining: boolean;
  };
  notes: string;
  timestamp: string;
}

const SEED_QC_LOGS: QcAuditLog[] = [
  {
    id: 'qc-log-104',
    workOrderId: 'WO-2026-104',
    productName: 'Radiant Crystal Beaded Tealight Lantern',
    inspector: 'Sunita Kumari (Loom Lead & QC Inspector)',
    result: 'passed',
    checks: { tension: true, knots: true, luster: true, lining: true },
    notes: 'Rigid 90-degree corner tension verified. All steel termination loops tucked cleanly.',
    timestamp: '2026-11-11T16:45:00Z',
  },
  {
    id: 'qc-log-098',
    workOrderId: 'WO-2026-098',
    productName: 'Signature Pearl Beaded Vanity Box',
    inspector: 'Amina Sheikh (Senior Finishing Lead)',
    result: 'passed',
    checks: { tension: true, knots: true, luster: true, lining: true },
    notes: 'Velvet lining flush with brass hinges. Hand-stamped wax seal applied.',
    timestamp: '2026-11-10T11:20:00Z',
  },
];

const STAGES_STORAGE_KEY = 'kalajay_custom_production_stages_v1';

export default function ProductionView() {
  const {
    workOrders,
    updateWorkOrderStage,
    createWorkOrder,
    can,
    activeSubPage,
    setActiveSubPage,
    logAction,
    showModal,
    artisans,
    createArtisan,
    updateArtisan,
  } = useAdminStore();

  const isQcView = activeSubPage === 'production.qc';
  const isStagesView = activeSubPage === 'production.stages';
  const isArtisansView = activeSubPage === 'production.artisans';

  // Configurable Pipeline Stages
  const [stages, setStages] = useState<ProductionStageDef[]>(DEFAULT_STAGES);
  const [editingStage, setEditingStage] = useState<ProductionStageDef | null>(null);

  // Load custom stages from shared Firestore backend with local fallback
  useEffect(() => {
    let isMounted = true;
    adminFetch('/api/admin/production')
      .then(res => res.json())
      .then(data => {
        if (data?.success && Array.isArray(data.stages) && data.stages.length > 0 && isMounted) {
          setStages(data.stages);
        } else {
          try {
            const stored = localStorage.getItem(STAGES_STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
                setStages(parsed);
              }
            }
          } catch {}
        }
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem(STAGES_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setStages(parsed);
            }
          }
        } catch {}
      });
    return () => { isMounted = false; };
  }, []);

  const saveStages = (updated: ProductionStageDef[]) => {
    setStages(updated);
    try {
      localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    adminFetch('/api/admin/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stages', stages: updated }),
    }).catch(() => {});
  };

  // --- Phase 2D: Artisan Collective Directory State ---
  const [artisanSearch, setArtisanSearch] = useState('');
  const [artisanHubFilter, setArtisanHubFilter] = useState('All');
  const [isRecordArtisanModalOpen, setIsRecordArtisanModalOpen] = useState(false);

  // New Artisan Form State
  const [newArtisanCode, setNewArtisanCode] = useState(`KJ-ART-0${(artisans.length + 1).toString().padStart(2, '0')}`);
  const [newArtisanName, setNewArtisanName] = useState('');
  const [newArtisanCapacity, setNewArtisanCapacity] = useState<ArtisanCapacity>('Master Loom Weaver');
  const [newArtisanMembership, setNewArtisanMembership] = useState<ArtisanMembership>('Master Craftswoman');
  const [newArtisanPhone, setNewArtisanPhone] = useState('+91 94312 00000');
  const [newArtisanEmergName, setNewArtisanEmergName] = useState('');
  const [newArtisanEmergPhone, setNewArtisanEmergPhone] = useState('+91 94312 00001');
  const [newArtisanAddress, setNewArtisanAddress] = useState('Village Ranti, Madhubani District, Bihar');
  const [newArtisanHub, setNewArtisanHub] = useState<ArtisanProfile['villageHub']>('Bihar Craft House (Madhubani)');
  const [newArtisanSkills, setNewArtisanSkills] = useState('Wire tensioning, Glass bead stringing');
  const [newArtisanLoom, setNewArtisanLoom] = useState(`Loom #0${Math.floor(1 + Math.random() * 8)}`);
  const [newArtisanMonthlyCapacity, setNewArtisanMonthlyCapacity] = useState<number>(20);

  const filteredArtisans = useMemo(() => {
    return artisans.filter(a => {
      if (artisanHubFilter !== 'All' && !a.villageHub.includes(artisanHubFilter)) return false;
      if (artisanSearch.trim()) {
        const q = artisanSearch.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchCode = a.memberCode.toLowerCase().includes(q);
        const matchCapacity = a.capacity.toLowerCase().includes(q);
        const matchHub = a.villageHub.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCapacity && !matchHub) return false;
      }
      return true;
    });
  }, [artisans, artisanHubFilter, artisanSearch]);

  const handleCreateArtisanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtisanName.trim()) {
      showToast('Artisan full name is required', 'warning');
      return;
    }
    createArtisan({
      memberCode: newArtisanCode.trim().toUpperCase(),
      name: newArtisanName.trim(),
      capacity: newArtisanCapacity,
      membershipType: newArtisanMembership,
      phone: newArtisanPhone.trim(),
      emergencyContactName: newArtisanEmergName.trim() || 'Family Member',
      emergencyContactPhone: newArtisanEmergPhone.trim() || '+91 94000 00000',
      address: newArtisanAddress.trim(),
      villageHub: newArtisanHub,
      joinDate: new Date().toISOString().slice(0, 10),
      isActive: true,
      skills: newArtisanSkills.split(',').map(s => s.trim()).filter(Boolean),
      currentLoomAssignment: newArtisanLoom,
      monthlyCapacityUnits: Number(newArtisanMonthlyCapacity) || 20,
      unitsCraftedTotal: 0,
      defectRatePct: 0.0,
    });
    setIsRecordArtisanModalOpen(false);
    showToast(`Enrolled artisan ${newArtisanName} (${newArtisanCode}) in Craft House Collective.`, 'success');
    setNewArtisanName('');
    setNewArtisanCode(`KJ-ART-0${(artisans.length + 2).toString().padStart(2, '0')}`);
  };

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'warning' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  // Common filters & search
  const [search, setSearch] = useState('');
  const [activeStage, setActiveStage] = useState<string>('all');

  // QC Subtabs
  const [qcSubTab, setQcSubTab] = useState<'pending' | 'certified' | 'standards' | 'logs'>('pending');
  const [qcLogs, setQcLogs] = useState<QcAuditLog[]>(SEED_QC_LOGS);

  // Modals
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [qcModalOrder, setQcModalOrder] = useState<WorkOrder | null>(null);
  const [customStageModalOpen, setCustomStageModalOpen] = useState(false);
  const [editWoModalOrder, setEditWoModalOrder] = useState<WorkOrder | null>(null);

  // New Work Order Form State
  const [prodSku, setProdSku] = useState(PRODUCTS[0]?.code || '');
  const [prodQty, setProdQty] = useState(10);
  const [artisanName, setArtisanName] = useState('Renu Devi');
  const [artisanLocation, setArtisanLocation] = useState('Bihar Hub · Loom A2');
  const [priority, setPriority] = useState<WorkOrder['priority']>('normal');
  const [targetDate, setTargetDate] = useState('2026-11-20');
  const [initialStage, setInitialStage] = useState<string>('loom_threading');

  // New Custom Stage Form State
  const [customStageName, setCustomStageName] = useState('');
  const [customStagePercent, setCustomStagePercent] = useState(50);
  const [customStageColor, setCustomStageColor] = useState('bg-indigo-100 text-indigo-800 border-indigo-200');
  const [customStageDesc, setCustomStageDesc] = useState('');

  // QC Checklist State
  const [qcTension, setQcTension] = useState(true);
  const [qcKnots, setQcKnots] = useState(true);
  const [qcAlignment, setQcAlignment] = useState(true);
  const [qcLining, setQcLining] = useState(true);
  const [qcInspector, setQcInspector] = useState('Sunita Kumari (Loom Lead & QC Inspector)');
  const [qcNotes, setQcNotes] = useState('');

  const canApproveQc = can('production.qc', 'approve');

  // Filtered Orders for Work Orders Tab
  const filteredOrders = workOrders.filter(w => {
    const matchesSearch =
      w.productName.toLowerCase().includes(search.toLowerCase()) ||
      w.artisanName.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase());
    const matchesStage = activeStage === 'all' || w.stage === activeStage;
    return matchesSearch && matchesStage;
  });

  // Filtered Orders for QC Station Tab
  const qcPendingOrders = workOrders.filter(w => w.stage === 'quality_inspection' || !w.qcPassed);
  const qcPassedOrders = workOrders.filter(w => w.qcPassed || w.stage === 'wax_sealed');

  // Submit New Work Order
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = PRODUCTS.find(p => p.code === prodSku) || PRODUCTS[0];
    createWorkOrder({
      productName: prod.name,
      sku: prod.code,
      quantity: prodQty,
      artisanName,
      artisanLocation,
      loomId: `LM-BH-0${Math.floor(1 + Math.random() * 8)}`,
      stage: initialStage as any,
      targetDate,
      priority,
      qcPassed: false,
      materialAllocated: true,
      notes: 'Issued from Unified Admin Console.',
    });
    setNewOrderModal(false);
    showToast(`Work order issued for ${prod.name} (${prodQty} pcs) to ${artisanName}.`, 'success');
  };

  // Open Add Stage Modal
  const openAddStageModal = () => {
    setEditingStage(null);
    setCustomStageName('');
    setCustomStagePercent(50);
    setCustomStageColor('bg-indigo-100 text-indigo-800 border-indigo-200');
    setCustomStageDesc('');
    setCustomStageModalOpen(true);
  };

  // Open Edit Stage Modal
  const openEditStageModal = (stage: ProductionStageDef) => {
    setEditingStage(stage);
    const rawName = stage.badgeLabel || stage.label.replace(/^\d+\.\s*/, '');
    setCustomStageName(rawName);
    setCustomStagePercent(stage.percent);
    setCustomStageColor(stage.color);
    setCustomStageDesc(stage.description);
    setCustomStageModalOpen(true);
  };

  // Submit Stage (Create or Update)
  const handleSaveCustomStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStageName.trim()) {
      showModal({
        title: 'Validation Notice',
        subtitle: 'Craft Stage Configuration',
        icon: 'warning',
        message: 'Please provide a stage title (e.g. "Framing", "Hand Knotting", "Monogram Threading").',
        confirmLabel: 'Understood',
      });
      return;
    }

    const cleanId = customStageName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');

    if (editingStage) {
      // Editing existing stage
      const updated = stages.map(s => {
        if (s.id === editingStage.id) {
          const prefix = s.label.match(/^\d+\./)?.[0] || '1.';
          return {
            ...s,
            label: `${prefix} ${customStageName.trim()}`,
            badgeLabel: customStageName.trim().toUpperCase(),
            color: customStageColor,
            percent: Math.min(100, Math.max(5, customStagePercent)),
            description: customStageDesc || s.description,
          };
        }
        return s;
      });
      saveStages(updated);
      setCustomStageModalOpen(false);
      setEditingStage(null);
      logAction('EDIT_PRODUCTION_STAGE', 'production', `Updated production stage: ${customStageName.trim()}`);
      showToast(`Stage "${customStageName.trim()}" updated successfully!`, 'success');
      setCustomStageName('');
      setCustomStageDesc('');
      return;
    }

    // Creating new stage: check duplicate
    if (stages.some(s => s.id === cleanId)) {
      showModal({
        title: 'Duplicate Identifier',
        subtitle: 'Craft Stage Configuration',
        icon: 'warning',
        message: 'A pipeline stage with a similar name already exists. Please choose a distinct title.',
        confirmLabel: 'Understood',
      });
      return;
    }

    const newStageDef: ProductionStageDef = {
      id: cleanId,
      label: `${stages.length + 1}. ${customStageName.trim()}`,
      badgeLabel: customStageName.trim().toUpperCase(),
      color: customStageColor,
      percent: Math.min(99, Math.max(10, customStagePercent)),
      description: customStageDesc || 'Custom artisanal processing stage.',
      isCustom: true,
    };

    // Insert before wax_sealed if possible
    const waxSealedIndex = stages.findIndex(s => s.id === 'wax_sealed');
    let nextStages: ProductionStageDef[];
    if (waxSealedIndex !== -1) {
      nextStages = [
        ...stages.slice(0, waxSealedIndex),
        newStageDef,
        ...stages.slice(waxSealedIndex),
      ];
    } else {
      nextStages = [...stages, newStageDef];
    }

    // Renumber properly
    const renumbered = nextStages.map((s, idx) => ({
      ...s,
      label: `${idx + 1}. ${s.label.replace(/^\d+\.\s*/, '')}`,
    }));

    saveStages(renumbered);
    setCustomStageModalOpen(false);
    logAction('ADD_PRODUCTION_STAGE', 'production', `Added custom production stage action: ${newStageDef.label}`);
    showToast(`Custom stage "${newStageDef.label}" added to production pipeline!`, 'success');
    setCustomStageName('');
    setCustomStageDesc('');
  };

  // Delete Stage Action
  const handleDeleteStage = (stageToDelete: ProductionStageDef) => {
    showModal({
      title: 'Delete Pipeline Stage',
      subtitle: 'Craft Stage Configuration',
      icon: 'danger',
      message: `Are you sure you want to delete stage "${stageToDelete.label}" from the production pipeline? Any active work orders in this stage will be safely reassigned to the initial Loom Threading stage.`,
      confirmLabel: 'Delete Stage',
      cancelLabel: 'Keep Stage',
      isDestructive: true,
      onConfirm: () => {
        const remainingStages = stages.filter(s => s.id !== stageToDelete.id);
        const fallbackStage = remainingStages[0]?.id || 'loom_threading';
        workOrders.forEach(w => {
          if (w.stage === stageToDelete.id) {
            updateWorkOrderStage(w.id, fallbackStage as any);
          }
        });

        // Renumber remaining stages
        const renumbered = remainingStages.map((s, idx) => ({
          ...s,
          label: `${idx + 1}. ${s.label.replace(/^\d+\.\s*/, '')}`,
        }));
        saveStages(renumbered);
        logAction('DELETE_PRODUCTION_STAGE', 'production', `Deleted stage: ${stageToDelete.label}`);
        showToast(`Stage "${stageToDelete.label}" has been removed.`, 'info');
      },
    });
  };

  // Move Stage Up / Down in sequence
  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const next = [...stages];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const renumbered = next.map((s, idx) => ({
      ...s,
      label: `${idx + 1}. ${s.label.replace(/^\d+\.\s*/, '')}`,
    }));
    saveStages(renumbered);
    showToast(`Reordered stage sequence.`, 'info');
  };

  // Reset to Pristine Default Stages
  const handleResetStages = () => {
    showModal({
      title: 'Reset Craft Pipeline Stages',
      subtitle: 'Default Atelier Workflow',
      icon: 'warning',
      message: 'Are you sure you want to reset all pipeline stages back to the standard 5 handcraft milestones (Loom Threading, Bead Weaving, Frame & Mirror Fitting, Quality Inspection, and Wax-Sealed)?',
      confirmLabel: 'Reset to Defaults',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        saveStages(DEFAULT_STAGES);
        showToast('Craft pipeline stages reset to pristine defaults.', 'success');
      },
    });
  };

  // Run QC Audit Submit
  const handleQcSubmit = (e: React.FormEvent, verdict: 'pass' | 'rework') => {
    e.preventDefault();
    if (!qcModalOrder) return;

    if (verdict === 'pass') {
      const allChecked = qcTension && qcKnots && qcAlignment && qcLining;
      updateWorkOrderStage(qcModalOrder.id, 'wax_sealed', allChecked);

      const newLog: QcAuditLog = {
        id: `qc-log-${Date.now()}`,
        workOrderId: qcModalOrder.id,
        productName: qcModalOrder.productName,
        inspector: qcInspector,
        result: 'passed',
        checks: { tension: qcTension, knots: qcKnots, luster: qcAlignment, lining: qcLining },
        notes: qcNotes || 'Full 4-point structural and tension integrity certified for wax-sealing.',
        timestamp: new Date().toISOString(),
      };
      setQcLogs(prev => [newLog, ...prev]);
      showToast(`Batch ${qcModalOrder.productName} passed QC and advanced to Wax-Sealing.`, 'success');
    } else {
      // Rework: send back to bead_weaving
      updateWorkOrderStage(qcModalOrder.id, 'bead_weaving', false);
      const newLog: QcAuditLog = {
        id: `qc-log-${Date.now()}`,
        workOrderId: qcModalOrder.id,
        productName: qcModalOrder.productName,
        inspector: qcInspector,
        result: 'rework_required',
        checks: { tension: qcTension, knots: qcKnots, luster: qcAlignment, lining: qcLining },
        notes: qcNotes || 'Sent back to loom for wire tension calibration and edge tightening.',
        timestamp: new Date().toISOString(),
      };
      setQcLogs(prev => [newLog, ...prev]);
      showToast(`Batch ${qcModalOrder.productName} routed back to Bead Weaving for tension rework.`, 'warning');
    }
    setQcModalOrder(null);
    setQcNotes('');
  };

  // Advance to next stage helper
  const handleAdvanceNextStage = (order: WorkOrder) => {
    const currentIndex = stages.findIndex(s => s.id === order.stage);
    if (currentIndex !== -1 && currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      const isQcNext = nextStage.id === 'wax_sealed';
      updateWorkOrderStage(order.id, nextStage.id, isQcNext ? true : order.qcPassed);
      showToast(`Work order ${order.id} advanced to ${nextStage.label}`, 'info');
    }
  };

  const getStageDef = (stageId: string): ProductionStageDef => {
    return (
      stages.find(s => s.id === stageId) || {
        id: stageId,
        label: stageId.replace(/_/g, ' '),
        badgeLabel: stageId.replace(/_/g, ' ').toUpperCase(),
        color: 'bg-stone-100 text-stone-800 border-stone-200',
        percent: 50,
        description: 'Artisan processing stage',
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 bg-[#372921] text-[#F7F3EC] px-4 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 0. SUBPAGE NAVIGATION TABS (Two-Way Sync with Sidebar) */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubPage('production.work_orders')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            !isQcView && !isStagesView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Work Orders &amp; Looms ({workOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('production.qc')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            isQcView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Quality Control (QC Station)</span>
          {qcPendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-bold">
              {qcPendingOrders.length} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('production.artisans')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            isArtisansView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Artisan Collective ({artisans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubPage('production.stages')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            isStagesView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Craft Pipeline Stages ({stages.length})</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW A: WORK ORDERS & ATELIER LOOMS
          ========================================================================= */}
      {!isQcView && !isStagesView && !isArtisansView && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
                <Hammer className="w-3.5 h-3.5" />
                <span>Atelier &amp; Loom Operations</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
                Production &amp; Handcraft Work Orders
              </h1>
              <p className="text-xs sm:text-sm text-[#76695F] mt-1">
                Oversee hand-loom runs across Bihar craft houses, manage batch quantities, and assign master women makers.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {/* Add Custom Stage Action Button */}
              <button
                type="button"
                onClick={openAddStageModal}
                className="px-3.5 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Add a custom stage or action to the production pipeline"
              >
                <Sliders className="w-3.5 h-3.5 text-[#9E5430]" />
                <span>+ Add Custom Stage Action</span>
              </button>

              <button
                type="button"
                onClick={() => setNewOrderModal(true)}
                className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue New Work Order</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  Active Handcraft Looms
                </span>
                <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
                  {workOrders.length} Looms Running
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F0E9DF] flex items-center justify-center text-[#9E5430]">
                <Hammer className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  21 Bihar Women Artisans
                </span>
                <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block">
                  100% Living Wage Hub
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  Configured Stages
                </span>
                <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
                  {stages.length} Pipeline Stages
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  QC Inspection Queue
                </span>
                <span className="font-serif text-2xl font-bold text-[#9E5430] mt-1 block">
                  {qcPendingOrders.length} Pending QC
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9E5430]/10 flex items-center justify-center text-[#9E5430]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Stage Filter Rail & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Dynamic Stages Filter Bar */}
              <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 flex-1">
                <button
                  type="button"
                  onClick={() => setActiveStage('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeStage === 'all'
                      ? 'bg-[#372921] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#DED3C5] text-[#76695F] hover:text-[#372921]'
                  }`}
                >
                  All Work Orders ({workOrders.length})
                </button>

                {stages.map(st => {
                  const count = workOrders.filter(w => w.stage === st.id).length;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveStage(st.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        activeStage === st.id
                          ? 'bg-[#9E5430] text-white font-semibold shadow-2xs'
                          : 'bg-white border border-[#DED3C5] text-[#76695F] hover:text-[#372921]'
                      }`}
                    >
                      <span>{st.label}</span>
                      {count > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                            activeStage === st.id ? 'bg-white text-[#9E5430]' : 'bg-[#F0E9DF] text-[#76695F]'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      {st.isCustom && (
                        <span className="text-[9px] px-1 bg-amber-400/30 text-amber-900 rounded font-bold">
                          Custom
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Quick Add Custom Stage button on tab bar */}
                <button
                  type="button"
                  onClick={openAddStageModal}
                  className="px-2.5 py-1.5 rounded-lg border border-dashed border-[#9E5430] text-[#9E5430] hover:bg-[#9E5430]/10 text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1"
                  title="Add another custom stage to this rail"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stage</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubPage('production.stages')}
                  className="px-2.5 py-1.5 rounded-lg border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#372921] text-xs font-medium whitespace-nowrap cursor-pointer flex items-center gap-1"
                  title="Manage, edit, reorder, and delete pipeline stages"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Manage Pipeline</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-[#76695F] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search work order, artisan..."
                  className="w-full bg-white border border-[#DED3C5] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Work Order &amp; Product</th>
                    <th className="py-3 px-4">Master Artisan &amp; Loom</th>
                    <th className="py-3 px-4 text-center">Batch Qty</th>
                    <th className="py-3 px-4">Current Craft Stage</th>
                    <th className="py-3 px-4">Target Finish</th>
                    <th className="py-3 px-4">QC Status</th>
                    <th className="py-3 px-4 text-right">Stage Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {filteredOrders.map(wo => {
                    const stageDef = getStageDef(wo.stage);
                    const isLastStage = wo.stage === 'wax_sealed';

                    return (
                      <tr key={wo.id} className="hover:bg-[#FFFCF7] transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-[#372921] font-semibold block">{wo.productName}</strong>
                          <span className="text-[10.5px] text-[#76695F] font-mono">
                            {wo.id} · {wo.sku}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#372921] block">{wo.artisanName}</span>
                          <span className="text-[11px] text-[#76695F] flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-[#9E5430]" />
                            <span>{wo.artisanLocation}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-[#372921]">
                          {wo.quantity} pcs
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1 max-w-[160px]">
                            <span
                              className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded uppercase border inline-block ${stageDef.color}`}
                            >
                              {stageDef.badgeLabel}
                            </span>
                            {/* Visual Progress Bar */}
                            <div className="w-full bg-[#EAE2D8] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#9E5430] h-full rounded-full transition-all duration-300"
                                style={{ width: `${stageDef.percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#76695F] font-mono text-[11px]">
                          {wo.targetDate}
                        </td>

                        <td className="py-3 px-4">
                          {wo.qcPassed ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>QC Certified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending QC</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {wo.stage === 'quality_inspection' ? (
                              <button
                                type="button"
                                onClick={() => setQcModalOrder(wo)}
                                disabled={!canApproveQc}
                                className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Run QC Inspection</span>
                              </button>
                            ) : (
                              <>
                                {/* Stage Selector Dropdown with ALL stages + custom add option */}
                                <select
                                  value={wo.stage}
                                  onChange={e => {
                                    if (e.target.value === '__ADD_NEW__') {
                                      setCustomStageModalOpen(true);
                                    } else {
                                      updateWorkOrderStage(wo.id, e.target.value as any);
                                      showToast(`Work order ${wo.id} stage changed to ${getStageDef(e.target.value).label}`);
                                    }
                                  }}
                                  className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#372921] focus:outline-none focus:border-[#9E5430] cursor-pointer max-w-[155px] truncate text-ellipsis"
                                >
                                  {stages.map(st => (
                                    <option key={st.id} value={st.id}>
                                      {st.label}
                                    </option>
                                  ))}
                                  <option value="__ADD_NEW__">+ Add Custom Stage...</option>
                                </select>

                                {/* Quick Advance Stage Button */}
                                {!isLastStage && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceNextStage(wo)}
                                    className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-[#FAF8F5] border border-[#DED3C5] hover:bg-[#9E5430] hover:text-white text-[#76695F] transition-colors cursor-pointer"
                                    title="Advance to next production stage"
                                    aria-label={`Advance work order ${wo.id} to next stage`}
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#76695F]">
                        <Hammer className="w-8 h-8 text-[#DED3C5] mx-auto mb-2" />
                        <p className="text-sm font-semibold text-[#372921]">No work orders in this stage</p>
                        <p className="text-xs text-[#76695F] mt-0.5">Issue a new work order or select &ldquo;All Work Orders&rdquo;.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: DEDICATED QUALITY CONTROL & INSPECTION STATION
          ========================================================================= */}
      {isQcView && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] uppercase tracking-wider font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Atelier Quality Assurance &amp; Certification</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
                Quality Control &amp; Inspection Station
              </h1>
              <p className="text-xs sm:text-sm text-[#76695F] mt-1">
                4-point structural integrity verification, wire knot concealment audits, facet luster inspection, and wax-seal certification.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={openAddStageModal}
                className="px-3.5 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#9E5430]" />
                <span>+ Add Custom QC Stage / Action</span>
              </button>

              {qcPendingOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQcModalOrder(qcPendingOrders[0])}
                  className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspect Next Batch ({qcPendingOrders[0].productName})</span>
                </button>
              )}
            </div>
          </div>

          {/* QC Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  First-Pass Yield Rate
                </span>
                <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">
                  98.2%
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                  +1.4% vs last calendar month
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <BadgeCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  Inspection Queue
                </span>
                <span className="font-serif text-2xl font-bold text-[#9E5430] mt-1 block">
                  {qcPendingOrders.length} Batches Awaiting
                </span>
                <span className="text-[10px] text-[#76695F] block mt-0.5">
                  Priority loom runs
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  QC Certified Heirloom
                </span>
                <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
                  142 Pieces
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Wax-sealed &amp; stamped
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9E5430]/10 flex items-center justify-center text-[#9E5430]">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                  Critical Defect Rate
                </span>
                <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
                  0.4%
                </span>
                <span className="text-[10px] text-[#76695F] block mt-0.5">
                  Within luxury atelier tolerance
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* QC Station Subtabs */}
          <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
            <button
              type="button"
              onClick={() => setQcSubTab('pending')}
              className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                qcSubTab === 'pending'
                  ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                  : 'text-[#76695F] hover:text-[#372921]'
              }`}
            >
              <span>Awaiting Inspection ({qcPendingOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setQcSubTab('certified')}
              className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                qcSubTab === 'certified'
                  ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                  : 'text-[#76695F] hover:text-[#372921]'
              }`}
            >
              <span>QC Certified Batches ({qcPassedOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setQcSubTab('standards')}
              className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                qcSubTab === 'standards'
                  ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                  : 'text-[#76695F] hover:text-[#372921]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>4-Point Inspection Protocol</span>
            </button>

            <button
              type="button"
              onClick={() => setQcSubTab('logs')}
              className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                qcSubTab === 'logs'
                  ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                  : 'text-[#76695F] hover:text-[#372921]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspection Logs ({qcLogs.length})</span>
            </button>
          </div>

          {/* SUBTAB 1: AWAITING INSPECTION QUEUE */}
          {qcSubTab === 'pending' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qcPendingOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-5 bg-white rounded-2xl border border-[#DED3C5] shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[#9E5430] bg-[#9E5430]/10 px-2 py-0.5 rounded">
                          {order.id} · {order.sku}
                        </span>
                        <span
                          className={`text-[9.5px] uppercase font-bold font-mono px-2 py-0.5 rounded-full ${
                            order.priority === 'bridal_express'
                              ? 'bg-rose-100 text-rose-800'
                              : order.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {order.priority.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#372921]">{order.productName}</h3>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#76695F] pt-1">
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-[#A99583]">Master Maker</span>
                          <strong className="text-[#372921]">{order.artisanName}</strong>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-[#A99583]">Loom / Hub</span>
                          <span>{order.artisanLocation}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-[#A99583]">Batch Quantity</span>
                          <strong className="text-[#372921] font-mono">{order.quantity} pcs</strong>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-[#A99583]">Target Date</span>
                          <span className="font-mono">{order.targetDate}</span>
                        </div>
                      </div>

                      {/* 4-Point Inspection Checklist Status */}
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE2D8] space-y-1.5 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#76695F] block">
                          Inspection Criteria:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#76695F]">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Structural Tension
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Knot Concealment
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Crystal Facet Luster
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Lining &amp; Hinges
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EAE2D8] flex items-center justify-between">
                      <span className="text-[11px] text-[#76695F] font-mono">
                        Stage: <strong className="text-[#9E5430]">{getStageDef(order.stage).badgeLabel}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setQcModalOrder(order)}
                        className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Run 4-Point QC Audit</span>
                      </button>
                    </div>
                  </div>
                ))}

                {qcPendingOrders.length === 0 && (
                  <div className="col-span-2 p-12 bg-white rounded-2xl border border-[#DED3C5] text-center text-[#76695F]">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-serif text-lg font-bold text-[#372921]">All Work Orders Certified</h3>
                    <p className="text-xs text-[#76695F] mt-1">There are no batches currently awaiting QC inspection.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 2: QC CERTIFIED BATCHES */}
          {qcSubTab === 'certified' && (
            <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#372921]">
                    Certified &amp; Wax-Sealed Heirloom Batches
                  </h3>
                  <p className="text-xs text-[#76695F] mt-0.5">
                    Batches that passed 100% of inspection checks and are certified for customer dispatch.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
                  {qcPassedOrders.length} Batches Certified
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Certified Creation</th>
                      <th className="py-3 px-4">Artisan Maker</th>
                      <th className="py-3 px-4 text-center">Batch Size</th>
                      <th className="py-3 px-4">Inspection Date</th>
                      <th className="py-3 px-4">QC Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE2D8]">
                    {qcPassedOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#FFFCF7]">
                        <td className="py-3 px-4">
                          <strong className="text-[#372921] font-semibold block">{order.productName}</strong>
                          <span className="text-[10.5px] text-[#76695F] font-mono">{order.id} · {order.sku}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#372921]">{order.artisanName}</span>
                          <span className="text-[10.5px] text-[#76695F] block font-mono">{order.artisanLocation}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#372921]">
                          {order.quantity} pcs
                        </td>
                        <td className="py-3 px-4 font-mono text-[#76695F]">
                          {order.actualDate || order.targetDate}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>100% Passed</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Certificate KJ-QC-${order.id} verified. Signed by Sunita Kumari.`, 'info');
                            }}
                            className="text-xs text-[#9E5430] font-semibold hover:underline cursor-pointer"
                          >
                            View Certificate ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 3: 4-POINT PROTOCOL EXPLANATION */}
          {qcSubTab === 'standards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  step: '01',
                  title: 'Structural Tension & Rigidity',
                  desc: 'High-tensile coated steel wire must maintain balanced internal tension. 90-degree corners must stand completely rigid without sagging, convex bowing, or skew.',
                  threshold: 'Zero deflection under 500g load test',
                },
                {
                  step: '02',
                  title: 'Wire Knot Concealment',
                  desc: 'All wire terminations, crimp beads, and loop knots must be tucked internally into adjacent bead cavities. Zero exposed sharp wire tips permitted.',
                  threshold: '100% blind knot tucking',
                },
                {
                  step: '03',
                  title: 'Optical Facet & Crystal Luster',
                  desc: 'Every Czech faceted crystal and synthetic pearl bead inspected under 5000K daylight lamp. Checked for micro-scratches, coating peel, or glass clouding.',
                  threshold: '100% facet clarity & micro-fiber wipe',
                },
                {
                  step: '04',
                  title: 'Velvet Lining & Hardware Snap',
                  desc: 'Silk/velvet internal lining must sit flush with brass box frame with zero glue bleed. Magnetic clasps and antiqued brass hinges must close with crisp positive snap.',
                  threshold: '50-cycle smooth hinge opening test',
                },
              ].map(proto => (
                <div key={proto.step} className="p-5 bg-white rounded-2xl border border-[#DED3C5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#9E5430] bg-[#9E5430]/10 px-2 py-0.5 rounded">
                      Checkpoint {proto.step}
                    </span>
                    <span className="text-[10px] font-mono text-[#76695F] bg-[#F7F3EC] px-2 py-0.5 rounded border border-[#DED3C5]">
                      Mandatory
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#372921]">{proto.title}</h3>
                  <p className="text-xs text-[#76695F] leading-relaxed">{proto.desc}</p>
                  <div className="pt-2 text-[11px] font-mono text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Benchmark: {proto.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUBTAB 4: INSPECTION LOGS & DEFECT HISTORY */}
          {qcSubTab === 'logs' && (
            <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#372921]">
                    Atelier Quality Audit Log
                  </h3>
                  <p className="text-xs text-[#76695F]">
                    Historical records of all physical batch inspections and rework determinations.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#76695F] bg-[#F7F3EC] px-3 py-1 rounded-full border border-[#DED3C5]">
                  {qcLogs.length} Logged Entries
                </span>
              </div>

              <div className="divide-y divide-[#EAE2D8]">
                {qcLogs.map(log => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-serif text-sm font-bold text-[#372921]">
                          {log.productName}
                        </strong>
                        <span className="font-mono text-[10.5px] text-[#76695F]">
                          ({log.workOrderId})
                        </span>
                        <span
                          className={`text-[9.5px] uppercase font-bold px-2 py-0.2 rounded-full font-mono ${
                            log.result === 'passed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.result.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[#76695F] italic">&ldquo;{log.notes}&rdquo;</p>
                      <span className="text-[10px] text-[#A99583] font-mono block">
                        Inspector: <strong>{log.inspector}</strong> · {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto text-[10px] font-mono">
                      <span className={`px-1.5 py-0.5 rounded ${log.checks.tension ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>Tension</span>
                      <span className={`px-1.5 py-0.5 rounded ${log.checks.knots ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>Knots</span>
                      <span className={`px-1.5 py-0.5 rounded ${log.checks.luster ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>Luster</span>
                      <span className={`px-1.5 py-0.5 rounded ${log.checks.lining ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>Lining</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW C: CRAFT PIPELINE STAGES & ACTION WORKFLOWS (FULL CRUD)
          ========================================================================= */}
      {isStagesView && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Atelier Workflow &amp; Milestones</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
                Craft Pipeline Stages &amp; Actions
              </h1>
              <p className="text-xs sm:text-sm text-[#76695F] mt-1">
                Configure custom hand-loom milestones, progress thresholds, tension calibration steps, and QC inspection gates.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={openAddStageModal}
                className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Craft Stage</span>
              </button>

              <button
                type="button"
                onClick={handleResetStages}
                className="px-3.5 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-2xs">
              <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                Total Pipeline Stages
              </span>
              <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
                {stages.length} Milestones
              </span>
              <span className="text-[10px] text-[#76695F] block mt-0.5">
                Active in handcraft runs
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-2xs">
              <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                Core System Stages
              </span>
              <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block">
                5 Standard Gates
              </span>
              <span className="text-[10px] text-[#76695F] block mt-0.5">
                Loom to Wax-Seal
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-2xs">
              <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                Custom Added Stages
              </span>
              <span className="font-serif text-2xl font-bold text-[#9E5430] mt-1 block">
                {stages.filter(s => s.isCustom).length} Artisan Actions
              </span>
              <span className="text-[10px] text-[#76695F] block mt-0.5">
                Bespoke atelier steps
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 shadow-2xs">
              <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
                Active Work Orders
              </span>
              <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
                {workOrders.length} In-Flight
              </span>
              <span className="text-[10px] text-[#76695F] block mt-0.5">
                Across all loom hubs
              </span>
            </div>
          </div>

          {/* Interactive Stages Management Table */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#372921]">
                  Pipeline Sequence &amp; Operational Actions
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Reorder execution sequence, modify completion percentages, and edit artisan instructions.
                </p>
              </div>
              <span className="text-xs text-[#76695F] font-mono">
                {stages.length} Configured Milestones
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 text-center">Seq / Order</th>
                    <th className="py-3 px-4">Stage Name &amp; Badge</th>
                    <th className="py-3 px-4">Progress %</th>
                    <th className="py-3 px-4">Operational Scope / Instructions</th>
                    <th className="py-3 px-4 text-center">Active Orders</th>
                    <th className="py-3 px-4 text-center">Stage Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {stages.map((st, idx) => {
                    const activeCount = workOrders.filter(w => w.stage === st.id).length;
                    return (
                      <tr key={st.id} className="hover:bg-[#FFFCF7] transition-colors">
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-mono font-bold text-xs text-[#372921] w-5">
                              #{idx + 1}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveStage(idx, 'up')}
                                className="p-1 rounded text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-w-[24px] min-h-[24px] flex items-center justify-center"
                                title="Move Stage Up"
                                aria-label={`Move ${st.label} up`}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === stages.length - 1}
                                onClick={() => handleMoveStage(idx, 'down')}
                                className="p-1 rounded text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-w-[24px] min-h-[24px] flex items-center justify-center"
                                title="Move Stage Down"
                                aria-label={`Move ${st.label} down`}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <strong className="text-[#372921] text-xs block font-bold mb-1">
                            {st.label}
                          </strong>
                          <span
                            className={`inline-block text-[9.5px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${st.color}`}
                          >
                            {st.badgeLabel}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#372921] w-8">
                              {st.percent}%
                            </span>
                            <div className="w-20 bg-[#EAE2D8] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#9E5430] h-full rounded-full transition-all"
                                style={{ width: `${st.percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#76695F] max-w-sm">
                          <p className="line-clamp-2 leading-relaxed">{st.description}</p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {activeCount > 0 ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-[#9E5430]/10 text-[#9E5430] px-2.5 py-0.5 rounded-full">
                              {activeCount} {activeCount === 1 ? 'Batch' : 'Batches'}
                            </span>
                          ) : (
                            <span className="text-[#A99583] text-[11px] font-mono">0</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              st.isCustom
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {st.isCustom ? 'Custom' : 'Core System'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => openEditStageModal(st)}
                              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#76695F] hover:text-[#9E5430] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
                              title="Edit Stage"
                              aria-label={`Edit ${st.label}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStage(st)}
                              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#76695F] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Stage"
                              aria-label={`Delete ${st.label}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD / EDIT PRODUCTION STAGE ACTION
          ========================================================================= */}
      {customStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  <Sliders className="w-3.5 h-3.5" />
                  Atelier Pipeline Configuration
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  {editingStage ? 'Edit Craft Pipeline Stage' : 'Add Custom Stage Action'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomStageModalOpen(false);
                  setEditingStage(null);
                }}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F] hover:text-[#372921]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomStage} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Stage Action Name <span className="text-[#9E5430]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bespoke Monogram Hand-Embroidery"
                  value={customStageName}
                  onChange={e => setCustomStageName(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
                <span className="text-[10px] text-[#76695F] mt-1 block">
                  This action will become selectable across all work orders and QC transitions.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Pipeline Progress %
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={customStagePercent}
                    onChange={e => setCustomStagePercent(Number(e.target.value))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Badge Color Theme
                  </label>
                  <select
                    value={customStageColor}
                    onChange={e => setCustomStageColor(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] truncate"
                  >
                    <option value="bg-indigo-100 text-indigo-800 border-indigo-200">Indigo (Speciality)</option>
                    <option value="bg-amber-100 text-amber-800 border-amber-200">Amber (Artisan Craft)</option>
                    <option value="bg-emerald-100 text-emerald-800 border-emerald-200">Emerald (Inspection / Finishing)</option>
                    <option value="bg-purple-100 text-purple-800 border-purple-200">Purple (Hardware / Framing)</option>
                    <option value="bg-rose-100 text-rose-800 border-rose-200">Rose (Bridal / Custom)</option>
                    <option value="bg-[#9E5430]/10 text-[#9E5430] border-[#9E5430]/30">Terracotta (Wax Seal)</option>
                    <option value="bg-stone-100 text-stone-800 border-stone-200">Stone (Neutral)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Operational Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master artisan threads gold-toned zari couple initials on inside pocket."
                  value={customStageDesc}
                  onChange={e => setCustomStageDesc(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              {/* Current Pipeline Stages Preview */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE2D8] space-y-1.5">
                <span className="text-[10.5px] uppercase font-bold text-[#76695F] block">
                  Current Pipeline Stages ({stages.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {stages.map(s => (
                    <span key={s.id} className="text-[10px] bg-white border border-[#DED3C5] px-2 py-0.5 rounded font-mono text-[#372921]">
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCustomStageModalOpen(false);
                    setEditingStage(null);
                  }}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] hover:bg-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingStage ? 'Save Stage Changes' : 'Add Stage to Pipeline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ISSUE NEW WORK ORDER MODAL
          ========================================================================= */}
      {newOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Bihar Craft House Loom
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Issue Handcraft Work Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewOrderModal(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Heirloom Creation <span className="text-[#9E5430]">*</span>
                </label>
                <select
                  value={prodSku}
                  onChange={e => setProdSku(e.target.value)}
                  className="w-full max-w-full truncate text-ellipsis bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.code} value={p.code} className="truncate">
                      [{p.code}] {p.name.length > 30 ? p.name.slice(0, 30) + '…' : p.name} · ₹{p.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Batch Quantity <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodQty}
                    onChange={e => setProdQty(Number(e.target.value))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Assigned Master Maker
                  </label>
                  <select
                    value={artisanName}
                    onChange={e => setArtisanName(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="Renu Devi">Renu Devi (Master Weaving)</option>
                    <option value="Sunita Kumari">Sunita Kumari (Loom Master &amp; QC)</option>
                    <option value="Rekha Kumari">Rekha Kumari (Frame &amp; Mirror Fitting)</option>
                    <option value="Anita Devi">Anita Devi (AirPod &amp; Miniatures)</option>
                    <option value="Pooja Kumari">Pooja Kumari (Geometric Clutches)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Loom Hub Allocation
                  </label>
                  <input
                    type="text"
                    value={artisanLocation}
                    onChange={e => setArtisanLocation(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={initialStage}
                    onChange={e => setInitialStage(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    {stages.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="normal">Normal Atelier Pace</option>
                    <option value="high">High Demand Reorder</option>
                    <option value="bridal_express">Bridal Express / Bespoke</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setNewOrderModal(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Hammer className="w-4 h-4" />
                  <span>Issue Work Order to Loom</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: 4-POINT MASTER QC INSPECTION MODAL
          ========================================================================= */}
      {qcModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Quality Assurance Certification
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  4-Point Master QC Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQcModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Batch Summary */}
              <div className="p-3.5 bg-white rounded-xl border border-[#DED3C5] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#9E5430] font-bold">
                    {qcModalOrder.id} · {qcModalOrder.sku}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#372921]">{qcModalOrder.productName}</h4>
                  <span className="text-[11px] text-[#76695F]">Master Artisan: {qcModalOrder.artisanName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#76695F] block">Batch Count</span>
                  <span className="font-serif text-base font-bold text-[#372921]">{qcModalOrder.quantity} pcs</span>
                </div>
              </div>

              {/* 4 Inspection Checkpoints */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#DED3C5] cursor-pointer hover:border-[#9E5430]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={qcTension}
                    onChange={e => setQcTension(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4 mt-0.5"
                  />
                  <div>
                    <strong className="text-[#372921] block">1. Bead Tension &amp; 90° Corner Rigidity</strong>
                    <span className="text-[11px] text-[#76695F]">
                      Zero loose slack along horizontal warp; corners maintain crisp 90-degree stance without convex bowing.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#DED3C5] cursor-pointer hover:border-[#9E5430]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={qcKnots}
                    onChange={e => setQcKnots(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4 mt-0.5"
                  />
                  <div>
                    <strong className="text-[#372921] block">2. Internal Knot Concealment</strong>
                    <span className="text-[11px] text-[#76695F]">
                      All steel wire termination loops tucked cleanly into internal bead channels. Zero exposed wire ends.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#DED3C5] cursor-pointer hover:border-[#9E5430]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={qcAlignment}
                    onChange={e => setQcAlignment(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4 mt-0.5"
                  />
                  <div>
                    <strong className="text-[#372921] block">3. Crystal Facet Luster &amp; Cleanness</strong>
                    <span className="text-[11px] text-[#76695F]">
                      High-refraction Czech crystal facets and lustrous pearls free of micro-abrasions, dust, and glue haze.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#DED3C5] cursor-pointer hover:border-[#9E5430]/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={qcLining}
                    onChange={e => setQcLining(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4 mt-0.5"
                  />
                  <div>
                    <strong className="text-[#372921] block">4. Velvet Lining &amp; Brass Hinges</strong>
                    <span className="text-[11px] text-[#76695F]">
                      Internal silk/velvet lining flush with framing. Magnetic clasps and antiqued brass hinges click with positive snap.
                    </span>
                  </div>
                </label>
              </div>

              {/* Inspector Signature */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Inspector Name</label>
                  <input
                    type="text"
                    value={qcInspector}
                    onChange={e => setQcInspector(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Audit Determination</label>
                  <div className="p-2 bg-[#FAF8F5] rounded-xl border border-[#DED3C5] text-xs font-mono font-bold text-emerald-800">
                    {qcTension && qcKnots && qcAlignment && qcLining ? '✓ Certified (All Checks Pass)' : '⚠️ Action Needed'}
                  </div>
                </div>
              </div>

              {/* Audit Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Inspection Notes / Findings
                </label>
                <textarea
                  rows={2}
                  value={qcNotes}
                  onChange={e => setQcNotes(e.target.value)}
                  placeholder="e.g. All 10 pieces inspected under 5000K daylight lamp. Tension balanced, certified for wax sealing."
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setQcModalOrder(null)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] text-xs font-semibold"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={e => handleQcSubmit(e, 'rework')}
                    className="px-4 py-2 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Require Rework
                  </button>
                  <button
                    type="button"
                    onClick={e => handleQcSubmit(e, 'pass')}
                    disabled={!(qcTension && qcKnots && qcAlignment && qcLining)}
                    className="px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Certify QC &amp; Advance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          MODAL 4: ENROLL NEW ARTISAN MODAL (Phase 2D)
          ========================================================================= */}
      {isRecordArtisanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Artisan Collective Registry
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Enroll Master Craftswoman
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordArtisanModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArtisanSubmit} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Member Code *</label>
                  <input
                    type="text"
                    required
                    value={newArtisanCode}
                    onChange={e => setNewArtisanCode(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Craftswoman Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Devi"
                    value={newArtisanName}
                    onChange={e => setNewArtisanName(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Craft Specialization</label>
                  <select
                    value={newArtisanCapacity}
                    onChange={e => setNewArtisanCapacity(e.target.value as ArtisanCapacity)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="Master Loom Weaver">Master Loom Weaver</option>
                    <option value="Wire Framework Sculptor">Wire Framework Sculptor</option>
                    <option value="Czech Glass Stringer">Czech Glass Stringer</option>
                    <option value="Silk Lining Finisher">Silk Lining Finisher</option>
                    <option value="Wax Seal & QC Inspector">Wax Seal &amp; QC Inspector</option>
                    <option value="Loom Apprentice">Loom Apprentice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Membership Status</label>
                  <select
                    value={newArtisanMembership}
                    onChange={e => setNewArtisanMembership(e.target.value as ArtisanMembership)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="Foundational 21 Artisan">Foundational 21 Artisan</option>
                    <option value="Master Craftswoman">Master Craftswoman</option>
                    <option value="Senior Artisan">Senior Artisan</option>
                    <option value="Apprentice Artisan">Apprentice Artisan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Village Craft Hub</label>
                  <select
                    value={newArtisanHub}
                    onChange={e => setNewArtisanHub(e.target.value as any)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  >
                    <option value="Bihar Craft House (Madhubani)">Bihar Craft House (Madhubani)</option>
                    <option value="Bihar Craft House (Darbhanga)">Bihar Craft House (Darbhanga)</option>
                    <option value="Mumbai Finishing Atelier">Mumbai Finishing Atelier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Assigned Loom Bench</label>
                  <input
                    type="text"
                    value={newArtisanLoom}
                    onChange={e => setNewArtisanLoom(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={newArtisanPhone}
                    onChange={e => setNewArtisanPhone(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Monthly Capacity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={newArtisanMonthlyCapacity}
                    onChange={e => setNewArtisanMonthlyCapacity(Number(e.target.value))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar (Spouse)"
                    value={newArtisanEmergName}
                    onChange={e => setNewArtisanEmergName(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={newArtisanEmergPhone}
                    onChange={e => setNewArtisanEmergPhone(e.target.value)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Craft Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newArtisanSkills}
                  onChange={e => setNewArtisanSkills(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsRecordArtisanModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll in Craft Collective</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
