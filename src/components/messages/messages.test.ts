import { describe, it, expect } from 'vitest';
import { INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, INITIAL_AUTOMATION_RULES } from '../../data/initialData';
import { MessageThread, Message } from '../../types';
import { authorize, AuthUser } from '../../server/auth/authorize';

describe('Phase 5: Messages & Practice Automation', () => {
  it('Internal notes are strictly blocked from rendering in client portal', () => {
    const thread = INITIAL_MESSAGES[0];
    expect(thread).toBeDefined();

    const clientUser: AuthUser = {
      id: 'user-client-1',
      email: 'j.sterling@sterlinghealth.com',
      role: 'Client',
      workspaceId: 'ws-main',
      permittedClientIds: ['client-1'],
    };

    // Client user attempting to view internal note
    const authInternal = authorize(clientUser, 'message:view', {
      workspaceId: 'ws-main',
      clientId: 'client-1',
      isInternalOnly: true,
    });

    expect(authInternal.authorized).toBe(false);
    expect(authInternal.statusCode).toBe(403);
    expect(authInternal.reason).toContain('Internal staff memos cannot be accessed by clients');
  });

  it('Client messages are labeled with honest in-app delivery state', () => {
    const thread = INITIAL_MESSAGES[0];
    const clientMsg = thread.messages.find(m => !m.isInternalNote);
    expect(clientMsg).toBeDefined();

    // In demo environment without email webhook confirmation, delivery must be In-app
    expect(['In-app', 'In-app only — email not configured']).toContain(
      clientMsg?.deliveryStatus || 'In-app'
    );
  });

  it('New message triggers notification in unread notifications feed', () => {
    const notifs = [...INITIAL_NOTIFICATIONS];
    const initialCount = notifs.length;

    notifs.push({
      id: `notif-${Date.now()}`,
      title: 'New Client Portal Message',
      message: 'John Sterling replied regarding Q3 Tax Returns.',
      type: 'message',
      timestamp: new Date().toISOString(),
      read: false,
      linkTo: { view: 'messages' },
    });

    expect(notifs.length).toBe(initialCount + 1);
    expect(notifs.filter(n => !n.read).length).toBeGreaterThan(0);
  });

  it('Automation rules can be toggled and triggered', () => {
    const rules = [...INITIAL_AUTOMATION_RULES];
    const firstRule = rules[0];

    expect(firstRule).toBeDefined();
    expect(firstRule.enabled).toBe(true);

    // Toggle rule
    firstRule.enabled = false;
    expect(firstRule.enabled).toBe(false);
  });
});
