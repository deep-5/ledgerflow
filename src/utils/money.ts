/**
 * Precision Integer Money Calculation Engine
 * Operates strictly on integer minor units (e.g. cents, pence, paise).
 * Avoids floating-point rounding errors in invoices and financial reporting.
 */

export interface Money {
  minorUnits: number; // e.g. $100.50 -> 10050
  currency: string;   // ISO 4217: USD, GBP, EUR, CAD, AUD, INR
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
  AUD: 'A$',
  INR: '₹',
};

const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND'];

/**
 * Format integer minor units into display string.
 */
export function formatMinorUnits(minorUnits: number, currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) {
    return `${symbol}${minorUnits.toLocaleString('en-US')}`;
  }

  const isNegative = minorUnits < 0;
  const absUnits = Math.abs(minorUnits);
  const major = Math.floor(absUnits / 100);
  const minor = absUnits % 100;
  const formatted = `${major.toLocaleString('en-US')}.${minor.toString().padStart(2, '0')}`;

  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/**
 * Convert user float/string input into safe integer minor units.
 */
export function parseToMinorUnits(amount: number | string, currency = 'USD'): number {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency)) {
    return Math.round(typeof amount === 'string' ? parseFloat(amount) || 0 : amount);
  }

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) || 0 : amount;
  return Math.round(num * 100);
}

/**
 * Calculate line item total in integer minor units.
 * quantity * unitPriceMinorUnits with basis points discount (1% = 100 bps)
 */
export function calculateLineTotal(
  quantity: number,
  unitPriceMinorUnits: number,
  discountBps = 0
): number {
  const rawSubtotal = Math.round(quantity * unitPriceMinorUnits);
  if (discountBps <= 0) return rawSubtotal;

  const discountAmount = Math.round((rawSubtotal * discountBps) / 10000);
  return Math.max(0, rawSubtotal - discountAmount);
}

/**
 * Compute invoice totals from line items and tax profile.
 */
export function computeInvoiceTotals(
  lines: Array<{
    quantity: number;
    unitPriceMinorUnits: number;
    discountBps?: number;
    taxRateBps?: number;
  }>,
  workspaceTaxRateBps = 0
) {
  let subtotalMinorUnits = 0;
  let taxMinorUnits = 0;

  for (const line of lines) {
    const lineTotal = calculateLineTotal(line.quantity, line.unitPriceMinorUnits, line.discountBps || 0);
    subtotalMinorUnits += lineTotal;

    const effectiveTaxBps = line.taxRateBps !== undefined ? line.taxRateBps : workspaceTaxRateBps;
    if (effectiveTaxBps > 0) {
      taxMinorUnits += Math.round((lineTotal * effectiveTaxBps) / 10000);
    }
  }

  const totalMinorUnits = subtotalMinorUnits + taxMinorUnits;

  return {
    subtotalMinorUnits,
    taxMinorUnits,
    totalMinorUnits,
  };
}
