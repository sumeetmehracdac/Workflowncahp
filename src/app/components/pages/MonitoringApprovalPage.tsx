import PageShell from "../PageShell";
import FormModal, { FormField, FormSelect } from "../FormModal";
import { ArrowRight } from "lucide-react";

const data = [
  { id: 1, requestType: "Additional Grants", scheme: "Post Doctoral Fellowship", currentRole: "Member Secretary (PAC)", action: "Forward to Committee", nextRole: "Chairperson (AC)", condition: "proposal_amt: 80L–5Cr", status: "MON_FORWARDED" },
  { id: 2, requestType: "Additional Grants", scheme: "Post Doctoral Fellowship", currentRole: "Chairperson (AC)", action: "Approve Additional Grant", nextRole: "Finance Officer", condition: "no_condition", status: "MON_APPROVED" },
  { id: 3, requestType: "Progress Report", scheme: "Research Grant", currentRole: "Member Secretary (PAC)", action: "Approve Progress Report", nextRole: "Director", condition: "no_condition", status: "PR_APPROVED" },
  { id: 4, requestType: "UC Submitted", scheme: "Research Grant", currentRole: "Finance Officer", action: "Accept UC", nextRole: "Member Secretary (PAC)", condition: "no_condition", status: "UC_ACCEPTED" },
  { id: 5, requestType: "UC Submitted", scheme: "Innovation Fund", currentRole: "Accounts Officer", action: "Request UC Revision", nextRole: "Member Secretary (PAC)", condition: "no_condition", status: "UC_REVISION" },
  { id: 6, requestType: "Change of Equipment", scheme: "Post Doctoral Fellowship", currentRole: "Committee Member (EC)", action: "Forward Equipment Change", nextRole: "Chairperson (EC)", condition: "no_condition", status: "EQ_FORWARDED" },
  { id: 7, requestType: "Extension Request", scheme: "Research Grant", currentRole: "Director", action: "Approve Extension", nextRole: "Member Secretary (PAC)", condition: "no_condition", status: "EXT_APPROVED" },
];

export default function MonitoringApprovalPage() {
  return (
    <PageShell
      title="Monitoring Approval Master"
      subtitle="Complete monitoring approval chains per request type — the orchestration layer for post-sanctioning workflows."
      layerBadge="Orchestration · Monitoring"
      layerColor="#f27e00"
      columns={[
        { key: "requestType", label: "Request Type", render: (item) => (
          <span className="text-[12px] bg-[#f27e00]/10 text-[#f27e00] px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>{item.requestType}</span>
        )},
        { key: "scheme", label: "Scheme", render: (item) => <span className="text-[12px] text-gray-500">{item.scheme}</span> },
        { key: "currentRole", label: "Current Role", render: (item) => <span style={{ fontWeight: 500 }} className="text-[12.5px] text-gray-800">{item.currentRole}</span> },
        { key: "action", label: "Action", render: (item) => (
          <span className="text-[12px] bg-[#008484]/8 text-[#008484] px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>{item.action}</span>
        )},
        { key: "arrow", label: "", width: "30px", render: () => <ArrowRight className="w-3.5 h-3.5 text-gray-300" /> },
        { key: "nextRole", label: "Next Role", render: (item) => <span className="text-[12.5px] text-gray-600">{item.nextRole}</span> },
        { key: "status", label: "Status", render: (item) => (
          <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded" style={{ fontWeight: 600 }}>{item.status}</span>
        )},
        { key: "edit", label: "", width: "80px", render: () => (
          <button className="px-2.5 py-1 rounded-md text-[12px] text-[#008484] hover:bg-[#008484]/5 transition-colors" style={{ fontWeight: 500 }}>Edit</button>
        )},
      ]}
      data={data}
      addLabel="Add Rule"
      renderModal={(onClose) => (
        <FormModal title="Add Monitoring Approval Rule" onClose={onClose}>
          <FormField label="Request Type"><FormSelect options={["Additional Grants", "Progress Report", "UC Submitted", "Change of Equipment", "Addition of COPI", "Extension Request"]} placeholder="Select request type" /></FormField>
          <FormField label="Scheme"><FormSelect options={["Post Doctoral Fellowship", "Research Grant", "Innovation Fund"]} placeholder="Select scheme" /></FormField>
          <FormField label="Current Role"><FormSelect options={["Member Secretary (PAC)", "Chairperson (AC)", "Committee Member (EC)", "Finance Officer", "Director", "Accounts Officer"]} placeholder="Select current role" /></FormField>
          <FormField label="Action"><FormSelect options={["Approve Progress Report", "Approve Additional Grant", "Accept UC", "Request UC Revision", "Approve Extension", "Forward Equipment Change"]} placeholder="Select action" /></FormField>
          <FormField label="Next Role"><FormSelect options={["Member Secretary (PAC)", "Chairperson (AC)", "Finance Officer", "Director"]} placeholder="Select next role" /></FormField>
          <FormField label="Status Code"><FormSelect options={["MON_FORWARDED", "MON_APPROVED", "PR_APPROVED", "UC_ACCEPTED", "UC_REVISION", "EXT_APPROVED"]} placeholder="Select status" /></FormField>
        </FormModal>
      )}
    />
  );
}
