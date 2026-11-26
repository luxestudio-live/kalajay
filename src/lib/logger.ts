/**
 * KALAJAY HANDCRAFTED LUXURIES — SECURITY-HARDENED AUDIT LOGGER
 * Sanitizes payloads before logging:
 * - Redacts passwords, API secrets, tokens, OTPs, full card numbers, CVVs
 * - Prevents secret leakage in production log streams and monitoring agents
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apiKey/i,
  /api_key/i,
  /authHeader/i,
  /authorization/i,
  /privateKey/i,
  /private_key/i,
  /credential/i,
  /signature/i,
  /cvv/i,
  /otp/i,
  /pin/i,
  /service_account/i,
];

function sanitizeValue(key: string, val: any): any {
  if (val === null || val === undefined) return val;

  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    if (pattern.test(key)) {
      return '[REDACTED_SECRET]';
    }
  }

  if (typeof val === 'string') {
    // Mask potential card numbers (13-19 digits)
    if (/^\d{13,19}$/.test(val.replace(/\s|-/g, ''))) {
      const clean = val.replace(/\s|-/g, '');
      return `****-****-****-${clean.slice(-4)}`;
    }
    // Mask potential bearer tokens
    if (val.startsWith('Bearer ') || val.startsWith('ey')) {
      return '[REDACTED_TOKEN]';
    }
    // Limit string length to prevent log injection / log bomb
    if (val.length > 2000) {
      return `${val.slice(0, 500)}... [TRUNCATED]`;
    }
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item, idx) => sanitizeValue(String(idx), item));
  }

  if (typeof val === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      cleanObj[k] = sanitizeValue(k, v);
    }
    return cleanObj;
  }

  return val;
}

export const logger = {
  info(message: string, meta?: Record<string, any>) {
    const sanitized = meta ? sanitizeValue('meta', meta) : undefined;
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...(sanitized ? { data: sanitized } : {}),
      })
    );
  },

  warn(message: string, meta?: Record<string, any>) {
    const sanitized = meta ? sanitizeValue('meta', meta) : undefined;
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        ...(sanitized ? { data: sanitized } : {}),
      })
    );
  },

  error(message: string, error?: any, meta?: Record<string, any>) {
    const sanitizedMeta = meta ? sanitizeValue('meta', meta) : undefined;
    const errMessage = error instanceof Error ? error.message : String(error || '');
    const errStack = error instanceof Error ? error.stack?.slice(0, 1000) : undefined;

    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: errMessage,
        ...(errStack ? { stack: errStack } : {}),
        ...(sanitizedMeta ? { data: sanitizedMeta } : {}),
      })
    );
  },
};
