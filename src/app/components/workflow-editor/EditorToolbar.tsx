import React from 'react';
import {
  ZoomIn, ZoomOut, Maximize2, Save, Download,
  Trash2, Lock, Unlock, Play, LayoutGrid, ArrowLeft, GitBranch,
} from 'lucide-react';
import { useReactFlow } from 'reactflow';

interface EditorToolbarProps {
  workflowName: string;
  workflowStatus: 'draft' | 'published' | 'archived';
  isLocked: boolean;
  onToggleLock: () => void;
  onSave: () => void;
  onPublish: () => void;
  onDeleteSelected: () => void;
  onAutoLayout: () => void;
  onExport: () => void;
  onBack: () => void;
  onPreview: () => void;
  hasSelection: boolean;
}

const TEAL = '#008484';

function ToolbarBtn({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}) {
  const variantStyles = {
    default: { color: '#6b7280', hoverBg: '#f3f4f6' },
    primary: { color: TEAL, hoverBg: 'rgba(0,132,132,0.08)' },
    danger: { color: '#ef4444', hoverBg: '#fef2f2' },
  };
  const v = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
      style={{
        color: v.color,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.backgroundColor = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '';
      }}
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-6 bg-gray-200 mx-1 shrink-0" />;
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#fef3c7', text: '#d97706' },
  published: { bg: '#d1fae5', text: '#065f46' },
  archived: { bg: '#f3f4f6', text: '#6b7280' },
};

export default function EditorToolbar(props: EditorToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const ss = statusStyle[props.workflowStatus];

  return (
    <div
      className="h-14 flex items-center justify-between px-4 shrink-0"
      style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}
    >
      {/* ── Left ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={props.onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${TEAL}, #006868)` }}
          >
            <GitBranch className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2
              className="text-gray-800 leading-tight max-w-[280px] truncate"
              style={{ fontSize: 14, fontWeight: 700 }}
            >
              {props.workflowName}
            </h2>
            <span
              className="px-2 py-0.5 rounded-full inline-block"
              style={{
                fontSize: 9,
                fontWeight: 700,
                backgroundColor: ss.bg,
                color: ss.text,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {props.workflowStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ── Center ───────────────────────────────────────────── */}
      <div
        className="flex items-center gap-0.5 rounded-xl px-2 py-1"
        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
      >
        <ToolbarBtn
          icon={<ZoomIn className="w-4 h-4" />}
          label="Zoom In"
          onClick={() => zoomIn()}
        />
        <ToolbarBtn
          icon={<ZoomOut className="w-4 h-4" />}
          label="Zoom Out"
          onClick={() => zoomOut()}
        />
        <ToolbarBtn
          icon={<Maximize2 className="w-4 h-4" />}
          label="Fit View"
          onClick={() => fitView({ padding: 0.15 })}
        />
        <Sep />
        <ToolbarBtn
          icon={<LayoutGrid className="w-4 h-4" />}
          label="Auto-arrange roles in lanes"
          onClick={props.onAutoLayout}
          variant="primary"
        />
        <ToolbarBtn
          icon={<Trash2 className="w-4 h-4" />}
          label="Delete Selected"
          onClick={props.onDeleteSelected}
          disabled={!props.hasSelection}
          variant="danger"
        />
        <Sep />
        <ToolbarBtn
          icon={
            props.isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )
          }
          label={props.isLocked ? 'Unlock Canvas' : 'Lock Canvas'}
          onClick={props.onToggleLock}
        />
      </div>

      {/* ── Right ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <ToolbarBtn
          icon={<Download className="w-4 h-4" />}
          label="Export JSON"
          onClick={props.onExport}
        />
        <div className="h-6 w-px bg-gray-200 mx-1" />
        {/* Preview */}
        <button
          onClick={props.onPreview}
          className="px-4 h-9 rounded-xl flex items-center gap-2 transition-all active:scale-95"
          style={{
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: '#fff7ed',
            color: '#f27e00',
            border: '1.5px solid #fed7aa',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffedd5')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#fff7ed')}
        >
          <Play className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={props.onSave}
          className="px-4 h-9 rounded-xl text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2"
          style={{ fontSize: 13, fontWeight: 600, backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={props.onPublish}
          className="px-4 h-9 rounded-xl text-white flex items-center gap-2 transition-all active:scale-95"
          style={{
            fontSize: 13,
            fontWeight: 600,
            background: `linear-gradient(135deg, #008484, #006868)`,
            boxShadow: `0 2px 8px rgba(0,132,132,0.35)`,
          }}
        >
          <Play className="w-3.5 h-3.5" />
          Publish
        </button>
      </div>
    </div>
  );
}