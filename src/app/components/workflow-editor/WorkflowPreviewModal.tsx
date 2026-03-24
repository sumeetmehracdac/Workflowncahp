import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, StepBack, StepForward,
  X, ArrowRight, GitBranch, Users, User,
} from 'lucide-react';
import { STAGE_CONFIG } from './mock-data';
import { ACTION_DEFS } from './ActionEdge';
import type { StageId, ActionType, RoleNodeData, ActionEdgeData } from './types';
import type { Node, Edge } from 'reactflow';

// ─── Types ────────────────────────────────────────────────────────────────────
type NodeState = 'idle' | 'active' | 'past' | 'future';

type PreviewStep =
  | { type: 'node'; nodeId: string; label: string; stage: StageId }
  | { type: 'edge'; edgeId: string; action: ActionType; fromLabel: string; toLabel: string; isBackward: boolean };

interface NodeLayout { nodeId: string; x: number; y: number; label: string; stage: StageId }
interface EdgeLayout  { edgeId: string; action: ActionType; isBackward: boolean; path: string; midX: number; midY: number }

interface Props {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onStepChange: (p: { activeNodeId: string | null; activeEdgeId: string | null; pastNodeIds: Set<string>; pastEdgeIds: Set<string> }) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STAGE_ORDER: StageId[] = ['submission', 'validation', 'evaluation1', 'evaluation2'];
const R          = 22;    // node circle radius
const ROW_H      = 140;   // height per stage row
const TAB_W      = 68;    // left stage-label strip
const PAD_V      = 30;    // vertical padding top/bottom
const BACK_OFF   = 70;    // right-side offset for backward arcs
const SPEEDS     = [{ label: 'Slow', ms: 2000 }, { label: 'Normal', ms: 900 }, { label: 'Fast', ms: 350 }];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseParts(label: string) {
  const i = label.indexOf('—');
  if (i === -1) return { role: label.trim(), council: '' };
  return { role: label.slice(0, i).trim(), council: label.slice(i + 1).trim() };
}

function initials(label: string) {
  const { role } = parseParts(label);
  return role.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function isGroup(label: string) {
  return label.toLowerCase().includes('committee') || label.toLowerCase().includes('council');
}

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// ─── Graph building ───────────────────────────────────────────────────────────
function buildSteps(nodes: Node[], edges: Edge[], fromStage: StageId, toStage: StageId): PreviewStep[] {
  const fi = STAGE_ORDER.indexOf(fromStage), ti = STAGE_ORDER.indexOf(toStage);
  const roleNodes = nodes.filter(n => n.type === 'roleNode').filter(n => {
    const idx = STAGE_ORDER.indexOf((n.data as RoleNodeData).stage);
    return idx >= fi && idx <= ti;
  }).sort((a, b) => {
    const ai = STAGE_ORDER.indexOf((a.data as RoleNodeData).stage);
    const bi = STAGE_ORDER.indexOf((b.data as RoleNodeData).stage);
    return ai !== bi ? ai - bi : a.position.x - b.position.x;
  });

  const ids = new Set(roleNodes.map(n => n.id));
  const rangeEdges = edges.filter(e => ids.has(e.source) && ids.has(e.target));

  const fwd = rangeEdges.filter(e => {
    const si = STAGE_ORDER.indexOf((nodes.find(n => n.id === e.source)?.data as RoleNodeData)?.stage);
    const ti2 = STAGE_ORDER.indexOf((nodes.find(n => n.id === e.target)?.data as RoleNodeData)?.stage);
    return ti2 >= si;
  });
  const bwd = rangeEdges.filter(e => !fwd.includes(e));

  const steps: PreviewStep[] = [];
  const seen = new Set<string>();

  for (const node of roleNodes) {
    const nd = node.data as RoleNodeData;
    steps.push({ type: 'node', nodeId: node.id, label: nd.label || 'Role', stage: nd.stage });
    for (const edge of fwd) {
      if (edge.source !== node.id || seen.has(edge.id)) continue;
      seen.add(edge.id);
      const tgt = nodes.find(n => n.id === edge.target);
      if (!tgt) continue;
      steps.push({ type: 'edge', edgeId: edge.id, action: (edge.data as ActionEdgeData)?.action ?? 'forward', fromLabel: nd.label, toLabel: (tgt.data as RoleNodeData).label, isBackward: false });
    }
  }
  for (const edge of bwd) {
    if (seen.has(edge.id)) continue;
    seen.add(edge.id);
    const src = nodes.find(n => n.id === edge.source), tgt = nodes.find(n => n.id === edge.target);
    if (!src || !tgt) continue;
    steps.push({ type: 'edge', edgeId: edge.id, action: (edge.data as ActionEdgeData)?.action ?? 'send_back', fromLabel: (src.data as RoleNodeData).label, toLabel: (tgt.data as RoleNodeData).label, isBackward: true });
  }
  return steps;
}

function buildLayout(nodes: Node[], edges: Edge[], fromStage: StageId, toStage: StageId, canvasW: number) {
  const fi = STAGE_ORDER.indexOf(fromStage), ti = STAGE_ORDER.indexOf(toStage);
  const stagesInRange = STAGE_ORDER.slice(fi, ti + 1);
  const roleNodes = nodes.filter(n => n.type === 'roleNode').filter(n => {
    const idx = STAGE_ORDER.indexOf((n.data as RoleNodeData).stage);
    return idx >= fi && idx <= ti;
  });
  const byStage = new Map<StageId, Node[]>();
  for (const s of stagesInRange) byStage.set(s, []);
  for (const n of roleNodes) byStage.get((n.data as RoleNodeData).stage)?.push(n);
  for (const [, arr] of byStage) arr.sort((a, b) => a.position.x - b.position.x);

  const innerW = canvasW - TAB_W - BACK_OFF;
  const nodeLayouts = new Map<string, NodeLayout>();

  stagesInRange.forEach((stage, ri) => {
    const arr = byStage.get(stage) ?? [];
    const cy = PAD_V + ri * ROW_H + ROW_H / 2;
    arr.forEach((n, ni) => {
      const cellW = innerW / Math.max(arr.length, 1);
      nodeLayouts.set(n.id, {
        nodeId: n.id, x: TAB_W + cellW * ni + cellW / 2, y: cy,
        label: (n.data as RoleNodeData).label || '', stage,
      });
    });
  });

  const ids = new Set(roleNodes.map(n => n.id));
  const edgeLayouts: EdgeLayout[] = [];
  const rightX = canvasW - BACK_OFF + 36;

  for (const edge of edges.filter(e => ids.has(e.source) && ids.has(e.target))) {
    const src = nodeLayouts.get(edge.source), tgt = nodeLayouts.get(edge.target);
    if (!src || !tgt) continue;

    const si = STAGE_ORDER.indexOf(src.stage), ti2 = STAGE_ORDER.indexOf(tgt.stage);
    const isBack = ti2 < si, isSame = si === ti2;
    let path: string, midX: number, midY: number;

    if (isBack) {
      path = `M ${src.x + R} ${src.y} C ${rightX} ${src.y} ${rightX} ${tgt.y} ${tgt.x + R} ${tgt.y}`;
      midX = rightX; midY = (src.y + tgt.y) / 2;
    } else if (isSame) {
      const arcY = src.y - 48;
      path = `M ${src.x + R} ${src.y} C ${src.x + R} ${arcY} ${tgt.x - R} ${arcY} ${tgt.x - R} ${tgt.y}`;
      midX = (src.x + tgt.x) / 2; midY = arcY + 4;
    } else {
      const my = (src.y + R + (tgt.y - R)) / 2;
      path = `M ${src.x} ${src.y + R} C ${src.x} ${my} ${tgt.x} ${my} ${tgt.x} ${tgt.y - R}`;
      midX = (src.x + tgt.x) / 2; midY = my;
    }
    edgeLayouts.push({ edgeId: edge.id, action: (edge.data as ActionEdgeData)?.action ?? 'forward', isBackward: isBack, path, midX, midY });
  }

  const totalH = PAD_V + stagesInRange.length * ROW_H + PAD_V;
  return { nodeLayouts, edgeLayouts, totalH, stagesInRange };
}

// ─── Node colors ──────────────────────────────────────────────────────────────
const NODE_FILL: Record<NodeState, string>   = { idle: TEAL_FILL(), active: '#f27e00', past: '#10b981', future: '#94a3b8' };
const NODE_STROKE: Record<NodeState, string> = { idle: '#006868',  active: '#c2620a',  past: '#059669', future: '#64748b' };
function TEAL_FILL() { return '#008484'; }

// ─── SVG Defs (arrow markers + glow filter) ───────────────────────────────────
function SvgDefs() {
  return (
    <defs>
      {([
        ['arr-orange', '#f27e00'],
        ['arr-green',  '#10b981'],
        ['arr-gray',   '#cbd5e1'],
        ['arr-purple', '#8b5cf6'],
      ] as [string, string][]).map(([id, color]) => (
        <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={color} />
        </marker>
      ))}
      <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  );
}

// ─── SVG Node — pure SVG, single circle, no foreignObject ────────────────────
function SvgNode({ layout, state, stepKey }: { layout: NodeLayout; state: NodeState; stepKey: number }) {
  const { x, y, label } = layout;
  const { role, council } = parseParts(label);
  const ini  = initials(label);
  const grp  = isGroup(label);
  const fill = state === 'active' ? '#f27e00' : state === 'past' ? '#10b981' : state === 'future' ? '#94a3b8' : '#008484';
  const opacity = state === 'future' ? 0.38 : 1;
  const scale   = state === 'active' ? 1.12 : 1;
  const filter  = state === 'active' ? 'url(#glow-orange)' : state === 'past' ? 'url(#glow-green)' : undefined;

  // split role text across up to 2 lines
  const words = role.split(/\s+/);
  let line1 = '', line2 = '';
  for (const w of words) {
    if (!line1 || (line1 + ' ' + w).length <= 13) line1 = line1 ? `${line1} ${w}` : w;
    else { line2 = line2 ? `${line2} ${w}` : w; }
  }
  line1 = trunc(line1, 14);
  line2 = trunc(line2, 14);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ opacity, transition: 'opacity 0.45s ease' }}
    >
      {/* Soft glow halo for active */}
      {state === 'active' && (
        <circle
          key={`glow-${stepKey}`}
          r={R + 12}
          fill="rgba(242,126,0,0.18)"
          style={{ animation: 'nodeGlowPulse 1.6s ease-in-out infinite' }}
        />
      )}

      {/* Main circle — CSS transition for smooth color change */}
      <circle
        r={R}
        fill={fill}
        stroke="white"
        strokeWidth={2.5}
        filter={filter}
        style={{ transition: 'fill 0.45s ease' }}
        transform={`scale(${scale})`}
      />

      {/* Icon or initials */}
      {grp ? (
        /* committee: group icon drawn inline */
        <g fill="white" transform={`scale(${scale})`}>
          <circle cx={-5} cy={-3} r={4} />
          <circle cx={5}  cy={-3} r={4} />
          <ellipse cx={-5} cy={6} rx={5} ry={3.5} />
          <ellipse cx={5}  cy={6} rx={5} ry={3.5} />
        </g>
      ) : state === 'past' ? (
        /* checkmark */
        <g transform={`scale(${scale})`}>
          <polyline
            points="-8,0 -3,6 9,-6"
            fill="none"
            stroke="white"
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={ini.length > 2 ? 10 : 13}
          fontWeight="800"
          fill="white"
          transform={`scale(${scale})`}
          style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
        >
          {ini || '?'}
        </text>
      )}

      {/* Role name label below circle */}
      <text
        y={R + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight="700"
        fill={state === 'future' ? '#94a3b8' : '#1e293b'}
        style={{ fontFamily: 'system-ui, sans-serif', transition: 'fill 0.45s', userSelect: 'none' }}
      >
        {line1}
      </text>
      {line2 && (
        <text
          y={R + 27}
          textAnchor="middle"
          fontSize={11}
          fontWeight="700"
          fill={state === 'future' ? '#94a3b8' : '#1e293b'}
          style={{ fontFamily: 'system-ui, sans-serif', transition: 'fill 0.45s', userSelect: 'none' }}
        >
          {line2}
        </text>
      )}
      {council && (
        <text
          y={R + (line2 ? 40 : 27)}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
          style={{ fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}
        >
          {trunc(council, 18)}
        </text>
      )}
    </g>
  );
}

// ─── SVG Edge ─────────────────────────────────────────────────────────────────
function SvgEdge({ layout, state, stepKey }: { layout: EdgeLayout; state: 'idle' | 'active' | 'past' | 'future'; stepKey: number }) {
  const { path, midX, midY, action, isBackward } = layout;
  const def  = ACTION_DEFS[action];
  const Icon = def.Icon;

  // Track stroke (base static path)
  const trackStroke  = state === 'past'   ? '#86efac'
    : state === 'active' ? '#fed7aa'
    : '#e2e8f0';
  const trackOpacity = state === 'future' ? 0.45 : 0.85;
  const trackMarker  = state === 'past'   ? 'url(#arr-green)'
    : isBackward          ? 'url(#arr-purple)'
    : 'url(#arr-gray)';

  // Pill colors
  const pillBg = state === 'active' ? '#f27e00'
    : state === 'past'   ? '#10b981'
    : state === 'future' ? '#e2e8f0'
    : '#f27e00';
  const pillText = (state === 'future') ? '#94a3b8' : 'white';

  return (
    <g>
      {/* ── Base track ──────────────────────────────── */}
      <path
        d={path}
        fill="none"
        stroke={trackStroke}
        strokeWidth={state === 'past' ? 2 : 1.5}
        strokeDasharray={state === 'future' ? '5 5' : undefined}
        strokeLinecap="round"
        markerEnd={trackMarker}
        opacity={trackOpacity}
        style={{ transition: 'stroke 0.45s, opacity 0.45s' }}
      />

      {/* ── Active: animated path drawing over track ─ */}
      {state === 'active' && (
        <path
          key={`draw-${stepKey}`}
          d={path}
          fill="none"
          stroke="#f27e00"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          markerEnd="url(#arr-orange)"
          style={{ animation: 'pathDraw 0.85s cubic-bezier(0.22,1,0.36,1) forwards' }}
        />
      )}

      {/* ── Action label pill at midpoint ────────────── */}
      <g transform={`translate(${midX}, ${midY})`}>
        {/* pill background */}
        <rect
          x={-26} y={-10} width={52} height={20}
          rx={10} ry={10}
          fill={pillBg}
          opacity={state === 'future' ? 0.6 : 1}
          style={{ transition: 'fill 0.45s' }}
        />
        {/* pill text */}
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={8.5}
          fontWeight="700"
          fill={pillText}
          style={{ fontFamily: 'system-ui, sans-serif', letterSpacing: '0.03em', userSelect: 'none', transition: 'fill 0.45s' }}
        >
          {def.label}
        </text>
      </g>
    </g>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function WorkflowPreviewModal({ nodes, edges, onClose, onStepChange }: Props) {
  const [fromStage, setFromStage] = useState<StageId>('submission');
  const [toStage,   setToStage]   = useState<StageId>('evaluation2');
  const [stepIdx,   setStepIdx]   = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx,  setSpeedIdx]  = useState(1);

  const areaRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(800);

  useEffect(() => {
    const el = areaRef.current; if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 100) setCanvasW(w);
    });
    ro.observe(el);
    setCanvasW(el.offsetWidth || 800);
    return () => ro.disconnect();
  }, []);

  const steps = useMemo(() => buildSteps(nodes, edges, fromStage, toStage), [nodes, edges, fromStage, toStage]);
  const { nodeLayouts, edgeLayouts, totalH, stagesInRange } = useMemo(
    () => buildLayout(nodes, edges, fromStage, toStage, canvasW),
    [nodes, edges, fromStage, toStage, canvasW]
  );

  const total = steps.length;

  useEffect(() => { setStepIdx(0); setIsPlaying(false); }, [steps]);

  const { pastNodeIds, pastEdgeIds } = useMemo(() => {
    const pn = new Set<string>(), pe = new Set<string>();
    for (let i = 0; i < stepIdx; i++) {
      const s = steps[i];
      if (s?.type === 'node') pn.add(s.nodeId);
      if (s?.type === 'edge') pe.add(s.edgeId);
    }
    return { pastNodeIds: pn, pastEdgeIds: pe };
  }, [steps, stepIdx]);

  const cur       = steps[stepIdx];
  const activeNId = cur?.type === 'node' ? cur.nodeId : null;
  const activeEId = cur?.type === 'edge' ? cur.edgeId : null;

  useEffect(() => {
    onStepChange({ activeNodeId: activeNId, activeEdgeId: activeEId, pastNodeIds, pastEdgeIds });
  }, [stepIdx, steps, pastNodeIds, pastEdgeIds, onStepChange, activeNId, activeEId]);

  useEffect(() => {
    if (!isPlaying) return;
    const ms = SPEEDS[speedIdx].ms;
    const iv = setInterval(() => setStepIdx(p => {
      if (p >= total - 1) { setIsPlaying(false); return p; }
      return p + 1;
    }), ms);
    return () => clearInterval(iv);
  }, [isPlaying, speedIdx, total]);

  const goTo = useCallback((i: number) => {
    setStepIdx(Math.max(0, Math.min(total - 1, i)));
    setIsPlaying(false);
  }, [total]);

  const hFrom = (s: StageId) => { setFromStage(s); if (STAGE_ORDER.indexOf(s) > STAGE_ORDER.indexOf(toStage)) setToStage(s); };
  const hTo   = (s: StageId) => { setToStage(s);   if (STAGE_ORDER.indexOf(s) < STAGE_ORDER.indexOf(fromStage)) setFromStage(s); };

  const presentStages = useMemo(() => {
    const set = new Set(nodes.filter(n => n.type === 'roleNode').map(n => (n.data as RoleNodeData).stage));
    return STAGE_ORDER.filter(s => set.has(s));
  }, [nodes]);
  const stageOpts = presentStages.length ? presentStages : STAGE_ORDER;

  // Compute node and edge visual states
  function nState(nodeId: string): NodeState {
    if (!total) return 'idle';
    if (activeNId === nodeId) return 'active';
    if (pastNodeIds.has(nodeId)) return 'past';
    return 'future';
  }
  function eState(edgeId: string): 'idle' | 'active' | 'past' | 'future' {
    if (!total) return 'idle';
    if (activeEId === edgeId) return 'active';
    if (pastEdgeIds.has(edgeId)) return 'past';
    return 'future';
  }

  const progress = total > 1 ? stepIdx / (total - 1) : 0;

  // Step description bar content
  const stepDesc = (() => {
    if (!cur) return null;
    if (cur.type === 'node') {
      const conf = STAGE_CONFIG[cur.stage];
      const { role, council } = parseParts(cur.label);
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
            style={{ backgroundColor: '#f27e00' }}>
            <User style={{ width: 13, height: 13, color: 'white' }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
            {role}{council ? <span style={{ fontWeight: 400, color: '#6b7280' }}> — {council}</span> : null}
          </p>
          <span className="shrink-0 px-2 py-0.5 rounded-full" style={{
            fontSize: 9, fontWeight: 700,
            backgroundColor: conf.lightBg, color: conf.color,
            border: `1px solid ${conf.borderColor}`,
          }}>
            {conf.label}
          </span>
        </div>
      );
    }
    const def = ACTION_DEFS[cur.action];
    const Icon = def.Icon;
    const { role: fr } = parseParts(cur.fromLabel);
    const { role: tr } = parseParts(cur.toLabel);
    return (
      <div className="flex items-center gap-2 min-w-0">
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{trunc(fr, 18)}</span>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full shrink-0"
          style={{ backgroundColor: '#f27e00' }}>
          <Icon style={{ width: 9, height: 9, color: 'white' }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'white' }}>{def.label}</span>
        </div>
        <ArrowRight style={{ width: 11, height: 11, color: '#9ca3af', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{trunc(tr, 18)}</span>
      </div>
    );
  })();

  return (
    <div
      className="absolute inset-0 flex flex-col pointer-events-auto"
      style={{ zIndex: 200, background: 'rgba(8,16,40,0.52)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="flex flex-col m-5 rounded-2xl overflow-hidden flex-1"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 24px 80px rgba(0,0,0,0.26)',
          animation: 'slideUpPanel 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #008484, #004f4f)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
              <GitBranch style={{ width: 15, height: 15, color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Workflow Preview</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                {total} steps · animated flow
              </p>
            </div>
          </div>

          {/* Range + speed */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>From</span>
            <select value={fromStage} onChange={e => hFrom(e.target.value as StageId)}
              className="rounded-lg px-2 py-1 outline-none"
              style={{ fontSize: 11, fontWeight: 600, border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', color: '#111827' }}>
              {stageOpts.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
            </select>
            <ArrowRight style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.35)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>To</span>
            <select value={toStage} onChange={e => hTo(e.target.value as StageId)}
              className="rounded-lg px-2 py-1 outline-none"
              style={{ fontSize: 11, fontWeight: 600, border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', color: '#111827' }}>
              {stageOpts.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
            </select>

            <div className="flex rounded-lg overflow-hidden ml-2" style={{ border: '1px solid rgba(255,255,255,0.22)' }}>
              {SPEEDS.map((sp, i) => (
                <button key={sp.label} onClick={() => setSpeedIdx(i)} style={{
                  fontSize: 10, fontWeight: 600, padding: '4px 10px',
                  backgroundColor: speedIdx === i ? 'rgba(255,255,255,0.22)' : 'transparent',
                  color: speedIdx === i ? 'white' : 'rgba(255,255,255,0.45)',
                  borderRight: i < SPEEDS.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none',
                }}>
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)')}>
            <X style={{ width: 14, height: 14, color: 'white' }} />
          </button>
        </div>

        {/* ── Diagram ─────────────────────────────────────────────── */}
        <div ref={areaRef} className="flex-1 overflow-auto" style={{ backgroundColor: '#f8fafc' }}>
          {nodeLayouts.size === 0 && (
            <div className="flex items-center justify-center h-full">
              <p style={{ fontSize: 14, color: '#9ca3af' }}>No roles in selected stage range</p>
            </div>
          )}

          {nodeLayouts.size > 0 && (
            <div style={{ position: 'relative', width: canvasW, height: totalH }}>

              {/* Stage bands (HTML — purely visual, no interaction) */}
              {stagesInRange.map((stage, ri) => {
                const conf = STAGE_CONFIG[stage];
                const bandY = PAD_V + ri * ROW_H;
                return (
                  <div key={stage} style={{ position: 'absolute', left: 0, top: bandY, width: canvasW, height: ROW_H, display: 'flex' }}>
                    {/* Label strip */}
                    <div style={{
                      width: TAB_W, flexShrink: 0,
                      background: `linear-gradient(180deg, ${conf.color}, ${conf.darkColor})`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                      borderRight: `2px solid ${conf.darkColor}`,
                      boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
                    }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 900, color: 'white',
                      }}>{conf.step}</span>
                      <p style={{ fontSize: 8.5, fontWeight: 700, color: 'white', textAlign: 'center' }}>{conf.label}</p>
                      <p style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{conf.sublabel}</p>
                    </div>
                    {/* Content area */}
                    <div style={{ flex: 1, backgroundColor: ri % 2 === 0 ? conf.lightBg : `${conf.lightBg}99`, borderBottom: `1px dashed ${conf.borderColor}` }} />
                  </div>
                );
              })}

              {/* SVG layer */}
              <svg
                style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
                width={canvasW}
                height={totalH}
              >
                <SvgDefs />

                {/* Edges drawn first (behind nodes) */}
                {edgeLayouts.map(el => (
                  <SvgEdge key={el.edgeId} layout={el} state={eState(el.edgeId)} stepKey={stepIdx} />
                ))}

                {/* Nodes on top */}
                {[...nodeLayouts.values()].map(nl => (
                  <SvgNode key={nl.nodeId} layout={nl} state={nState(nl.nodeId)} stepKey={stepIdx} />
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* ── Controls bar ────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-4 px-5 py-3"
          style={{ borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>

          {/* Step description */}
          <div className="flex-1 min-w-0">
            {stepDesc ?? <p style={{ fontSize: 12, color: '#9ca3af' }}>{total === 0 ? 'No steps in range' : 'Press play to begin'}</p>}
          </div>

          {/* Progress */}
          <div className="flex flex-col items-center gap-1 w-36 shrink-0">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #008484, #10b981)' }} />
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af' }}>
              {total > 0
                ? <><span style={{ fontWeight: 700, color: '#008484' }}>{stepIdx + 1}</span> / {total}</>
                : '—'}
            </p>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { icon: <SkipBack  style={{ width: 13, height: 13 }} />, onClick: () => goTo(0),          disabled: total === 0,             title: 'Restart' },
              { icon: <StepBack  style={{ width: 13, height: 13 }} />, onClick: () => goTo(stepIdx - 1), disabled: stepIdx === 0 || !total,  title: 'Prev' },
            ].map((b, i) => (
              <button key={i} onClick={b.onClick} disabled={b.disabled} title={b.title}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#f3f4f6', color: '#6b7280', opacity: b.disabled ? 0.38 : 1 }}>
                {b.icon}
              </button>
            ))}

            <button
              onClick={() => { if (stepIdx >= total - 1) { setStepIdx(0); setIsPlaying(true); } else setIsPlaying(v => !v); }}
              disabled={total === 0}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: total === 0 ? '#e5e7eb' : 'linear-gradient(135deg, #008484, #006868)',
                boxShadow: total > 0 ? '0 2px 10px rgba(0,132,132,0.32)' : 'none',
                color: 'white',
              }}>
              {isPlaying ? <Pause style={{ width: 16, height: 16 }} /> : <Play style={{ width: 16, height: 16 }} />}
            </button>

            {[
              { icon: <StepForward style={{ width: 13, height: 13 }} />, onClick: () => goTo(stepIdx + 1), disabled: stepIdx >= total - 1 || !total, title: 'Next' },
              { icon: <SkipForward style={{ width: 13, height: 13 }} />, onClick: () => goTo(total - 1),   disabled: total === 0,                     title: 'End' },
            ].map((b, i) => (
              <button key={i} onClick={b.onClick} disabled={b.disabled} title={b.title}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#f3f4f6', color: '#6b7280', opacity: b.disabled ? 0.38 : 1 }}>
                {b.icon}
              </button>
            ))}
          </div>

          {/* Scrubber */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] shrink-0" style={{ scrollbarWidth: 'none' }}>
            {steps.map((s, i) => {
              const isAct = i === stepIdx, isPast = i < stepIdx;
              return (
                <button key={i} onClick={() => goTo(i)}
                  title={s.type === 'node' ? s.label : `${s.fromLabel} → ${s.toLabel}`}
                  style={{
                    width: isAct ? 22 : s.type === 'edge' ? 10 : 14, height: 6,
                    borderRadius: 99, flexShrink: 0,
                    backgroundColor: isAct ? '#008484' : isPast ? '#a7f3d0' : s.type === 'edge' ? '#fde68a' : '#e5e7eb',
                    border: isAct ? '1.5px solid #006868' : 'none',
                    transition: 'width 0.2s, background-color 0.3s',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
