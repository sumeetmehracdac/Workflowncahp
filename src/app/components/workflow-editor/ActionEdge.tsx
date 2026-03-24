import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
  type EdgeProps,
} from 'reactflow';
import {
  CheckCircle2,
  XCircle,
  CornerDownLeft,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import type { ActionType, ActionEdgeData, RoleNodeData } from './types';
import { useWorkflowContext } from './WorkflowContext';

// ─── Action Definitions ───────────────────────────────────────────────────────
interface ActionDef {
  label: string;
  Icon: React.ElementType;
  color: string;
}

export const ACTION_DEFS: Record<ActionType, ActionDef> = {
  approve:   { label: 'Approve',   Icon: CheckCircle2,  color: '#10b981' },
  reject:    { label: 'Reject',    Icon: XCircle,       color: '#ef4444' },
  send_back: { label: 'Send Back', Icon: CornerDownLeft, color: '#8b5cf6' },
  return:    { label: 'Return',    Icon: ArrowLeft,     color: '#f59e0b' },
  forward:   { label: 'Forward',   Icon: ArrowRight,    color: '#3b82f6' },
  escalate:  { label: 'Escalate',  Icon: TrendingUp,    color: '#f27e00' },
};

/** Truncate a string to at most n chars */
function trunc(s: string, n = 16): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

/** Get the role-only part of "Role — Council" */
function roleOf(label: string): string {
  const idx = label.indexOf('—');
  return (idx === -1 ? label : label.slice(0, idx)).trim();
}

// ─── Action Edge ──────────────────────────────────────────────────────────────
export function ActionEdge({
  id,
  source,
  target,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  data, markerEnd, selected,
}: EdgeProps<ActionEdgeData>) {
  const { getNodes, setEdges } = useReactFlow();
  const { selectedNodeId, isPreviewMode, previewActiveEdgeId, previewPastEdgeIds } =
    useWorkflowContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovered,   setIsHovered]    = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const action: ActionType = data?.action ?? 'forward';
  const def = ACTION_DEFS[action];
  const ActionIcon = def.Icon;

  // ── Resolve source / target node labels ────────────────────────────────
  const allNodes       = getNodes();
  const srcLabel       = roleOf((allNodes.find(n => n.id === source)?.data as RoleNodeData)?.label ?? '');
  const tgtLabel       = roleOf((allNodes.find(n => n.id === target)?.data as RoleNodeData)?.label ?? '');
  const showFromTo     = (isHovered || selected || showDropdown) && (srcLabel || tgtLabel);

  // ── Focus / dimming ────────────────────────────────────────────────────
  const isConnectedToSelected =
    selectedNodeId !== null && (source === selectedNodeId || target === selectedNodeId);
  const isFocused = !selectedNodeId || isConnectedToSelected;

  // ── Preview state ──────────────────────────────────────────────────────
  const isPreviewActive = isPreviewMode && previewActiveEdgeId === id;
  const isPreviewPast   = isPreviewMode && previewPastEdgeIds.has(id);
  const isPreviewFuture = isPreviewMode && !isPreviewActive && !isPreviewPast;

  // ── Path ───────────────────────────────────────────────────────────────
  const isBackward = sourceY > targetY;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 14,
    offset: isBackward ? 60 : 24,
  });

  const updateAction = useCallback(
    (newAction: ActionType) => {
      setEdges(eds =>
        eds.map(e => e.id === id ? { ...e, data: { ...(e.data ?? {}), action: newAction } } : e)
      );
      setShowDropdown(false);
    },
    [id, setEdges]
  );

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // ── Visual state ────────────────────────────────────────────────────────
  const showFull = selected || isHovered || isPreviewActive;

  let strokeColor = '#f27e00';
  let strokeWidth = 2;
  let edgeOpacity = 1;

  if (isPreviewMode) {
    strokeColor = isPreviewActive ? '#f27e00' : isPreviewPast ? '#10b981' : '#9ca3af';
    strokeWidth = isPreviewActive ? 3 : 2;
    edgeOpacity = isPreviewFuture ? 0.2 : isPreviewPast ? 0.75 : 1;
  } else {
    edgeOpacity = !isFocused ? 0.12 : selected ? 1 : isHovered ? 0.9 : 0.6;
    strokeWidth = selected ? 2.5 : isHovered ? 2 : 1.8;
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth,
          opacity: edgeOpacity,
          transition: 'opacity 0.2s, stroke-width 0.15s, stroke 0.3s',
        }}
      />

      {/* Flowing dash animation on active preview edge */}
      {isPreviewActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="#f27e00"
          strokeWidth={4}
          strokeDasharray="14 9"
          strokeLinecap="round"
          opacity={0.85}
          style={{ animation: 'edgeFlowDash 0.7s linear infinite', pointerEvents: 'none' }}
        />
      )}

      {/* Past edge green overlay */}
      {isPreviewPast && (
        <path
          d={edgePath}
          fill="none"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="6 5"
          strokeLinecap="round"
          opacity={0.5}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Label + tooltip ───────────────────────────────────────── */}
      <EdgeLabelRenderer>
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: isPreviewMode ? 'none' : 'all',
            zIndex: selected ? 100 : 50,
            opacity: isPreviewMode
              ? isPreviewActive ? 1 : isPreviewPast ? 0.6 : 0.15
              : !isFocused ? 0.15 : 1,
            transition: 'opacity 0.2s',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* ── From → To tooltip (appears above pill on hover/select) ── */}
          {!isPreviewMode && showFromTo && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 7px)',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(17,24,39,0.88)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '4px 9px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                animation: 'fadeInTooltip 0.15s ease-out forwards',
                pointerEvents: 'none',
              }}
            >
              {srcLabel && (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  {trunc(srcLabel, 14)}
                </span>
              )}
              <ArrowRight style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              {tgtLabel && (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  {trunc(tgtLabel, 14)}
                </span>
              )}
            </div>
          )}

          {/* ── Action pill ────────────────────────────────────────────── */}
          <button
            onClick={e => { e.stopPropagation(); if (!isPreviewMode) setShowDropdown(v => !v); }}
            className="flex items-center rounded-full shadow-lg transition-all active:scale-95"
            style={{
              background: isPreviewPast
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #f27e00, #d96c00)',
              border: selected || isPreviewActive ? '2px solid white' : '2px solid rgba(255,255,255,0.5)',
              boxShadow: selected || isPreviewActive
                ? '0 0 0 3px rgba(242,126,0,0.45), 0 4px 16px rgba(242,126,0,0.4)'
                : '0 3px 12px rgba(242,126,0,0.35)',
              padding: showFull ? '5px 11px 5px 7px' : '5px 7px',
              gap: showFull ? 5 : 3,
              transition: 'padding 0.15s, gap 0.15s, box-shadow 0.2s',
            }}
          >
            <span className="rounded-full shrink-0" style={{
              width: 7, height: 7,
              backgroundColor: def.color,
              border: '1.5px solid rgba(255,255,255,0.5)',
              display: 'inline-block',
            }} />
            <ActionIcon className="w-3 h-3 text-white shrink-0" />
            {showFull && (
              <>
                <span className="text-white" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>
                  {def.label}
                </span>
                {!isPreviewMode && (
                  <ChevronDown className="text-white/70" style={{ width: 10, height: 10 }} />
                )}
              </>
            )}
          </button>

          {/* ── Action picker dropdown ─────────────────────────────────── */}
          {showDropdown && !isPreviewMode && (
            <div className="absolute bg-white rounded-2xl overflow-hidden" style={{
              top: '110%', left: '50%', transform: 'translateX(-50%)',
              minWidth: 185,
              boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
              border: '1px solid #e5e7eb',
              zIndex: 200,
            }}>
              {/* From → To inside the dropdown header */}
              {(srcLabel || tgtLabel) && (
                <div style={{
                  padding: '8px 12px 6px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex', alignItems: 'center', gap: 5,
                  backgroundColor: '#fafafa',
                }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#374151' }}>{trunc(srcLabel, 14)}</span>
                  <ArrowRight style={{ width: 9, height: 9, color: '#9ca3af', flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#374151' }}>{trunc(tgtLabel, 14)}</span>
                </div>
              )}
              <div className="px-3 pt-2 pb-1"
                style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>
                Select Action
              </div>
              {(Object.entries(ACTION_DEFS) as [ActionType, ActionDef][]).map(([key, d]) => {
                const Icon = d.Icon;
                const isActive = key === action;
                return (
                  <button
                    key={key}
                    onClick={e => { e.stopPropagation(); updateAction(key); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors"
                    style={{
                      backgroundColor: isActive ? '#fff7ed' : 'transparent',
                      borderLeft: isActive ? '3px solid #f27e00' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <span className="rounded-full shrink-0" style={{ width: 8, height: 8, backgroundColor: d.color, display: 'inline-block' }} />
                    <Icon style={{ width: 13, height: 13, color: d.color }} className="shrink-0" />
                    <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? '#f27e00' : '#374151' }}>
                      {d.label}
                    </span>
                    {isActive && <CheckCircle2 className="ml-auto shrink-0" style={{ width: 12, height: 12, color: '#f27e00' }} />}
                  </button>
                );
              })}
              <div style={{ height: 4 }} />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { actionEdge: ActionEdge };
