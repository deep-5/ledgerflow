import { describe, it, expect } from 'vitest';
import { authorize, AuthUser } from './authorize';

describe('LedgerFlow Authorization Engine', () => {
  const firmOwner: AuthUser = {
    id: 'user-owner',
    email: 'sarah.jenkins@apexadvisory.com',
    role: 'Firm Owner',
    workspaceId: 'ws-main',
  };

  const accountant: AuthUser = {
    id: 'user-accountant',
    email: 'alex.rivera@apexadvisory.com',
    role: 'Accountant',
    workspaceId: 'ws-main',
    permittedClientIds: ['client-1', 'client-2'],
  };

  const reviewer: AuthUser = {
    id: 'user-reviewer',
    email: 'marcus.vance@apexadvisory.com',
    role: 'Reviewer',
    workspaceId: 'ws-main',
  };

  const clientUser: AuthUser = {
    id: 'user-client-1',
    email: 'john@sterlingholdings.com',
    role: 'Client',
    workspaceId: 'ws-main',
    permittedClientIds: ['client-1'],
  };

  it('Firm Owner can perform administrative actions', () => {
    const res = authorize(firmOwner, 'workspace:manage');
    expect(res.authorized).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('Prevents cross-tenant access when workspaceId does not match', () => {
    const res = authorize(firmOwner, 'client:view', { workspaceId: 'ws-different-firm' });
    expect(res.authorized).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.reason).toContain('Tenant isolation mismatch');
  });

  it('Prevents client role from viewing internal staff notes', () => {
    const res = authorize(clientUser, 'message:view', {
      workspaceId: 'ws-main',
      clientId: 'client-1',
      isInternalOnly: true,
    });
    expect(res.authorized).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.reason).toContain('Internal staff memos cannot be accessed by clients');
  });

  it('Prevents client from accessing another client records (returns 404 to avoid ID probing)', () => {
    const res = authorize(clientUser, 'doc_request:view', {
      workspaceId: 'ws-main',
      clientId: 'client-2', // Client 1 trying to view Client 2
    });
    expect(res.authorized).toBe(false);
    expect(res.statusCode).toBe(404);
  });

  it('Allows client to view their own documents and tasks in the portal', () => {
    const res = authorize(clientUser, 'doc_request:view', {
      workspaceId: 'ws-main',
      clientId: 'client-1',
    });
    expect(res.authorized).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('Reviewer can approve review only if assigned or designated reviewer', () => {
    const assignedReview = authorize(reviewer, 'task:approve_review', {
      workspaceId: 'ws-main',
      reviewerId: 'user-reviewer',
    });
    expect(assignedReview.authorized).toBe(true);

    const unassignedReview = authorize(reviewer, 'task:approve_review', {
      workspaceId: 'ws-main',
      reviewerId: 'different-reviewer-id',
    });
    expect(unassignedReview.authorized).toBe(false);
    expect(unassignedReview.statusCode).toBe(403);
  });

  it('Hard delete blocked on clients with financial or audit history', () => {
    const res = authorize(firmOwner, 'client:hard_delete', {
      workspaceId: 'ws-main',
      clientId: 'client-1',
      hasFinancialHistory: true,
    });
    expect(res.authorized).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.reason).toContain('Retention Policy');
  });
});
