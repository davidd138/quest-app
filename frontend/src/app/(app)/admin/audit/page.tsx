'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  LogIn,
  Play,
  Trophy,
  MessageSquare,
  FileDown,
  Trash2,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { AdminGuard } from '@/components/layout/AdminGuard';
import Card from '@/components/ui/Card';

// ---------- Types ----------

interface AuditEvent {
  id: string;
  actorUserId: string;
  actorName?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  details?: Record<string, unknown>;
}

type AuditAction =
  | 'login'
  | 'quest_start'
  | 'quest_complete'
  | 'conversation_start'
  | 'data_export'
  | 'account_delete'
  | 'admin_action';

// ---------- Mock Data ----------

const MOCK_EVENTS: AuditEvent[] = [
  { id: 'evt-001', actorUserId: 'u-001', actorName: 'Ana Garcia', action: 'login', resourceType: 'session', resourceId: 'sess-abc', timestamp: '2026-03-15T10:30:00Z', ipAddress: '84.120.5.12' },
  { id: 'evt-002', actorUserId: 'u-002', actorName: 'Carlos Lopez', action: 'quest_start', resourceType: 'quest', resourceId: 'q-001', timestamp: '2026-03-15T10:25:00Z', ipAddress: '91.205.3.44', details: { questTitle: 'Madrid Tapas Hunt' } },
  { id: 'evt-003', actorUserId: 'u-001', actorName: 'Ana Garcia', action: 'conversation_start', resourceType: 'conversation', resourceId: 'conv-001', timestamp: '2026-03-15T10:20:00Z', ipAddress: '84.120.5.12', details: { characterName: 'Carlos', stageTitle: 'Plaza Mayor' } },
  { id: 'evt-004', actorUserId: 'u-003', actorName: 'Maria Fernandez', action: 'quest_complete', resourceType: 'quest', resourceId: 'q-002', timestamp: '2026-03-15T09:45:00Z', ipAddress: '78.31.22.100', details: { questTitle: 'Gothic Barcelona', totalPoints: 350 } },
  { id: 'evt-005', actorUserId: 'u-004', actorName: 'Pedro Martinez', action: 'data_export', resourceType: 'user', resourceId: 'u-004', timestamp: '2026-03-14T18:00:00Z', ipAddress: '95.12.44.7' },
  { id: 'evt-006', actorUserId: 'admin-001', actorName: 'Admin User', action: 'admin_action', resourceType: 'user', resourceId: 'u-005', timestamp: '2026-03-14T16:30:00Z', ipAddress: '10.0.0.1', details: { action: 'suspend_user', reason: 'Policy violation' } },
  { id: 'evt-007', actorUserId: 'u-005', actorName: 'Laura Ruiz', action: 'account_delete', resourceType: 'user', resourceId: 'u-005', timestamp: '2026-03-14T15:00:00Z', ipAddress: '62.78.33.90' },
  { id: 'evt-008', actorUserId: 'u-002', actorName: 'Carlos Lopez', action: 'quest_complete', resourceType: 'quest', resourceId: 'q-001', timestamp: '2026-03-14T14:30:00Z', ipAddress: '91.205.3.44', details: { questTitle: 'Madrid Tapas Hunt', totalPoints: 500 } },
  { id: 'evt-009', actorUserId: 'u-006', actorName: 'Sofia Navarro', action: 'login', resourceType: 'session', resourceId: 'sess-def', timestamp: '2026-03-14T12:00:00Z', ipAddress: '88.7.123.55' },
  { id: 'evt-010', actorUserId: 'u-001', actorName: 'Ana Garcia', action: 'quest_start', resourceType: 'quest', resourceId: 'q-003', timestamp: '2026-03-14T11:00:00Z', ipAddress: '84.120.5.12', details: { questTitle: 'Retiro Park Treasures' } },
  { id: 'evt-011', actorUserId: 'admin-001', actorName: 'Admin User', action: 'admin_action', resourceType: 'quest', resourceId: 'q-004', timestamp: '2026-03-14T10:00:00Z', ipAddress: '10.0.0.1', details: { action: 'publish_quest', questTitle: 'Seville Flamenco Trail' } },
  { id: 'evt-012', actorUserId: 'u-003', actorName: 'Maria Fernandez', action: 'conversation_start', resourceType: 'conversation', resourceId: 'conv-002', timestamp: '2026-03-13T17:00:00Z', ipAddress: '78.31.22.100', details: { characterName: 'Maria', stageTitle: 'El Retiro' } },
];

const ACTION_CONFIG: Record<AuditAction, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  login: { label: 'Login', icon: LogIn, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  quest_start: { label: 'Quest Start', icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  quest_complete: { label: 'Quest Complete', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  conversation_start: { label: 'Conversation', icon: MessageSquare, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  data_export: { label: 'Data Export', icon: FileDown, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  account_delete: { label: 'Account Delete', icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  admin_action: { label: 'Admin Action', icon: Settings, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

const ALL_ACTIONS: AuditAction[] = ['login', 'quest_start', 'quest_complete', 'conversation_start', 'data_export', 'account_delete', 'admin_action'];
const PAGE_SIZE = 8;

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.05 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// ---------- Component ----------

export default function AuditLogPage() {
  const [events] = useState<AuditEvent[]>(MOCK_EVENTS);
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (actionFilter !== 'all' && evt.action !== actionFilter) return false;
      if (userSearch && !evt.actorName?.toLowerCase().includes(userSearch.toLowerCase()) && !evt.actorUserId.toLowerCase().includes(userSearch.toLowerCase())) return false;
      if (resourceSearch && !evt.resourceId.toLowerCase().includes(resourceSearch.toLowerCase())) return false;
      if (startDate && evt.timestamp < new Date(startDate).toISOString()) return false;
      if (endDate && evt.timestamp > new Date(endDate + 'T23:59:59Z').toISOString()) return false;
      return true;
    });
  }, [events, actionFilter, userSearch, resourceSearch, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pagedEvents = filteredEvents.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleExportCSV = useCallback(() => {
    const header = 'Timestamp,User,Action,Resource Type,Resource ID,IP Address,Details\n';
    const rows = filteredEvents.map((evt) =>
      [
        evt.timestamp,
        evt.actorName || evt.actorUserId,
        evt.action,
        evt.resourceType,
        evt.resourceId,
        evt.ipAddress,
        evt.details ? JSON.stringify(evt.details) : '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredEvents]);

  return (
    <AdminGuard>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="p-4 md:p-8 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Shield size={28} className="text-violet-400" />
              Audit Log
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              GDPR-compliant activity trail for all platform events
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setActionFilter('all'); setUserSearch(''); setResourceSearch(''); setStartDate(''); setEndDate(''); setCurrentPage(0); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw size={14} />
              Reset
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-all"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card variant="elevated" padding="none" className="mb-6">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2.5">
              <Filter size={16} className="text-violet-400" />
              <h3 className="font-heading font-semibold text-white text-sm">Filters</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action type */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Action Type</label>
                <select
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value as AuditAction | 'all'); setCurrentPage(0); }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Actions</option>
                  {ALL_ACTIONS.map((a) => (
                    <option key={a} value={a} className="bg-slate-900">{ACTION_CONFIG[a].label}</option>
                  ))}
                </select>
              </div>

              {/* User search */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">User</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={userSearch}
                    onChange={(e) => { setUserSearch(e.target.value); setCurrentPage(0); }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Date range */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">From</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">To</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Resource ID search */}
            <div className="px-5 pb-5">
              <label className="text-xs font-medium text-slate-400 mb-1 block">Resource ID</label>
              <div className="relative max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by resource ID..."
                  value={resourceSearch}
                  onChange={(e) => { setResourceSearch(e.target.value); setCurrentPage(0); }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder:text-slate-600"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results count */}
        <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </motion.div>

        {/* Events table */}
        <motion.div variants={itemVariants}>
          <Card variant="elevated" padding="none" className="overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/10 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-2">Resource</div>
              <div className="col-span-2">Resource ID</div>
              <div className="col-span-1">IP</div>
              <div className="col-span-1" />
            </div>

            {/* Rows */}
            {pagedEvents.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Activity size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No events match the current filters.</p>
              </div>
            ) : (
              pagedEvents.map((evt) => {
                const cfg = ACTION_CONFIG[evt.action];
                const Icon = cfg.icon;
                const isExpanded = expandedId === evt.id;

                return (
                  <div key={evt.id} className="border-b border-white/5 last:border-b-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                      className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Timestamp */}
                      <div className="md:col-span-2 text-xs text-slate-400">
                        {new Date(evt.timestamp).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>

                      {/* User */}
                      <div className="md:col-span-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs text-slate-400 font-medium">
                          {(evt.actorName || evt.actorUserId)[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-white truncate">{evt.actorName || evt.actorUserId}</span>
                      </div>

                      {/* Action */}
                      <div className="md:col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <Icon size={12} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Resource type */}
                      <div className="md:col-span-2 text-sm text-slate-400 capitalize">
                        {evt.resourceType}
                      </div>

                      {/* Resource ID */}
                      <div className="md:col-span-2 text-xs text-slate-500 font-mono truncate">
                        {evt.resourceId}
                      </div>

                      {/* IP */}
                      <div className="md:col-span-1 text-xs text-slate-500 font-mono">
                        {evt.ipAddress}
                      </div>

                      {/* Expand */}
                      <div className="md:col-span-1 flex items-center justify-end">
                        {evt.details ? (
                          isExpanded ? (
                            <ChevronDown size={14} className="text-slate-500" />
                          ) : (
                            <ChevronRight size={14} className="text-slate-500" />
                          )
                        ) : null}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && evt.details && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-4"
                      >
                        <div className="ml-8 bg-white/[0.02] rounded-xl border border-white/5 p-4">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Details</p>
                          <div className="space-y-1.5">
                            {Object.entries(evt.details).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-3 text-sm">
                                <span className="text-slate-500 min-w-[120px]">{key}:</span>
                                <span className="text-white">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  i === currentPage
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </motion.div>
        )}
      </motion.div>
    </AdminGuard>
  );
}
