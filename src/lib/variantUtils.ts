/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Dynamic Product Variant Utility & Combination Engine
 */

import type { ProductAttribute, AttributeValue, ProductVariant } from '@/data/catalogue';

/**
 * Validates a 3 or 6-character hexadecimal color code.
 */
export function validateHexColor(hex: string): boolean {
  if (!hex) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

/**
 * Calculates accessible text color ('#000000' or '#FFFFFF') based on background luminance.
 */
export function getContrastingTextColor(hexColor?: string): string {
  if (!hexColor || !validateHexColor(hexColor)) return '#372921';
  let hex = hexColor.trim().replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Standard relative luminance (WCAG 2.1)
  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];

  return luminance > 0.5 ? '#1C1917' : '#FFFFFF';
}

/**
 * Safely slugifies attribute or value names for SKU codes.
 */
export function slugifyCode(str: string): string {
  return (str || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates combinations from attributes with Cartesian product.
 * Preserves existing variant customizations (price, image, stock, availability, lead time)
 * if a matching combination already existed.
 */
export function generateVariantCombinations(
  baseSku: string,
  basePrice: number,
  baseImage: string,
  attributes: ProductAttribute[],
  existingVariants: ProductVariant[] = []
): ProductVariant[] {
  // Only use attributes marked as variant dimensions and having at least one value
  const dimensionAttrs = (attributes || []).filter(
    attr => attr.isVariantDimension && Array.isArray(attr.values) && attr.values.length > 0
  );

  if (dimensionAttrs.length === 0) {
    return existingVariants;
  }

  // Combinatorial safety guard: alert if product exceeds limit
  const totalPossible = dimensionAttrs.reduce((acc, curr) => acc * curr.values.length, 1);
  if (totalPossible > 150) {
    console.warn(`[Kalajay Variant Engine] Combinatorial guard: ${totalPossible} combinations requested. Clamping to 150.`);
  }

  // Helper map of existing variants indexed by their attribute keys
  // Key format: attrId1:valId1|attrId2:valId2 (sorted)
  const existingMap = new Map<string, ProductVariant>();
  for (const v of existingVariants) {
    if (v.attributes) {
      const sortedKey = Object.entries(v.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([a, val]) => `${a}:${val}`)
        .join('|');
      existingMap.set(sortedKey, v);
    }
    // Also map by variant code as fallback
    if (v.code) {
      existingMap.set(`code:${v.code}`, v);
    }
  }

  // Compute Cartesian product
  let combinations: Array<Array<{ attr: ProductAttribute; val: AttributeValue }>> = [[]];

  for (const attr of dimensionAttrs) {
    const nextCombinations: Array<Array<{ attr: ProductAttribute; val: AttributeValue }>> = [];
    for (const combo of combinations) {
      for (const val of attr.values) {
        nextCombinations.push([...combo, { attr, val }]);
        if (nextCombinations.length >= 150) break;
      }
      if (nextCombinations.length >= 150) break;
    }
    combinations = nextCombinations;
  }

  const generated: ProductVariant[] = [];

  combinations.forEach((combo, idx) => {
    const attrMap: Record<string, string> = {};
    const attrNameMap: Record<string, string> = {};
    const labelParts: string[] = [];
    const codeParts: string[] = [];

    combo.forEach(({ attr, val }) => {
      attrMap[attr.id] = val.id;
      attrNameMap[attr.name] = val.label;
      labelParts.push(val.label);
      codeParts.push(slugifyCode(val.value || val.label));
    });

    const comboKey = Object.entries(attrMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([a, val]) => `${a}:${val}`)
      .join('|');

    const existing = existingMap.get(comboKey);

    const label = labelParts.join(' / ');
    const code = existing?.code || `${baseSku || 'KJ-PROD'}-${codeParts.join('-') || idx + 1}`;
    const id = existing?.id || `var-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    // Try to find image from specific swatch image of first color/image attribute if existing has no image
    const swatchImg = combo.find(c => c.val.swatchImage)?.val.swatchImage;

    generated.push({
      id,
      code,
      label,
      price: existing?.price !== undefined ? Number(existing.price) : Number(basePrice) || 0,
      mrp: existing?.mrp !== undefined ? Number(existing.mrp) : undefined,
      inStock: existing?.inStock !== undefined ? existing.inStock : true,
      stock: existing?.stock !== undefined ? Number(existing.stock) : 10,
      reservedStock: existing?.reservedStock !== undefined ? Number(existing.reservedStock) : 0,
      reorderThreshold: existing?.reorderThreshold !== undefined ? Number(existing.reorderThreshold) : 3,
      leadTimeDays: existing?.leadTimeDays !== undefined ? Number(existing.leadTimeDays) : 3,
      dimensions: existing?.dimensions,
      weightGrams: existing?.weightGrams,
      barcode: existing?.barcode,
      image: existing?.image || swatchImg || baseImage || '',
      isAvailable: existing?.isAvailable !== undefined ? existing.isAvailable : true,
      isDefault: existing?.isDefault !== undefined ? existing.isDefault : idx === 0,
      attributes: attrMap,
      attributeNames: attrNameMap,
    });
  });

  return generated;
}

/**
 * 1-Click Migration / Compatibility Helper:
 * Converts legacy flat variants into a dynamic "Finish / Colorway" attribute.
 */
export function convertLegacyVariantsToAttributes(
  legacyVariants: ProductVariant[]
): { attributes: ProductAttribute[]; variants: ProductVariant[] } {
  if (!Array.isArray(legacyVariants) || legacyVariants.length === 0) {
    return { attributes: [], variants: [] };
  }

  const attrId = 'attr-finish';
  const values: AttributeValue[] = legacyVariants.map((v, idx) => ({
    id: `val-finish-${idx + 1}`,
    label: v.label || `Finish ${idx + 1}`,
    value: slugifyCode(v.label || `finish-${idx + 1}`).toLowerCase(),
    swatchImage: v.image || undefined,
    displayOrder: idx,
  }));

  const finishAttribute: ProductAttribute = {
    id: attrId,
    name: 'Finish & Colorway',
    displayType: 'button',
    isVariantDimension: true,
    displayOrder: 0,
    values,
  };

  const updatedVariants: ProductVariant[] = legacyVariants.map((v, idx) => ({
    ...v,
    id: v.id || `var-legacy-${idx + 1}`,
    isAvailable: v.inStock !== false,
    isDefault: idx === 0,
    attributes: {
      [attrId]: values[idx].id,
    },
    attributeNames: {
      'Finish & Colorway': values[idx].label,
    },
  }));

  return {
    attributes: [finishAttribute],
    variants: updatedVariants,
  };
}

/**
 * Matches customer's chosen attribute values against available product variants.
 */
export function findMatchingVariant(
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>
): ProductVariant | undefined {
  if (!Array.isArray(variants) || variants.length === 0) return undefined;

  // Filter for matching variant
  return variants.find(variant => {
    if (!variant.attributes) return false;
    for (const [attrId, valId] of Object.entries(selectedAttributes)) {
      if (variant.attributes[attrId] !== valId) {
        return false;
      }
    }
    return true;
  });
}
