import React, { useState } from 'react';
import WorkflowDashboard from './components/WorkflowDashboard';
import WorkflowCanvas from './components/workflow-editor/WorkflowCanvas';
import type { WorkflowDefinition } from './components/workflow-editor/types';

export default function App() {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowDefinition | null>(null);

  const handleCreateNew = () => {
    const newWorkflow: WorkflowDefinition = {
      id: `wf-new-${Date.now()}`,
      name: 'Untitled Workflow',
      description: '',
      formType: '',
      version: 1,
      status: 'draft',
      nodes: [],   // start with empty canvas (swimlanes always present in canvas)
      edges: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
    };
    setActiveWorkflow(newWorkflow);
  };

  if (activeWorkflow) {
    return (
      <WorkflowCanvas
        workflow={activeWorkflow}
        onBack={() => setActiveWorkflow(null)}
      />
    );
  }

  return (
    <WorkflowDashboard
      onOpenWorkflow={setActiveWorkflow}
      onCreateNew={handleCreateNew}
    />
  );
}
