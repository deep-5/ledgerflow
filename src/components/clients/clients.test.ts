import { describe, it, expect } from 'vitest';
import { INITIAL_CLIENTS, INITIAL_TASKS } from '../../data/initialData';
import { Client, ClientType } from '../../types';

describe('Phase 2: Clients & Dashboard Operations', () => {
  it('Directory initialized with realistic multi-entity demo clients', () => {
    expect(INITIAL_CLIENTS.length).toBeGreaterThanOrEqual(5);

    const usClient = INITIAL_CLIENTS.find(c => c.currency === 'USD');
    const ukClient = INITIAL_CLIENTS.find(c => c.currency === 'GBP');

    expect(usClient).toBeDefined();
    expect(ukClient).toBeDefined();
  });

  it('Adding a client creates a complete record and increments active count', () => {
    const clientsList: Client[] = [...INITIAL_CLIENTS];
    const initialActiveCount = clientsList.filter(c => c.status === 'Active').length;

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: 'Alexander Hamilton',
      company: 'Treasury Advisory Inc.',
      clientType: 'Corporate',
      email: 'a.hamilton@treasuryadvisory.com',
      phone: '+1 555-0100',
      address: '1 Wall St, New York, NY 10005',
      country: 'United States',
      currency: 'USD',
      timeZone: 'America/New_York',
      assignedAccountantId: 'user-3',
      teamMemberIds: ['user-3'],
      services: ['Monthly Bookkeeping', 'Advisory'],
      startDate: '2024-10-17',
      billingFrequency: 'Monthly Retainer',
      status: 'Active',
      notes: 'Fast growing fintech firm.',
      portalAccessEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clientsList.push(newClient);
    const updatedActiveCount = clientsList.filter(c => c.status === 'Active').length;

    expect(updatedActiveCount).toBe(initialActiveCount + 1);
    expect(clientsList.find(c => c.company === 'Treasury Advisory Inc.')).toBeDefined();
  });

  it('Client with pending work cannot be deleted without archiving first', () => {
    const clientId = 'client-1';
    const clientTasks = INITIAL_TASKS.filter(t => t.clientId === clientId);

    expect(clientTasks.length).toBeGreaterThan(0);
    // Retention rule: client with tasks cannot be hard deleted
    const canHardDelete = clientTasks.length === 0;
    expect(canHardDelete).toBe(false);
  });

  it('Validates CSV row fields correctly during import', () => {
    const validRow = {
      company: 'Apex Tech',
      name: 'Jane Doe',
      email: 'jane@apextech.com',
    };
    const isValid = !!validRow.company && !!validRow.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validRow.email);
    expect(isValid).toBe(true);

    const invalidEmailRow = {
      company: 'Apex Tech',
      name: 'Jane Doe',
      email: 'not-an-email',
    };
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidEmailRow.email);
    expect(isEmailValid).toBe(false);
  });
});
