/**
 * KALAJAY HANDCRAFTED LUXURIES — CANONICAL ADDRESS MODEL & VALIDATOR
 * Synchronized across Patron Profile, Checkout, and Firestore persistence.
 */

export interface Address {
  id: string;
  label: string; // 'Home' | 'Studio' | 'Work' | 'Other' | string
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface AddressValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates canonical address data according to Indian courier and postal standards.
 */
export function validateAddress(addr: Partial<Address> | null | undefined): AddressValidationResult {
  const errors: string[] = [];

  if (!addr) {
    return { valid: false, errors: ['Address payload is required.'] };
  }

  const fullName = (addr.fullName || '').trim();
  if (fullName.length < 2) {
    errors.push('Recipient full name must be at least 2 characters.');
  }

  const phoneDigits = (addr.phone || '').replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.push('A valid 10-digit mobile number is required for courier SMS updates.');
  }

  const street = (addr.street || '').trim();
  if (street.length < 3) {
    errors.push('Street address and premise details must be at least 3 characters.');
  }

  const city = (addr.city || '').trim();
  if (city.length < 2) {
    errors.push('City name is required.');
  }

  const state = (addr.state || '').trim();
  if (!state) {
    errors.push('State or Union Territory is required.');
  }

  const pincode = (addr.pincode || '').replace(/\D/g, '').trim();
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    errors.push('A valid 6-digit Indian PIN code is required (e.g. 400050).');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes an arbitrary address object into a canonical Address record,
 * generating a stable ID if absent and sanitizing fields.
 */
export function normalizeAddress(raw: any, existingId?: string): Address {
  const cleanId =
    existingId ||
    raw?.id ||
    `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const cleanPhone = (raw?.phone || '').replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : (raw?.phone || '').trim();

  return {
    id: cleanId,
    label: (raw?.label || 'Home').trim(),
    fullName: (raw?.fullName || '').trim(),
    phone: formattedPhone,
    street: (raw?.street || '').trim(),
    apartment: (raw?.apartment || '').trim() || undefined,
    city: (raw?.city || '').trim(),
    state: (raw?.state || 'Maharashtra').trim(),
    pincode: (raw?.pincode || '').replace(/\D/g, '').slice(0, 6),
    isDefault: Boolean(raw?.isDefault),
  };
}

/**
 * Checks whether two addresses represent the identical physical delivery destination,
 * ignoring capitalization, apartment whitespace, and label differences.
 */
export function areAddressesEqual(a: Partial<Address>, b: Partial<Address>): boolean {
  if (!a || !b) return false;

  const normalizeStreet = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizeCity = (c?: string) => (c || '').trim().toLowerCase();
  const normalizeState = (st?: string) => (st || '').trim().toLowerCase();
  const normalizePincode = (p?: string) => (p || '').replace(/\D/g, '').trim();

  const streetMatch = normalizeStreet(a.street) === normalizeStreet(b.street);
  const aptMatch = normalizeStreet(a.apartment) === normalizeStreet(b.apartment);
  const cityMatch = normalizeCity(a.city) === normalizeCity(b.city);
  const stateMatch = normalizeState(a.state) === normalizeState(b.state);
  const pincodeMatch = normalizePincode(a.pincode) === normalizePincode(b.pincode);

  return streetMatch && aptMatch && cityMatch && stateMatch && pincodeMatch;
}

/**
 * Produces a concise, luxury single-line display format for checkout summaries and badges.
 */
export function formatAddressOneLine(addr: Partial<Address>): string {
  if (!addr) return '';
  const parts = [
    addr.street,
    addr.apartment,
    addr.city,
    addr.state ? `${addr.state} - ${addr.pincode || ''}` : addr.pincode,
  ].filter(Boolean);
  return parts.join(', ');
}
