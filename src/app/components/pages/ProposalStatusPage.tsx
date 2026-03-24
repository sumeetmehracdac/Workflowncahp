import PageShell from "../PageShell";
import { StatusBadge, ActionButtons } from "../StatusBadge";
import FormModal, { FormField, FormInput } from "../FormModal";

const data = [
  { id: 1, statusName: "Proposal Submitted", code: "SUBMIT", active: true },
  { id: 2, statusName: "Technically Recommended", code: "TECHRECOM", active: true },
  { id: 3, statusName: "Technically Revised", code: "TECHREV", active: true },
  { id: 4, statusName: "Internal", code: "INT", active: true },
  { id: 5, statusName: "Forwarded to Committee", code: "FORWARDED", active: true },
  { id: 6, statusName: "Accepted", code: "ACCEPTED", active: true },
  { id: 7, statusName: "Rejected", code: "REJECTED", active: true },
  { id: 8, statusName: "Sanctioned", code: "SANCTIONED", active: true },
  { id: 9, statusName: "Under Review", code: "REVIEW", active: true },
  { id: 10, statusName: "On Hold", code: "HOLD", active: false },
  { id: 11, statusName: "Finance Cleared", code: "FIN_CLEARED", active: true },
  { id: 12, statusName: "Director Approved", code: "DIR_APPROVED", active: true },
];

export default function ProposalStatusPage() {
  return (
    <PageShell
      title="Proposal Status Master"
      subtitle="Master registry of all possible proposal lifecycle statuses."
      layerBadge="Foundation"
      layerColor="#008484"
      columns={[
        { key: "id", label: "Status ID", width: "80px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "statusName", label: "Status Name", render: (item) => <span style={{ fontWeight: 500 }} className="text-gray-800">{item.statusName}</span> },
        { key: "code", label: "Status Code", render: (item) => <code className="text-[12px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded" style={{ fontWeight: 600 }}>{item.code}</code> },
        { key: "active", label: "Status", render: (item) => <StatusBadge active={item.active} /> },
        { key: "actions", label: "", width: "120px", render: (item) => <ActionButtons onEdit={() => {}} onToggle={() => {}} isActive={item.active} /> },
      ]}
      data={data}
      addLabel="Add Status"
      renderModal={(onClose) => (
        <FormModal title="Add Proposal Status" onClose={onClose}>
          <FormField label="Status Name"><FormInput placeholder="e.g. Proposal Submitted" /></FormField>
          <FormField label="Status Code"><FormInput placeholder="e.g. SUBMIT" /></FormField>
        </FormModal>
      )}
    />
  );
}
