/**
 * LedgerFlow Authorization Engine
 * Enforces role-based access control (RBAC) and client-level access (ClientUserAccess).
 * Used across API handlers, server actions, and UI permission gates.
 */

export type UserRole =
  | 'Firm Owner'
  | 'Administrator'
  | 'Manager'
  | 'Accountant'
  | 'Bookkeeper'
  | 'Reviewer'
  | 'Client';

export type Action =
  // Workspace & Settings
  | 'workspace:manage'
  | 'workspace:delete'
  | 'settings:edit'
  | 'integrations:manage'
  | 'audit_log:view'
  | 'data:export'
  // Team
  | 'team:invite'
  | 'team:deactivate'
  | 'team:view'
  // Clients
  | 'client:create'
  | 'client:edit'
  | 'client:deactivate'
  | 'client:hard_delete'
  | 'client:view'
  // Tasks
  | 'task:create'
  | 'task:edit'
  | 'task:assign'
  | 'task:submit_review'
  | 'task:approve_review'
  | 'task:mark_completed'
  | 'task:view'
  // Document Requests
  | 'doc_request:create'
  | 'doc_request:send'
  | 'doc_request:review_file'
  | 'doc_request:approve_file'
  | 'doc_request:upload_portal'
  | 'doc_request:view'
  // Messages
  | 'message:create_internal_note'
  | 'message:send_to_client'
  | 'message:reply_as_client'
  | 'message:view'
  // Invoices & Billing
  | 'invoice:create'
  | 'invoice:send'
  | 'invoice:record_payment'
  | 'invoice:void'
  | 'invoice:view'
  // Time Tracking
  | 'time:log'
  | 'time:approve'
  | 'time:convert_to_invoice'
  | 'time:view';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  permittedClientIds?: string[]; // IDs of clients this user has explicit access to (for Accountant/Bookkeeper/Client)
}

export interface ResourceContext {
  workspaceId?: string;
  clientId?: string;
  assignedStaffId?: string;
  reviewerId?: string;
  isInternalOnly?: boolean;
  hasFinancialHistory?: boolean;
}

export interface AuthorizationResult {
  authorized: boolean;
  statusCode: 200 | 403 | 404;
  reason?: string;
}

/**
 * Core server-side authorization check.
 * Strictly guarantees multi-tenant workspace isolation and role boundaries.
 */
export function authorize(
  user: AuthUser,
  action: Action,
  resource?: ResourceContext
): AuthorizationResult {
  // 1. Multi-tenant workspace check: User must belong to the workspace of the resource
  if (resource?.workspaceId && resource.workspaceId !== user.workspaceId) {
    return {
      authorized: false,
      statusCode: 403,
      reason: 'Forbidden: Tenant isolation mismatch.',
    };
  }

  // 2. Client role restrictions (Portal users)
  if (user.role === 'Client') {
    // Clients can never view internal staff notes or comments
    if (resource?.isInternalOnly) {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'Forbidden: Internal staff memos cannot be accessed by clients.',
      };
    }

    // Client can only view/interact with records belonging to their own clientId
    if (resource?.clientId && (!user.permittedClientIds || !user.permittedClientIds.includes(resource.clientId))) {
      return {
        authorized: false,
        statusCode: 404, // 404 to avoid leaking existence of other client records
        reason: 'Not Found: Client record does not exist or access denied.',
      };
    }

    const allowedClientActions: Action[] = [
      'client:view',
      'task:view',
      'doc_request:upload_portal',
      'doc_request:view',
      'message:reply_as_client',
      'message:view',
      'invoice:view',
    ];

    if (allowedClientActions.includes(action)) {
      return { authorized: true, statusCode: 200 };
    }

    return {
      authorized: false,
      statusCode: 403,
      reason: 'Forbidden: Client role has restricted portal-only access.',
    };
  }

  // 3. Firm Owner has full superadmin rights across the workspace
  if (user.role === 'Firm Owner') {
    // Hard delete rule: only if client has no financial/audit history
    if (action === 'client:hard_delete' && resource?.hasFinancialHistory) {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'Retention Policy: Client records with financial history cannot be hard deleted.',
      };
    }
    return { authorized: true, statusCode: 200 };
  }

  // 4. Administrator has full rights except workspace ownership deletion
  if (user.role === 'Administrator') {
    if (action === 'workspace:delete') {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'Forbidden: Only Firm Owner can delete workspace.',
      };
    }
    if (action === 'client:hard_delete') {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'Forbidden: Only Firm Owner can hard-delete clients.',
      };
    }
    return { authorized: true, statusCode: 200 };
  }

  // 5. Manager
  if (user.role === 'Manager') {
    const forbiddenManagerActions: Action[] = [
      'workspace:delete',
      'workspace:manage',
      'client:hard_delete',
      'integrations:manage',
    ];
    if (forbiddenManagerActions.includes(action)) {
      return { authorized: false, statusCode: 403, reason: 'Forbidden for Manager role.' };
    }
    return { authorized: true, statusCode: 200 };
  }

  // 6. Reviewer
  if (user.role === 'Reviewer') {
    const allowedReviewerActions: Action[] = [
      'task:view',
      'task:approve_review',
      'doc_request:view',
      'doc_request:review_file',
      'doc_request:approve_file',
      'message:view',
      'client:view',
      'time:view',
    ];

    // Only allow approving review if reviewer is assigned or reviewerId matches
    if (action === 'task:approve_review') {
      if (resource?.reviewerId && resource.reviewerId !== user.id) {
        return {
          authorized: false,
          statusCode: 403,
          reason: 'Forbidden: Task is assigned to a different reviewer.',
        };
      }
    }

    if (allowedReviewerActions.includes(action)) {
      return { authorized: true, statusCode: 200 };
    }

    return { authorized: false, statusCode: 403, reason: 'Forbidden for Reviewer role.' };
  }

  // 7. Accountant & Bookkeeper
  if (user.role === 'Accountant' || user.role === 'Bookkeeper') {
    // If client restrictions are applied, enforce permittedClientIds
    if (
      resource?.clientId &&
      user.permittedClientIds &&
      user.permittedClientIds.length > 0 &&
      !user.permittedClientIds.includes(resource.clientId)
    ) {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'Forbidden: User is not assigned to this client.',
      };
    }

    const forbiddenStaffActions: Action[] = [
      'workspace:delete',
      'workspace:manage',
      'settings:edit',
      'integrations:manage',
      'audit_log:view',
      'data:export',
      'client:deactivate',
      'client:hard_delete',
      'task:approve_review', // Only Manager, Owner, or designated Reviewer can approve
      'time:approve',
      'time:convert_to_invoice',
      'invoice:void',
    ];

    if (forbiddenStaffActions.includes(action)) {
      return { authorized: false, statusCode: 403, reason: 'Forbidden for staff role.' };
    }

    return { authorized: true, statusCode: 200 };
  }

  return { authorized: false, statusCode: 403, reason: 'Access denied.' };
}
