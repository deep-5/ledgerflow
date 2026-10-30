import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Users,
  CheckSquare,
  FileCheck,
  Receipt,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { useApp, ActiveView } from '../../context/AppContext';
import { authorize } from '../../server/auth/authorize';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    clients,
    tasks,
    documentRequests,
    invoices,
    messages,
    currentUser,
    setCurrentView,
    setSelectedTaskId,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K or Ctrl+K to open, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search items respecting user permissions
  const results = useMemo(() => {
    if (!query.trim()) {
      return [
        {
          id: 'nav-dashboard',
          category: 'Navigation',
          title: 'Go to Dashboard Home',
          subtitle: 'Operational practice overview',
          icon: <Sparkles className="w-4 h-4 text-brand-600" />,
          action: () => {
            setCurrentView('dashboard');
            onClose();
          },
        },
        {
          id: 'nav-clients',
          category: 'Navigation',
          title: 'Open Client Directory',
          subtitle: 'Manage client accounts and contacts',
          icon: <Users className="w-4 h-4 text-blue-600" />,
          action: () => {
            setCurrentView('clients');
            onClose();
          },
        },
        {
          id: 'nav-tasks',
          category: 'Navigation',
          title: 'Work & Tasks Kanban',
          subtitle: 'Track work status and deadlines',
          icon: <CheckSquare className="w-4 h-4 text-amber-600" />,
          action: () => {
            setCurrentView('tasks');
            onClose();
          },
        },
        {
          id: 'nav-docs',
          category: 'Navigation',
          title: 'Document Requests',
          subtitle: 'Review client file submissions',
          icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
          action: () => {
            setCurrentView('documents');
            onClose();
          },
        },
      ];
    }

    const q = query.toLowerCase();
    const list: Array<{
      id: string;
      category: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      action: () => void;
    }> = [];

    // 1. Clients
    clients.forEach(c => {
      const auth = authorize(
        {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          workspaceId: 'ws-main',
          permittedClientIds: currentUser.permittedClientIds,
        },
        'client:view',
        { clientId: c.id }
      );

      if (auth.authorized && (c.company.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))) {
        list.push({
          id: `client-${c.id}`,
          category: 'Clients',
          title: c.company,
          subtitle: `${c.clientType} • ${c.name} (${c.email})`,
          icon: <Users className="w-4 h-4 text-blue-600" />,
          action: () => {
            setCurrentView('clients');
            onClose();
          },
        });
      }
    });

    // 2. Tasks
    tasks.forEach(t => {
      const client = clients.find(c => c.id === t.clientId);
      const auth = authorize(
        {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          workspaceId: 'ws-main',
          permittedClientIds: currentUser.permittedClientIds,
        },
        'task:view',
        { clientId: t.clientId }
      );

      if (auth.authorized && (t.title.toLowerCase().includes(q) || (client && client.company.toLowerCase().includes(q)))) {
        list.push({
          id: `task-${t.id}`,
          category: 'Tasks',
          title: t.title,
          subtitle: `${client?.company || 'Client'} • Status: ${t.status} • Priority: ${t.priority}`,
          icon: <CheckSquare className="w-4 h-4 text-amber-600" />,
          action: () => {
            setSelectedTaskId(t.id);
            setCurrentView('tasks');
            onClose();
          },
        });
      }
    });

    // 3. Document Requests
    documentRequests.forEach(req => {
      const client = clients.find(c => c.id === req.clientId);
      const auth = authorize(
        {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          workspaceId: 'ws-main',
          permittedClientIds: currentUser.permittedClientIds,
        },
        'doc_request:view',
        { clientId: req.clientId }
      );

      if (auth.authorized && (req.title.toLowerCase().includes(q) || (client && client.company.toLowerCase().includes(q)))) {
        list.push({
          id: `req-${req.id}`,
          category: 'Document Requests',
          title: req.title,
          subtitle: `${client?.company || 'Client'} • ${req.status} • Due ${req.dueDate}`,
          icon: <FileCheck className="w-4 h-4 text-emerald-600" />,
          action: () => {
            setCurrentView('documents');
            onClose();
          },
        });
      }
    });

    // 4. Invoices
    if (currentUser.role !== 'Client') {
      invoices.forEach(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        if (inv.invoiceNumber.toLowerCase().includes(q) || (client && client.company.toLowerCase().includes(q))) {
          list.push({
            id: `inv-${inv.id}`,
            category: 'Invoices',
            title: `${inv.invoiceNumber} — ${client?.company || 'Client'}`,
            subtitle: `Total: $${inv.total.toFixed(2)} • Status: ${inv.status}`,
            icon: <Receipt className="w-4 h-4 text-purple-600" />,
            action: () => {
              setCurrentView('invoices');
              onClose();
            },
          });
        }
      });
    }

    // 5. Messages
    messages.forEach(msg => {
      if (msg.subject.toLowerCase().includes(q) || msg.clientName.toLowerCase().includes(q)) {
        list.push({
          id: `msg-${msg.id}`,
          category: 'Messages',
          title: msg.subject,
          subtitle: `${msg.clientName} • ${msg.messages.length} replies`,
          icon: <MessageSquare className="w-4 h-4 text-teal-600" />,
          action: () => {
            setCurrentView('messages');
            onClose();
          },
        });
      }
    });

    return list.slice(0, 10);
  }, [query, clients, tasks, documentRequests, invoices, messages, currentUser, setCurrentView, setSelectedTaskId, onClose]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-modal border border-slate-200/90 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search clients, tasks, requests, invoices..."
            className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all ${
                    isSelected ? 'bg-brand-50/80 text-brand-900 border border-brand-200/60' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{item.title}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-300'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
