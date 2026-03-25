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
          width: 82,
          background: `linear-gradient(180deg, ${conf.color} 0%, ${conf.darkColor} 100%)`,
          padding: '12px 8px',
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 34, height: 34,
            backgroundColor: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.28)',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 900, color: 'white', lineHeight: 1 }}>
            {conf.step}
          </span>
        </div>
        <p className="text-white text-center leading-tight mt-1.5"
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.02em' }}>
          {conf.label}
        </p>
        <p className="text-center"
          style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {conf.sublabel}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: conf.lightBg }}>
        <p className="select-none pointer-events-none"
          style={{
            fontSize: 10, color: conf.color, opacity: 0.28,
            letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
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

const AVATAR_R    = 24;   // radius of circle
const AVATAR_DIAM = AVATAR_R * 2;

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

  const avatarBg = isGroup
    ? 'linear-gradient(145deg, #7c3aed, #5b21b6)'
    : `linear-gradient(145deg, ${TEAL}, ${TEAL_DARK})`;

  // CARD WIDTH: narrower since no "Actual Role" header row
  const CARD_W = 148;

  return (
    <div style={{
      position: 'relative',
      width: CARD_W,
      paddingTop: AVATAR_R,      // half-circle protrudes above card top
      opacity: cardOpacity,
      transition: 'opacity 0.3s',
    }}>

      {/* Pulsing preview ring */}
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
          position: 'absolute', top: 2, right: 0,
          width: 17, height: 17, borderRadius: '50%',
          backgroundColor: '#10b981', border: '2px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
        }}>
          <CheckCircle2 style={{ width: 10, height: 10, color: 'white' }} />
        </div>
      )}

      {/* Avatar circle (half above card) */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: AVATAR_DIAM, height: AVATAR_DIAM, borderRadius: '50%',
        background: avatarBg,
        border: '2.5px solid white',
        boxShadow: '0 3px 10px rgba(0,0,0,0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
      }}>
        {isGroup
          ? <Users style={{ width: 18, height: 18, color: 'white' }} />
          : initials
          ? <span style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{initials}</span>
          : <User style={{ width: 18, height: 18, color: 'white' }} />}
      </div>

      {/* Name plate — compact, no header row */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        border: `2px solid ${borderColor}`,
        boxShadow,
        paddingTop: AVATAR_R + 5,
        paddingBottom: 9,
        paddingLeft: 9,
        paddingRight: 9,
        textAlign: 'center',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
        zIndex: 5,
      }}>
            <div className="flex flex-row items-center justify-center gap-1.5 flex-wrap">
              <p style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#111827',
                lineHeight: 1.3,
                /* show the full combined label, e.g. "CLERK — NCAHP" */
                wordBreak: 'break-word',
              }}>
                {label}
              </p>
              {data.roleId && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'white',
                  backgroundColor: borderColor,
                  padding: '2px 6px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}>
                  ID: {data.roleId}
                </span>
              )}
            </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top}    id="tgt-top"    style={{ ...HANDLE_STYLE, top: 0 }} />
      <Handle type="target" position={Position.Left}   id="tgt-left"   style={{ ...HANDLE_STYLE, left: -5, top: '60%' }} />
      <Handle type="source" position={Position.Bottom} id="src-bottom" style={{ ...HANDLE_STYLE, bottom: -5 }} />
      <Handle type="source" position={Position.Right}  id="src-right"  style={{ ...HANDLE_STYLE, right: -5, top: '60%' }} />
    </div>
  );
});
RoleNode.displayName = 'RoleNode';

export const nodeTypes = { swimlaneNode: SwimlaneNode, roleNode: RoleNode };
