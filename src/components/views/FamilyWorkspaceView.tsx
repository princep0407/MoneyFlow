import React, { useState } from 'react';
import { Users, Plus, Shield, Check, Trash2, Mail, UserCheck } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Role } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FamilyWorkspaceView: React.FC = () => {
  const {
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    inviteWorkspaceMember,
    removeWorkspaceMember,
    currentUser,
    allUsers,
    setCurrentUser,
    filteredTransactions,
    currency,
    numberFormat,
  } = useFinance();

  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsType, setNewWsType] = useState<'personal' | 'family'>('family');

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    createWorkspace(newWsName.trim(), newWsType);
    setNewWsName('');
    setIsCreatingWs(false);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteWorkspaceMember(inviteEmail.trim(), inviteName.trim(), inviteRole);
    setInviteEmail('');
    setInviteName('');
    setIsInviting(false);
  };

  // Member-wise spend calculations
  const memberSpending = currentWorkspace.members.map((member) => {
    const totalSpent = filteredTransactions
      .filter((t) => t.createdByUserId === member.userId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = filteredTransactions
      .filter((t) => t.createdByUserId === member.userId && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      member,
      totalSpent,
      totalIncome,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspaces & Family Members
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage multi-user family finances with role-based access control (RBAC)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInviting(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
          <button
            onClick={() => setIsCreatingWs(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Workspace</span>
          </button>
        </div>
      </div>

      {/* Workspace Switcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => switchWorkspace(ws.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              ws.id === currentWorkspace.id
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                {ws.type} Workspace
              </span>
              {ws.id === currentWorkspace.id && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{ws.name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {ws.members.length} registered member(s)
            </p>
          </div>
        ))}
      </div>

      {/* Create Workspace Inline Form */}
      {isCreatingWs && (
        <form
          onSubmit={handleCreateWorkspace}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Create New Workspace
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingWs(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vacation Villa Pool, Patel Family Hub"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Workspace Type
              </label>
              <select
                value={newWsType}
                onChange={(e) => setNewWsType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="family">Family Workspace (Shared)</option>
                <option value="personal">Personal Workspace</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingWs(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg"
            >
              Create Workspace
            </button>
          </div>
        </form>
      )}

      {/* Invite Member Inline Form */}
      {isInviting && (
        <form
          onSubmit={handleInvite}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Invite Member to {currentWorkspace.name}
            </h3>
            <button
              type="button"
              onClick={() => setIsInviting(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Patel"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. priya.patel@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Role & Permissions
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white capitalize"
              >
                <option value="owner">Workspace Owner (Full Control)</option>
                <option value="admin">Workspace Admin (Manage Finances)</option>
                <option value="member">Member (View & Record)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsInviting(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg"
            >
              Send Invitation
            </button>
          </div>
        </form>
      )}

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Workspace Members ({currentWorkspace.members.length})
          </h2>
          <span className="text-xs text-slate-400">
            Permissions apply to current workspace
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Period Expenses</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {memberSpending.map(({ member, totalSpent, totalIncome }) => (
                <tr key={member.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.userId === currentUser.id && (
                            <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {formatDate(member.joinedAt, 'short')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(totalSpent, currency, numberFormat)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {member.userId !== currentUser.id && (
                      <button
                        onClick={() => removeWorkspaceMember(member.userId)}
                        title="Remove member"
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
