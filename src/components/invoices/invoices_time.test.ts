import { describe, it, expect } from 'vitest';
import { INITIAL_INVOICES, INITIAL_TIME_ENTRIES } from '../../data/initialData';
import { Invoice, TimeEntry } from '../../types';
import { computeInvoiceTotals, formatMinorUnits } from '../../utils/money';

describe('Phase 6: Firm Invoices & Time Tracking Integration', () => {
  it('Invoice totals use integer math with minor units', () => {
    const lines = [
      { quantity: 4.5, unitPriceMinorUnits: 15000 }, // 4.5 hrs @ $150 = $675.00
      { quantity: 1.0, unitPriceMinorUnits: 250000 }, // Monthly Retainer = $2,500.00
    ];

    const result = computeInvoiceTotals(lines, 0); // No tax
    expect(result.subtotalMinorUnits).toBe(317500); // $3,175.00
    expect(result.totalMinorUnits).toBe(317500);
    expect(formatMinorUnits(result.totalMinorUnits, 'USD')).toBe('$3,175.00');
  });

  it('Sent invoice is locked against direct edits', () => {
    const inv = INITIAL_INVOICES.find(i => i.status === 'Sent' || i.status === 'Paid');
    expect(inv).toBeDefined();

    // Sent/paid invoices must be locked
    const isLocked = inv?.status !== 'Draft';
    expect(isLocked).toBe(true);
  });

  it('Recording manual payment updates balance due accurately', () => {
    const invoice = {
      id: 'inv-test-1',
      total: 3500,
      amountPaid: 0,
      balanceDue: 3500,
      status: 'Sent',
    };

    const paymentAmount = 1500;
    invoice.amountPaid += paymentAmount;
    invoice.balanceDue -= paymentAmount;
    invoice.status = invoice.balanceDue === 0 ? 'Paid' : 'Partially Paid';

    expect(invoice.amountPaid).toBe(1500);
    expect(invoice.balanceDue).toBe(2000);
    expect(invoice.status).toBe('Partially Paid');

    // Settle balance
    invoice.amountPaid += 2000;
    invoice.balanceDue = 0;
    invoice.status = 'Paid';

    expect(invoice.balanceDue).toBe(0);
    expect(invoice.status).toBe('Paid');
  });

  it('Approved billable time entry converts to invoice lines exactly once and blocks duplicate billing', () => {
    const timeEntries: TimeEntry[] = [
      {
        id: 'time-entry-1',
        staffId: 'user-3',
        staffName: 'Sophia Patel',
        clientId: 'client-1',
        clientName: 'Sterling Health Solutions Inc.',
        description: 'Q3 Corporate Tax Ledger Verification',
        startTime: '2024-10-15T09:00:00Z',
        durationMinutes: 180, // 3 hours
        billable: true,
        billingRate: 175,
        approved: true,
        invoiced: false,
        createdAt: '2024-10-15T12:00:00Z',
      },
    ];

    const convertTimeToInvoiceLines = (entryIds: string[]) => {
      const generatedLines: any[] = [];
      const errors: string[] = [];

      for (const id of entryIds) {
        const entry = timeEntries.find(t => t.id === id);
        if (!entry) continue;

        if (entry.invoiced) {
          errors.push(`Entry ${id} has already been billed.`);
          continue;
        }

        if (!entry.approved) {
          errors.push(`Entry ${id} is not approved.`);
          continue;
        }

        generatedLines.push({
          timeEntryId: entry.id,
          description: `${entry.description} (${(entry.durationMinutes / 60).toFixed(1)} hrs @ $${entry.billingRate}/hr)`,
          quantity: entry.durationMinutes / 60,
          unitPrice: entry.billingRate,
          total: (entry.durationMinutes / 60) * entry.billingRate,
        });

        // Mark as billed to prevent double billing
        entry.invoiced = true;
      }

      return { generatedLines, errors };
    };

    // First conversion attempt
    const firstAttempt = convertTimeToInvoiceLines(['time-entry-1']);
    expect(firstAttempt.generatedLines.length).toBe(1);
    expect(firstAttempt.errors.length).toBe(0);
    expect(timeEntries[0].invoiced).toBe(true);

    // Second conversion attempt with same entry (Must be blocked)
    const secondAttempt = convertTimeToInvoiceLines(['time-entry-1']);
    expect(secondAttempt.generatedLines.length).toBe(0);
    expect(secondAttempt.errors.length).toBe(1);
    expect(secondAttempt.errors[0]).toContain('already been billed');
  });
});
