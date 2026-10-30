import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  Send,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Eye,
  RotateCw,
  FileUp,
  Filter,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatDate, formatFileSize, formatTimeAgo } from '../../utils/formatters';
import { DocumentRequest, DocumentRequestStatus, FileApprovalStatus, RequestedFileItem } from '../../types';

export const DocumentRequests: React.FC = () => {
  const {
    documentRequests,
    clients,
    allUsers,
    currentUser,
    addDocumentRequest,
    updateDocumentRequest,
    uploadDocumentFile,
    reviewDocumentFile,
    addAuditLog,
    setQuickCreateOpen,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Review Drawer / Modal
  const [activeRequest, setActiveRequest] = useState<DocumentRequest | null>(null);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Staff simulation upload modal for testing
  const [staffUploadItem, setStaffUploadItem] = useState<{ reqId: string; item: RequestedFileItem } | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = documentRequests.length;
    const submittedForReview = documentRequests.filter(
      r => r.status === 'Submitted' || r.status === 'In Review' || r.items.some(i => i.uploadedFile?.approvalStatus === 'Pending')
    ).length;
    const pendingClient = documentRequests.filter(
      r => r.status === 'Sent' || r.status === 'Partially Received' || r.status === 'Changes Requested'
    ).length;
    const completed = documentRequests.filter(r => r.status === 'Completed').length;
    return { total, submittedForReview, pendingClient, completed };
  }, [documentRequests]);

  const filteredRequests = useMemo(() => {
    return documentRequests.filter(req => {
      const client = clients.find(c => c.id === req.clientId);
      const matchSearch =
        req.title.toLowerCase().includes(search.toLowerCase()) ||
        (client && client.company.toLowerCase().includes(search.toLowerCase())) ||
        (client && client.name.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (clientFilter !== 'all' && req.clientId !== clientFilter) return false;

      return true;
    });
  }, [documentRequests, search, statusFilter, clientFilter, clients]);

  const handleCopyLink = (reqId: string) => {
    const link = `https://portal.ledgerflow.io/request/${reqId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedLinkIndex(reqId);
    setTimeout(() => setCopiedLinkIndex(null), 2500);
  };

  const handleSendReminder = (req: DocumentRequest) => {
    const client = clients.find(c => c.id === req.clientId);
    addAuditLog(
      'Sent Document Reminder',
      'Document',
      `Dispatched automated follow-up reminder to ${client?.name || 'client'} for "${req.title}".`
    );
    setReminderToast(`Reminder dispatched to ${client?.email || client?.company}`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleStaffSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUploadItem || !simulatedFileName.trim()) return;

    uploadDocumentFile(staffUploadItem.reqId, staffUploadItem.item.id, {
      name: simulatedFileName.trim().endsWith('.pdf') ? simulatedFileName.trim() : `${simulatedFileName.trim()}.pdf`,
      size: 1048576 * (1.2 + Math.random() * 2),
      type: 'application/pdf',
    });

    setStaffUploadItem(null);
    setSimulatedFileName('');

    // Update active request modal if open
    if (activeRequest && activeRequest.id === staffUploadItem.reqId) {
      const updated = documentRequests.find(r => r.id === activeRequest.id);
      if (updated) setActiveRequest(updated);
    }
  };

  const handleApproveFile = (reqId: string, itemId: string) => {
    reviewDocumentFile(reqId, itemId, 'Approved', 'Verified and reconciled by accounting staff.');
    if (activeRequest) {
      const updated = documentRequests.find(r => r.id === activeRequest.id);
      if (updated) setActiveRequest(updated);
    }
  };

  const handleRejectFile = (reqId: string, itemId: string) => {
    if (!rejectionNotes.trim()) return;
    reviewDocumentFile(reqId, itemId, 'Rejected - Reupload Required', rejectionNotes.trim());
    setRejectingItemId(null);
    setRejectionNotes('');
    if (activeRequest) {
      const updated = documentRequests.find(r => r.id === activeRequest.id);
      if (updated) setActiveRequest(updated);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-modal text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 border border-slate-800">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          {reminderToast}
        </div>
      )}

      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Document Requests & Submissions</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-brand-700 border border-blue-200/60">
              {documentRequests.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Collect bank statements, expense receipts, and payroll journals securely with automated client follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setQuickCreateOpen(true)}
          >
            Create Document Request
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-[#087EDB]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Active Requests</span>
            <div className="w-8 h-8 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#202938] tracking-tight">{stats.total}</div>
          <p className="text-[11px] text-[#788596] mt-1">Across all onboarded practice clients</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Submitted / Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 tracking-tight">{stats.submittedForReview}</div>
          <p className="text-[11px] text-[#788596] mt-1">Staff verification pending</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Awaiting Client</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600 tracking-tight">{stats.pendingClient}</div>
          <p className="text-[11px] text-[#788596] mt-1">Pending client uploads & statements</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5EBF0] shadow-card hover:border-[#A7F477] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#788596] uppercase tracking-wider">Completed Sets</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBFDD8] border border-[#A7F477] text-[#2A6605] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#2A6605] tracking-tight">{stats.completed}</div>
          <p className="text-[11px] text-[#788596] mt-1">Reconciled and closed out</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#E5EBF0] shadow-card flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by request title, client company or contact..."
            className="w-full pl-9 pr-4 py-2 bg-[#F3F7FA] border border-[#E5EBF0] rounded-xl text-xs text-[#202938] placeholder-[#788596] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 focus:border-[#087EDB] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-[#F3F7FA] p-1 rounded-xl border border-[#E5EBF0]">
            {['all', 'Sent', 'Partially Received', 'Submitted', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-white text-[#087EDB] shadow-subtle font-bold'
                    : 'text-[#788596] hover:text-[#202938]'
                }`}
              >
                {status === 'all' ? 'All Requests' : status}
              </button>
            ))}
          </div>

          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E5EBF0] rounded-xl bg-white text-[#202938] font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20 cursor-pointer"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Requests Table */}
      <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3F7FA] border-b border-[#E5EBF0] text-[#788596] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Request Name & Scope</th>
                <th className="py-3.5 px-3">Client</th>
                <th className="py-3.5 px-3">Sent Date</th>
                <th className="py-3.5 px-3">Due Date</th>
                <th className="py-3.5 px-3">Submission Progress</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBF0]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#788596]">
                    <FileCheck className="w-8 h-8 text-[#788596]/40 mx-auto mb-2" />
                    <p className="font-semibold text-[#202938] text-sm">No document requests found</p>
                    <p className="text-xs text-[#788596] mt-1">Try adjusting your filters or create a new request.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const client = clients.find(c => c.id === req.clientId);
                  const receivedCount = req.items.filter(i => !!i.uploadedFile).length;
                  const totalCount = req.items.length;
                  const percent = Math.round((receivedCount / totalCount) * 100);
                  const isOverdue = req.dueDate < '2024-10-17' && req.status !== 'Completed';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => setActiveRequest(req)}
                      className="hover:bg-[#F3F7FA] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#D9EFFA] border border-[#BCE3F7] text-[#087EDB] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#202938] group-hover:text-[#087EDB] transition-colors">
                              {req.title}
                            </span>
                            <div className="text-[11px] text-[#788596] flex items-center gap-1.5 mt-0.5">
                              <span>Auto-remind: {req.reminderSchedule}</span>
                              <span>•</span>
                              <span>{req.items.length} requested files</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#F3F7FA] border border-[#E5EBF0] text-[#202938] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {client?.company.substring(0, 2).toUpperCase() || 'CL'}
                          </div>
                          <div>
                            <span className="font-semibold text-[#202938]">{client?.company}</span>
                            <div className="text-[10px] text-[#788596]">{client?.name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-[#788596] font-medium">
                        {formatDate(req.dateSent)}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-[#202938]'}`}>
                          {formatDate(req.dueDate)}
                        </span>
                        {isOverdue && (
                          <span className="ml-1.5 text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Overdue
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="w-36">
                          <div className="flex justify-between text-[11px] text-[#788596] mb-1">
                            <span className="font-medium">
                              {receivedCount} of {totalCount} files
                            </span>
                            <span className="font-bold text-[#202938]">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5EBF0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                percent === 100
                                  ? 'bg-[#A7F477]'
                                  : percent > 0
                                  ? 'bg-[#087EDB]'
                                  : 'bg-[#E5EBF0]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge status={req.status} size="sm" />
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyLink(req.id)}
                            className="p-1.5 text-[#788596] hover:text-[#202938] rounded-lg hover:bg-[#F3F7FA] transition-colors"
                            title="Copy Secure Client Portal Upload Link"
                          >
                            {copiedLinkIndex === req.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleSendReminder(req)}
                            className="p-1.5 text-[#788596] hover:text-[#087EDB] rounded-lg hover:bg-[#D9EFFA] transition-colors"
                            title="Dispatch Automated Reminder"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveRequest(req)}
                          >
                            Review Files →
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Request Modal Drawer */}
      {activeRequest && (
        <Modal
          isOpen={!!activeRequest}
          onClose={() => setActiveRequest(null)}
          title={activeRequest.title}
          subtitle={`Client: ${
            clients.find(c => c.id === activeRequest.clientId)?.company || 'Client'
          } • Due ${formatDate(activeRequest.dueDate)}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Status and summary strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl gap-3 -mt-2">
              <div className="flex items-center gap-3">
                <Badge status={activeRequest.status} size="md" />
                <span className="text-xs text-slate-600 font-semibold">
                  {activeRequest.items.filter(i => !!i.uploadedFile).length} of{' '}
                  {activeRequest.items.length} files submitted
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={() => handleSendReminder(activeRequest)}
                >
                  Dispatch Reminder
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    updateDocumentRequest(activeRequest.id, { status: 'Completed' });
                    setActiveRequest(prev => (prev ? { ...prev, status: 'Completed' } : null));
                  }}
                >
                  Mark Request Complete
                </Button>
              </div>
            </div>

            {/* Client Instructions */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-brand-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Instructions Provided to Client:
              </div>
              <p className="leading-relaxed">{activeRequest.instructions}</p>
            </div>

            {/* Required Files Checklist and Review Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Requested Documents & File Proofs
                </h4>
                <span className="text-[11px] text-slate-400">
                  Click 'Upload on Behalf' to simulate client document deposit
                </span>
              </div>

              <div className="space-y-3">
                {activeRequest.items.map(item => {
                  const uploaded = item.uploadedFile;

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {item.name}
                            </span>
                            {item.required && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                Mandatory
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                          )}
                        </div>

                        {/* Status */}
                        {uploaded ? (
                          <Badge status={uploaded.approvalStatus} size="sm" />
                        ) : (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Awaiting Upload
                          </span>
                        )}
                      </div>

                      {/* Upload Details if uploaded */}
                      {uploaded ? (
                        <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-brand-600 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {uploaded.fileName}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {formatFileSize(uploaded.fileSize)} • Uploaded by {uploaded.uploadedBy}{' '}
                                on {formatDate(uploaded.uploadedAt)}
                              </p>
                            </div>
                          </div>

                          {/* Approval / Replacement actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {uploaded.approvalStatus !== 'Approved' && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<Check className="w-3.5 h-3.5" />}
                                onClick={() => handleApproveFile(activeRequest.id, item.id)}
                              >
                                Approve
                              </Button>
                            )}

                            {uploaded.approvalStatus !== 'Rejected - Reupload Required' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                                onClick={() => setRejectingItemId(item.id)}
                              >
                                Request Replacement
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Upload Slot for missing file */
                        <div className="p-3.5 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500">
                          <span>File has not yet been submitted by client.</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Upload className="w-3.5 h-3.5" />}
                            onClick={() =>
                              setStaffUploadItem({ reqId: activeRequest.id, item })
                            }
                          >
                            Upload on Behalf
                          </Button>
                        </div>
                      )}

                      {/* Review Notes banner if existing */}
                      {uploaded?.reviewNotes && (
                        <div className="text-[11px] text-slate-600 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                          <strong className="text-amber-800">Staff Review Feedback:</strong>{' '}
                          {uploaded.reviewNotes}
                        </div>
                      )}

                      {/* Inline Reject note input */}
                      {rejectingItemId === item.id && (
                        <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 text-xs animate-in fade-in">
                          <label className="font-bold text-rose-900 block">
                            Specify Reason for File Rejection:
                          </label>
                          <input
                            type="text"
                            value={rejectionNotes}
                            onChange={e => setRejectionNotes(e.target.value)}
                            placeholder="e.g. Document was blurry or missing page 3 with closing ledger balance..."
                            className="w-full px-3 py-2 border border-rose-300 rounded-xl bg-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRejectingItemId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectFile(activeRequest.id, item.id)}
                            >
                              Send Rejection Notice
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Upload on Behalf Simulation Modal */}
      {staffUploadItem && (
        <Modal
          isOpen={!!staffUploadItem}
          onClose={() => setStaffUploadItem(null)}
          title="Upload Document File"
          subtitle={`Slot: "${staffUploadItem.item.name}"`}
          maxWidth="md"
        >
          <form onSubmit={handleStaffSimulateUpload} className="space-y-4 pt-1">
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/70">
              <FileUp className="w-9 h-9 text-brand-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Secure File Validation (PDF, CSV, XLSX up to 25MB)
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter simulated document filename or statement reference:
              </p>
              <input
                type="text"
                required
                value={simulatedFileName}
                onChange={e => setSimulatedFileName(e.target.value)}
                placeholder="e.g. SVB_Checking_Statement_Sep2024.pdf"
                className="w-full mt-3 px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setStaffUploadItem(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Upload & Verify
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
