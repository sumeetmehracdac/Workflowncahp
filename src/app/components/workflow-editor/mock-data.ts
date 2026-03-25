import type { StageId, WorkflowDefinition } from './types';
import type { Node } from 'reactflow';

// ─── Stage Configuration (Horizontal rows: stages stack top-to-bottom) ─────────
export const STAGE_CONFIG: Record<
  StageId,
  {
    label: string;
    sublabel: string;
    color: string;
    darkColor: string;
    lightBg: string;
    borderColor: string;
    /** Default top y-position of this stage band */
    y: number;
    /** Height of the swimlane band */
    height: number;
    step: number;
  }
> = {
  submission: {
    label: 'Submission',
    sublabel: 'Stage 1',
    color: '#3b82f6',
    darkColor: '#1d4ed8',
    lightBg: '#eff6ff',
    borderColor: '#bfdbfe',
    y: 0,
    height: 160,
    step: 1,
  },
  validation: {
    label: 'Validation',
    sublabel: 'Stage 2',
    color: '#7c3aed',
    darkColor: '#5b21b6',
    lightBg: '#f5f3ff',
    borderColor: '#ddd6fe',
    y: 180,
    height: 160,
    step: 2,
  },
  evaluation1: {
    label: 'Evaluation 1',
    sublabel: 'Physical Inspection',
    color: '#d97706',
    darkColor: '#b45309',
    lightBg: '#fffbeb',
    borderColor: '#fde68a',
    y: 360,
    height: 160,
    step: 3,
  },
  evaluation2: {
    label: 'Evaluation 2',
    sublabel: 'Minutes of Meeting',
    color: '#059669',
    darkColor: '#047857',
    lightBg: '#ecfdf5',
    borderColor: '#a7f3d0',
    y: 540,
    height: 160,
    step: 4,
  },
};

/** Default width of a swimlane band (wide enough for many roles side-by-side) */
export const SWIMLANE_WIDTH = 1300;
/** Height of each individual swimlane band */
export const STAGE_BAND_HEIGHT = 160;
/** Vertical gap between swimlane bands */
export const STAGE_GAP = 20;

// ─── Role Library (autocomplete suggestions) ──────────────────────────────────
export const ROLE_LIBRARY: { id: string, label: string }[] = [
  { id: '01', label: 'Admin - External' },
  { id: '02', label: 'Applicant - External' },
  { id: '03', label: 'Secretary - NCAHP' },
  { id: '04', label: 'Secretary - Uttar Pradesh State Council' },
  { id: '05', label: 'Developer - External' },
];

// ─── Form Types ───────────────────────────────────────────────────────────────
export const FORM_TYPES = [
  'New Registration',
  'Registration Renewal',
  'License Transfer',
  'Certificate Verification',
  'NOC Application',
  'Qualification Assessment',
  'Foreign Credential Evaluation',
  'Disciplinary Action',
];

// ─── Helper: detect stage from drop y-position ───────────────────────────────
export function getStageFromY(y: number): StageId {
  if (y < 170) return 'submission';
  if (y < 350) return 'validation';
  if (y < 530) return 'evaluation1';
  return 'evaluation2';
}

// ─── Swimlane Nodes (horizontal bands, draggable) ─────────────────────────────
export function buildSwimlaneNodes(): Node[] {
  return (Object.keys(STAGE_CONFIG) as StageId[]).map((stage) => {
    const conf = STAGE_CONFIG[stage];
    return {
      id: `__lane__${stage}`,
      type: 'swimlaneNode',
      position: { x: 0, y: conf.y },
      data: { stage },
      draggable: true,
      selectable: true,    // ← allow selection for removal
      focusable: false,    // ← prevents keyboard focus elevation
      connectable: false,
      style: { width: SWIMLANE_WIDTH, height: STAGE_BAND_HEIGHT },
      zIndex: -2,
    };
  });
}

// ─── Sample Workflows ─────────────────────────────────────────────────────────
export const sampleWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf-001',
    name: 'New Registration — Allied Health Professional',
    description:
      'Multi-stage approval workflow for new allied health professional registrations with physical inspection and committee review.',
    formType: 'New Registration',
    version: 3,
    status: 'published',
    nodes: [
      {
        id: 'r-s1',
        type: 'roleNode',
        position: { x: 80, y: 30 },
        data: { label: 'Applicant - External', stage: 'submission', roleId: '02' },
      },
      {
        id: 'r-v1',
        type: 'roleNode',
        position: { x: 80, y: 210 },
        data: { label: 'Admin - External', stage: 'validation', roleId: '01' },
      },
      {
        id: 'r-e1',
        type: 'roleNode',
        position: { x: 80, y: 390 },
        data: { label: 'Secretary - Uttar Pradesh State Council', stage: 'evaluation1', roleId: '04' },
      },
      {
        id: 'r-e2a',
        type: 'roleNode',
        position: { x: 60, y: 570 },
        data: { label: 'Secretary - NCAHP', stage: 'evaluation2', roleId: '03' },
      },
      {
        id: 'r-e2b',
        type: 'roleNode',
        position: { x: 420, y: 570 },
        data: { label: 'Developer - External', stage: 'evaluation2', roleId: '05' },
      },
    ],
    edges: [
      { id: 'e1', source: 'r-s1',  target: 'r-v1',  type: 'actionEdge', data: { action: 'forward', actionLabel: 'Forward', actionId: '01' } },
      { id: 'e2', source: 'r-v1',  target: 'r-e1',  type: 'actionEdge', data: { action: 'approve', actionLabel: 'Approve', actionId: '02' } },
      { id: 'e3', source: 'r-v1',  target: 'r-s1',  type: 'actionEdge', data: { action: 'send_back', actionLabel: 'Send Back', actionId: '04' } },
      { id: 'e4', source: 'r-e1',  target: 'r-e2a', type: 'actionEdge', data: { action: 'forward', actionLabel: 'Forward', actionId: '01' } },
      { id: 'e5', source: 'r-e1',  target: 'r-v1',  type: 'actionEdge', data: { action: 'return', actionLabel: 'Return to Submitter', actionId: '05' } },
      { id: 'e6', source: 'r-e2a', target: 'r-e2b', type: 'actionEdge', data: { action: 'approve', actionLabel: 'Approve', actionId: '02' } },
      { id: 'e7', source: 'r-e2a', target: 'r-e1',  type: 'actionEdge', data: { action: 'reject', actionLabel: 'Reject', actionId: '03' } },
      { id: 'e8', source: 'r-e2b', target: 'r-e1',  type: 'actionEdge', data: { action: 'send_back', actionLabel: 'Send Back', actionId: '04' } },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-03-20',
    createdBy: 'Admin',
  },
  {
    id: 'wf-002',
    name: 'License Renewal — Physiotherapist',
    description:
      'Streamlined renewal workflow with document verification and council approval.',
    formType: 'Registration Renewal',
    version: 2,
    status: 'published',
    nodes: [
      {
        id: 'r-s1',
        type: 'roleNode',
        position: { x: 80, y: 30 },
        data: { label: 'Admin - External', stage: 'submission', roleId: '01' },
      },
      {
        id: 'r-v1',
        type: 'roleNode',
        position: { x: 80, y: 210 },
        data: { label: 'Applicant - External', stage: 'validation', roleId: '02' },
      },
      {
        id: 'r-e1',
        type: 'roleNode',
        position: { x: 80, y: 390 },
        data: { label: 'Secretary - NCAHP', stage: 'evaluation1', roleId: '03' },
      },
      {
        id: 'r-e2',
        type: 'roleNode',
        position: { x: 80, y: 570 },
        data: { label: 'Developer - External', stage: 'evaluation2', roleId: '05' },
      },
    ],
    edges: [
      { id: 'e1', source: 'r-s1', target: 'r-v1', type: 'actionEdge', data: { action: 'forward', actionLabel: 'Forward', actionId: '01' } },
      { id: 'e2', source: 'r-v1', target: 'r-e1', type: 'actionEdge', data: { action: 'approve', actionLabel: 'Approve', actionId: '02' } },
      { id: 'e3', source: 'r-v1', target: 'r-s1', type: 'actionEdge', data: { action: 'send_back', actionLabel: 'Send Back', actionId: '04' } },
      { id: 'e4', source: 'r-e1', target: 'r-e2', type: 'actionEdge', data: { action: 'approve', actionLabel: 'Approve', actionId: '02' } },
      { id: 'e5', source: 'r-e1', target: 'r-v1', type: 'actionEdge', data: { action: 'return', actionLabel: 'Return to Submitter', actionId: '05' } },
    ],
    createdAt: '2026-02-10',
    updatedAt: '2026-03-18',
    createdBy: 'Admin',
  },
  {
    id: 'wf-003',
    name: 'Foreign Credential Evaluation',
    description: 'Multi-committee evaluation workflow for foreign qualified professionals.',
    formType: 'Foreign Credential Evaluation',
    version: 1,
    status: 'draft',
    nodes: [],
    edges: [],
    createdAt: '2026-03-01',
    updatedAt: '2026-03-22',
    createdBy: 'Admin',
  },
  {
    id: 'wf-004',
    name: 'Disciplinary Action — Lab Technician',
    description: 'Investigation and hearing workflow for disciplinary proceedings.',
    formType: 'Disciplinary Action',
    version: 1,
    status: 'archived',
    nodes: [],
    edges: [],
    createdAt: '2025-11-05',
    updatedAt: '2026-01-10',
    createdBy: 'Admin',
  },
  {
    id: 'wf-005',
    name: 'NOC Processing — Inter-State Transfer',
    description:
      'No Objection Certificate processing for practitioners transferring between states.',
    formType: 'NOC Application',
    version: 4,
    status: 'published',
    nodes: [],
    edges: [],
    createdAt: '2025-09-20',
    updatedAt: '2026-03-15',
    createdBy: 'Admin',
  },
];