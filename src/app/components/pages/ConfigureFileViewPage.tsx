import PageShell from "../PageShell";
import { StatusBadge, ActionButtons } from "../StatusBadge";
import FormModal, { FormField, FormInput, FormSelect } from "../FormModal";
import { ExternalLink, FileText } from "lucide-react";

const data = [
  { id: 1, action: "Send Sanction Letter", displayName: "Sanction Letter", link: "/documents/sanction-letter", linkName: "View Letter", showLink: true, showRemarks: true, params: "txnId, piId", active: true },
  { id: 2, action: "Send Rejection to PI", displayName: "Rejection Notice", link: "/documents/rejection-notice", linkName: "View Notice", showLink: true, showRemarks: true, params: "txnId", active: true },
  { id: 3, action: "Technically Recommend", displayName: "Technical Report", link: "/documents/tech-report", linkName: "View Report", showLink: true, showRemarks: false, params: "txnId, expertId", active: true },
  { id: 4, action: "Accept", displayName: "Acceptance Note", link: "/documents/acceptance", linkName: "View Note", showLink: false, showRemarks: true, params: "txnId", active: true },
  { id: 5, action: "Forward to Committee", displayName: "Forwarding Sheet", link: "/documents/forwarding", linkName: "View Sheet", showLink: true, showRemarks: false, params: "txnId", active: false },
];

export default function ConfigureFileViewPage() {
  return (
    <PageShell
      title="Configure File View"
      subtitle="Configure document links and remarks displayed at each workflow action stage."
      layerBadge="Presentation"
      layerColor="#008484"
      columns={[
        { key: "id", label: "ID", width: "50px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "action", label: "Action", render: (item) => (
          <span className="text-[12px] bg-[#008484]/8 text-[#008484] px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>{item.action}</span>
        )},
        { key: "displayName", label: "Display Name", render: (item) => <span style={{ fontWeight: 500 }} className="text-gray-800">{item.displayName}</span> },
        { key: "link", label: "Link", render: (item) => (
          <div className="flex items-center gap-1.5 text-[12px] text-blue-600">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate max-w-[160px]">{item.link}</span>
          </div>
        )},
        { key: "showLink", label: "Show Link", render: (item) => (
          <span className={`text-[11px] px-2 py-0.5 rounded ${item.showLink ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 500 }}>
            {item.showLink ? "Yes" : "No"}
          </span>
        )},
        { key: "showRemarks", label: "Remarks", render: (item) => (
          <span className={`text-[11px] px-2 py-0.5 rounded ${item.showRemarks ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`} style={{ fontWeight: 500 }}>
            {item.showRemarks ? "Yes" : "No"}
          </span>
        )},
        { key: "active", label: "Status", render: (item) => <StatusBadge active={item.active} /> },
        { key: "actions", label: "", width: "120px", render: (item) => <ActionButtons onEdit={() => {}} onToggle={() => {}} isActive={item.active} /> },
      ]}
      data={data}
      addLabel="Add Configuration"
      renderModal={(onClose) => (
        <FormModal title="Configure File View" onClose={onClose}>
          <FormField label="Action"><FormSelect options={["Accept", "Reject", "Send Sanction Letter", "Technically Recommend", "Forward to Committee"]} placeholder="Select action" /></FormField>
          <FormField label="Display Action Name"><FormInput placeholder="e.g. Sanction Letter" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Link URL"><FormInput placeholder="/documents/..." /></FormField>
            <FormField label="Link Name"><FormInput placeholder="e.g. View Letter" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Show View Link"><FormSelect options={["Yes", "No"]} /></FormField>
            <FormField label="Show Remarks"><FormSelect options={["Yes", "No"]} /></FormField>
          </div>
          <FormField label="Parameters"><FormInput placeholder="e.g. txnId, piId" /></FormField>
        </FormModal>
      )}
    />
  );
}
