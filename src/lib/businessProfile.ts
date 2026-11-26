/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Central Authoritative Business Profile & Statutory Registration Hub
 *
 * Source of truth for:
 * - Legal entity and brand credentials
 * - Statutory GSTIN (27FAAPS2113B1Z8) and PAN registration
 * - Official studio and atelier coordinates
 * - Contact and concierge communications
 * - Format validation & compliance enforcement
 *
 * Under no circumstances should individual components or templates hardcode
 * independent GSTIN or tax identifiers.
 */

export interface KalajayBusinessProfile {
  legalEntityName: string;
  brandName: string;
  tradeName: string;
  gstin: string;
  pan: string;
  stateCode: string;
  stateName: string;
  registeredAddress: string;
  mumbaiStudioAddress: string;
  atelierHubAddress: string;
  contactEmail: string;
  altEmail: string;
  supportPhone: string;
  displayPhone: string;
  whatsappUrl: string;
  instagram: string;
  instagramUrl: string;
  website: string;
  approvalStatus: 'PENDING_CLIENT_ACCOUNTANT_APPROVAL' | 'VERIFIED';
  tax: {
    gstRate: number;
    taxLabel: string;
    hsnCode: string;
    description: string;
  };
}

export const KALAJAY_BUSINESS_PROFILE: KalajayBusinessProfile = {
  // CONFIRMED STATUTORY DETAILS:
  // GSTIN is confirmed statutory identifier: 27FAAPS2113B1Z8
  // PAN is structurally extracted: FAAPS2113B
  // State code: 27 (Maharashtra)
  // All other legal entity and registration credentials are held pending formal client/CA signoff.
  legalEntityName: 'Kalajay Creations LLP',
  brandName: 'Kalajay',
  tradeName: 'Kalajay Handcrafted Luxuries',
  gstin: '27FAAPS2113B1Z8',
  pan: 'FAAPS2113B',
  stateCode: '27',
  stateName: 'Maharashtra',
  registeredAddress: 'Worli Sea Face, Worli, Mumbai, Maharashtra 400018, India',
  mumbaiStudioAddress: 'Sea Face Studios, Worli, Mumbai, Maharashtra 400018, India',
  atelierHubAddress: 'Craft House Atelier, Loom Cluster 4, Madhubani, Bihar 847211, India',
  contactEmail: 'support@kalajay.in',
  altEmail: 'concierge@kalajay.in',
  supportPhone: '+91 97405 40847',
  displayPhone: '+91 97405 40847',
  whatsappUrl: 'https://wa.me/919740540847?text=Hi%20Kalajay!%20I%27d%20like%20to%20know%20more%20about%20your%20handcrafted%20pieces.',
  instagram: '@kalajay.handcrafted',
  instagramUrl: 'https://www.instagram.com/kalajay.handcrafted/',
  website: 'https://kalajay-luxe.theluxestudio.in',
  approvalStatus: 'PENDING_CLIENT_ACCOUNTANT_APPROVAL',
  tax: {
    gstRate: 0.03,
    taxLabel: 'GST (3%)',
    hsnCode: '71179090',
    description: 'GST on handcrafted luxury imitation jewelry and artisan beadwork under HSN 7117',
  },
};

/**
 * Standard Indian Goods and Services Tax Identification Number (GSTIN) Regex:
 * - 2 digits: State Code (e.g., 27 for Maharashtra)
 * - 5 alphabets: PAN entity code letters
 * - 4 digits: PAN serial number
 * - 1 alphabet: PAN checksum letter
 * - 1 digit/alphabet: Entity count of PAN holder in the state (usually 1)
 * - 1 character: 'Z' by default
 * - 1 digit/alphabet: Check digit
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{3}[CPHFATBLJG][A-Z]{1}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Strict validator for Indian GSTIN format
 * Rejects placeholder/dummy masks (e.g. XXXXX) and enforces official statutory structure.
 */
export function validateGstin(gstin: string): boolean {
  if (!gstin || typeof gstin !== 'string') return false;
  const clean = gstin.trim().toUpperCase();
  if (clean.includes('XXXXX') || clean.includes('00000')) return false;
  return GSTIN_REGEX.test(clean);
}

/**
 * Returns the immutable authoritative business profile
 */
export function getAuthoritativeBusinessProfile(): KalajayBusinessProfile {
  return KALAJAY_BUSINESS_PROFILE;
}
