import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Client,
  Task,
  DocumentRequest,
  Invoice,
  MessageThread,
  TimeEntry,
  CalendarEvent,
  NotificationItem,
  AuditLogItem,
  AutomationRule,
  WorkspaceSettings,
  TaskStatus,
  TaskPriority,
  InvoicePayment,
  FileApprovalStatus,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_TASKS,
  INITIAL_DOCUMENT_REQUESTS,
  INITIAL_INVOICES,
  INITIAL_MESSAGES,
  INITIAL_TIME_ENTRIES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_AUTOMATION_RULES,
} from '../data/initialData';

export type ActiveView = 
  | 'dashboard' 
  | 'clients' 
  | 'tasks' 
  | 'calendar' 
  | 'documents' 
  | 'portal' 
  | 'messages' 
  | 'invoices' 
  | 'time' 
  | 'team' 
  | 'reports' 
  | 'notifications' 
  | 'settings';

interface ActiveTimerState {
  id: string;
  taskId?: string;
  clientId: string;
  description: string;
  startTime: number; // Date.now()
  elapsedSeconds: number;
  isRunning: boolean;
}

interface AppContextType {
  // Navigation & UI
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  
  // Current User & Workspace & Auth
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  workspaceSettings: WorkspaceSettings;
  updateWorkspaceSettings: (settings: Partial<WorkspaceSettings>) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addTaskComment: (taskId: string, content: string, isInternal: boolean) => void;
  deleteTask: (id: string) => void;

  // Document Requests
  documentRequests: DocumentRequest[];
  addDocumentRequest: (req: Omit<DocumentRequest, 'id' | 'createdAt' | 'updatedAt'>) => DocumentRequest;
  updateDocumentRequest: (id: string, updates: Partial<DocumentRequest>) => void;
  uploadDocumentFile: (requestId: string, itemId: string, file: { name: string; size: number; type: string }) => void;
  reviewDocumentFile: (requestId: string, itemId: string, status: FileApprovalStatus, notes?: string) => void;

  // Invoices & Payments
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'payments' | 'amountPaid' | 'balanceDue'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  recordPayment: (invoiceId: string, payment: Omit<InvoicePayment, 'id' | 'invoiceId' | 'recordedByStaffId'>) => void;

  // Messages
  messages: MessageThread[];
  sendMessage: (threadId: string, content: string, isInternal?: boolean) => void;
  createThread: (clientId: string, subject: string, initialMessage: string, isInternal?: boolean) => MessageThread;
  toggleStarMessage: (threadId: string) => void;
  markThreadRead: (threadId: string) => void;

  // Time Tracking
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimerState | null;
  startTimer: (clientId: string, taskId?: string, description?: string) => void;
  stopTimer: () => void;
  addManualTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'staffId' | 'staffName'>) => void;
  approveTimeEntry: (id: string) => void;
  deleteTimeEntry: (id: string) => void;

  // Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Audit Logs & Automation Rules
  auditLogs: AuditLogItem[];
  automationRules: AutomationRule[];
  toggleAutomationRule: (id: string) => void;

  // Helpers
  addAuditLog: (action: string, category: AuditLogItem['category'], details: string) => void;
  resetDemoData: () => void;
  quickCreateOpen: boolean;
  setQuickCreateOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_VIEW: 'ledgerflow_view',
  SIDEBAR: 'ledgerflow_sidebar_collapsed',
  USER_ID: 'ledgerflow_user_id',
  CLIENTS: 'ledgerflow_clients',
  TASKS: 'ledgerflow_tasks',
  REQUESTS: 'ledgerflow_requests',
  INVOICES: 'ledgerflow_invoices',
  MESSAGES: 'ledgerflow_messages',
  TIME: 'ledgerflow_time',
  EVENTS: 'ledgerflow_events',
  NOTIFS: 'ledgerflow_notifs',
  AUDIT: 'ledgerflow_audit',
  RULES: 'ledgerflow_rules',
  SETTINGS: 'ledgerflow_settings',
  TIMER: 'ledgerflow_active_timer',
  AUTH: 'ledgerflow_authenticated',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or defaults
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) !== 'false';
  });

  const [currentView, setCurrentView] = useState<ActiveView>(() => {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW) as ActiveView) || 'dashboard';
  });

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [quickCreateOpen, setQuickCreateOpen] = useState<boolean>(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR) === 'true';
  });

  const [allUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    return INITIAL_USERS.find(u => u.id === savedId) || INITIAL_USERS[0];
  });

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
    if (user.role === 'Client') {
      setCurrentView('portal');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
  };

  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENT_REQUESTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [messages, setMessages] = useState<MessageThread[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIME);
    return saved ? JSON.parse(saved) : INITIAL_TIME_ENTRIES;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RULES);
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATION_RULES;
  });

  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMER);
    return saved ? JSON.parse(saved) : null;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, currentUser.id);
    // If switched to client role and not in portal, route to portal!
    if (currentUser.role === 'Client' && currentView !== 'portal') {
      setCurrentView('portal');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(workspaceSettings));
  }, [workspaceSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(documentRequests));
  }, [documentRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME, JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(automationRules));
  }, [automationRules]);

  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.TIMER);
    }
  }, [activeTimer]);

  // Live timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          return {
            ...prev,
            elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000),
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, activeTimer?.startTime]);

  // Helper to add audit log
  const addAuditLog = (action: string, category: AuditLogItem['category'], details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action,
      category,
      performedBy: `${currentUser.name} (${currentUser.role})`,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Workspace session)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Workspace Settings
  const updateWorkspaceSettings = (newSettings: Partial<WorkspaceSettings>) => {
    setWorkspaceSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('Updated Workspace Settings', 'Security', 'Modified firm profile, localization or tax configuration.');
  };

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    addAuditLog('Created Client', 'Client', `Added new client "${newClient.company}" (${newClient.name}).`);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    addAuditLog('Updated Client', 'Client', `Updated client details for ID ${id}.`);
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    addAuditLog('Deactivated Client', 'Client', `Removed / deactivated client "${target?.company || id}".`);
  };

  // Task operations
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setTasks(prev => [newTask, ...prev]);
    
    // Add to calendar event automatically
    if (newTask.dueDate) {
      const client = clients.find(c => c.id === newTask.clientId);
      setCalendarEvents(prev => [
        {
          id: `cal-t-${newTask.id}`,
          title: newTask.title,
          type: 'Task Deadline',
          date: newTask.dueDate,
          clientId: newTask.clientId,
          clientName: client?.company || client?.name,
          assignedStaffId: newTask.assignedStaffId,
          relatedId: newTask.id,
          status: newTask.status,
        },
        ...prev,
      ]);
    }

    addAuditLog('Created Task', 'Task', `Added task "${newTask.title}" for client ID ${newTask.clientId}.`);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'Completed' && !t.completedAt) {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return t;
      })
    );
    addAuditLog('Updated Task', 'Task', `Modified task fields for ID ${id}.`);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, status };
          if (status === 'Completed') {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return t;
      })
    );
    addAuditLog('Task Status Changed', 'Task', `Moved task ID ${id} to "${status}".`);
  };

  const addTaskComment = (taskId: string, content: string, isInternal: boolean) => {
    const newComment = {
      id: `tc-${Date.now()}`,
      taskId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
      isInternalOnly: isInternal,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t))
    );
    addAuditLog('Added Task Comment', 'Task', `Added ${isInternal ? 'internal' : 'client-visible'} comment to task.`);
  };

  const deleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    addAuditLog('Deleted Task', 'Task', `Deleted task "${target?.title || id}".`);
  };

  // Document Request operations
  const addDocumentRequest = (reqData: Omit<DocumentRequest, 'id' | 'createdAt' | 'updatedAt'>): DocumentRequest => {
    const newReq: DocumentRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocumentRequests(prev => [newReq, ...prev]);

    // Add notification
    const client = clients.find(c => c.id === newReq.clientId);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Document Request Sent',
        message: `Requested ${newReq.items.length} files from ${client?.company || 'client'}.`,
        type: 'document',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { view: 'documents', id: newReq.id },
      },
      ...prev,
    ]);

    addAuditLog('Created Document Request', 'Document', `Sent document request "${newReq.title}" to client ID ${newReq.clientId}.`);
    return newReq;
  };

  const updateDocumentRequest = (id: string, updates: Partial<DocumentRequest>) => {
    setDocumentRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  };

  const uploadDocumentFile = (requestId: string, itemId: string, file: { name: string; size: number; type: string }) => {
    setDocumentRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          const updatedItems = req.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                uploadedFile: {
                  id: `up-${Date.now()}`,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type || 'application/pdf',
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: currentUser.name,
                  approvalStatus: 'Pending' as FileApprovalStatus,
                },
              };
            }
            return item;
          });

          // Check if all items uploaded
          const allUploaded = updatedItems.every(i => !!i.uploadedFile);
          const anyUploaded = updatedItems.some(i => !!i.uploadedFile);
          const newStatus = allUploaded ? 'Submitted' : anyUploaded ? 'Partially Received' : req.status;

          return {
            ...req,
            items: updatedItems,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );

    addAuditLog('Uploaded Document File', 'Document', `Uploaded file "${file.name}" for request item ${itemId}.`);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Client File Received',
        message: `${currentUser.name} uploaded "${file.name}".`,
        type: 'document',
        timestamp: new Date().toISOString(),
        read: false,
        linkTo: { view: 'documents', id: requestId },
      },
      ...prev,
    ]);
  };

  const reviewDocumentFile = (requestId: string, itemId: string, status: FileApprovalStatus, notes?: string) => {
    setDocumentRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          const updatedItems = req.items.map(item => {
            if (item.id === itemId && item.uploadedFile) {
              return {
                ...item,
                uploadedFile: {
                  ...item.uploadedFile,
                  approvalStatus: status,
                  reviewNotes: notes || item.uploadedFile.reviewNotes,
                },
              };
            }
            return item;
          });

          const hasRejection = updatedItems.some(i => i.uploadedFile?.approvalStatus === 'Rejected - Reupload Required');
          const allApproved = updatedItems.every(i => i.uploadedFile?.approvalStatus === 'Approved');

          let newStatus = req.status;
          if (hasRejection) newStatus = 'Changes Requested';
          else if (allApproved) newStatus = 'Completed';
          else newStatus = 'In Review';

          return {
            ...req,
            items: updatedItems,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );

    addAuditLog('Reviewed Document Item', 'Document', `Marked file in request ID ${requestId} as "${status}". Note: ${notes || 'none'}.`);
  };

  // Invoices & Payments
  const addInvoice = (invData: Omit<Invoice, 'id' | 'createdAt' | 'payments' | 'amountPaid' | 'balanceDue'>): Invoice => {
    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      amountPaid: 0,
      balanceDue: invData.total,
      payments: [],
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Add to calendar
    setCalendarEvents(prev => [
      {
        id: `cal-inv-${newInvoice.id}`,
        title: `Invoice ${newInvoice.invoiceNumber} Due`,
        type: 'Invoice Due',
        date: newInvoice.dueDate,
        clientId: newInvoice.clientId,
        clientName: newInvoice.clientCompany,
        relatedId: newInvoice.id,
        status: newInvoice.status,
      },
      ...prev,
    ]);

    addAuditLog('Created Invoice', 'Invoice', `Drafted invoice ${newInvoice.invoiceNumber} for ${newInvoice.clientCompany} (${newInvoice.currency} ${newInvoice.total}).`);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, ...updates } : inv)));
    addAuditLog('Updated Invoice', 'Invoice', `Updated invoice ID ${id}.`);
  };

  const recordPayment = (
    invoiceId: string,
    paymentData: Omit<InvoicePayment, 'id' | 'invoiceId' | 'recordedByStaffId'>
  ) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newPayment: InvoicePayment = {
            ...paymentData,
            id: `pay-${Date.now()}`,
            invoiceId,
            recordedByStaffId: currentUser.id,
          };
          const totalPaid = inv.amountPaid + paymentData.amount;
          const balance = Math.max(0, inv.total - totalPaid);
          const newStatus = balance === 0 ? 'Paid' : 'Partially Paid';

          return {
            ...inv,
            amountPaid: totalPaid,
            balanceDue: balance,
            status: newStatus,
            payments: [...inv.payments, newPayment],
          };
        }
        return inv;
      })
    );

    addAuditLog('Recorded Payment', 'Invoice', `Recorded payment of ${paymentData.amount} for invoice ${invoiceId} via ${paymentData.paymentMethod}.`);
  };

  // Messages
  const sendMessage = (threadId: string, content: string, isInternal: boolean = false) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId: 'client-or-staff',
      content,
      isInternalNote: isInternal,
      sentAt: new Date().toISOString(),
    };

    setMessages(prev =>
      prev.map(th => {
        if (th.id === threadId) {
          return {
            ...th,
            lastMessageSnippet: content.slice(0, 80),
            lastUpdated: new Date().toISOString(),
            messages: [...th.messages, newMsg],
          };
        }
        return th;
      })
    );

    addAuditLog('Sent Message', 'Client', `Sent message in thread ${threadId} (internal: ${isInternal}).`);
  };

  const createThread = (clientId: string, subject: string, initialMessage: string, isInternal: boolean = false): MessageThread => {
    const client = clients.find(c => c.id === clientId);
    const newThreadId = `thread-${Date.now()}`;
    const newMsg = {
      id: `msg-${Date.now()}`,
      threadId: newThreadId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId: client?.email || 'client',
      content: initialMessage,
      isInternalNote: isInternal,
      sentAt: new Date().toISOString(),
    };

    const newThread: MessageThread = {
      id: newThreadId,
      clientId,
      clientName: client ? `${client.company} (${client.name})` : 'Client',
      subject,
      folder: 'inbox',
      assignedStaffId: currentUser.id,
      lastMessageSnippet: initialMessage.slice(0, 80),
      lastUpdated: new Date().toISOString(),
      unreadCount: 0,
      isStarred: false,
      messages: [newMsg],
    };

    setMessages(prev => [newThread, ...prev]);
    addAuditLog('Created Message Thread', 'Client', `Started conversation "${subject}" with client ID ${clientId}.`);
    return newThread;
  };

  const toggleStarMessage = (threadId: string) => {
    setMessages(prev =>
      prev.map(th => (th.id === threadId ? { ...th, isStarred: !th.isStarred } : th))
    );
  };

  const markThreadRead = (threadId: string) => {
    setMessages(prev =>
      prev.map(th => (th.id === threadId ? { ...th, unreadCount: 0 } : th))
    );
  };

  // Time Tracking
  const startTimer = (clientId: string, taskId?: string, description?: string) => {
    // If there is an existing timer, stop and log it first to prevent duplicate running timers!
    if (activeTimer) {
      stopTimer();
    }

    const newTimerState: ActiveTimerState = {
      id: `timer-${Date.now()}`,
      clientId,
      taskId,
      description: description || 'Active client work session',
      startTime: Date.now(),
      elapsedSeconds: 0,
      isRunning: true,
    };
    setActiveTimer(newTimerState);
    addAuditLog('Started Work Timer', 'Time', `Started live timer for client ID ${clientId}.`);
  };

  const stopTimer = () => {
    if (!activeTimer) return;
    const client = clients.find(c => c.id === activeTimer.clientId);
    const task = tasks.find(t => t.id === activeTimer.taskId);
    const durationMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));

    const newEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      clientId: activeTimer.clientId,
      clientName: client?.company || client?.name || 'Client',
      taskId: activeTimer.taskId,
      taskTitle: task?.title,
      description: activeTimer.description,
      startTime: new Date(activeTimer.startTime).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes,
      billable: true,
      billingRate: 175,
      approved: false,
      invoiced: false,
      createdAt: new Date().toISOString(),
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setActiveTimer(null);
    addAuditLog('Stopped Work Timer', 'Time', `Logged ${durationMinutes} minutes for ${newEntry.clientName}.`);
  };

  const addManualTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'staffId' | 'staffName'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `time-${Date.now()}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setTimeEntries(prev => [newEntry, ...prev]);
    addAuditLog('Manual Time Entry', 'Time', `Logged manual entry of ${newEntry.durationMinutes} mins for ${newEntry.clientName}.`);
  };

  const approveTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.map(e => (e.id === id ? { ...e, approved: true } : e)));
    addAuditLog('Approved Timesheet Entry', 'Time', `Approved time entry ID ${id}.`);
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(e => e.id !== id));
    addAuditLog('Deleted Time Entry', 'Time', `Deleted time entry ID ${id}.`);
  };

  // Calendar
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
    };
    setCalendarEvents(prev => [newEvent, ...prev]);
    addAuditLog('Created Calendar Event', 'Task', `Scheduled "${newEvent.title}" on ${newEvent.date}.`);
    return newEvent;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Automation rules
  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    addAuditLog('Toggled Automation Rule', 'Security', `Toggled rule ID ${id}.`);
  };

  // Reset demo data
  const resetDemoData = () => {
    setWorkspaceSettings(INITIAL_SETTINGS);
    setClients(INITIAL_CLIENTS);
    setTasks(INITIAL_TASKS);
    setDocumentRequests(INITIAL_DOCUMENT_REQUESTS);
    setInvoices(INITIAL_INVOICES);
    setMessages(INITIAL_MESSAGES);
    setTimeEntries(INITIAL_TIME_ENTRIES);
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAutomationRules(INITIAL_AUTOMATION_RULES);
    setActiveTimer(null);
    setCurrentUser(INITIAL_USERS[0]);
    addAuditLog('Reset Demo Data', 'Security', 'Restored pristine demonstration records.');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedClientId,
        setSelectedClientId,
        selectedTaskId,
        setSelectedTaskId,
        sidebarCollapsed,
        setSidebarCollapsed,
        globalSearch,
        setGlobalSearch,
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        allUsers,
        workspaceSettings,
        updateWorkspaceSettings,
        clients,
        addClient,
        updateClient,
        deleteClient,
        tasks,
        addTask,
        updateTask,
        updateTaskStatus,
        addTaskComment,
        deleteTask,
        documentRequests,
        addDocumentRequest,
        updateDocumentRequest,
        uploadDocumentFile,
        reviewDocumentFile,
        invoices,
        addInvoice,
        updateInvoice,
        recordPayment,
        messages,
        sendMessage,
        createThread,
        toggleStarMessage,
        markThreadRead,
        timeEntries,
        activeTimer,
        startTimer,
        stopTimer,
        addManualTimeEntry,
        approveTimeEntry,
        deleteTimeEntry,
        calendarEvents,
        addCalendarEvent,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        automationRules,
        toggleAutomationRule,
        addAuditLog,
        resetDemoData,
        quickCreateOpen,
        setQuickCreateOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
