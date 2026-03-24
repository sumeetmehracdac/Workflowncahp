import type { Node, Edge } from 'reactflow';

export type StageId = 'submission' | 'validation' | 'evaluation1' | 'evaluation2';

export type ActionType =
  | 'approve'
  | 'reject'
  | 'send_back'
  | 'return'
  | 'forward'
  | 'escalate';

export interface RoleNodeData {
  /** Combined "Role Name — Council" label, e.g. "Deputy Secretary — NCAHP" */
  label: string;
  stage: StageId;
  [key: string]: unknown;
}

export interface SwimlaneNodeData {
  stage: StageId;
  [key: string]: unknown;
}

export interface ActionEdgeData {
  action: ActionType;
  [key: string]: unknown;
}

export type WorkflowNode = Node<RoleNodeData | SwimlaneNodeData>;
export type WorkflowEdge = Edge<ActionEdgeData>;

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  formType: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  nodes: Node<RoleNodeData>[];   // role nodes only (swimlanes are rebuilt at runtime)
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
