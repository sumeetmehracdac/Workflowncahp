import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  type Node,
  type Edge,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast, Toaster } from 'sonner';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { nodeTypes } from './custom-nodes';
import { edgeTypes } from './ActionEdge';
import NodePalette from './NodePalette';
import PropertiesPanel from './PropertiesPanel';
import EditorToolbar from './EditorToolbar';
import WorkflowPreviewModal from './WorkflowPreviewModal';
import { WorkflowContext } from './WorkflowContext';
import {
  buildSwimlaneNodes,
  getStageFromY,
  STAGE_CONFIG,
  STAGE_BAND_HEIGHT,
  SWIMLANE_WIDTH,
} from './mock-data';
import type { WorkflowDefinition, RoleNodeData, StageId, SwimlaneNodeData } from './types';

// ─── Global keyframe animations (injected once) ───────────────────────────────
const PREVIEW_CSS = `
@keyframes nodePreviewPulse {
  0%   { opacity: 1;    transform: scale(1); }
  50%  { opacity: 0.55; transform: scale(1.08); }
  100% { opacity: 1;    transform: scale(1); }
}
@keyframes edgeFlowDash {
  from { stroke-dashoffset: 46; }
  to   { stroke-dashoffset: 0; }
}
@keyframes slideUpPanel {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pathDraw {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
@keyframes nodeGlowPulse {
  0%, 100% { opacity: 0.22; transform: scale(1); }
  50%       { opacity: 0.10; transform: scale(1.18); }
}
@keyframes fadeInTooltip {
  from { opacity: 0; transform: translateX(-50%) translateY(3px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
`;

function injectCSS(css: string, id: string) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

// Inject once at module level
injectCSS(PREVIEW_CSS, 'workflow-preview-css');

// ─── Constants ────────────────────────────────────────────────────────────────
interface WorkflowCanvasProps {
  workflow: WorkflowDefinition;
  onBack: () => void;
}

let nodeIdCounter = 200;
const genId = () => `role-${++nodeIdCounter}`;

const INITIAL_SWIMLANE_NODES = buildSwimlaneNodes();

/** Swimlane nodes are always at the bottom of the z-stack */
function buildInitialNodes(workflowNodes: Node[]): Node[] {
  const lanes = INITIAL_SWIMLANE_NODES.map((n) => ({ ...n, zIndex: -2 }));
  const roles = workflowNodes.map((n) => ({ ...n, zIndex: 10 }));
  return [...lanes, ...roles];
}

/** Arrow markers — large and bold */
const MARKER_END = {
  type: MarkerType.ArrowClosed,
  color: '#f27e00',
  width: 32,
  height: 32,
};

const DEFAULT_EDGE_OPTIONS = {
  type: 'actionEdge',
  data: { action: 'forward' },
  markerEnd: MARKER_END,
};

function buildInitialEdges(workflowEdges: Edge[]): Edge[] {
  return workflowEdges.map((e) => ({
    ...e,
    type: e.type ?? 'actionEdge',
    markerEnd: e.markerEnd ?? MARKER_END,
  }));
}

// ─── Canvas inner ──────────────────────────────────────────────────────────────
function CanvasInner({ workflow, onBack }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildInitialNodes(workflow.nodes as Node[])
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildInitialEdges(workflow.edges as Edge[])
  );

  const [selectedNode, setSelectedNode] = useState<Node<RoleNodeData> | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // ── Preview state ─────────────────────────────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);
  const [previewActiveNodeId, setPreviewActiveNodeId] = useState<string | null>(null);
  const [previewActiveEdgeId, setPreviewActiveEdgeId] = useState<string | null>(null);
  const [previewPastNodeIds, setPreviewPastNodeIds] = useState<ReadonlySet<string>>(new Set());
  const [previewPastEdgeIds, setPreviewPastEdgeIds] = useState<ReadonlySet<string>>(new Set());

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, fitView } = useReactFlow();

  // ── Connection ────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge({ ...params, ...DEFAULT_EDGE_OPTIONS, id: `e-${Date.now()}` }, eds)
      );
    },
    [setEdges]
  );

  // ── Node click ────────────────────────────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (showPreview) return;
    if (node.type !== 'roleNode') return;
    setSelectedNode(node as Node<RoleNodeData>);
    setShowRightPanel(true);
  }, [showPreview]);

  const onPaneClick = useCallback(() => {
    if (showPreview) return;
    setSelectedNode(null);
    setShowRightPanel(false);
  }, [showPreview]);

  // ── Drag over ─────────────────────────────────────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Drop: roles and swimlanes ─────────────────────────────────────────────
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isLocked || showPreview) return;

      const nodeType = event.dataTransfer.getData('application/reactflow-type');
      if (!nodeType) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      // Drop a Stage Lane
      if (nodeType === 'swimlaneNode') {
        const stageId = event.dataTransfer.getData('application/reactflow-stage') as StageId;
        if (!stageId || !STAGE_CONFIG[stageId]) return;

        const laneId = `__lane__${stageId}`;
        const alreadyExists = nodes.some((n) => n.id === laneId);
        if (alreadyExists) {
          toast.info(`${STAGE_CONFIG[stageId].label} is already on the canvas`);
          return;
        }

        const conf = STAGE_CONFIG[stageId];
        const newLane: Node<SwimlaneNodeData> = {
          id: laneId,
          type: 'swimlaneNode',
          position: { x: position.x - SWIMLANE_WIDTH / 2, y: position.y - conf.height / 2 },
          data: { stage: stageId },
          draggable: true,
          selectable: true,
          connectable: false,
          style: { width: SWIMLANE_WIDTH, height: conf.height },
          zIndex: -2,
        };
        setNodes((nds) => [...nds, newLane]);
        toast.success(`${conf.label} lane added`);
        return;
      }

      // Drop a Role Node
      if (nodeType === 'roleNode') {
        const stage = getStageFromY(position.y);
        const newNode: Node<RoleNodeData> = {
          id: genId(),
          type: 'roleNode',
          position,
          data: { label: '', stage },
          zIndex: 10,
        };
        setNodes((nds) => [...nds, newNode]);
        setSelectedNode(newNode);
        setShowRightPanel(true);
      }
    },
    [project, setNodes, isLocked, nodes, showPreview]
  );

  // ── Drag start (from palette) ─────────────────────────────────────────────
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string, stageId?: string) => {
      event.dataTransfer.setData('application/reactflow-type', nodeType);
      if (stageId) {
        event.dataTransfer.setData('application/reactflow-stage', stageId);
      }
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // ── Node update ───────────────────────────────────────────────────────────
  const handleNodeUpdate = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data } : n)));
      setSelectedNode((prev) =>
        prev && prev.id === id ? ({ ...prev, data } as Node<RoleNodeData>) : prev
      );
    },
    [setNodes]
  );

  // ── Delete selected role ──────────────────────────────────────────────────
  const handleDeleteSelected = useCallback(() => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setSelectedNode(null);
    setShowRightPanel(false);
    toast.success('Role removed');
  }, [selectedNode, setNodes, setEdges]);

  // ── Auto layout ───────────────────────────────────────────────────────────
  const handleAutoLayout = useCallback(() => {
    const byStage: Record<StageId, Node[]> = {
      submission: [], validation: [], evaluation1: [], evaluation2: [],
    };

    nodes
      .filter((n) => n.type === 'roleNode')
      .forEach((n) => {
        const stage = (n.data as RoleNodeData).stage as StageId;
        if (byStage[stage]) byStage[stage].push(n);
      });

    const updated = nodes.map((n) => {
      if (n.type !== 'roleNode') return n;
      const stage = (n.data as RoleNodeData).stage as StageId;
      const conf = STAGE_CONFIG[stage];
      const stageNodes = byStage[stage];
      const idx = stageNodes.findIndex((sn) => sn.id === n.id);
      const total = stageNodes.length;
      const totalWidth = total * 260;
      const startX = Math.max(20, (SWIMLANE_WIDTH - totalWidth) / 2);
      const roleY = conf.y + (STAGE_BAND_HEIGHT - 115) / 2;

      return {
        ...n,
        position: { x: startX + idx * 270, y: roleY },
        zIndex: 10,
      };
    });

    setNodes(updated);
    setTimeout(() => fitView({ padding: 0.12 }), 50);
    toast.success('Roles arranged by stage');
  }, [nodes, setNodes, fitView]);

  // ── Save / Publish / Export ───────────────────────────────────────────────
  const handleSave    = useCallback(() => toast.success('Workflow saved'), []);
  const handlePublish = useCallback(() => toast.success('Workflow published!'), []);

  const handleExport = useCallback(() => {
    const roleNodes = nodes.filter((n) => n.type === 'roleNode');
    const payload = JSON.stringify({ nodes: roleNodes, edges }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  }, [nodes, edges, workflow.name]);

  // ── Preview ───────────────────────────────────────────────────────────────
  const handleOpenPreview = useCallback(() => {
    setSelectedNode(null);
    setShowRightPanel(false);
    setShowPreview(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewActiveNodeId(null);
    setPreviewActiveEdgeId(null);
    setPreviewPastNodeIds(new Set());
    setPreviewPastEdgeIds(new Set());
  }, []);

  const handlePreviewStepChange = useCallback(
    (params: {
      activeNodeId: string | null;
      activeEdgeId: string | null;
      pastNodeIds: Set<string>;
      pastEdgeIds: Set<string>;
    }) => {
      setPreviewActiveNodeId(params.activeNodeId);
      setPreviewActiveEdgeId(params.activeEdgeId);
      setPreviewPastNodeIds(params.pastNodeIds);
      setPreviewPastEdgeIds(params.pastEdgeIds);
    },
    []
  );

  // ── MiniMap color ─────────────────────────────────────────────────────────
  const minimapColor = (node: Node) => {
    if (node.type === 'swimlaneNode') {
      const stage = (node.data as { stage: StageId }).stage;
      return STAGE_CONFIG[stage]?.color ?? '#e5e7eb';
    }
    return '#008484';
  };

  // ── Context value ─────────────────────────────────────────────────────────
  const contextValue = {
    selectedNodeId: selectedNode?.id ?? null,
    isPreviewMode: showPreview,
    previewActiveNodeId,
    previewActiveEdgeId,
    previewPastNodeIds,
    previewPastEdgeIds,
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
        <EditorToolbar
          workflowName={workflow.name}
          workflowStatus={workflow.status}
          isLocked={isLocked}
          onToggleLock={() => setIsLocked((v) => !v)}
          onSave={handleSave}
          onPublish={handlePublish}
          onDeleteSelected={handleDeleteSelected}
          onAutoLayout={handleAutoLayout}
          onExport={handleExport}
          onBack={onBack}
          onPreview={handleOpenPreview}
          hasSelection={!!selectedNode}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {/* ── Left panel ────────────────────────────────────── */}
          {!showPreview && (
            <div
              className="shrink-0 overflow-hidden transition-all duration-300"
              style={{
                width: showLeftPanel ? 252 : 0,
                borderRight: '1px solid #e5e7eb',
                backgroundColor: 'white',
              }}
            >
              <div className="w-[252px] h-full flex flex-col">
                <div
                  className="px-4 py-3 shrink-0"
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <p className="text-gray-800" style={{ fontSize: 13, fontWeight: 700 }}>
                    Workflow Elements
                  </p>
                  <p className="text-gray-400" style={{ fontSize: 10 }}>
                    Drag items onto the canvas
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <NodePalette onDragStart={onDragStart} />
                </div>
              </div>
            </div>
          )}

          {/* Toggle Left */}
          {!showPreview && (
            <button
              onClick={() => setShowLeftPanel((v) => !v)}
              className="absolute top-3 z-30 w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all"
              style={{ left: showLeftPanel ? 256 : 8 }}
            >
              {showLeftPanel ? (
                <PanelLeftClose className="w-4 h-4 text-gray-400" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}

          {/* ── Canvas ────────────────────────────────────────── */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={isLocked || showPreview ? undefined : onNodesChange}
              onEdgesChange={isLocked || showPreview ? undefined : onEdgesChange}
              onConnect={isLocked || showPreview ? undefined : onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
              fitView
              fitViewOptions={{ padding: 0.12 }}
              proOptions={{ hideAttribution: true }}
              snapToGrid
              snapGrid={[10, 10]}
              minZoom={0.25}
              maxZoom={2}
              deleteKeyCode={null}
              selectNodesOnDrag={false}
              elevateNodesOnSelect={false}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1.2}
                color="#d1d5db"
              />
              <Controls showInteractive={false} style={{ bottom: 24, left: 24 }} />
              <MiniMap
                nodeColor={minimapColor}
                maskColor="rgba(0,0,0,0.06)"
                style={{ width: 170, height: 110, borderRadius: 12, border: '1px solid #e5e7eb' }}
              />
            </ReactFlow>

            {/* Empty-canvas hint */}
            {!showPreview && nodes.filter((n) => n.type === 'roleNode').length === 0 && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 10 }}
              >
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'rgba(0,132,132,0.08)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="#008484" strokeWidth={1.5}>
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-gray-500" style={{ fontSize: 15, fontWeight: 600 }}>
                    Drop Actual Roles onto the canvas
                  </p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: 12 }}>
                    Drag stage lanes from the left panel, then place roles inside them
                  </p>
                </div>
              </div>
            )}

            {/* ── Preview modal overlay ──────────────────────── */}
            {showPreview && (
              <WorkflowPreviewModal
                nodes={nodes}
                edges={edges}
                onClose={handleClosePreview}
                onStepChange={handlePreviewStepChange}
              />
            )}
          </div>

          {/* Toggle Right */}
          {!showPreview && selectedNode && (
            <button
              onClick={() => setShowRightPanel((v) => !v)}
              className="absolute top-3 z-30 w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all"
              style={{ right: showRightPanel ? 308 : 8 }}
            >
              {showRightPanel ? (
                <PanelRightClose className="w-4 h-4 text-gray-400" />
              ) : (
                <PanelRightOpen className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}

          {/* ── Right panel ───────────────────────────────────── */}
          {!showPreview && (
            <div
              className="shrink-0 overflow-hidden transition-all duration-300"
              style={{
                width: showRightPanel && selectedNode ? 304 : 0,
                borderLeft: '1px solid #e5e7eb',
              }}
            >
              <div className="w-[304px] h-full">
                <PropertiesPanel
                  node={selectedNode}
                  onUpdate={handleNodeUpdate}
                  onClose={() => {
                    setShowRightPanel(false);
                    setSelectedNode(null);
                  }}
                  onDelete={handleDeleteSelected}
                />
              </div>
            </div>
          )}
        </div>

        <Toaster position="bottom-right" richColors />
      </div>
    </WorkflowContext.Provider>
  );
}

// ─── Exported with provider ────────────────────────────────────────────────────
export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}