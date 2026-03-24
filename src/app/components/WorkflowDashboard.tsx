import React, { useState } from 'react';
import {
  Plus, Search, GitBranch, Clock, CheckCircle2, Archive,
  ArrowRight, LayoutGrid, List, Copy, Trash2, Edit3,
  Activity, Users, TrendingUp, MoreVertical, Eye,
} from 'lucide-react';
import { sampleWorkflows, FORM_TYPES, STAGE_CONFIG } from './workflow-editor/mock-data';
import type { WorkflowDefinition } from './workflow-editor/types';
import type { StageId } from './workflow-editor/types';

interface WorkflowDashboardProps {
  onOpenWorkflow: (workflow: WorkflowDefinition) => void;
  onCreateNew: () => void;
}

const statusConfig = {
  draft: {
    bg: '#fef3c7',
    text: '#d97706',
    icon: <Edit3 className="w-3 h-3" />,
    dot: '#f59e0b',
  },
  published: {
    bg: '#d1fae5',
    text: '#065f46',
    icon: <CheckCircle2 className="w-3 h-3" />,
    dot: '#10b981',
  },
  archived: {
    bg: '#f3f4f6',
    text: '#6b7280',
    icon: <Archive className="w-3 h-3" />,
    dot: '#9ca3af',
  },
};

// ─── Mini workflow preview SVG ─────────────────────────────────────────────────
function WorkflowPreview({ workflow }: { workflow: WorkflowDefinition }) {
  const hasNodes = workflow.nodes.length > 0;

  if (!hasNodes) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,132,132,0.08)' }}
          >
            <GitBranch className="w-5 h-5" style={{ color: '#008484', opacity: 0.4 }} />
          </div>
          <p className="text-gray-300" style={{ fontSize: 11 }}>
            No stages configured
          </p>
        </div>
      </div>
    );
  }

  // Build a mini preview showing stage distribution
  const stageIds: StageId[] = ['submission', 'validation', 'evaluation1', 'evaluation2'];
  const roleCounts = stageIds.map((s) =>
    workflow.nodes.filter((n) => (n.data as { stage: StageId }).stage === s).length
  );

  return (
    <div className="h-full flex flex-col justify-center px-4 gap-2">
      <div className="flex items-center gap-1.5">
        {stageIds.map((s, i) => {
          const conf = STAGE_CONFIG[s];
          const count = roleCounts[i];
          return (
            <React.Fragment key={s}>
              <div
                className="flex-1 flex flex-col items-center gap-1 rounded-lg py-2"
                style={{ backgroundColor: conf.lightBg }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: conf.color }}
                >
                  <span className="text-white" style={{ fontSize: 9, fontWeight: 800 }}>
                    {conf.step}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: conf.color }}>
                  {count}
                </span>
              </div>
              {i < stageIds.length - 1 && (
                <ArrowRight
                  className="shrink-0"
                  style={{ width: 10, height: 10, color: '#d1d5db' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-center text-gray-400" style={{ fontSize: 9 }}>
        {workflow.nodes.length} role{workflow.nodes.length !== 1 ? 's' : ''} ·{' '}
        {workflow.edges.length} connection{workflow.edges.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  trend,
  accentColor,
  accentBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  accentColor: string;
  accentBg: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
      style={{ border: '1px solid #f3f4f6' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: accentBg }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        {trend && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ fontSize: 11, fontWeight: 600, backgroundColor: '#d1fae5', color: '#065f46' }}
          >
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-900 mt-3" style={{ fontSize: 28, fontWeight: 800 }}>
        {value}
      </p>
      <p className="text-gray-400 mt-0.5" style={{ fontSize: 13 }}>
        {label}
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function WorkflowDashboard({
  onOpenWorkflow,
  onCreateNew,
}: WorkflowDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = sampleWorkflows.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const published = sampleWorkflows.filter((w) => w.status === 'published').length;
  const drafts = sampleWorkflows.filter((w) => w.status === 'draft').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* ── Hero header ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #008484 0%, #005f5f 50%, #003f3f 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-0 right-0 rounded-full"
          style={{
            width: 380,
            height: 380,
            background: 'rgba(255,255,255,0.04)',
            transform: 'translate(30%, -40%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 rounded-full"
          style={{
            width: 240,
            height: 240,
            background: 'rgba(255,255,255,0.04)',
            transform: 'translate(-30%, 40%)',
          }}
        />
        {/* Orange accent line */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 3, background: 'linear-gradient(90deg, #f27e00, #ffa040, #f27e00)' }}
        />

        <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="text-white"
                    style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}
                  >
                    Workflow Studio
                  </p>
                  <p className="text-white/50" style={{ fontSize: 11 }}>
                    NCAHP · Visual Workflow Builder
                  </p>
                </div>
              </div>
              <p className="text-white/70" style={{ fontSize: 14, maxWidth: 520 }}>
                Design approval workflows visually. Assign roles, connect stages, and embed
                actions directly on transition arrows — no coding required.
              </p>

              {/* Stage chips */}
              <div className="flex items-center gap-2 mt-5">
                {(Object.keys(STAGE_CONFIG) as StageId[]).map((s) => {
                  const conf = STAGE_CONFIG[s];
                  return (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        className="rounded-full"
                        style={{ width: 6, height: 6, backgroundColor: conf.color, display: 'inline-block' }}
                      />
                      {conf.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl transition-all hover:shadow-xl active:scale-95"
              style={{
                backgroundColor: 'white',
                color: '#008484',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              <Plus className="w-5 h-5" />
              New Workflow
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mt-8 -mb-14 relative z-10">
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Total Workflows"
              value={String(sampleWorkflows.length)}
              trend="+2 this month"
              accentColor="#008484"
              accentBg="rgba(0,132,132,0.1)"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Published"
              value={String(published)}
              accentColor="#059669"
              accentBg="#d1fae5"
            />
            <StatCard
              icon={<Edit3 className="w-5 h-5" />}
              label="Drafts"
              value={String(drafts)}
              accentColor="#d97706"
              accentBg="#fef3c7"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Form Types"
              value={String(FORM_TYPES.length)}
              trend="100%"
              accentColor="#3b82f6"
              accentBg="#dbeafe"
            />
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-14">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl outline-none transition-all"
                style={{
                  border: '1px solid #e5e7eb',
                  fontSize: 13,
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#008484';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,132,132,0.1)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'published', 'draft', 'archived'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3.5 py-2 rounded-xl transition-all"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: statusFilter === s ? '#008484' : 'white',
                  color: statusFilter === s ? 'white' : '#6b7280',
                  border: statusFilter === s ? '1px solid #008484' : '1px solid #e5e7eb',
                }}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="w-px h-8 bg-gray-200 mx-1" />
            <div
              className="flex overflow-hidden rounded-xl"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className="p-2.5 transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? '#008484' : 'white',
                  color: viewMode === 'grid' ? 'white' : '#9ca3af',
                }}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2.5 transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? '#008484' : 'white',
                  color: viewMode === 'list' ? 'white' : '#9ca3af',
                }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid view */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((workflow) => {
              const sc = statusConfig[workflow.status];
              return (
                <div
                  key={workflow.id}
                  onClick={() => onOpenWorkflow(workflow)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer group relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ border: '1px solid #f3f4f6' }}
                >
                  {/* Preview area */}
                  <div
                    className="h-32 relative overflow-hidden"
                    style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}
                  >
                    <WorkflowPreview workflow={workflow} />

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: sc.bg,
                          color: sc.text,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {sc.icon}
                        {workflow.status}
                      </span>
                    </div>

                    {/* Version */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className="px-2 py-0.5 rounded-full bg-white"
                        style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', border: '1px solid #e5e7eb' }}
                      >
                        v{workflow.version}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className="text-gray-900 mb-1 line-clamp-1"
                      style={{ fontSize: 15, fontWeight: 700 }}
                    >
                      {workflow.name}
                    </h3>
                    <p className="text-gray-400 line-clamp-2 mb-4" style={{ fontSize: 12 }}>
                      {workflow.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400" style={{ fontSize: 11 }}>
                        <Clock className="w-3 h-3" />
                        <span>{workflow.updatedAt}</span>
                      </div>
                      <div
                        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                        style={{ fontSize: 12, fontWeight: 700, color: '#008484' }}
                      >
                        Open
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Context menu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === workflow.id ? null : workflow.id);
                    }}
                    className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {openMenu === workflow.id && (
                    <div
                      className="absolute top-12 left-3 bg-white rounded-xl py-1 z-20"
                      style={{ minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: 12 }}>
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors" style={{ fontSize: 12 }}>
                        <Copy className="w-3.5 h-3.5" /> Clone
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors" style={{ fontSize: 12 }}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Create card */}
            <button
              onClick={onCreateNew}
              className="bg-white rounded-2xl flex flex-col items-center justify-center min-h-[280px] group transition-all duration-300 hover:shadow-lg"
              style={{
                border: '2px dashed #e5e7eb',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#008484')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb')
              }
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: '#f3f4f6' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(0,132,132,0.1)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6')
                }
              >
                <Plus className="w-7 h-7 text-gray-400 group-hover:text-[#008484] transition-colors" />
              </div>
              <p
                className="text-gray-400 group-hover:text-[#008484] transition-colors"
                style={{ fontSize: 14, fontWeight: 700 }}
              >
                Create New Workflow
              </p>
              <p className="text-gray-300 mt-1" style={{ fontSize: 12 }}>
                Start from scratch
              </p>
            </button>
          </div>
        ) : (
          /* List view */
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #f3f4f6' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Workflow', 'Form Type', 'Roles', 'Status', 'Version', 'Updated', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-gray-400 uppercase tracking-wider"
                        style={{ fontSize: 10, fontWeight: 700 }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((workflow) => {
                  const sc = statusConfig[workflow.status];
                  return (
                    <tr
                      key={workflow.id}
                      onClick={() => onOpenWorkflow(workflow)}
                      className="cursor-pointer group transition-colors"
                      style={{ borderBottom: '1px solid #f9fafb' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.backgroundColor = '')
                      }
                    >
                      <td className="px-5 py-4">
                        <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 600 }}>
                          {workflow.name}
                        </p>
                        <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: 11 }}>
                          {workflow.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-600" style={{ fontSize: 13 }}>
                        {workflow.formType}
                      </td>
                      <td className="px-5 py-4 text-gray-600" style={{ fontSize: 13 }}>
                        {workflow.nodes.length}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="flex items-center gap-1 w-fit px-2.5 py-1 rounded-full"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            backgroundColor: sc.bg,
                            color: sc.text,
                            textTransform: 'uppercase',
                          }}
                        >
                          {sc.icon}
                          {workflow.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400" style={{ fontSize: 13 }}>
                        v{workflow.version}
                      </td>
                      <td className="px-5 py-4 text-gray-400" style={{ fontSize: 12 }}>
                        {workflow.updatedAt}
                      </td>
                      <td className="px-5 py-4">
                        <ArrowRight
                          className="w-4 h-4 text-gray-200 group-hover:text-[#008484] transition-colors"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
