export type UserRole = 
  | 'Firm Owner' 
  | 'Administrator' 
  | 'Manager' 
  | 'Accountant' 
  | 'Bookkeeper' 
  | 'Reviewer' 
  | 'Client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  timeZone: string;
  active: boolean;
  assignedClients?: string[]; // Client IDs
  permittedClientIds?: string[];
  weeklyCapacityHours?: number;
}

export type ClientType = 'Corporate' | 'LLC / Partnership' | 'Sole Proprietor' | 'Individual' | 'Non-Profit';
export type ClientStatus = 'Active' | 'Onboarding' | 'Pending Review' | 'Inactive';
export type BillingFrequency = 'Monthly Retainer' | 'Quarterly' | 'Annual' | 'Hourly / Project';

export interface Client {
  id: string;
  name: string;
  company: string;
  clientType: ClientType;
  email: string;
  phone: string;
  address: string;
  country: string; // e.g., 'United States', 'United Kingdom', 'Canada'
  currency: 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
  timeZone: string;
  assignedAccountantId: string;
  teamMemberIds: string[];
  services: string[]; // e.g. ['Monthly Bookkeeping', 'VAT Filing', 'Payroll']
  startDate: string;
  billingFrequency: BillingFrequency;
  status: ClientStatus;
  notes: string;
  portalAccessEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 
  | 'Not Started' 
  | 'In Progress' 
  | 'Waiting for Client' 
  | 'In Review' 
  | 'Completed' 
  | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternalOnly: boolean; // internal staff note vs visible to client
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  serviceCategory: string;
  description: string;
  assignedStaffId: string;
  reviewerId: string;
  startDate: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
  tags?: string[];
  isRecurring?: boolean;
  recurrenceInterval?: 'monthly' | 'quarterly' | 'annually';
  checklist?: { id: string; text: string; completed: boolean }[];
  comments: TaskComment[];
  createdAt: string;
  completedAt?: string;
}

export type DocumentRequestStatus = 
  | 'Draft' 
  | 'Sent' 
  | 'Partially Received' 
  | 'Submitted' 
  | 'In Review' 
  | 'Changes Requested' 
  | 'Completed' 
  | 'Cancelled';

export type FileApprovalStatus = 'Pending' | 'Approved' | 'Rejected - Reupload Required';

export interface RequestedFileItem {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  uploadedFile?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    uploadedBy: string;
    approvalStatus: FileApprovalStatus;
    reviewNotes?: string;
    downloadUrl?: string;
  };
}

export interface DocumentRequest {
  id: string;
  title: string;
  clientId: string;
  requestedByStaffId: string;
  assignedReviewerId: string;
  dateSent: string;
  dueDate: string;
  status: DocumentRequestStatus;
  instructions: string;
  reminderSchedule: 'Daily' | 'Every 3 Days' | 'Weekly' | 'Custom';
  items: RequestedFileItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  isInternalNote: boolean;
  deliveryStatus?: 'In-app' | 'Email sent' | 'Email failed';
  attachments?: { name: string; size: number }[];
  sentAt: string;
}

export interface MessageThread {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  folder: 'inbox' | 'sent' | 'starred' | 'archived';
  assignedStaffId: string;
  relatedTaskId?: string;
  lastMessageSnippet: string;
  lastUpdated: string;
  unreadCount: number;
  isStarred: boolean;
  messages: Message[];
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Void';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number; // e.g., 20% for UK VAT or 0% or 8.25%
  total: number;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Wire / ACH' | 'Credit Card' | 'Direct Debit' | 'Cheque' | 'Stripe Manual';
  referenceNumber: string;
  recordedByStaffId: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  currency: 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  paymentTerms: string; // e.g. 'Net 15', 'Due on Receipt', 'Net 30'
  payments: InvoicePayment[];
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  staffId: string;
  staffName: string;
  clientId: string;
  clientName: string;
  taskId?: string;
  taskTitle?: string;
  description: string;
  startTime: string; // ISO
  endTime?: string; // ISO, undefined if running
  durationMinutes: number;
  billable: boolean;
  billingRate: number; // per hour
  approved: boolean;
  invoiced: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Task Deadline' | 'Document Due' | 'Client Review' | 'Team Meeting' | 'Invoice Due';
  date: string; // YYYY-MM-DD
  time?: string;
  clientId?: string;
  clientName?: string;
  assignedStaffId?: string;
  relatedId?: string; // taskId, requestId, invoiceId
  status?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'document' | 'task' | 'invoice' | 'message' | 'system';
  timestamp: string;
  read: boolean;
  linkTo?: { view: string; id?: string };
}

export interface AuditLogItem {
  id: string;
  action: string;
  category: 'Client' | 'Task' | 'Document' | 'Invoice' | 'Security' | 'Time';
  performedBy: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface WorkspaceSettings {
  firmName: string;
  legalEntityName: string;
  taxRegistrationNumber: string; // e.g. EIN or UK VAT Number
  defaultCurrency: 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
  defaultJurisdiction: string;
  defaultTaxRatePercent: number;
  timeZone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  fiscalYearEnd: string;
  emailNotifications: boolean;
  clientPortalUrlSlug: string;
  autoRemindDaysBeforeDue: number;
}
