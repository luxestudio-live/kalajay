/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Playwright / TypeScript Automated Test Suite: Dynamic Product Variants System
 */

import {
  generateVariantCombinations,
  validateHexColor,
  getContrastingTextColor,
  findMatchingVariant,
  convertLegacyVariantsToAttributes,
} from '@/lib/variantUtils';
import type { ProductAttribute, ProductVariant } from '@/data/catalogue';

function describe(name: string, fn: () => void) {
  console.log(`\n--- ${name} ---`);
  fn();
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
    },
    toBeDefined() {
      if (actual === undefined || actual === null) throw new Error(`Expected defined, got ${actual}`);
    },
    toContain(substr: string) {
      if (!String(actual).includes(substr)) throw new Error(`Expected "${actual}" to contain "${substr}"`);
    },
  };
}

describe('Dynamic Product Variant System', () => {
  const mockAttributes: ProductAttribute[] = [
    {
      id: 'attr-color',
      name: 'Colorway',
      displayType: 'color',
      isVariantDimension: true,
      displayOrder: 0,
      values: [
        { id: 'v-amber', label: '24K Gilded Amber', value: 'amber', hexColor: '#D4AF37' },
        { id: 'v-pearl', label: 'Ivory Pearl', value: 'pearl', hexColor: '#FFF8E7' },
      ],
    },
    {
      id: 'attr-size',
      name: 'Silhouette Scale',
      displayType: 'button',
      isVariantDimension: true,
      displayOrder: 1,
      values: [
        { id: 'v-mini', label: 'Mini 20cm', value: 'mini' },
        { id: 'v-classic', label: 'Classic 26cm', value: 'classic' },
        { id: 'v-mtm', label: 'Made to Measure', value: 'mtm' },
      ],
    },
    {
      id: 'attr-hardware',
      name: 'Hardware Finish',
      displayType: 'dropdown',
      isVariantDimension: true,
      displayOrder: 2,
      values: [
        { id: 'v-gold', label: 'Polished Gold', value: 'gold' },
        { id: 'v-antique', label: 'Antique Brass', value: 'antique' },
      ],
    },
    {
      id: 'attr-meta',
      name: 'Atelier Note',
      displayType: 'text',
      isVariantDimension: false, // informational only
      displayOrder: 3,
      values: [
        { id: 'v-note', label: 'Handcrafted with Japanese Miyuki crystal seed beads', value: 'note' },
      ],
    },
  ];

  test('1. Validates arbitrary custom attribute names and display types', () => {
    expect(mockAttributes.length).toBe(4);
    expect(mockAttributes[0].name).toBe('Colorway');
    expect(mockAttributes[1].name).toBe('Silhouette Scale');
    expect(mockAttributes[2].name).toBe('Hardware Finish');
    expect(mockAttributes[3].name).toBe('Atelier Note');
    expect(mockAttributes[0].displayType).toBe('color');
    expect(mockAttributes[1].displayType).toBe('button');
    expect(mockAttributes[2].displayType).toBe('dropdown');
    expect(mockAttributes[3].displayType).toBe('text');
  });

  test('2. Validates HEX colors and WCAG luminance text contrast', () => {
    expect(validateHexColor('#D4AF37')).toBe(true);
    expect(validateHexColor('#FFF8E7')).toBe(true);
    expect(validateHexColor('#123')).toBe(true);
    expect(validateHexColor('invalid-hex')).toBe(false);

    // Light background (#FFF8E7) gets dark text (#1C1917)
    expect(getContrastingTextColor('#FFF8E7')).toBe('#1C1917');
    // Dark background (#1A120B) gets light text (#FFFFFF)
    expect(getContrastingTextColor('#1A120B')).toBe('#FFFFFF');
  });

  test('3. Generates Cartesian product combinations without combinatorial explosion', () => {
    // 2 colors × 3 sizes × 2 hardware = 12 combinations
    const combos = generateVariantCombinations(
      'KJ-TEST-EMPRESS',
      45000,
      'https://www.kalajay.in/p1.jpg',
      mockAttributes
    );
    expect(combos.length).toBe(12);

    const first = combos[0];
    expect(first.id).toBeDefined();
    expect(first.isDefault).toBe(true);
    expect(first.price).toBe(45000);
    expect(first.attributes?.['attr-color']).toBe('v-amber');
    expect(first.attributeNames?.['Colorway']).toBe('24K Gilded Amber');
  });

  test('4. Allows combination price overrides and disabled status', () => {
    const combos = generateVariantCombinations(
      'KJ-TEST-EMPRESS',
      45000,
      'https://www.kalajay.in/p1.jpg',
      mockAttributes
    );

    // Override first combination
    combos[0].price = 52000;
    combos[0].mrp = 58000;
    combos[1].isAvailable = false;

    // Regenerate: customizations must be preserved
    const regenerated = generateVariantCombinations(
      'KJ-TEST-EMPRESS',
      45000,
      'https://www.kalajay.in/p1.jpg',
      mockAttributes,
      combos
    );

    expect(regenerated[0].price).toBe(52000);
    expect(regenerated[0].mrp).toBe(58000);
    expect(regenerated[1].isAvailable).toBe(false);
  });

  test('5. Matches customer selected attributes to exact variant combination on PDP', () => {
    const combos = generateVariantCombinations(
      'KJ-TEST-EMPRESS',
      45000,
      'https://www.kalajay.in/p1.jpg',
      mockAttributes
    );
    combos[0].price = 49000;

    const matched = findMatchingVariant(combos, {
      'attr-color': 'v-amber',
      'attr-size': 'v-mini',
      'attr-hardware': 'v-gold',
    });

    expect(matched).toBeDefined();
    expect(matched?.price).toBe(49000);
    expect(matched?.label).toContain('24K Gilded Amber');
    expect(matched?.label).toContain('Mini 20cm');
  });

  test('6. Converts legacy single-dimension variants seamlessly into dynamic attributes', () => {
    const legacyVariants: ProductVariant[] = [
      { code: 'KJ-LEG-1', label: 'Gold Amber', price: 8000, inStock: true, image: 'https://img1.jpg' },
      { code: 'KJ-LEG-2', label: 'Silver Mist', price: 8500, inStock: true, image: 'https://img2.jpg' },
    ];

    const migrated = convertLegacyVariantsToAttributes(legacyVariants);
    expect(migrated.attributes.length).toBe(1);
    expect(migrated.attributes[0].name).toBe('Finish & Colorway');
    expect(migrated.attributes[0].values.length).toBe(2);
    expect(migrated.variants.length).toBe(2);
    expect(migrated.variants[0].code).toBe('KJ-LEG-1');
    expect(migrated.variants[0].attributes).toBeDefined();
  });
});
