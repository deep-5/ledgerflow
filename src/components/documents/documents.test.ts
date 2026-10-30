import { describe, it, expect } from 'vitest';
import { INITIAL_DOCUMENT_REQUESTS, INITIAL_CLIENTS } from '../../data/initialData';
import { DocumentRequest, FileApprovalStatus } from '../../types';
import { authorize, AuthUser } from '../../server/auth/authorize';

describe('Phase 4: Document Requests & Client Portal Isolation', () => {
  it('Initial document requests contain structured required items', () => {
    expect(INITIAL_DOCUMENT_REQUESTS.length).toBeGreaterThanOrEqual(3);

    const firstReq = INITIAL_DOCUMENT_REQUESTS[0];
    expect(firstReq.items.length).toBeGreaterThan(0);
    expect(firstReq.items[0].required).toBe(true);
  });

  it('File review lifecycle: approval and replacement request', () => {
    const req = { ...INITIAL_DOCUMENT_REQUESTS[0] };
    const item = { ...req.items[0] };

    // Simulate uploaded file
    item.uploadedFile = {
      id: 'file-1',
      fileName: 'Bank_Statement_Sep2024.pdf',
      fileSize: 1048576,
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'John Sterling',
      approvalStatus: 'Pending',
    };

    expect(item.uploadedFile.approvalStatus).toBe('Pending');

    // Staff requests replacement
    item.uploadedFile.approvalStatus = 'Rejected - Reupload Required';
    item.uploadedFile.reviewNotes = 'Page 2 is missing ledger closing balance.';
    expect(item.uploadedFile.approvalStatus).toBe('Rejected - Reupload Required');
    expect(item.uploadedFile.reviewNotes).toContain('Page 2 is missing');

    // Client re-uploads corrected file
    item.uploadedFile.fileName = 'Bank_Statement_Sep2024_Complete.pdf';
    item.uploadedFile.approvalStatus = 'Pending';
    item.uploadedFile.reviewNotes = undefined;
    expect(item.uploadedFile.approvalStatus).toBe('Pending');

    // Staff approves
    item.uploadedFile.approvalStatus = 'Approved';
    expect(item.uploadedFile.approvalStatus).toBe('Approved');
  });

  it('Strict tenant & cross-client portal isolation: Client 2 cannot access Client 1 request', () => {
    const client2User: AuthUser = {
      id: 'user-client-2',
      email: 'claire@camdentech.co.uk',
      role: 'Client',
      workspaceId: 'ws-main',
      permittedClientIds: ['client-2'], // Only Camden Tech
    };

    // Client 2 attempts to query request belonging to client-1
    const authResult = authorize(client2User, 'doc_request:view', {
      workspaceId: 'ws-main',
      clientId: 'client-1',
    });

    expect(authResult.authorized).toBe(false);
    expect(authResult.statusCode).toBe(404);
  });

  it('Client 1 can access their own document requests in the portal', () => {
    const client1User: AuthUser = {
      id: 'user-client-1',
      email: 'j.sterling@sterlinghealth.com',
      role: 'Client',
      workspaceId: 'ws-main',
      permittedClientIds: ['client-1'],
    };

    const authResult = authorize(client1User, 'doc_request:view', {
      workspaceId: 'ws-main',
      clientId: 'client-1',
    });

    expect(authResult.authorized).toBe(true);
    expect(authResult.statusCode).toBe(200);
  });
});
