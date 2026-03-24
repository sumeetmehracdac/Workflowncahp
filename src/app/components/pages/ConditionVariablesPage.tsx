import PageShell from "../PageShell";
import { StatusBadge, ActionButtons } from "../StatusBadge";
import FormModal, { FormField, FormInput } from "../FormModal";

const data = [
  { id: 1, conditionId: "C001", variable: "proposal_amt", minValue: "0", maxValue: "80,00,000", description: "Low-value proposals (up to 80 lakhs)", active: true },
  { id: 2, conditionId: "C001", variable: "proposal_amt", minValue: "80,00,001", maxValue: "5,00,00,000", description: "Mid-value proposals (80L – 5Cr)", active: true },
  { id: 3, conditionId: "C001", variable: "proposal_amt", minValue: "5,00,00,001", maxValue: "100,00,00,000", description: "High-value proposals (5Cr – 100Cr)", active: true },
  { id: 4, conditionId: "C002", variable: "no_condition", minValue: "0", maxValue: "0", description: "No conditional routing required", active: true },
  { id: 5, conditionId: "C003", variable: "project_duration", minValue: "0", maxValue: "36", description: "Short-term projects (up to 3 years)", active: true },
  { id: 6, conditionId: "C003", variable: "project_duration", minValue: "37", maxValue: "60", description: "Long-term projects (3–5 years)", active: false },
];

export default function ConditionVariablesPage() {
  return (
    <PageShell
      title="Condition Variables"
      subtitle="Define conditional variables and value ranges for workflow routing decisions."
      layerBadge="Foundation"
      layerColor="#008484"
      columns={[
        { key: "conditionId", label: "Condition ID", render: (item) => (
          <span className="text-[12px] bg-[#f27e00]/10 text-[#f27e00] px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>{item.conditionId}</span>
        )},
        { key: "variable", label: "Variable", render: (item) => <code className="text-[12px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.variable}</code> },
        { key: "minValue", label: "Min Value", render: (item) => <span className="tabular-nums">₹{item.minValue}</span> },
        { key: "maxValue", label: "Max Value", render: (item) => <span className="tabular-nums">₹{item.maxValue}</span> },
        { key: "description", label: "Description" },
        { key: "active", label: "Status", render: (item) => <StatusBadge active={item.active} /> },
        { key: "actions", label: "", width: "120px", render: (item) => <ActionButtons onEdit={() => {}} onToggle={() => {}} isActive={item.active} /> },
      ]}
      data={data}
      addLabel="Add Variable"
      renderModal={(onClose) => (
        <FormModal title="Add Condition Variable" onClose={onClose}>
          <FormField label="Condition ID"><FormInput placeholder="e.g. C001" /></FormField>
          <FormField label="Variable Name"><FormInput placeholder="e.g. proposal_amt" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Minimum Value"><FormInput placeholder="0" /></FormField>
            <FormField label="Maximum Value"><FormInput placeholder="80,00,000" /></FormField>
          </div>
          <FormField label="Description"><FormInput placeholder="Description of this condition range" /></FormField>
        </FormModal>
      )}
    />
  );
}
