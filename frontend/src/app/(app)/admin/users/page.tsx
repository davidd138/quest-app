'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  Search,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  Clock,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import { useQuery, useMutation } from '@/hooks/useGraphQL';
import { LIST_ALL_USERS } from '@/lib/graphql/queries';
import { UPDATE_USER_STATUS } from '@/lib/graphql/mutations';
import Card from '@/components/ui/Card';
import type { User, UserConnection, UserStatus } from '@/types';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const rowVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 8 },
};

const statusConfig: Record<
  UserStatus,
  { label: string; icon: React.ElementType; bgClass: string; textClass: string; borderClass: string }
> = {
  active: {
    label: 'Active',
    icon: UserCheck,
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/20',
  },
  suspended: {
    label: 'Suspended',
    icon: Ban,
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/20',
  },
  expired: {
    label: 'Expired',
    icon: AlertTriangle,
    bgClass: 'bg-slate-500/10',
    textClass: 'text-slate-400',
    borderClass: 'border-slate-500/20',
  },
};

const statusOptions: UserStatus[] = ['active', 'pending', 'suspended', 'expired'];

function AdminUsersContent() {
  const { data: userConnection, loading, execute: fetchUsers } = useQuery<UserConnection>(LIST_ALL_USERS);
  const { execute: updateUserStatus } = useMutation<User>(UPDATE_USER_STATUS);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  useEffect(() => {
    fetchUsers({ limit: 200 });
  }, [fetchUsers]);

  const users = userConnection?.items ?? [];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery ||
        (u.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleStatusChange = useCallback(
    async (userId: string, newStatus: UserStatus) => {
      try {
        await updateUserStatus({ userId, status: newStatus });
        fetchUsers({ limit: 200 });
      } catch {
        // Error handled by hook
      }
    },
    [updateUserStatus, fetchUsers],
  );

  // Counts
  const counts = useMemo(() => {
    const result: Record<string, number> = { total: users.length };
    statusOptions.forEach((s) => {
      result[s] = users.filter((u) => u.status === s).length;
    });
    return result;
  }, [users]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <UsersIcon size={28} className="text-violet-400" />
          User Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage user accounts and permissions
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-heading font-bold text-white">{counts.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        {statusOptions.map((status) => {
          const config = statusConfig[status];
          return (
            <div
              key={status}
              className={`rounded-xl p-3 text-center ${config.bgClass} border ${config.borderClass}`}
            >
              <p className={`text-2xl font-heading font-bold ${config.textClass}`}>
                {counts[status] ?? 0}
              </p>
              <p className="text-xs text-slate-400">{config.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Search and filter */}
      <motion.div variants={itemVariants}>
        <Card padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50 transition-colors min-w-[140px]"
            >
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {statusConfig[s].label}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Users table */}
      <motion.div variants={itemVariants}>
        <Card padding="none" variant="elevated">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                      Role
                    </th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-center text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                      Joined
                    </th>
                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredUsers.map((user) => {
                      const config = statusConfig[user.status];
                      const StatusIcon = config.icon;

                      return (
                        <motion.tr
                          key={user.userId}
                          variants={rowVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-violet-800/30 flex items-center justify-center flex-shrink-0">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name ?? ''}
                                    className="w-full h-full rounded-xl object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-bold text-violet-400">
                                    {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium text-white truncate max-w-[150px]">
                                {user.name ?? 'Unnamed'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Mail size={12} className="text-slate-500 flex-shrink-0" />
                              <span className="text-sm text-slate-300 truncate max-w-[200px]">
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Shield size={12} className="text-slate-500" />
                              <span className="text-sm text-slate-300 capitalize">{user.role}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass} border ${config.borderClass}`}
                            >
                              <StatusIcon size={10} />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Calendar size={12} className="text-slate-500" />
                              <span className="text-xs text-slate-400">
                                {new Date(user.createdAt).toLocaleDateString('en', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end">
                              <select
                                value={user.status}
                                onChange={(e) =>
                                  handleStatusChange(user.userId, e.target.value as UserStatus)
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50 transition-colors min-w-[110px]"
                              >
                                {statusOptions.map((s) => (
                                  <option key={s} value={s} className="bg-navy-900">
                                    {statusConfig[s].label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* User count */}
      <motion.div variants={itemVariants} className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}
