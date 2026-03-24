import PageShell from "../PageShell";
import { StatusBadge, ActionButtons } from "../StatusBadge";
import FormModal, { FormField, FormInput, FormSelect } from "../FormModal";

const data = [
  { id: 1, action: "Send Sanction Letter to PI", piStatus: "Sanction Order Issued", active: true },
  { id: 2, action: "Send Rejection to PI", piStatus: "Not Recommended", active: true },
  { id: 3, action: "Send Revision to PI", piStatus: "Revised", active: true },
  { id: 4, action: "Accept", piStatus: "Under Processing", active: true },
  { id: 5, action: "Forward to Committee", piStatus: "Under Review", active: true },
  { id: 6, action: "Technically Recommend", piStatus: "Under Evaluation", active: true },
  { id: 7, action: "Hold", piStatus: "Pending Further Information", active: true },
  { id: 8, action: "Return to Previous", piStatus: "Under Re-examination", active: false },
  { id: 9, action: "Send Extension Approval", piStatus: "Extension Approved", active: true },
];

export default function PIStatusPage() {
  return (
    <PageShell
      title="PI Status Master"
      subtitle="Map workflow actions to the status labels visible to the Principal Investigator (applicant)."
      layerBadge="Foundation"
      layerColor="#008484"
      columns={[
        { key: "id", label: "ID", width: "60px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "action", label: "Internal Action", render: (item) => (
          <span className="text-[12px] bg-[#008484]/8 text-[#008484] px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>{item.action}</span>
        )},
        { key: "piStatus", label: "PI-Facing Status", render: (item) => (
          <span style={{ fontWeight: 500 }} className="text-gray-800">{item.piStatus}</span>
        )},
        { key: "active", label: "Status", render: (item) => <StatusBadge active={item.active} /> },
        { key: "actions", label: "", width: "120px", render: (item) => <ActionButtons onEdit={() => {}} onToggle={() => {}} isActive={item.active} /> },
      ]}
      data={data}
      addLabel="Add Mapping"
      renderModal={(onClose) => (
        <FormModal title="Add PI Status Mapping" onClose={onClose}>
          <FormField label="Internal Action"><FormSelect options={["Accept", "Reject", "Send Sanction Letter to PI", "Send Rejection to PI", "Send Revision to PI", "Hold"]} placeholder="Select action" /></FormField>
          <FormField label="PI-Facing Status Text"><FormInput placeholder="e.g. Sanction Order Issued" /></FormField>
        </FormModal>
      )}
    />
  );
}
