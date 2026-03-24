import PageShell from "../PageShell";
import { StatusBadge, ActionButtons } from "../StatusBadge";
import FormModal, { FormField, FormSelect } from "../FormModal";

const data = [
  { id: 1, role: "Member Secretary", committee: "PAC", key: "MS_PAC", active: true },
  { id: 2, role: "Chairperson", committee: "Expert Committee", key: "CH_EC", active: true },
  { id: 3, role: "Committee Member", committee: "Expert Committee", key: "CM_EC", active: true },
  { id: 4, role: "Finance Officer", committee: "No Committee Type", key: "FO_NCT", active: true },
  { id: 5, role: "Chairperson", committee: "Apex Committee", key: "CH_AC", active: true },
  { id: 6, role: "Member Secretary", committee: "Expert Committee", key: "MS_EC", active: true },
  { id: 7, role: "Committee Member", committee: "Task Force", key: "CM_TF", active: true },
  { id: 8, role: "Director", committee: "No Committee Type", key: "DIR_NCT", active: true },
  { id: 9, role: "Chairperson", committee: "Task Force", key: "CH_TF", active: false },
  { id: 10, role: "Accounts Officer", committee: "No Committee Type", key: "AO_NCT", active: true },
];

export default function RoleCommitteePage() {
  return (
    <PageShell
      title="Role-Committee Mapping"
      subtitle="Define valid combinations of roles and committee types in the system."
      layerBadge="Foundation"
      layerColor="#008484"
      columns={[
        { key: "id", label: "ID", width: "60px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "role", label: "Role", render: (item) => <span style={{ fontWeight: 500 }} className="text-gray-800">{item.role}</span> },
        { key: "committee", label: "Committee Type", render: (item) => (
          <span className="text-[12px] bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>{item.committee}</span>
        )},
        { key: "key", label: "System Key", render: (item) => <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.key}</code> },
        { key: "active", label: "Status", render: (item) => <StatusBadge active={item.active} /> },
        { key: "actions", label: "", width: "120px", render: (item) => <ActionButtons onEdit={() => {}} onToggle={() => {}} isActive={item.active} /> },
      ]}
      data={data}
      addLabel="Add Mapping"
      renderModal={(onClose) => (
        <FormModal title="Add Role-Committee Mapping" onClose={onClose}>
          <FormField label="Role"><FormSelect options={["Member Secretary", "Chairperson", "Committee Member", "Finance Officer", "Director", "Accounts Officer"]} placeholder="Select role" /></FormField>
          <FormField label="Committee Type"><FormSelect options={["Expert Committee", "PAC", "Apex Committee", "Task Force", "No Committee Type"]} placeholder="Select committee type" /></FormField>
        </FormModal>
      )}
    />
  );
}
