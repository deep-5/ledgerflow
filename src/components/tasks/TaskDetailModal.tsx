import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Play,
  StopCircle,
  Check,
  Send,
  Lock,
  Eye,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate, formatTimeAgo } from '../../utils/formatters';
import { TaskStatus, TaskPriority } from '../../types';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    clients,
    allUsers,
    currentUser,
    updateTask,
    updateTaskStatus,
    addTaskComment,
    deleteTask,
    startTimer,
    stopTimer,
    activeTimer,
  } = useApp();

  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(true);
  const [newChecklistText, setNewChecklistText] = useState('');

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const client = clients.find(c => c.id === task.clientId);
  const assignee = allUsers.find(u => u.id === task.assignedStaffId);
  const reviewer = allUsers.find(u => u.id === task.reviewerId);
  const isTimerRunning = activeTimer?.taskId === task.id;

  const handleToggleChecklist = (itemIndex: number) => {
    if (!task.checklist) return;
    const updated = [...task.checklist];
    updated[itemIndex] = { ...updated[itemIndex], completed: !updated[itemIndex].completed };
    updateTask(task.id, { checklist: updated });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const existing = task.checklist || [];
    const updated = [
      ...existing,
      { id: `c-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ];
    updateTask(task.id, { checklist: updated });
    setNewChecklistText('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addTaskComment(task.id, newComment.trim(), isInternalComment);
    setNewComment('');
  };

  return (
    <Modal
      isOpen={!!taskId}
      onClose={onClose}
      title={task.title}
      subtitle={`${client?.company || 'Client'} • Category: ${task.serviceCategory}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-subtle border border-surface-border rounded-xl -mt-2">
          {/* Quick status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">Status:</span>
            <select
              value={task.status}
              onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
              className="px-2.5 py-1 text-xs border border-surface-border rounded-lg bg-white font-medium text-text-main focus:outline-none"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Client">Waiting for Client</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Badge status={task.status} size="sm" />
          </div>

          {/* Timer and approval buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isTimerRunning) stopTimer();
                else startTimer(task.clientId, task.id, `Task: ${task.title}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isTimerRunning
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-text-main border-surface-border hover:bg-brand-50 hover:text-brand-600'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <StopCircle className="w-4 h-4 text-rose-600" />
                  Stop Timer
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-brand-600 fill-current" />
                  Start Timer
                </>
              )}
            </button>

            {task.status !== 'Completed' && (
              <Button
                variant="primary"
                size="sm"
                icon={<Check className="w-3.5 h-3.5" />}
                onClick={() => updateTaskStatus(task.id, 'Completed')}
              >
                Mark Completed
              </Button>
            )}
          </div>
        </div>

        {/* Task Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white p-4 border border-surface-border rounded-xl">
          <div>
            <span className="text-text-secondary font-medium block mb-1">Assigned Staff</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-[10px]">
                {assignee?.name.charAt(0) || 'U'}
              </span>
              <span className="font-semibold text-text-main truncate">
                {assignee?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-text-secondary font-medium block mb-1">QA Reviewer</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                {reviewer?.name.charAt(0) || 'R'}
              </span>
              <span className="font-semibold text-text-main truncate">
                {reviewer?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-text-secondary font-medium block mb-1">Due Date</span>
            <span className="font-semibold text-text-main block">
              {formatDate(task.dueDate)}
            </span>
            <span className="text-[10px] text-text-secondary">
              Started: {formatDate(task.startDate)}
            </span>
          </div>

          <div>
            <span className="text-text-secondary font-medium block mb-1">Hours Logged</span>
            <span className="font-semibold text-text-main block">
              {task.actualHours} hrs / {task.estimatedHours} est.
            </span>
            <span className="text-[10px] text-text-secondary">
              Priority: <strong className="text-text-main">{task.priority}</strong>
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
            Scope & Instructions
          </h4>
          <p className="text-xs text-text-secondary bg-surface-subtle p-3 rounded-lg border border-surface-border leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Actionable Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
              Work Checklist Items
            </h4>
            <span className="text-[11px] text-text-secondary">
              {task.checklist ? task.checklist.filter(c => c.completed).length : 0} of{' '}
              {task.checklist ? task.checklist.length : 0} complete
            </span>
          </div>

          <div className="space-y-1.5">
            {task.checklist &&
              task.checklist.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(index)}
                  className="flex items-center gap-2.5 p-2 bg-white border border-surface-border rounded-lg text-xs hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      item.completed ? 'line-through text-text-secondary' : 'text-text-main font-medium'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}

            <form onSubmit={handleAddChecklistItem} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                placeholder="Add checklist step (e.g. Verify Stripe fee journal entry)..."
                className="flex-1 px-3 py-1.5 text-xs border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Button variant="secondary" size="sm" type="submit">
                Add Step
              </Button>
            </form>
          </div>
        </div>

        {/* Comments & Memos */}
        <div className="space-y-3 pt-2 border-t border-surface-border">
          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
            Discussion & Internal Practice Notes
          </h4>

          {/* Comments stream */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {task.comments.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No notes posted yet.</p>
            ) : (
              task.comments.map(c => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border text-xs ${
                    c.isInternalOnly
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-surface-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-main">{c.authorName}</span>
                      <span className="text-[10px] text-text-secondary">({c.authorRole})</span>
                      {c.isInternalOnly ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          <Lock className="w-2.5 h-2.5" /> Staff Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded">
                          <Eye className="w-2.5 h-2.5" /> Client Visible
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-secondary">
                      {formatTimeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-text-main leading-relaxed">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* New comment input */}
          <form onSubmit={handleAddComment} className="space-y-2 pt-2">
            <textarea
              rows={2}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Post a message or internal technical note..."
              className="w-full px-3 py-2 text-xs border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalComment}
                  onChange={e => setIsInternalComment(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Internal Practice Note (Hidden from client)
                </span>
              </label>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Post Note
              </Button>
            </div>
          </form>
        </div>

        {/* Delete task footer */}
        <div className="pt-2 border-t border-surface-border flex justify-between items-center text-xs">
          <span className="text-text-secondary text-[11px]">
            Created {formatDate(task.createdAt)}
          </span>
          <button
            onClick={() => {
              deleteTask(task.id);
              onClose();
            }}
            className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Task
          </button>
        </div>
      </div>
    </Modal>
  );
};
