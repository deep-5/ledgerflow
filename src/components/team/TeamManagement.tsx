import React, { useState } from 'react';
import {
  Shield,
  Users,
  Plus,
  Mail,
  Clock,
  CheckSquare,
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { User, UserRole } from '../../types';

export const TeamManagement: React.FC = () => {
  const { allUsers, clients, tasks, currentUser, addAuditLog } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Accountant');
  const [newUserDept, setNewUserDept] = useState('Client Accounting Services');
  const [newUserHours, setNewUserHours] = useState(40);

  // Selected member for permissions view
  const [selectedMember, setSelectedMember] = useState<User | null>(allUsers[0]);

  const staffMembers = allUsers.filter(u => u.role !== 'Client');

  const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    'Firm Owner': [
      'Full workspace administrator access',
      'Manage billing and firm banking settings',
      'Assign roles and configure permissions',
      'Approve staff timesheets and override entries',
      'Sign off on certified client engagements',
    ],
    Administrator: [
      'Manage staff and client directory',
      'Configure integrations and tax settings',
      'View operational reports and audit logs',
      'Manage document request templates',
    ],
    Manager: [
      'Assign tasks and allocate team workloads',
      'Review and sign off on bookkeeping tasks',
      'Send invoices and record payments',
      'Direct client communication and portal management',
    ],
    Accountant: [
      'Create and update assigned client tasks',
      'Send document requests and verify uploads',
      'Track billable hours and submit timesheets',
      'Post internal notes and client updates',
    ],
    Bookkeeper: [
      'Reconcile bank accounts and credit card feeds',
      'Request supporting expense receipts',
      'Log time on assigned tasks',
      'Perform data entry for review',
    ],
    Reviewer: [
      'Approve or reject uploaded client documents',
      'Conduct pre-flight tax review checkups',
      'Audit timesheet accuracy',
    ],
    Client: [
      'View own portal dashboard only',
      'Upload requested files and replace documents',
      'View and pay firm invoices',
      'Direct message assigned accounting team',
    ],
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addAuditLog(
      'Invited Team Member',
      'Security',
      `Invited ${newUserName} (${newUserEmail}) as ${newUserRole}.`
    );

    setIsAddModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6 w-full max-w-[1750px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main">Team & Staff Workload</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Manage practice personnel, capacity hours, role-based authorization, and client allocations.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Team Member
        </Button>
      </div>

      {/* Team Grid & Permissions Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team Members List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card overflow-hidden">
            <div className="p-5 px-6 border-b border-[#E5EBF0] bg-[#F3F7FA] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202938] tracking-tight">Practice Personnel Directory</h3>
              <span className="text-xs text-[#788596] font-medium">
                {staffMembers.length} active professionals
              </span>
            </div>

            <div className="divide-y divide-[#E5EBF0]">
              {staffMembers.map(member => {
                const isSelected = selectedMember?.id === member.id;
                const assignedTasks = tasks.filter(t => t.assignedStaffId === member.id);
                const openCount = assignedTasks.filter(t => t.status !== 'Completed').length;
                const estimatedHours = assignedTasks
                  .filter(t => t.status !== 'Completed')
                  .reduce((s, t) => s + (t.estimatedHours || 2), 0);
                const capacity = member.weeklyCapacityHours || 40;
                const utilPercent = Math.min(100, Math.round((estimatedHours / capacity) * 100));

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`p-4 px-6 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#D9EFFA] border-l-4 border-[#087EDB]' : 'hover:bg-[#F3F7FA]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#D9EFFA] text-[#087EDB] flex items-center justify-center font-bold text-xs flex-shrink-0 border border-[#BCE3F7] shadow-xs">
                        {member.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs sm:text-sm text-[#202938] truncate tracking-tight">
                            {member.name}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 bg-[#F3F7FA] text-[#202938] border border-[#E5EBF0] rounded-md font-semibold">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#788596] truncate mt-0.5">
                          {member.email} • {member.department}
                        </p>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="w-32 text-right flex-shrink-0">
                      <div className="text-[11px] font-bold text-[#202938]">
                        {openCount} tasks ({utilPercent}%)
                      </div>
                      <div className="w-full h-1.5 bg-[#E5EBF0] rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            utilPercent > 80
                              ? 'bg-rose-500'
                              : utilPercent > 60
                              ? 'bg-[#087EDB]'
                              : 'bg-[#A7F477]'
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Member Details & Role Permissions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedMember ? (
            <div className="bg-white rounded-2xl border border-[#E5EBF0] shadow-card p-6 space-y-5">
              <div className="flex items-center gap-3.5 border-b border-[#E5EBF0] pb-4">
                <div className="w-12 h-12 rounded-xl bg-[#087EDB] text-white flex items-center justify-center font-bold text-sm shadow-xs border border-[#0668B6]">
                  {selectedMember.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#202938] tracking-tight">{selectedMember.name}</h3>
                  <p className="text-xs text-[#087EDB] font-semibold">{selectedMember.role}</p>
                  <p className="text-[11px] text-[#788596]">{selectedMember.email}</p>
                </div>
              </div>

              {/* Weekly Capacity Breakdown */}
              <div className="p-3.5 bg-[#F3F7FA] border border-[#E5EBF0] rounded-xl text-xs space-y-2">
                <span className="font-bold text-[#788596] uppercase tracking-wider text-[10px] block">
                  Capacity & Time Zone
                </span>
                <div className="flex justify-between text-[#788596]">
                  <span>Weekly Target:</span>
                  <strong className="text-[#202938] font-bold">
                    {selectedMember.weeklyCapacityHours || 40} hours / week
                  </strong>
                </div>
                <div className="flex justify-between text-[#788596]">
                  <span>Time Zone:</span>
                  <strong className="text-[#202938] font-semibold">{selectedMember.timeZone}</strong>
                </div>
              </div>

              {/* Permissions Matrix */}
              <div className="space-y-2.5 text-xs">
                <span className="font-bold text-[#788596] uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#087EDB]" />
                  Granted Role Permissions ({selectedMember.role})
                </span>

                <div className="space-y-2 pt-1">
                  {ROLE_PERMISSIONS[selectedMember.role]?.map((perm, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-[#E5EBF0] rounded-xl flex items-start gap-2.5 shadow-subtle"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6605] mt-0.5 flex-shrink-0" />
                      <span className="text-[#202938] font-medium text-[11px] leading-relaxed">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#788596] bg-white rounded-2xl border border-[#E5EBF0] shadow-card">
              Select a team member to view permissions and capacity details.
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Invite Accounting Team Member"
          subtitle="Assign roles, weekly capacity, and departmental access."
          maxWidth="md"
        >
          <form onSubmit={handleAddMemberSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-text-main mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                placeholder="e.g. David Miller"
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                placeholder="david.miller@apexadvisory.com"
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Practice Role</label>
              <select
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg bg-white"
              >
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Bookkeeper">Bookkeeper</option>
                <option value="Reviewer">Reviewer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">Department</label>
              <input
                type="text"
                value={newUserDept}
                onChange={e => setNewUserDept(e.target.value)}
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1">
                Weekly Target Capacity (Hours)
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={newUserHours}
                onChange={e => setNewUserHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-surface-border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
