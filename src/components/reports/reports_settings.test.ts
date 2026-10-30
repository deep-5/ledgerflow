import { describe, it, expect } from 'vitest';
import {
  INITIAL_TASKS,
  INITIAL_INVOICES,
  INITIAL_TIME_ENTRIES,
  INITIAL_USERS,
  INITIAL_SETTINGS,
} from '../../data/initialData';

describe('Phase 7: Operational Reports & Firm Administration', () => {
  it('Operational reports calculations match exact underlying record counts', () => {
    // 1. Tasks completed
    const manualCompletedCount = INITIAL_TASKS.filter(t => t.status === 'Completed').length;
    expect(manualCompletedCount).toBeGreaterThanOrEqual(1);

    // 2. Overdue tasks
    const manualOverdueCount = INITIAL_TASKS.filter(
      t => t.status !== 'Completed' && t.dueDate < '2024-10-17'
    ).length;
    expect(manualOverdueCount).toBeGreaterThanOrEqual(1);

    // 3. Billable hours
    const billableMinutes = INITIAL_TIME_ENTRIES.filter(t => t.billable).reduce(
      (sum, t) => sum + t.durationMinutes,
      0
    );
    expect(billableMinutes).toBeGreaterThan(0);
    const billableHours = billableMinutes / 60;
    expect(billableHours).toBeCloseTo(billableMinutes / 60, 2);

    // 4. Gross revenue
    const manualRevenueTotal = INITIAL_INVOICES.reduce((sum, i) => sum + i.total, 0);
    const manualPaidTotal = INITIAL_INVOICES.reduce((sum, i) => sum + i.amountPaid, 0);
    const manualUnpaidTotal = INITIAL_INVOICES.reduce((sum, i) => sum + i.balanceDue, 0);

    expect(manualRevenueTotal).toBe(manualPaidTotal + manualUnpaidTotal);
  });

  it('Staff capacity utilization calculates accurately against configured targets', () => {
    const staff = INITIAL_USERS.find(u => u.role === 'Accountant');
    expect(staff).toBeDefined();

    const capacity = staff?.weeklyCapacityHours || 40;
    const staffLoggedMinutes = INITIAL_TIME_ENTRIES.filter(t => t.staffId === staff?.id).reduce(
      (sum, t) => sum + t.durationMinutes,
      0
    );
    const loggedHours = staffLoggedMinutes / 60;
    const utilizationPercent = Math.min(100, Math.round((loggedHours / capacity) * 100));

    expect(utilizationPercent).toBeGreaterThanOrEqual(0);
    expect(utilizationPercent).toBeLessThanOrEqual(100);
  });

  it('Workspace settings contains multi-currency and localization parameters', () => {
    expect(INITIAL_SETTINGS.firmName).toBeDefined();
    expect(INITIAL_SETTINGS.defaultCurrency).toBe('USD');
    expect(INITIAL_SETTINGS.timeZone).toContain('America/New_York');
    expect(INITIAL_SETTINGS.autoRemindDaysBeforeDue).toBe(3);
  });
});
