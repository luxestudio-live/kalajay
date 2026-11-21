'use client';

import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Trash2,
  Upload,
  Layers,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sliders,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ProductAttribute,
  AttributeValue,
  ProductVariant,
  AttributeDisplayType,
} from '@/data/catalogue';
import {
  validateHexColor,
  getContrastingTextColor,
  generateVariantCombinations,
  convertLegacyVariantsToAttributes,
} from '@/lib/variantUtils';

interface ProductVariantManagerProps {
  baseSku: string;
  basePrice: number;
  baseImage: string;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  defaultVariantCode?: string;
  onChangeAttributes: (attributes: ProductAttribute[]) => void;
  onChangeVariants: (variants: ProductVariant[]) => void;
  onChangeDefaultVariant?: (defaultCode: string) => void;
  uploadImageFile: (file: File) => Promise<string | null>;
}

export default function ProductVariantManager({
  baseSku,
  basePrice,
  baseImage,
  attributes,
  variants,
  defaultVariantCode,
  onChangeAttributes,
  onChangeVariants,
  onChangeDefaultVariant,
  uploadImageFile,
}: ProductVariantManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'attributes' | 'combinations'>('attributes');
  const [attributeError, setAttributeError] = useState<string | null>(null);

  // Common luxury attribute presets
  const presets: Array<{ name: string; type: AttributeDisplayType; isDim: boolean; defaultValues: string[] }> = [
    {
      name: 'Colorway',
      type: 'color',
      isDim: true,
      defaultValues: ['24K Gilded Amber', 'Ivory Pearl', 'Emerald Mala'],
    },
    {
      name: 'Size / Silhouette',
      type: 'button',
      isDim: true,
      defaultValues: ['Mini 20cm', 'Classic 26cm', 'Grand 32cm'],
    },
    {
      name: 'Hardware & Finish',
      type: 'button',
      isDim: true,
      defaultValues: ['Antique Brass', 'Champagne Gold', 'Rose Gilt'],
    },
    {
      name: 'Strap Length',
      type: 'dropdown',
      isDim: true,
      defaultValues: ['Standard Drop (52cm)', 'Extended Crossbody (65cm)', 'Clutch Handle Only'],
    },
    {
      name: 'Bespoke Personalization',
      type: 'text',
      isDim: false,
      defaultValues: ['Complimentary Monogram (Up to 3 Initials)'],
    },
  ];

  // Helper to add an attribute
  const handleAddAttribute = (
    name = 'New Attribute',
    displayType: AttributeDisplayType = 'button',
    isVariantDimension = true,
    initialValues: string[] = []
  ) => {
    setAttributeError(null);
    const attrId = `attr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const values: AttributeValue[] =
      initialValues.length > 0
        ? initialValues.map((v, i) => ({
            id: `val-${Date.now().toString(36)}-${i}`,
            label: v,
            value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            hexColor: displayType === 'color' ? '#9E5430' : undefined,
            displayOrder: i,
          }))
        : [
            {
              id: `val-${Date.now().toString(36)}-0`,
              label: 'Standard',
              value: 'standard',
              hexColor: displayType === 'color' ? '#9E5430' : undefined,
              displayOrder: 0,
            },
          ];

    const newAttr: ProductAttribute = {
      id: attrId,
      name,
      displayType,
      isVariantDimension,
      displayOrder: attributes.length,
      values,
    };

    const nextAttrs = [...attributes, newAttr];
    onChangeAttributes(nextAttrs);

    // Auto-generate combinations if this is a variant dimension
    if (isVariantDimension) {
      const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, nextAttrs, variants);
      onChangeVariants(nextCombos);
    }
  };

  // Reorder attribute
  const handleMoveAttribute = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === attributes.length - 1)) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const copy = [...attributes];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    copy.forEach((a, i) => (a.displayOrder = i));
    onChangeAttributes(copy);
    const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, copy, variants);
    onChangeVariants(nextCombos);
  };

  // Update attribute
  const handleUpdateAttribute = (index: number, patch: Partial<ProductAttribute>) => {
    const copy = [...attributes];
    copy[index] = { ...copy[index], ...patch };
    onChangeAttributes(copy);
    // If dimension status changed, regenerate combinations
    if (patch.isVariantDimension !== undefined) {
      const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, copy, variants);
      onChangeVariants(nextCombos);
    }
  };

  // Remove attribute
  const handleRemoveAttribute = (index: number) => {
    const copy = [...attributes];
    copy.splice(index, 1);
    copy.forEach((a, i) => (a.displayOrder = i));
    onChangeAttributes(copy);
    const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, copy, variants);
    onChangeVariants(nextCombos);
  };

  // Add value to attribute
  const handleAddValue = (attrIndex: number) => {
    const copy = [...attributes];
    const attr = copy[attrIndex];
    const valIdx = attr.values.length;
    const newVal: AttributeValue = {
      id: `val-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      label: attr.displayType === 'color' ? 'New Shade' : `Option ${valIdx + 1}`,
      value: `option-${valIdx + 1}`,
      hexColor: attr.displayType === 'color' ? '#D4AF37' : undefined,
      displayOrder: valIdx,
    };
    attr.values.push(newVal);
    onChangeAttributes(copy);

    if (attr.isVariantDimension) {
      const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, copy, variants);
      onChangeVariants(nextCombos);
    }
  };

  // Update value in attribute
  const handleUpdateValue = (attrIndex: number, valIndex: number, patch: Partial<AttributeValue>) => {
    const copy = [...attributes];
    const val = copy[attrIndex].values[valIndex];
    copy[attrIndex].values[valIndex] = { ...val, ...patch };
    onChangeAttributes(copy);

    // Update corresponding label in combinations if label changed
    if (patch.label && copy[attrIndex].isVariantDimension) {
      const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, copy, variants);
      onChangeVariants(nextCombos);
    }
  };

  // Remove value from attribute
  const handleRemoveValue = (attrIndex: number, valIndex: number) => {
    const copy = [...attributes];
    copy[attrIndex].values.splice(valIndex, 1);
    onChangeAttributes(copy);
    if (copy[attrIndex].isVariantDimension) {
      const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, copy, variants);
      onChangeVariants(nextCombos);
    }
  };

  // Manual regenerate combinations trigger
  const handleRebuildCombinations = () => {
    const nextCombos = generateVariantCombinations(baseSku, basePrice, baseImage, attributes, variants);
    onChangeVariants(nextCombos);
  };

  // 1-click migration for legacy flat variants
  const handleMigrateLegacy = () => {
    const { attributes: migratedAttrs, variants: migratedVariants } = convertLegacyVariantsToAttributes(variants);
    onChangeAttributes(migratedAttrs);
    onChangeVariants(migratedVariants);
  };

  // Combination row updates
  const handleUpdateCombination = (idx: number, patch: Partial<ProductVariant>) => {
    const next = [...variants];
    next[idx] = { ...next[idx], ...patch };
    // If setting as default, unset others
    if (patch.isDefault) {
      next.forEach((v, i) => {
        if (i !== idx) v.isDefault = false;
      });
      if (onChangeDefaultVariant && next[idx].code) {
        onChangeDefaultVariant(next[idx].code);
      }
    }
    onChangeVariants(next);
  };

  const handleRemoveCombination = (idx: number) => {
    const next = [...variants];
    next.splice(idx, 1);
    onChangeVariants(next);
  };

  // Detect legacy flat variants (variants present but no attributes configured)
  const isLegacyFlatVariants = attributes.length === 0 && variants.length > 0;

  return (
    <div className="space-y-5 animate-fade-in text-xs">
      {/* Editorial Banner */}
      <div className="p-3.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-xl flex items-start gap-3">
        <Sliders className="w-4 h-4 text-[#9E5430] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#372921] block font-semibold text-xs">
            Dynamic Luxury Attributes &amp; Variant Engine
          </strong>
          <p className="text-[#76695F] leading-relaxed text-[11px]">
            Configure unrestricted attributes (Colorways, Custom Sizes, Dimensions, Hardware Finishes, Strap Options, or Custom Details).
            The matrix will generate sellable combinations with individual SKU codes, custom pricing, inventory stock, and photo previews.
          </p>
        </div>
      </div>

      {/* Legacy Migration Alert if applicable */}
      {isLegacyFlatVariants && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              This piece has <strong>{variants.length} legacy finish variants</strong>. Convert them to dynamic multi-attribute specifications with 1 click.
            </span>
          </div>
          <button
            type="button"
            onClick={handleMigrateLegacy}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            Upgrade to Dynamic Attributes
          </button>
        </div>
      )}

      {/* Sub-Tabs: Attributes vs Combinations */}
      <div className="flex items-center justify-between border-b border-[#EAE2D8] pb-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('attributes')}
            className={`px-3 py-1.5 rounded-t-lg font-bold uppercase tracking-wider text-[10.5px] transition-all cursor-pointer ${
              activeSubTab === 'attributes'
                ? 'bg-white border-t border-x border-[#DED3C5] text-[#9E5430] shadow-2xs'
                : 'text-[#76695F] hover:text-[#372921]'
            }`}
          >
            1. Attributes &amp; Swatches ({attributes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('combinations')}
            className={`px-3 py-1.5 rounded-t-lg font-bold uppercase tracking-wider text-[10.5px] transition-all cursor-pointer ${
              activeSubTab === 'combinations'
                ? 'bg-white border-t border-x border-[#DED3C5] text-[#9E5430] shadow-2xs'
                : 'text-[#76695F] hover:text-[#372921]'
            }`}
          >
            2. Sellable Combinations ({variants.length})
          </button>
        </div>

        {activeSubTab === 'combinations' && (
          <button
            type="button"
            onClick={handleRebuildCombinations}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#9E5430] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
            title="Rebuild matrix while preserving custom prices and SKUs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate Matrix</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          TAB 1: ATTRIBUTES & SWATCHES
          ========================================================================= */}
      {activeSubTab === 'attributes' && (
        <div className="space-y-4">
          {/* Preset Buttons for Quick Add */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#76695F] block">
              Quick-Add Luxury Dimensions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddAttribute(preset.name, preset.type, preset.isDim, preset.defaultValues)}
                  className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F3EFE9] border border-[#DED3C5] rounded-full text-[#372921] text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#9E5430]" />
                  <span>{preset.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAddAttribute('Custom Attribute', 'button', true, ['Standard'])}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF7F2] border border-dashed border-[#9E5430] text-[#9E5430] rounded-full text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Custom Attribute</span>
              </button>
            </div>
          </div>

          {/* Attributes List */}
          {attributes.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-[#DED3C5] rounded-xl bg-white/60 space-y-2">
              <Layers className="w-6 h-6 text-[#9E5430]/60 mx-auto" />
              <p className="text-xs text-[#76695F]">
                No dynamic attributes added yet. This creation is currently sold as a standard single finish.
              </p>
              <button
                type="button"
                onClick={() => handleAddAttribute('Colorway', 'color', true, ['24K Gilded Amber', 'Ivory Pearl'])}
                className="px-4 py-2 bg-[#9E5430] hover:bg-[#854526] text-white rounded-full font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Attribute (e.g. Colorway)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {attributes.map((attr, attrIdx) => (
                <div key={attr.id} className="p-4 bg-white border border-[#DED3C5] rounded-xl shadow-2xs space-y-3.5">
                  {/* Attribute Top Bar: Name, Type, Reorder, Remove */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EAE2D8]">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <span className="font-mono text-[10px] font-bold text-[#9E5430] px-1.5 py-0.5 bg-[#FAF7F2] rounded border border-[#EAE2D8]">
                        DIM #{attrIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={attr.name}
                        onChange={e => handleUpdateAttribute(attrIdx, { name: e.target.value })}
                        placeholder="Attribute Name (e.g. Colorway, Size, Strap)"
                        className="font-bold text-xs text-[#372921] bg-transparent border-b border-transparent hover:border-[#DED3C5] focus:border-[#9E5430] focus:outline-none px-1 py-0.5"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Display Type Selector */}
                      <select
                        value={attr.displayType}
                        onChange={e => handleUpdateAttribute(attrIdx, { displayType: e.target.value as AttributeDisplayType })}
                        className="bg-[#FAF7F2] border border-[#DED3C5] rounded-md px-2 py-1 text-[11px] text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      >
                        <option value="color">Color Swatch (HEX + Texture)</option>
                        <option value="image">Image Swatch</option>
                        <option value="button">Pill Buttons</option>
                        <option value="dropdown">Dropdown Select</option>
                        <option value="text">Informational Text Badge</option>
                      </select>

                      {/* Variant Dimension Toggle */}
                      <label className="flex items-center gap-1.5 text-[11px] text-[#76695F] cursor-pointer bg-[#FCFAF6] px-2 py-1 rounded-md border border-[#EAE2D8]">
                        <input
                          type="checkbox"
                          checked={attr.isVariantDimension}
                          onChange={e => handleUpdateAttribute(attrIdx, { isVariantDimension: e.target.checked })}
                          className="accent-[#9E5430] rounded"
                        />
                        <span>Variant Dimension</span>
                      </label>

                      {/* Reorder Buttons */}
                      <div className="flex items-center border border-[#EAE2D8] rounded-md overflow-hidden bg-[#FAF7F2]">
                        <button
                          type="button"
                          onClick={() => handleMoveAttribute(attrIdx, 'up')}
                          disabled={attrIdx === 0}
                          className="p-1 hover:bg-[#EAE2D8] disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="w-3 h-3 text-[#372921]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAttribute(attrIdx, 'down')}
                          disabled={attrIdx === attributes.length - 1}
                          className="p-1 hover:bg-[#EAE2D8] disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="w-3 h-3 text-[#372921]" />
                        </button>
                      </div>

                      {/* Delete Attribute */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(attrIdx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                        title="Remove attribute"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Attribute Values Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#76695F] block">
                      Options &amp; Swatches ({attr.values.length}):
                    </span>

                    <div className="space-y-2">
                      {attr.values.map((val, valIdx) => (
                        <div
                          key={val.id}
                          className="p-2.5 bg-[#FAF8F5] border border-[#EAE2D8] rounded-lg flex flex-wrap items-center gap-2.5"
                        >
                          {/* Label / Name */}
                          <div className="flex-1 min-w-[150px]">
                            <input
                              type="text"
                              value={val.label}
                              onChange={e => handleUpdateValue(attrIdx, valIdx, { label: e.target.value })}
                              placeholder={attr.displayType === 'color' ? 'Color Name (e.g. Amber Gold)' : 'Option Name (e.g. Mini 22cm)'}
                              className="w-full bg-white border border-[#DED3C5] rounded-md px-2 py-1 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                            />
                          </div>

                          {/* Color Swatch Specific Controls: Color Picker + HEX + Live Swatch */}
                          {attr.displayType === 'color' && (
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Native Color Picker */}
                              <label className="relative cursor-pointer shrink-0" title="Choose HEX Color">
                                <input
                                  type="color"
                                  value={validateHexColor(val.hexColor || '') ? val.hexColor : '#9E5430'}
                                  onChange={e => handleUpdateValue(attrIdx, valIdx, { hexColor: e.target.value.toUpperCase() })}
                                  className="w-7 h-7 rounded-md cursor-pointer border border-[#DED3C5] p-0.5 bg-white"
                                />
                              </label>

                              {/* Manual HEX Input */}
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={val.hexColor || '#9E5430'}
                                  onChange={e => {
                                    const next = e.target.value.trim().toUpperCase();
                                    handleUpdateValue(attrIdx, valIdx, { hexColor: next.startsWith('#') ? next : `#${next}` });
                                  }}
                                  placeholder="#RRGGBB"
                                  maxLength={7}
                                  className={`w-20 font-mono text-[11px] bg-white border rounded-md px-2 py-1 ${
                                    validateHexColor(val.hexColor || '')
                                      ? 'border-[#DED3C5] text-[#372921]'
                                      : 'border-rose-400 text-rose-600'
                                  } focus:outline-none focus:border-[#9E5430]`}
                                />
                              </div>

                              {/* Live Swatch Preview Badge */}
                              <div
                                style={{
                                  backgroundColor: validateHexColor(val.hexColor || '') ? val.hexColor : '#9E5430',
                                  color: getContrastingTextColor(val.hexColor),
                                  backgroundImage: val.swatchImage ? `url(${val.swatchImage})` : undefined,
                                  backgroundSize: 'cover',
                                }}
                                className="w-8 h-7 rounded-md border border-black/10 shadow-2xs flex items-center justify-center font-mono text-[9px] font-bold"
                                title={`Live Preview: ${val.label || 'Swatch'}`}
                              >
                                {val.swatchImage ? <ImageIcon className="w-3.5 h-3.5" /> : '•'}
                              </div>
                            </div>
                          )}

                          {/* Image Swatch or Texture URL */}
                          {(attr.displayType === 'color' || attr.displayType === 'image') && (
                            <div className="flex items-center gap-1.5 min-w-[140px] flex-1">
                              <input
                                type="text"
                                value={val.swatchImage || ''}
                                onChange={e => handleUpdateValue(attrIdx, valIdx, { swatchImage: e.target.value })}
                                placeholder="Texture / Swatch URL"
                                className="w-full bg-white border border-[#DED3C5] rounded-md px-2 py-1 text-[11px] text-[#372921] focus:outline-none focus:border-[#9E5430]"
                              />
                              <label className="cursor-pointer px-2 py-1 bg-white border border-[#DED3C5] hover:border-[#9E5430] text-[#372921] rounded-md text-[11px] font-medium flex items-center gap-1 shrink-0 transition-colors">
                                <Upload className="w-3 h-3 text-[#9E5430]" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await uploadImageFile(file);
                                      if (url) handleUpdateValue(attrIdx, valIdx, { swatchImage: url });
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}

                          {/* Remove Value Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveValue(attrIdx, valIdx)}
                            disabled={attr.values.length <= 1}
                            className="p-1 text-stone-400 hover:text-rose-500 disabled:opacity-20 cursor-pointer transition-colors"
                            title="Remove option"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddValue(attrIdx)}
                      className="px-2.5 py-1 text-[#9E5430] hover:bg-[#FAF7F2] font-semibold text-[11px] rounded inline-flex items-center gap-1 transition-colors cursor-pointer mt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Value to {attr.name}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SELLABLE COMBINATIONS MATRIX
          ========================================================================= */}
      {activeSubTab === 'combinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 border border-[#DED3C5] rounded-xl text-xs">
            <div>
              <span className="font-bold text-[#372921] block">
                {variants.length} Sellable Combination{variants.length === 1 ? '' : 's'} Configured
              </span>
              <span className="text-[#76695F] text-[11px]">
                {variants.filter(v => v.isAvailable !== false).length} Available for online purchase · Base Price: ₹{basePrice.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRebuildCombinations}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EFE9] border border-[#DED3C5] text-[#9E5430] rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update Matrix from Attributes</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-[#DED3C5] rounded-xl bg-white/50 space-y-2">
              <p className="text-xs text-[#76695F]">
                No combinations generated yet. Please add at least one attribute marked as a Variant Dimension in Tab 1.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('attributes')}
                className="px-3.5 py-1.5 bg-[#9E5430] text-white rounded-full font-semibold text-xs cursor-pointer"
              >
                Go to Attributes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={v.id || v.code || idx}
                  className={`p-3.5 bg-white border rounded-xl space-y-3 transition-all ${
                    v.isAvailable !== false ? 'border-[#DED3C5] shadow-2xs' : 'border-stone-200 opacity-60 bg-stone-50/50'
                  }`}
                >
                  {/* Row Top: Active Toggle, Title, Default Badge, Delete */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8]">
                    <div className="flex items-center gap-3">
                      {/* Active Toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-[#372921]">
                        <input
                          type="checkbox"
                          checked={v.isAvailable !== false}
                          onChange={e => handleUpdateCombination(idx, { isAvailable: e.target.checked })}
                          className="accent-[#9E5430] rounded"
                        />
                        <span>{v.isAvailable !== false ? 'Active' : 'Disabled'}</span>
                      </label>

                      {/* Default Radio */}
                      <label className="flex items-center gap-1 text-[11px] text-[#76695F] cursor-pointer">
                        <input
                          type="radio"
                          name="defaultVariant"
                          checked={v.isDefault === true}
                          onChange={() => handleUpdateCombination(idx, { isDefault: true })}
                          className="accent-[#9E5430]"
                        />
                        <span>Default Finish</span>
                      </label>

                      <strong className="text-xs text-[#372921] font-semibold">{v.label}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCombination(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                      title="Remove combination"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Form Grid for Combination Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* SKU */}
                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#372921] mb-1">
                        Variant SKU Code
                      </label>
                      <input
                        type="text"
                        value={v.code}
                        onChange={e => handleUpdateCombination(idx, { code: e.target.value.toUpperCase() })}
                        className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    {/* Price Override */}
                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#372921] mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.price}
                        onChange={e => handleUpdateCombination(idx, { price: Number(e.target.value) })}
                        className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2 py-1 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    {/* MRP / Original Price */}
                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#372921] mb-1">
                        MRP Comparison (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.mrp || ''}
                        onChange={e => handleUpdateCombination(idx, { mrp: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="Optional strike-through"
                        className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2 py-1 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>

                    {/* Stock Qty */}
                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#372921] mb-1">
                        Stock in Loom (Units)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={v.stock ?? 10}
                        onChange={e => {
                          const stock = Number(e.target.value);
                          handleUpdateCombination(idx, { stock, inStock: stock > 0 });
                        }}
                        className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2 py-1 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>
                  </div>

                  {/* Photo & Lead Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center pt-1">
                    <div className="sm:col-span-3">
                      <label className="block text-[10.5px] font-semibold text-[#372921] mb-1">
                        Variant Specific Photo URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={v.image || ''}
                          onChange={e => handleUpdateCombination(idx, { image: e.target.value })}
                          placeholder="https://... or upload photo"
                          className="flex-1 bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2 py-1 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                        />
                        <label className="cursor-pointer px-2.5 py-1 bg-[#FAF7F2] border border-[#DED3C5] hover:border-[#9E5430] text-[#372921] rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition-colors">
                          <Upload className="w-3 h-3 text-[#9E5430]" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImageFile(file);
                                if (url) handleUpdateCombination(idx, { image: url });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-semibold text-[#372921] mb-1">
                        Lead Time (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={v.leadTimeDays ?? 3}
                        onChange={e => handleUpdateCombination(idx, { leadTimeDays: Number(e.target.value) })}
                        className="w-full bg-[#FCFAF6] border border-[#DED3C5] rounded-lg px-2 py-1 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
