import PageShell from "../PageShell";
import { StatusBadge, ActionButtons } from "../StatusBadge";
import FormModal, { FormField, FormInput, FormSelect } from "../FormModal";

const data = [
  { id: 1, actionName: "Accept", processName: "Confirm Action", actionPerformed: "Proposal Accepted", noteSheet: "Proposal has been accepted for further processing", icon: "check-circle", tooltip: "Accept Proposal", active: true },
  { id: 2, actionName: "Reject", processName: "Confirm Action", actionPerformed: "Proposal Rejected", noteSheet: "Proposal has been rejected", icon: "x-circle", tooltip: "Reject Proposal", active: true },
  { id: 3, actionName: "Send for Review", processName: "Forward Action", actionPerformed: "Sent for Expert Review", noteSheet: "Forwarded to expert committee for review", icon: "send", tooltip: "Forward to Review", active: true },
  { id: 4, actionName: "Forward to Committee", processName: "Forward Action", actionPerformed: "Forwarded to Committee", noteSheet: "Proposal forwarded to committee members", icon: "users", tooltip: "Forward to Committee", active: true },
  { id: 5, actionName: "Send Sanction Letter", processName: "PI Communication", actionPerformed: "Sanction Letter Sent", noteSheet: "Sanction order generated and sent to PI", icon: "file-text", tooltip: "Issue Sanction", active: true },
  { id: 6, actionName: "Send Rejection to PI", processName: "PI Communication", actionPerformed: "Rejection Communicated", noteSheet: "Rejection letter sent to PI", icon: "alert-circle", tooltip: "Notify Rejection", active: true },
  { id: 7, actionName: "Send Revision to PI", processName: "PI Communication", actionPerformed: "Revision Requested", noteSheet: "Revision request sent to PI", icon: "edit", tooltip: "Request Revision", active: true },
  { id: 8, actionName: "Return to Previous", processName: "Return Action", actionPerformed: "Returned", noteSheet: "Returned to previous officer for re-examination", icon: "arrow-left", tooltip: "Return", active: false },
  { id: 9, actionName: "Technically Recommend", processName: "Confirm Action", actionPerformed: "Technically Recommended", noteSheet: "Proposal technically recommended by expert", icon: "thumbs-up", tooltip: "Tech Recommend", active: true },
  { id: 10, actionName: "Hold", processName: "Status Action", actionPerformed: "Proposal on Hold", noteSheet: "Proposal put on hold pending further information", icon: "pause", tooltip: "Hold", active: true },
];

export default function ActionsPage() {
  return (
    <PageShell
      title="Actions"
      subtitle="Master registry of all workflow actions that can be performed on proposals and requests."
      layerBadge="Foundation"
      layerColor="#008484"
      columns={[
        { key: "id", label: "ID", width: "60px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "actionName", label: "Action Name", render: (item) => <span style={{ fontWeight: 500 }} className="text-gray-800">{item.actionName}</span> },
        { key: "processName", label: "Process", render: (item) => (
          <span className="text-[12px] bg-[#008484]/8 text-[#008484] px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>{item.processName}</span>
        )},
        { key: "actionPerformed", label: "Display Label" },
        { key: "icon", label: "Icon", render: (item) => <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.icon}</code> },
        { key: "active", label: "Status", render: (item) => <StatusBadge active={item.active} /> },
        { key: "actions", label: "", width: "120px", render: (item) => <ActionButtons onEdit={() => {}} onToggle={() => {}} isActive={item.active} /> },
      ]}
      data={data}
      addLabel="Add Action"
      renderModal={(onClose) => (
        <FormModal title="Add New Action" onClose={onClose}>
          <FormField label="Action Name"><FormInput placeholder="e.g. Accept, Reject, Forward" /></FormField>
          <FormField label="Process Name"><FormSelect options={["Confirm Action", "Forward Action", "PI Communication", "Return Action", "Status Action"]} placeholder="Select process" /></FormField>
          <FormField label="Action Performed (Display Label)"><FormInput placeholder="Text shown when action is performed" /></FormField>
          <FormField label="NoteSheet Text"><FormInput placeholder="Official note sheet entry" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Icon Name"><FormInput placeholder="e.g. check-circle" /></FormField>
            <FormField label="Tooltip Title"><FormInput placeholder="Tooltip text" /></FormField>
          </div>
        </FormModal>
      )}
    />
  );
}
