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
import ActionPropertiesPanel from './ActionPropertiesPanel';
import EditorToolbar from './EditorToolbar';
import ApplicationTypeModal from './ApplicationTypeModal';
import { WorkflowContext } from './WorkflowContext';
import {
  buildSwimlaneNodes,
  getStageFromY,
  STAGE_CONFIG,
  STAGE_BAND_HEIGHT,
  SWIMLANE_WIDTH,
  ROLE_LIBRARY,
} from './mock-data';
import type { WorkflowDefinition, RoleNodeData, StageId, SwimlaneNodeData, ActionEdgeData } from './types';

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
  const [selectedEdge, setSelectedEdge] = useState<Edge<ActionEdgeData> | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // ── Print / Publish state ─────────────────────────────────────────────────────────
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [selectedAppTypes, setSelectedAppTypes] = useState<string[]>([]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, fitView } = useReactFlow();

  // ── Connection ────────────────────────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds: Edge[]) =>
        addEdge({ ...params, ...DEFAULT_EDGE_OPTIONS, id: `e-${Date.now()}` }, eds)
      );
    },
    [setEdges]
  );

  // ── Node click ────────────────────────────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (showPrintView) return;
    if (node.type !== 'roleNode' && node.type !== 'swimlaneNode') return;
    setSelectedEdge(null);
    setSelectedNode(node as Node<RoleNodeData>);
    setShowRightPanel(false);
  }, [showPrintView]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    if (showPrintView) return;
    setSelectedNode(null);
    setSelectedEdge(edge as Edge<ActionEdgeData>);
    setShowRightPanel(true);
  }, [showPrintView]);

  const openEdgeProperties = useCallback((id: string) => {
    if (showPrintView) return;
    const edge = edges.find((e) => e.id === id);
    if (edge) {
      setSelectedNode(null);
      setSelectedEdge(edge as Edge<ActionEdgeData>);
      setShowRightPanel(true);
    }
  }, [showPrintView, edges]);

  const onPaneClick = useCallback(() => {
    if (showPrintView) return;
    setSelectedNode(null);
    setSelectedEdge(null);
    setShowRightPanel(false);
  }, [showPrintView]);

  // ── Drag over ─────────────────────────────────────────────────────────────
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Drop: roles and swimlanes ─────────────────────────────────────────────
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isLocked || showPrintView) return;

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
        setNodes((nds: Node[]) => [...nds, newLane]);
        toast.success(`${conf.label} lane added`);
        return;
      }

      // Drop a Role Node
      if (nodeType === 'roleNode') {
        const stage = getStageFromY(position.y);
        const roleId = event.dataTransfer.getData('application/reactflow-role');
        const roleDef = roleId ? ROLE_LIBRARY.find(r => r.id === roleId) : null;
        
        const newNode: Node<RoleNodeData> = {
          id: genId(),
          type: 'roleNode',
          position,
          data: { label: roleDef?.label ?? '', stage, roleId: roleDef?.id },
          zIndex: 10,
        };
        setNodes((nds: Node[]) => [...nds, newNode]);
        setSelectedNode(newNode);
        setShowRightPanel(true);
      }
    },
    [project, setNodes, isLocked, nodes, showPrintView]
  );

  // ── Drag start (from palette) ─────────────────────────────────────────────
  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string, stageId?: string, roleId?: string) => {
      event.dataTransfer.setData('application/reactflow-type', nodeType);
      if (stageId) {
        event.dataTransfer.setData('application/reactflow-stage', stageId);
      }
      if (roleId) {
        event.dataTransfer.setData('application/reactflow-role', roleId);
      }
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // ── Click to add stage (from palette) ─────────────────────────────────────
  const handleAddStage = useCallback((stageId: StageId) => {
    if (isLocked || showPrintView) return;
    const conf = STAGE_CONFIG[stageId];
    if (!conf) return;

    const laneId = `__lane__${stageId}`;
    const alreadyExists = nodes.some((n) => n.id === laneId);
    if (alreadyExists) {
      toast.info(`${conf.label} is already on the canvas`);
      return;
    }

    const { x, y } = project({ x: 200, y: 100 + nodes.length * 150 });
    const newLane: Node<SwimlaneNodeData> = {
      id: laneId,
      type: 'swimlaneNode',
      position: { x, y },
      data: { stage: stageId },
      draggable: true,
      selectable: true,
      connectable: false,
      style: { width: SWIMLANE_WIDTH, height: conf.height },
      zIndex: -2,
    };
    setNodes((nds: Node[]) => [...nds, newLane]);
    toast.success(`${conf.label} lane added`);
  }, [isLocked, showPrintView, nodes, setNodes, project]);

  // ── Click to add role (from palette) ──────────────────────────────────────
  const handleAddRole = useCallback((roleId: string) => {
    if (isLocked || showPrintView) return;
    const roleDef = ROLE_LIBRARY.find((r) => r.id === roleId);
    if (!roleDef) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    const centerX = bounds ? bounds.width / 2 : window.innerWidth / 2;
    const centerY = bounds ? bounds.height / 2 : window.innerHeight / 2;
    const { x, y } = project({ x: centerX - 40, y: centerY - 40 });
    const stage = getStageFromY(y);

    const newNode: Node<RoleNodeData> = {
      id: genId(),
      type: 'roleNode',
      position: { x, y },
      data: { label: roleDef.label, stage, roleId },
      zIndex: 10,
    };
    setNodes((nds: Node[]) => [...nds, newNode]);
    setSelectedNode(newNode);
    setShowRightPanel(true);
    toast.success(`${roleDef.label} added`);
  }, [isLocked, showPrintView, project, setNodes]);

  // ── Node update ───────────────────────────────────────────────────────────
  const handleNodeUpdate = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds: Node[]) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)));
      setSelectedNode((prev: Node<RoleNodeData> | null) =>
        prev && prev.id === id ? ({ ...prev, data: { ...prev.data, ...data } } as Node<RoleNodeData>) : prev
      );
    },
    [setNodes]
  );

  // ── Edge update ───────────────────────────────────────────────────────────
  const handleEdgeUpdate = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setEdges((eds: Edge[]) => eds.map((e) => (e.id === id ? { ...e, data: { ...e.data, ...data } } : e)));
      setSelectedEdge((prev: Edge<ActionEdgeData> | null) =>
        prev && prev.id === id ? ({ ...prev, data: { ...prev.data, ...data } } as Edge<ActionEdgeData>) : prev
      );
    },
    [setEdges]
  );

  // ── Delete selected role ──────────────────────────────────────────────────
  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds: Node[]) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds: Edge[]) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
      toast.success(selectedNode.type === 'swimlaneNode' ? 'Stage removed' : 'Role removed');
    } else if (selectedEdge) {
      setEdges((eds: Edge[]) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      toast.success('Action removed');
    }
    setShowRightPanel(false);
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

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

  // ── Publish / Print ───────────────────────────────────────────────────────────────
  const handleOpenPublishModal = useCallback(() => {
    setSelectedNode(null);
    setShowRightPanel(false);
    setShowPublishModal(true);
  }, []);

  const handleApplyPublish = useCallback((types: string[]) => {
    setSelectedAppTypes(types);
    setShowPublishModal(false);
    toast.success(`Workflow published for ${types.length} application type(s)!`);
  }, []);

  const handleOpenPreview = useCallback(() => {
    setSelectedNode(null);
    setShowRightPanel(false);
    setShowLeftPanel(false);
    setShowPrintView(true);
    setTimeout(() => fitView({ padding: 0.1 }), 50);
  }, [fitView]);

  const handleClosePrintView = useCallback(() => {
    setShowPrintView(false);
    setShowLeftPanel(true);
    setTimeout(() => fitView({ padding: 0.1 }), 50);
  }, [fitView]);

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
    selectedEdgeId: selectedEdge?.id ?? null,
    isPreviewMode: false,
    previewActiveNodeId: null,
    previewActiveEdgeId: null,
    previewPastNodeIds: new Set<string>(),
    previewPastEdgeIds: new Set<string>(),
    openEdgeProperties,
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col" style={{ backgroundColor: showPrintView ? 'white' : '#f8fafc' }}>
        
        {/* ── Printable Header ────────────────────────────────────────── */}
        {showPrintView && (
          <div className="flex items-center justify-between p-6 bg-white border-b print:hidden shrink-0 z-50 relative">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Applied to: {selectedAppTypes.length} Application Type{selectedAppTypes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="px-6 py-2 text-white font-bold rounded-lg transition"
                style={{ backgroundColor: '#008484' }}
              >
                Print / Save PDF
              </button>
              <button 
                onClick={handleClosePrintView}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
              >
                Close Output
              </button>
            </div>
          </div>
        )}

        <style>
          {`
            @media print {
              html, body { background: white !important; margin: 0; padding: 0; }
              .react-flow__renderer { background: white !important; }
            }
          `}
        </style>

        {!showPrintView && (
          <EditorToolbar
            workflowName={workflow.name}
            workflowStatus={workflow.status}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked((v) => !v)}
            onSave={handleSave}
            onPublish={handleOpenPublishModal}
            onDeleteSelected={handleDeleteSelected}
            onAutoLayout={handleAutoLayout}
            onExport={handleExport}
            onBack={onBack}
            onPreview={handleOpenPreview}
            hasSelection={!!selectedNode || !!selectedEdge}
          />
        )}

        <div className="flex-1 flex overflow-hidden relative">
          {/* ── Left panel ────────────────────────────────────── */}
          {!showPrintView && (
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
                  <NodePalette onDragStart={onDragStart} onAddStage={handleAddStage} onAddRole={handleAddRole} />
                </div>
              </div>
            </div>
          )}

          {/* Toggle Left */}
          {!showPrintView && (
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
              onNodesChange={isLocked || showPrintView ? undefined : onNodesChange}
              onEdgesChange={isLocked || showPrintView ? undefined : onEdgesChange}
              onConnect={isLocked || showPrintView ? undefined : onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
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
              nodesDraggable={!showPrintView && !isLocked}
              nodesConnectable={!showPrintView && !isLocked}
              elementsSelectable={!showPrintView}
            >
              {!showPrintView && (
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={24}
                  size={1.2}
                  color="#d1d5db"
                />
              )}
              {!showPrintView && <Controls showInteractive={false} style={{ bottom: 24, left: 24 }} />}
              {!showPrintView && (
                <MiniMap
                  nodeColor={minimapColor}
                  maskColor="rgba(0,0,0,0.06)"
                  style={{ width: 170, height: 110, borderRadius: 12, border: '1px solid #e5e7eb' }}
                />
              )}
            </ReactFlow>

            {/* Empty-canvas hint */}
            {!showPrintView && nodes.filter((n) => n.type === 'roleNode').length === 0 && (
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

            {/* ── Application Type Modal overlay ──────────────────────── */}
            {showPublishModal && (
              <ApplicationTypeModal
                onClose={() => setShowPublishModal(false)}
                onApply={handleApplyPublish}
              />
            )}
          </div>

          {/* Toggle Right */}
          {!showPrintView && (selectedNode || selectedEdge) && (
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
          {!showPrintView && (
            <div
              className="shrink-0 overflow-hidden transition-all duration-300"
              style={{
                width: showRightPanel && (selectedNode || selectedEdge) ? 304 : 0,
                borderLeft: '1px solid #e5e7eb',
              }}
            >
              <div className="w-[304px] h-full">
                {selectedNode ? (
                  <PropertiesPanel
                    node={selectedNode}
                    onUpdate={handleNodeUpdate}
                    onClose={() => {
                      setShowRightPanel(false);
                      setSelectedNode(null);
                    }}
                    onDelete={handleDeleteSelected}
                  />
                ) : selectedEdge ? (
                   <ActionPropertiesPanel
                    id={selectedEdge.id}
                    data={selectedEdge.data!}
                    onUpdate={handleEdgeUpdate}
                    onClose={() => {
                      setShowRightPanel(false);
                      setSelectedEdge(null);
                    }}
                    onDelete={handleDeleteSelected}
                   />
                ) : null}
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