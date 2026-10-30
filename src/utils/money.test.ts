import { describe, it, expect } from 'vitest';
import {
  formatMinorUnits,
  parseToMinorUnits,
  calculateLineTotal,
  computeInvoiceTotals,
} from './money';

describe('Integer Money & Minor Unit Calculations', () => {
  it('formats minor units accurately without floating-point artifacts', () => {
    expect(formatMinorUnits(150000, 'USD')).toBe('$1,500.00');
    expect(formatMinorUnits(34999, 'GBP')).toBe('£349.99');
    expect(formatMinorUnits(50, 'EUR')).toBe('€0.50');
    expect(formatMinorUnits(0, 'USD')).toBe('$0.00');
  });

  it('parses user currency inputs safely into integer minor units', () => {
    expect(parseToMinorUnits(1200.5, 'USD')).toBe(120050);
    expect(parseToMinorUnits('$4,500.75', 'USD')).toBe(450075);
    expect(parseToMinorUnits('£99.99', 'GBP')).toBe(9999);
  });

  it('computes line totals with basis points discounts correctly', () => {
    // 5 hours @ $150.00 = $750.00 (75000 minor units), 10% discount (1000 bps) = $675.00 (67500 minor units)
    const lineTotal = calculateLineTotal(5, 15000, 1000);
    expect(lineTotal).toBe(67500);
  });

  it('computes full invoice totals including 20% VAT (2000 bps) cleanly', () => {
    const lines = [
      { quantity: 1, unitPriceMinorUnits: 250000 }, // $2,500.00
      { quantity: 2, unitPriceMinorUnits: 50000 },  // $1,000.00
    ];

    const result = computeInvoiceTotals(lines, 2000); // 20% VAT
    expect(result.subtotalMinorUnits).toBe(350000); // $3,500.00
    expect(result.taxMinorUnits).toBe(70000);       // $700.00 (20% of 3500)
    expect(result.totalMinorUnits).toBe(420000);     // $4,200.00
  });
});
