import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  CheckSquare,
  FileCheck,
  MessageSquare,
  Receipt,
  Clock,
  History,
  Plus,
  Send,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatDate, formatTimeAgo } from '../../utils/formatters';

interface ClientDetailModalProps {
  clientId: string | null;
  onClose: () => void;
  onEditClient: (client: any) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  clientId,
  onClose,
  onEditClient,
}) => {
  const {
    clients,
    tasks,
    documentRequests,
    invoices,
    messages,
    timeEntries,
    auditLogs,
    allUsers,
    deleteClient,
    setCurrentView,
    setSelectedTaskId,
    setQuickCreateOpen,
  } = useApp();

  type TabType = 'overview' | 'tasks' | 'documents' | 'messages' | 'invoices' | 'time' | 'activity';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);

  const client = clients.find(c => c.id === clientId);
  if (!client) return null;

  const assignedAccountant = allUsers.find(u => u.id === client.assignedAccountantId);
  const clientTasks = tasks.filter(t => t.clientId === client.id);
  const clientDocRequests = documentRequests.filter(r => r.clientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id);
  const clientMessages = messages.filter(m => m.clientId === client.id);
  const clientTime = timeEntries.filter(t => t.clientId === client.id);
  const clientLogs = auditLogs.filter(l => l.details.includes(client.company) || l.details.includes(client.name));

  const totalBilled = clientInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = clientInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const openTasksCount = clientTasks.filter(t => t.status !== 'Completed').length;
  const missingDocsCount = clientDocRequests.filter(
    r => r.status === 'Sent' || r.status === 'Partially Received' || r.status === 'Changes Requested'
  ).length;

  return (
    <Modal
      isOpen={!!clientId}
      onClose={onClose}
      title={client.company}
      subtitle={`Client Account #${client.id} • ${client.clientType} • ${client.country}`}
      maxWidth="5xl"
    >
      {/* Header Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-subtle p-3.5 rounded-xl border border-surface-border -mt-2">
        <div>
          <span className="text-[11px] text-text-secondary">Primary Contact</span>
          <p className="text-xs font-semibold text-text-main truncate">{client.name}</p>
        </div>
        <div>
          <span className="text-[11px] text-text-secondary">Assigned Accountant</span>
          <p className="text-xs font-semibold text-text-main truncate">
            {assignedAccountant?.name || 'Unassigned'}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-text-secondary">Pending Tasks</span>
          <p className="text-xs font-semibold text-brand-600">{openTasksCount} active</p>
        </div>
        <div>
          <span className="text-[11px] text-text-secondary">Outstanding Balance</span>
          <p className="text-xs font-semibold text-rose-600">
            {formatCurrency(totalOutstanding, client.currency)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border gap-2 overflow-x-auto text-xs font-semibold">
        {(
          [
            { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
            { id: 'tasks', label: `Tasks (${clientTasks.length})`, icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'documents', label: `Documents (${clientDocRequests.length})`, icon: <FileCheck className="w-4 h-4" /> },
            { id: 'messages', label: `Messages (${clientMessages.length})`, icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'invoices', label: `Invoices (${clientInvoices.length})`, icon: <Receipt className="w-4 h-4" /> },
            { id: 'time', label: `Time (${clientTime.length})`, icon: <Clock className="w-4 h-4" /> },
            { id: 'activity', label: 'Audit History', icon: <History className="w-4 h-4" /> },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600 bg-brand-50/50 rounded-t'
                : 'border-transparent text-text-secondary hover:text-text-main hover:bg-surface-subtle'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2 min-h-[360px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions for this client */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  setQuickCreateOpen(true);
                }}
              >
                Create Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<FileCheck className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  setQuickCreateOpen(true);
                }}
              >
                Request Documents
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Receipt className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  setQuickCreateOpen(true);
                }}
              >
                Draft Invoice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditClient(client)}
              >
                Edit Client Info
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 ml-auto"
                onClick={() => setDeactivateConfirmOpen(true)}
              >
                Deactivate Client
              </Button>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white border border-surface-border rounded-xl space-y-3">
                <h4 className="font-semibold text-text-main text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  Business & Contact Details
                </h4>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Contact Name:</span>
                    <span className="font-medium text-text-main">{client.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Email:</span>
                    <span className="font-medium text-brand-600">{client.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Phone:</span>
                    <span className="font-medium text-text-main">{client.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Address:</span>
                    <span className="font-medium text-text-main truncate max-w-[220px]">
                      {client.address}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Client Portal Status:</span>
                    <Badge
                      status={client.portalAccessEnabled ? 'Active' : 'Inactive'}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-surface-border rounded-xl space-y-3">
                <h4 className="font-semibold text-text-main text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Service & Billing Configuration
                </h4>
                <div className="space-y-2 text-text-secondary">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Billing Schedule:</span>
                    <span className="font-medium text-text-main">{client.billingFrequency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Operating Currency:</span>
                    <span className="font-medium text-text-main">{client.currency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Client Since:</span>
                    <span className="font-medium text-text-main">{formatDate(client.startDate)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Time Zone:</span>
                    <span className="font-medium text-text-main">{client.timeZone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Services Included:</span>
                    <span className="font-medium text-text-main text-right">
                      {client.services.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-2">
              <h4 className="font-semibold text-text-main text-xs uppercase tracking-wider">
                Internal Practice Notes
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                {client.notes || 'No internal notes recorded yet for this client.'}
              </p>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-surface-border rounded-xl overflow-hidden bg-white">
              {clientTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No tasks found for this client.
                </div>
              ) : (
                clientTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-subtle transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      onClose();
                      setCurrentView('tasks');
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-text-main truncate">
                          {t.title}
                        </span>
                        <Badge status={t.priority} size="sm" showDot={false} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-1">
                        <span>{t.serviceCategory}</span>
                        <span>•</span>
                        <span>Due {formatDate(t.dueDate)}</span>
                      </div>
                    </div>
                    <Badge status={t.status} size="sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-surface-border rounded-xl overflow-hidden bg-white">
              {clientDocRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No document requests sent yet.
                </div>
              ) : (
                clientDocRequests.map(req => {
                  const received = req.items.filter(i => !!i.uploadedFile).length;
                  return (
                    <div
                      key={req.id}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-subtle transition-colors cursor-pointer"
                      onClick={() => {
                        onClose();
                        setCurrentView('documents');
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-text-main truncate">
                          {req.title}
                        </p>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {received} of {req.items.length} files submitted • Due {formatDate(req.dueDate)}
                        </p>
                      </div>
                      <Badge status={req.status} size="sm" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-surface-border rounded-xl overflow-hidden bg-white">
              {clientMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No conversation threads found.
                </div>
              ) : (
                clientMessages.map(th => (
                  <div
                    key={th.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-subtle transition-colors cursor-pointer"
                    onClick={() => {
                      onClose();
                      setCurrentView('messages');
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-text-main truncate">{th.subject}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
                        {th.lastMessageSnippet}
                      </p>
                    </div>
                    <span className="text-[10px] text-text-secondary">
                      {formatTimeAgo(th.lastUpdated)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-surface-border rounded-xl overflow-hidden bg-white">
              {clientInvoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No invoices billed to this client yet.
                </div>
              ) : (
                clientInvoices.map(inv => (
                  <div
                    key={inv.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-subtle transition-colors cursor-pointer"
                    onClick={() => {
                      onClose();
                      setCurrentView('invoices');
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-text-main font-mono">
                          {inv.invoiceNumber}
                        </span>
                        <Badge status={inv.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Issued {formatDate(inv.issueDate)} • Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-text-main">
                        {formatCurrency(inv.total, inv.currency)}
                      </p>
                      {inv.balanceDue > 0 && (
                        <p className="text-[10px] text-rose-600 font-medium">
                          Bal: {formatCurrency(inv.balanceDue, inv.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TIME ENTRIES TAB */}
        {activeTab === 'time' && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-surface-border rounded-xl overflow-hidden bg-white">
              {clientTime.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No time logged for this client yet.
                </div>
              ) : (
                clientTime.map(entry => (
                  <div key={entry.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-medium text-text-main">{entry.description}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        Logged by {entry.staffName} on {formatDate(entry.startTime)}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-semibold text-text-main">
                        {(entry.durationMinutes / 60).toFixed(1)} hrs
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          entry.approved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {entry.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY AUDIT TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-surface-border rounded-xl overflow-hidden bg-white">
              {clientLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-secondary">
                  No recorded audit events.
                </div>
              ) : (
                clientLogs.map(log => (
                  <div key={log.id} className="p-3 text-xs flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-text-main">{log.action}</p>
                      <p className="text-[11px] text-text-secondary">{log.details}</p>
                      <span className="text-[10px] text-text-secondary">
                        {log.performedBy} • {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Retention / Authorization Alert & Deactivate confirmation */}
      {deactivateConfirmOpen && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2 mt-4">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Accounting Records Retention Notice
          </div>
          <p>
            Under statutory and regulatory audit requirements, clients with prior tax returns, invoices, or verified bank reconciliations cannot be permanently erased. Deactivating will remove the client from active rosters and close pending tasks.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeactivateConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                deleteClient(client.id);
                setDeactivateConfirmOpen(false);
                onClose();
              }}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
