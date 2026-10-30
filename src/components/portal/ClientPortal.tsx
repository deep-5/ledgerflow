import React, { useState } from 'react';
import {
  Globe,
  FileCheck,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  MessageSquare,
  User,
  CreditCard,
  Building2,
  Download,
  Send,
  Check,
  FileText,
  ShieldCheck,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatFileSize, formatTimeAgo } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { RequestedFileItem } from '../../types';

export const ClientPortal: React.FC = () => {
  const {
    currentUser,
    clients,
    tasks,
    documentRequests,
    invoices,
    messages,
    uploadDocumentFile,
    recordPayment,
    sendMessage,
    updateClient,
  } = useApp();

  type PortalTab = 'overview' | 'requests' | 'documents' | 'tasks' | 'messages' | 'invoices' | 'profile';
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');

  const defaultClientId = currentUser.role === 'Client' ? 'client-1' : (clients[0]?.id || 'client-1');
  const [selectedClientPortalId, setSelectedClientPortalId] = useState<string>(defaultClientId);

  const client = clients.find(c => c.id === selectedClientPortalId) || clients[0];

  // Isolated client records ONLY!
  const myRequests = documentRequests.filter(r => r.clientId === client.id);
  const myTasks = tasks.filter(t => t.clientId === client.id);
  const myInvoices = invoices.filter(i => i.clientId === client.id);
  const myMessages = messages.filter(m => m.clientId === client.id);

  // Upload modal state
  const [uploadTarget, setUploadTarget] = useState<{ reqId: string; item: RequestedFileItem } | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');

  // Payment modal state
  const [payingInvoice, setPayingInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Bank Wire / ACH'>('Credit Card');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Message reply state
  const [activeThreadId, setActiveThreadId] = useState<string | null>(myMessages[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  // Profile edit state
  const [profilePhone, setProfilePhone] = useState(client.phone);
  const [profileAddress, setProfileAddress] = useState(client.address);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTarget || !uploadFileName.trim()) return;

    uploadDocumentFile(uploadTarget.reqId, uploadTarget.item.id, {
      name: uploadFileName.trim().endsWith('.pdf') ? uploadFileName.trim() : `${uploadFileName.trim()}.pdf`,
      size: 1048576 * (1.5 + Math.random() * 2),
      type: 'application/pdf',
    });

    setUploadTarget(null);
    setUploadFileName('');
  };

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    recordPayment(payingInvoice.id, {
      amount: payingInvoice.balanceDue,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNumber: paymentRef || `ACH-${Date.now().toString().slice(-6)}`,
      notes: `Settled by client via secure portal (${paymentMethod}).`,
    });

    setPaymentSuccessToast(`Payment of ${formatCurrency(payingInvoice.balanceDue, payingInvoice.currency)} recorded successfully.`);
    setPayingInvoice(null);
    setTimeout(() => setPaymentSuccessToast(null), 3500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !replyText.trim()) return;

    sendMessage(activeThreadId, replyText.trim(), false);
    setReplyText('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateClient(client.id, {
      phone: profilePhone,
      address: profileAddress,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const activeThread = myMessages.find(m => m.id === activeThreadId);

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Toast */}
      {paymentSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-modal text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          {paymentSuccessToast}
        </div>
      )}

      {/* Portal Security Header */}
      <div className="p-5 sm:p-6 bg-white border border-[#E5EBF0] rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5DB321] ring-4 ring-[#EBFDD8]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#202938] tracking-tight">
              {client.company} Secure Portal
            </h2>
            <span className="text-[11px] bg-[#EBFDD8] text-[#2A6605] px-2.5 py-0.5 rounded-full border border-[#A7F477] font-bold shadow-xs">
              Client Portal Session
            </span>
          </div>
          <p className="text-xs text-[#788596] mt-1">
            Authenticated as <strong className="text-[#202938]">{currentUser.name}</strong> • Account: {client.email} • Assigned Firm: Apex Advisory Partners
          </p>
        </div>

        {/* Staff preview switcher */}
        {currentUser.role !== 'Client' && (
          <div className="flex items-center gap-2 bg-[#F3F7FA] p-2 rounded-xl border border-[#E5EBF0] text-xs shadow-subtle">
            <span className="text-[#788596] font-semibold text-[11px] uppercase tracking-wider">Staff Preview:</span>
            <select
              value={selectedClientPortalId}
              onChange={e => setSelectedClientPortalId(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#E5EBF0] rounded-lg text-[#202938] font-bold focus:outline-none shadow-xs cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Client Portal Navigation Tabs */}
      <div className="flex border-b border-[#E5EBF0] gap-2 overflow-x-auto text-xs font-semibold">
        {(
          [
            { id: 'overview', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
            { id: 'requests', label: `Pending Requests (${myRequests.filter(r => r.status !== 'Completed').length})`, icon: <FileCheck className="w-4 h-4" /> },
            { id: 'documents', label: 'My Documents', icon: <FileText className="w-4 h-4" /> },
            { id: 'tasks', label: `Work Status (${myTasks.length})`, icon: <Clock className="w-4 h-4" /> },
            { id: 'messages', label: `Messages (${myMessages.length})`, icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'invoices', label: `Invoices (${myInvoices.filter(i => i.balanceDue > 0).length} Unpaid)`, icon: <Receipt className="w-4 h-4" /> },
            { id: 'profile', label: 'Profile & Settings', icon: <User className="w-4 h-4" /> },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 border-b-2 transition-all duration-150 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#087EDB] text-[#087EDB] bg-[#D9EFFA] rounded-t-xl font-bold'
                : 'border-transparent text-[#788596] hover:text-[#202938] hover:bg-[#F3F7FA]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Hero Card */}
          <div className="p-6 sm:p-7 bg-[#D9EFFA] border border-[#BCE3F7] rounded-2xl shadow-card">
            <h3 className="text-lg font-bold text-[#0668B6] tracking-tight">
              Welcome, {client.name.split(' ')[0]}
            </h3>
            <p className="text-xs sm:text-sm text-[#202938] mt-1 max-w-2xl leading-relaxed">
              Your accounting team at Apex Advisory is currently preparing your monthly ledger and compliance filings. Please review outstanding document requests below to keep your records on schedule.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('requests')}
              className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card cursor-pointer hover:shadow-card-hover hover:border-amber-300 transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-[#788596] mb-2">
                <span className="font-bold uppercase tracking-wider text-[10px]">Missing Documents</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#202938] tracking-tight">
                {myRequests.filter(r => r.status !== 'Completed').length}
              </div>
              <p className="text-[11px] text-amber-700 font-semibold mt-2 pt-2 border-t border-[#E5EBF0]">
                Action required by you
              </p>
            </div>

            <div
              onClick={() => setActiveTab('invoices')}
              className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card cursor-pointer hover:shadow-card-hover hover:border-rose-300 transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-[#788596] mb-2">
                <span className="font-bold uppercase tracking-wider text-[10px]">Unpaid Invoices</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#202938] tracking-tight truncate">
                {formatCurrency(
                  myInvoices.reduce((s, i) => s + i.balanceDue, 0),
                  client.currency
                )}
              </div>
              <p className="text-[11px] text-rose-600 font-semibold mt-2 pt-2 border-t border-[#E5EBF0]">
                {myInvoices.filter(i => i.balanceDue > 0).length} invoice awaiting payment
              </p>
            </div>

            <div
              onClick={() => setActiveTab('tasks')}
              className="p-5 bg-white border border-[#E5EBF0] rounded-2xl shadow-card cursor-pointer hover:shadow-card-hover hover:border-[#087EDB]/50 transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-[#788596] mb-2">
                <span className="font-bold uppercase tracking-wider text-[10px]">Active Work in Progress</span>
                <div className="w-7 h-7 rounded-lg bg-[#D9EFFA] border border-[#BCE3F7] flex items-center justify-center text-[#087EDB]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#202938] tracking-tight">
                {myTasks.filter(t => t.status !== 'Completed').length}
              </div>
              <p className="text-[11px] text-[#087EDB] font-semibold mt-2 pt-2 border-t border-[#E5EBF0]">
                Being serviced by your accountant
              </p>
            </div>
          </div>

          {/* Urgent Document Requests Section */}
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#202938] tracking-tight">
                  Requested Documents Needing Your Action
                </h4>
                <p className="text-xs text-[#788596]">Click any slot to upload requested files</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('requests')}>
                View All →
              </Button>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              {myRequests.filter(r => r.status !== 'Completed').map(req => (
                <div key={req.id} className="p-5 px-6 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#202938] tracking-tight">
                        {req.title}
                      </span>
                      <p className="text-[11px] text-[#788596] mt-0.5">
                        Due: {formatDate(req.dueDate)} • {req.instructions}
                      </p>
                    </div>
                    <Badge status={req.status} size="sm" />
                  </div>

                  {/* Items slots */}
                  <div className="space-y-2">
                    {req.items.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-[#F3F7FA] border border-[#E5EBF0] rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#202938] tracking-tight">{item.name}</p>
                          <p className="text-[11px] text-[#788596] mt-0.5">{item.description}</p>
                        </div>

                        {item.uploadedFile ? (
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-[#2A6605] font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#5DB321]" />
                              {item.uploadedFile.fileName}
                            </span>
                            <Badge status={item.uploadedFile.approvalStatus} size="sm" />
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Upload className="w-3.5 h-3.5" />}
                            onClick={() => setUploadTarget({ reqId: req.id, item })}
                          >
                            Upload File
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {myRequests.map(req => (
              <div
                key={req.id}
                className="bg-white border border-slate-200/80 rounded-2xl shadow-card p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 tracking-tight">{req.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sent {formatDate(req.dateSent)} • Deadline: {formatDate(req.dueDate)}
                    </p>
                  </div>
                  <Badge status={req.status} size="md" />
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Instructions:</span>
                  {req.instructions}
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    File Checklist
                  </h4>
                  {req.items.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white shadow-subtle"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 tracking-tight">{item.name}</span>
                          {item.required && (
                            <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold border border-rose-200/60">
                              Required
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                        )}
                      </div>

                      {item.uploadedFile ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{item.uploadedFile.fileName}</p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(item.uploadedFile.fileSize)}
                            </p>
                          </div>
                          <Badge status={item.uploadedFile.approvalStatus} size="sm" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadTarget({ reqId: req.id, item })}
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Upload className="w-3.5 h-3.5" />}
                          onClick={() => setUploadTarget({ reqId: req.id, item })}
                        >
                          Upload Document
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">Approved & Stored Documents</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review all verified financial files, bank statements, and tax receipts on file.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myRequests
              .flatMap(r => r.items)
              .filter(i => !!i.uploadedFile)
              .map(item => (
                <div
                  key={item.id}
                  className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {item.uploadedFile?.fileName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        For: {item.name} • {formatFileSize(item.uploadedFile?.fileSize || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge status={item.uploadedFile?.approvalStatus || 'Pending'} size="sm" />
                    <button
                      onClick={() => alert(`Simulating secure download of ${item.uploadedFile?.fileName}`)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: MY TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">Firm Engagement Workflow</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time progress of accounting, payroll, and tax filings performed by your firm.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myTasks.map(task => (
              <div key={task.id} className="p-5 px-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm tracking-tight">{task.title}</span>
                  <Badge status={task.status} size="sm" />
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{task.description}</p>
                <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pt-1">
                  <span>Category: {task.serviceCategory}</span>
                  <span className="text-slate-300">•</span>
                  <span>Target Date: {formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden min-h-[500px]">
          {/* Thread List */}
          <div className="border-r border-slate-200/80 divide-y divide-slate-100">
            <div className="p-3.5 bg-slate-50 font-bold text-xs text-slate-700 border-b border-slate-200/80">
              Conversations
            </div>
            {myMessages.map(thread => (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-4 cursor-pointer transition-colors text-xs ${
                  activeThreadId === thread.id ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {thread.subject}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatTimeAgo(thread.lastUpdated)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {thread.lastMessageSnippet}
                </p>
              </div>
            ))}
          </div>

          {/* Active Conversation Stream */}
          <div className="md:col-span-2 flex flex-col justify-between">
            {activeThread ? (
              <>
                <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 tracking-tight">{activeThread.subject}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Direct line to your assigned accounting team
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3.5 flex-1 overflow-y-auto max-h-[360px]">
                  {activeThread.messages
                    .filter(m => !m.isInternalNote)
                    .map(msg => {
                      const isMe = msg.senderRole === 'Client';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-slate-700">{msg.senderName}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(msg.sentAt)}</span>
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-brand-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply to your accountant..."
                    className="flex-1 px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a conversation thread to view.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Firm Service Invoices</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Statements for bookkeeping, payroll, and corporate accounting services rendered.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myInvoices.map(inv => (
              <div
                key={inv.id}
                className="p-5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {inv.invoiceNumber}
                    </span>
                    <Badge status={inv.status} size="sm" />
                  </div>
                  <p className="text-slate-500 mt-1">
                    Due: {formatDate(inv.dueDate)} • Terms: {inv.paymentTerms}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {inv.lines.map(l => l.description).join('; ')}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div className="text-right">
                    <span className="font-bold text-sm text-slate-900 block">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                    {inv.balanceDue > 0 && (
                      <span className="text-[11px] text-rose-600 font-bold block">
                        Bal: {formatCurrency(inv.balanceDue, inv.currency)}
                      </span>
                    )}
                  </div>

                  {inv.balanceDue > 0 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CreditCard className="w-3.5 h-3.5" />}
                      onClick={() => setPayingInvoice(inv)}
                    >
                      Pay Online
                    </Button>
                  ) : (
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Paid
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/80 shadow-card p-7 space-y-4">
          <h3 className="font-bold text-base text-slate-900 tracking-tight">Entity Contact Settings</h3>
          <p className="text-xs text-slate-400">
            Keep your business contact details current for official tax filings and billing remittance.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                disabled
                value={client.company}
                className="w-full px-3.5 py-2 border border-slate-200/80 rounded-xl bg-slate-50 text-slate-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Legal entity changes must be requested through your accounting lead.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Email</label>
              <input
                type="email"
                disabled
                value={client.email}
                className="w-full px-3.5 py-2 border border-slate-200/80 rounded-xl bg-slate-50 text-slate-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={e => setProfilePhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Address</label>
              <input
                type="text"
                value={profileAddress}
                onChange={e => setProfileAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {profileSaved && (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated successfully.
                </span>
              )}
              <Button variant="primary" size="sm" type="submit" className="ml-auto">
                Save Profile
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Upload File Modal */}
      {uploadTarget && (
        <Modal
          isOpen={!!uploadTarget}
          onClose={() => setUploadTarget(null)}
          title={`Upload ${uploadTarget.item.name}`}
          subtitle="All files are encrypted and submitted directly to your accountant."
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-1">
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/60">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600 mx-auto mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-900 tracking-tight">Select Document File to Upload</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported: PDF, CSV, Excel, PNG (max 25MB)
              </p>
              <input
                type="text"
                required
                value={uploadFileName}
                onChange={e => setUploadFileName(e.target.value)}
                placeholder="e.g. October_Bank_Statement.pdf"
                className="w-full mt-4 px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs bg-white text-center shadow-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setUploadTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit File
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Modal */}
      {payingInvoice && (
        <Modal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          title={`Pay Invoice ${payingInvoice.invoiceNumber}`}
          subtitle={`Total Balance Due: ${formatCurrency(payingInvoice.balanceDue, payingInvoice.currency)}`}
          maxWidth="md"
        >
          <form onSubmit={handlePayInvoice} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    paymentMethod === 'Credit Card'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs ring-1 ring-brand-500'
                      : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Bank Wire / ACH')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    paymentMethod === 'Bank Wire / ACH'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs ring-1 ring-brand-500'
                      : 'border-slate-200/90 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  ACH / Wire Transfer
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Confirmation / Check Reference
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder="e.g. STRIPE-CH-918203 or WIRE-REF-4091"
                className="w-full px-3.5 py-2 border border-slate-200/90 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Secure 256-bit encrypted practice payment gateway. A payment receipt will be generated in your audit ledger.</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setPayingInvoice(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Authorize Payment of {formatCurrency(payingInvoice.balanceDue, payingInvoice.currency)}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
