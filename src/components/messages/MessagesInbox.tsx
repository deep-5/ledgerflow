import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Star,
  Archive,
  Inbox,
  Send,
  Plus,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  User,
  Paperclip,
  CheckSquare,
  Shield,
  Sparkles,
  Building2,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import { MessageThread } from '../../types';

export const MessagesInbox: React.FC = () => {
  const {
    messages,
    clients,
    allUsers,
    tasks,
    currentUser,
    sendMessage,
    createThread,
    toggleStarMessage,
    markThreadRead,
    setSelectedTaskId,
    setCurrentView,
  } = useApp();

  type Folder = 'inbox' | 'sent' | 'starred' | 'archived';
  const [activeFolder, setActiveFolder] = useState<Folder>('inbox');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(messages[0]?.id || null);
  const [search, setSearch] = useState('');

  // Reply state
  const [replyContent, setReplyContent] = useState('');
  const [isInternalReply, setIsInternalReply] = useState(false);

  // New Thread Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newSubject, setNewSubject] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [newIsInternal, setNewIsInternal] = useState(false);

  const filteredThreads = useMemo(() => {
    return messages.filter(th => {
      // folder filter
      if (activeFolder === 'starred' && !th.isStarred) return false;
      if (activeFolder === 'archived' && th.folder !== 'archived') return false;
      if (activeFolder === 'sent' && th.folder !== 'sent') return false;
      if (activeFolder === 'inbox' && th.folder === 'archived') return false;

      // search filter
      const matchSearch =
        th.subject.toLowerCase().includes(search.toLowerCase()) ||
        th.clientName.toLowerCase().includes(search.toLowerCase()) ||
        th.lastMessageSnippet.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [messages, activeFolder, search]);

  const activeThread = messages.find(m => m.id === selectedThreadId) || filteredThreads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !replyContent.trim()) return;

    sendMessage(activeThread.id, replyContent.trim(), isInternalReply);
    setReplyContent('');
  };

  const handleCreateNewThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newSubject.trim() || !newInitialMsg.trim()) return;

    const newTh = createThread(newClientId, newSubject.trim(), newInitialMsg.trim(), newIsInternal);
    setSelectedThreadId(newTh.id);
    setIsNewModalOpen(false);
    setNewSubject('');
    setNewInitialMsg('');
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202938]">Communication & Client Inquiries</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#D9EFFA] text-[#087EDB] border border-[#BCE3F7]">
              {messages.length} Threads
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#788596] mt-0.5">
            Internal client memos, direct customer questions, and document query threads with strict tenant privacy.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsNewModalOpen(true)}
        >
          New Conversation
        </Button>
      </div>

      {/* Main Mailbox Grid */}
      <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Folder Nav (3 cols) */}
        <div className="md:col-span-3 border-r border-[#E5EBF0] p-3.5 space-y-1.5 bg-[#F3F7FA]">
          <div className="text-[10px] font-bold text-[#788596] uppercase tracking-wider px-3 py-1 mb-1">
            Practice Mailboxes
          </div>

          <button
            onClick={() => setActiveFolder('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'inbox'
                ? 'bg-white text-[#087EDB] shadow-sm border border-[#E5EBF0] font-bold'
                : 'text-[#788596] hover:text-[#202938] hover:bg-white/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Inbox
            </span>
            <span className="text-[10px] bg-[#D9EFFA] px-2 py-0.5 rounded-full text-[#087EDB] font-bold border border-[#BCE3F7]">
              {messages.filter(m => m.folder === 'inbox').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('starred')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'starred'
                ? 'bg-white text-[#087EDB] shadow-sm border border-[#E5EBF0] font-bold'
                : 'text-[#788596] hover:text-[#202938] hover:bg-white/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Starred
            </span>
            <span className="text-[10px] bg-[#D9EFFA] px-2 py-0.5 rounded-full text-[#087EDB] font-bold border border-[#BCE3F7]">
              {messages.filter(m => m.isStarred).length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('archived')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'archived'
                ? 'bg-white text-[#087EDB] shadow-sm border border-[#E5EBF0] font-bold'
                : 'text-[#788596] hover:text-[#202938] hover:bg-white/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archived
            </span>
          </button>

          <div className="pt-4 mt-4 border-t border-[#E5EBF0] px-3 text-[11px] text-[#788596]">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Privacy Assurance:
            </div>
            <p className="leading-relaxed">
              Internal notes are clearly styled in warm amber and never displayed in client portal access.
            </p>
          </div>
        </div>

        {/* Center Thread List (4 cols) */}
        <div className="md:col-span-4 border-r border-[#E5EBF0] flex flex-col bg-white">
          <div className="p-3 border-b border-[#E5EBF0] bg-[#F3F7FA]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#788596] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subject or client..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5EBF0] rounded-xl text-xs text-[#202938] placeholder-[#788596] focus:outline-none focus:ring-2 focus:ring-[#087EDB]/20"
              />
            </div>
          </div>

          <div className="divide-y divide-[#E5EBF0] flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#788596]">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                No threads found in {activeFolder}.
              </div>
            ) : (
              filteredThreads.map(th => {
                const isSelected = activeThread?.id === th.id;
                const hasInternalNote = th.messages.some(m => m.isInternalNote);

                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      setSelectedThreadId(th.id);
                      markThreadRead(th.id);
                    }}
                    className={`p-3.5 cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'bg-[#D9EFFA] border-l-4 border-[#087EDB]'
                        : 'hover:bg-[#F3F7FA] border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#202938] truncate max-w-[170px]">
                        {th.clientName.split('(')[0]}
                      </span>
                      <span className="text-[10px] text-[#788596] font-medium">
                        {formatTimeAgo(th.lastUpdated)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="font-semibold text-[#202938] truncate text-xs">{th.subject}</p>
                      {hasInternalNote && (
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full flex-shrink-0">
                          Staff Note
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {th.lastMessageSnippet}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[10px] text-slate-400">
                        {th.messages.length} replies
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleStarMessage(th.id);
                        }}
                        className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            th.isStarred ? 'text-amber-500 fill-amber-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Message Body (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between bg-white">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200/80 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">{activeThread.subject}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeThread.clientName}</span>
                  </div>
                </div>

                {activeThread.relatedTaskId && (
                  <button
                    onClick={() => {
                      setSelectedTaskId(activeThread.relatedTaskId!);
                      setCurrentView('tasks');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/60 hover:bg-blue-100/70 transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Open Linked Task
                  </button>
                )}
              </div>

              {/* Messages Stream */}
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[440px]">
                {activeThread.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      msg.isInternalNote
                        ? 'bg-amber-50/70 border-amber-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        : 'bg-slate-50/70 border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({msg.senderRole})</span>
                        {msg.isInternalNote ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                            <Lock className="w-2.5 h-2.5" /> Internal Staff Memo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <Eye className="w-2.5 h-2.5" /> Client Message
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(msg.sentAt)}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200/80 space-y-3 bg-white">
                <textarea
                  rows={2}
                  required
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder={
                    isInternalReply
                      ? 'Type confidential internal note for practice staff...'
                      : 'Type message visible to client in their portal...'
                  }
                  className={`w-full px-3.5 py-2 text-xs border rounded-xl focus:outline-none transition-all ${
                    isInternalReply
                      ? 'border-amber-300 bg-amber-50/30 focus:ring-2 focus:ring-amber-500/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternalReply}
                      onChange={e => setIsInternalReply(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                    />
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Post as Internal Staff Note
                    </span>
                  </label>

                  <Button
                    variant={isInternalReply ? 'secondary' : 'primary'}
                    size="sm"
                    type="submit"
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    {isInternalReply ? 'Post Internal Note' : 'Send to Client'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Select a conversation thread to view.
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="New Practice Conversation"
          subtitle="Start a client message thread or record an internal account review memo."
          maxWidth="md"
        >
          <form onSubmit={handleCreateNewThread} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Target Client *</label>
              <select
                value={newClientId}
                onChange={e => setNewClientId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="e.g. Missing Q3 Corporate Tax Document Verification"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Initial Message *</label>
              <textarea
                rows={3}
                required
                value={newInitialMsg}
                onChange={e => setNewInitialMsg(e.target.value)}
                placeholder="Write message details..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="internalCheck"
                checked={newIsInternal}
                onChange={e => setNewIsInternal(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
              />
              <label htmlFor="internalCheck" className="text-slate-700 font-semibold cursor-pointer">
                Internal team note (Hidden from client portal)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Start Conversation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
