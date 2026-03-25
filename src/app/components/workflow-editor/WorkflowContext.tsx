import { createContext, useContext } from 'react';

interface WorkflowContextValue {
  /** ID of the currently selected role node, or null */
  selectedNodeId: string | null;
  /** ID of the currently selected action edge, or null */
  selectedEdgeId: string | null;
  /** Whether the preview animation is currently active */
  isPreviewMode: boolean;
  /** The node currently lit up in the animation */
  previewActiveNodeId: string | null;
  /** The edge currently lit up in the animation */
  previewActiveEdgeId: string | null;
  /** Nodes already passed in the animation */
  previewPastNodeIds: ReadonlySet<string>;
  /** Edges already passed in the animation */
  previewPastEdgeIds: ReadonlySet<string>;
  /** Function to open action properties directly from edge */
  openEdgeProperties?: (id: string) => void;
}

export const WorkflowContext = createContext<WorkflowContextValue>({
  selectedNodeId: null,
  selectedEdgeId: null,
  isPreviewMode: false,
  previewActiveNodeId: null,
  previewActiveEdgeId: null,
  previewPastNodeIds: new Set(),
  previewPastEdgeIds: new Set(),
});

export const useWorkflowContext = () => useContext(WorkflowContext);
