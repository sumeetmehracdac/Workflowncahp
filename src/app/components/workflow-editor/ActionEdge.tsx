import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
  type EdgeProps,
  type Edge,
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
function trunc(s: string, n = 25): string {
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
  const { getNodes, setEdges, getEdges } = useReactFlow();
  const { selectedNodeId, selectedEdgeId, isPreviewMode, previewActiveEdgeId, previewPastEdgeIds, openEdgeProperties } =
    useWorkflowContext();

  const [isHovered,   setIsHovered]    = useState(false);

  const action: ActionType = data?.action ?? 'forward';
  const def = ACTION_DEFS[action];
  const ActionIcon = def.Icon;

  // ── Resolve source / target node labels ────────────────────────────────
  const allNodes       = getNodes();
  const srcLabel       = roleOf((allNodes.find(n => n.id === source)?.data as RoleNodeData)?.label ?? '');
  const tgtLabel       = roleOf((allNodes.find(n => n.id === target)?.data as RoleNodeData)?.label ?? '');
  const isSelected     = selected || selectedEdgeId === id;
  const showFromTo     = (isHovered || isSelected) && (srcLabel || tgtLabel);

  // ── Focus / dimming ────────────────────────────────────────────────────
  const isConnectedToSelected =
    (selectedNodeId !== null && (source === selectedNodeId || target === selectedNodeId)) ||
    (selectedEdgeId === id);
  const isFocused = (!selectedNodeId && !selectedEdgeId) || isConnectedToSelected || isSelected;

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

  // ── Sibling Edge Calculation for label offset ──────────────────────────
  const allEdges = getEdges();
  const siblings = allEdges.filter((e: Edge) => e.source === source && e.target === target);
  siblings.sort((a: Edge, b: Edge) => a.id.localeCompare(b.id)); // Stable order
  const siblingIndex = siblings.findIndex((e: Edge) => e.id === id);
  const edgeCount = siblings.length;
  // Space out exactly overlapping pills by 52px each
  const yOffset = edgeCount > 1 ? (siblingIndex - (edgeCount - 1) / 2) * 52 : 0;


  // ── Visual state ────────────────────────────────────────────────────────
  const showFull = true; // Default to full view

  let strokeColor = '#f27e00';
  let strokeWidth = 2;
  let edgeOpacity = 1;

  if (isPreviewMode) {
    strokeColor = isPreviewActive ? '#f27e00' : isPreviewPast ? '#10b981' : '#9ca3af';
    strokeWidth = isPreviewActive ? 3 : 2;
    edgeOpacity = isPreviewFuture ? 0.2 : isPreviewPast ? 0.75 : 1;
  } else {
    edgeOpacity = !isFocused ? 0.12 : isSelected ? 1 : isHovered ? 0.9 : 0.6;
    strokeWidth = isSelected ? 3 : isHovered ? 2.5 : 1.8;
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
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + yOffset}px)`,
              pointerEvents: isPreviewMode ? 'none' : 'all',
              zIndex: isSelected ? 100 : 50,
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
            onClick={e => { e.stopPropagation(); if (openEdgeProperties) openEdgeProperties(id); }}
            className="flex items-center rounded-full shadow-lg transition-all active:scale-95 group"
            style={{
              background: isPreviewPast
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #f27e00, #d96c00)',
              border: isSelected || isPreviewActive ? '2px solid white' : '2px solid rgba(255,255,255,0.5)',
              boxShadow: isSelected || isPreviewActive
                ? '0 0 0 3px rgba(242,126,0,0.45), 0 4px 16px rgba(242,126,0,0.4)'
                : '0 3px 12px rgba(242,126,0,0.35)',
              padding: showFull ? '7px 14px 7px 10px' : '7px 10px',
              gap: showFull ? 6 : 4,
              transition: 'padding 0.15s, gap 0.15s, box-shadow 0.2s',
            }}
          >
            <span className="rounded-full shrink-0" style={{
              width: 8, height: 8,
              backgroundColor: def.color,
              border: '1.5px solid rgba(255,255,255,0.6)',
              display: 'inline-block',
            }} />
            <ActionIcon className="w-4 h-4 text-white shrink-0" />
            {showFull && (
              <div className="flex items-baseline gap-2">
                {data?.actionId && (
                   <span style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em' }}>
                    {data?.actionId}
                   </span>
                )}
                <span className="text-white" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                  {trunc(data?.actionLabel || def.label)}
                </span>
                {!isPreviewMode && (
                  <ChevronDown className="text-white/70 group-hover:text-white transition-colors" style={{ width: 12, height: 12 }} />
                )}
              </div>
            )}
          </button>

          {/* No inline dropdown - using Properties Panel instead */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { actionEdge: ActionEdge };
