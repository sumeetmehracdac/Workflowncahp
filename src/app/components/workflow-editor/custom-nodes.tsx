import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Users, User, CheckCircle2 } from 'lucide-react';
import { STAGE_CONFIG } from './mock-data';
import type { RoleNodeData, SwimlaneNodeData, StageId } from './types';
import { useWorkflowContext } from './WorkflowContext';

// ─── Swimlane Node ─────────────────────────────────────────────────────────────
export const SwimlaneNode = memo(({ data }: NodeProps<SwimlaneNodeData>) => {
  const conf = STAGE_CONFIG[data.stage];
  if (!conf) return null;

  return (
    <div
      className="flex h-full"
      style={{
        borderRadius: 14,
        border: `2px solid ${conf.borderColor}`,
        overflow: 'hidden',
        cursor: 'grab',
        boxShadow: `inset 0 2px 8px rgba(0,0,0,0.07), inset 0 1px 3px rgba(0,0,0,0.04)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center gap-1 shrink-0"
        style={{
          width: 110, // Increased from 82 to fit larger labels
          background: `linear-gradient(180deg, ${conf.color} 0%, ${conf.darkColor} 100%)`,
          padding: '12px 10px',
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 38, height: 38, // Slightly larger circle
            backgroundColor: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.28)',
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 900, color: 'white', lineHeight: 1 }}>
            {conf.step}
          </span>
        </div>
        <p className="text-white text-center leading-tight mt-1.5"
          style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>
          {conf.label}
        </p>
        <p className="text-center"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
          {conf.sublabel}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: conf.lightBg }}>
        <p className="select-none pointer-events-none"
          style={{
            fontSize: 12, color: conf.color, opacity: 0.35,
            letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
          }}>
          · · · drag roles here · · ·
        </p>
      </div>
    </div>
  );
});
SwimlaneNode.displayName = 'SwimlaneNode';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const TEAL      = '#008484';
const TEAL_DARK = '#006868';

function getInitials(label: string): string {
  const rolePart = label.split('—')[0]?.trim() ?? label;
  return rolePart.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

const HANDLE_STYLE = {
  width: 10, height: 10,
  border: `2px solid ${TEAL}`,
  backgroundColor: 'white',
  borderRadius: '50%',
};

const AVATAR_R    = 20;   // radius of head circle
const AVATAR_DIAM = AVATAR_R * 2; // 40px

// ─── Role Node — compact org-chart badge ──────────────────────────────────────
export const RoleNode = memo(({ id, data, selected }: NodeProps<RoleNodeData>) => {
  const { isPreviewMode, previewActiveNodeId, previewPastNodeIds } = useWorkflowContext();

  const isPreviewActive = isPreviewMode && previewActiveNodeId === id;
  const isPreviewPast   = isPreviewMode && previewPastNodeIds.has(id);
  const isPreviewFuture = isPreviewMode && !isPreviewActive && !isPreviewPast;

  const label     = (data.label ?? '').trim();
  const initials  = getInitials(label || '?');
  const isGroup   = label.toLowerCase().includes('committee') || label.toLowerCase().includes('council');

  const cardOpacity = isPreviewFuture ? 0.28 : isPreviewPast ? 0.6 : 1;
  const borderColor = isPreviewActive ? '#f27e00' : selected ? TEAL : '#e2e8f0';
  const boxShadow   = isPreviewActive
    ? '0 0 0 4px rgba(242,126,0,0.28), 0 6px 24px rgba(242,126,0,0.22)'
    : selected
    ? `0 0 0 3px ${TEAL}, 0 6px 20px rgba(0,132,132,0.2)`
    : '0 3px 14px rgba(0,0,0,0.10)';

  let avatarBg = `linear-gradient(145deg, ${TEAL}, ${TEAL_DARK})`; // Default
  const labelLower = label.toLowerCase();

  if (labelLower.includes('ncahp')) {
    // Teal (Primary logo color)
    avatarBg = `linear-gradient(145deg, ${TEAL}, ${TEAL_DARK})`;
  } else if (labelLower.includes('state council')) {
    // Amber/Gold (Logo petals)
    avatarBg = 'linear-gradient(145deg, #f59e0b, #d97706)';
  } else if (labelLower.includes('external')) {
    // Red (Logo swoosh)
    avatarBg = 'linear-gradient(145deg, #ef4444, #dc2626)';
  } else if (isGroup) {
    // Purple fallback for generic groups
    avatarBg = 'linear-gradient(145deg, #7c3aed, #5b21b6)';
  }

  // CARD WIDTH: narrower since no "Actual Role" header row
  const CARD_W = 148;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity: cardOpacity,
      transition: 'opacity 0.3s',
      // We do not want fixed width, let pill define width or center it
    }}>

      {/* ── Pill for Role Name (above user icon) ── */}
      <div style={{
        backgroundColor: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: 20,
        padding: '5px 14px',
        boxShadow,
        marginBottom: 6,
        whiteSpace: 'nowrap',
        zIndex: 20,
        position: 'relative', // so shadows show correctly
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: '0.02em' }}>
          {label || 'Select Role'}
        </span>
      </div>

      {/* ── User Icon Container ── */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Pulsing preview ring (around head) */}
        {isPreviewActive && (
          <div style={{
            position: 'absolute', top: -4, left: '50%',
            transform: 'translateX(-50%)',
            width: AVATAR_DIAM + 12, height: AVATAR_DIAM + 12,
            borderRadius: '50%',
            border: '2.5px solid #f27e00',
            animation: 'nodePreviewPulse 1.2s ease-in-out infinite',
            pointerEvents: 'none', zIndex: 0,
          }} />
        )}

        {/* Past checkmark badge */}
        {isPreviewPast && (
          <div style={{
            position: 'absolute', top: -2, right: -4,
            width: 17, height: 17, borderRadius: '50%',
            backgroundColor: '#10b981', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
          }}>
            <CheckCircle2 style={{ width: 10, height: 10, color: 'white' }} />
          </div>
        )}

        {/* Head (Face of User Icon) */}
        <div style={{
          width: AVATAR_DIAM, height: AVATAR_DIAM, borderRadius: '50%',
          background: avatarBg,
          border: `2px solid white`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
          position: 'relative'
        }}>
          {data.roleId ? (
            <span style={{ fontSize: 13, fontWeight: 900, color: 'white', letterSpacing: '0.02em', marginTop: 1 }}>
              {data.roleId}
            </span>
          ) : isGroup ? (
            <Users style={{ width: 18, height: 18, color: 'white' }} />
          ) : initials ? (
            <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{initials}</span>
          ) : (
            <User style={{ width: 18, height: 18, color: 'white' }} />
          )}
        </div>

        {/* Shoulders (Body of User Icon) */}
        <div style={{
          width: AVATAR_DIAM + 28, // e.g. 68px wide body
          height: 28,
          background: avatarBg, // fixed from backgroundColor for gradients
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
          marginTop: -6, // generously overlap with head to form neck area
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          border: `2px solid white`,
          borderBottom: 'none',
          zIndex: 5,
        }} />

        {/* Handles that connect to the User Icon */}
        <Handle type="target" position={Position.Left}   id="tgt-left"   style={{ ...HANDLE_STYLE, left: -5, top: '65%' }} />
        <Handle type="source" position={Position.Bottom} id="src-bottom" style={{ ...HANDLE_STYLE, bottom: -5 }} />
        <Handle type="source" position={Position.Right}  id="src-right"  style={{ ...HANDLE_STYLE, right: -5, top: '65%' }} />
      </div>

      {/* Top Handle connects to the Pill */}
      <Handle type="target" position={Position.Top}    id="tgt-top"    style={{ ...HANDLE_STYLE, top: 0 }} />
    </div>
  );
});
RoleNode.displayName = 'RoleNode';

export const nodeTypes = { swimlaneNode: SwimlaneNode, roleNode: RoleNode };
