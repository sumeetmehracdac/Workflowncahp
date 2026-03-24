import PageShell from "../PageShell";
import FormModal, { FormField, FormSelect } from "../FormModal";
import { ArrowRight, GitBranch } from "lucide-react";

const data = [
  { id: 1, scheme: "Post Doctoral Fellowship", currentRole: "Member Secretary (PAC)", action: "Forward to Committee", nextRole: "Committee Member (EC)", condition: "proposal_amt: 0–80L", status: "FORWARDED" },
  { id: 2, scheme: "Post Doctoral Fellowship", currentRole: "Committee Member (EC)", action: "Technically Recommend", nextRole: "Chairperson (EC)", condition: "no_condition", status: "TECHRECOM" },
  { id: 3, scheme: "Post Doctoral Fellowship", currentRole: "Chairperson (EC)", action: "Accept", nextRole: "Member Secretary (PAC)", condition: "no_condition", status: "ACCEPTED" },
  { id: 4, scheme: "Post Doctoral Fellowship", currentRole: "Member Secretary (PAC)", action: "Send Sanction Letter", nextRole: "Director", condition: "proposal_amt: 0–80L", status: "SANCTIONED" },
  { id: 5, scheme: "Research Grant", currentRole: "Member Secretary (PAC)", action: "Forward to Committee", nextRole: "Committee Member (EC)", condition: "proposal_amt: 80L–5Cr", status: "FORWARDED" },
  { id: 6, scheme: "Research Grant", currentRole: "Chairperson (AC)", action: "Accept", nextRole: "Finance Officer", condition: "proposal_amt: 5Cr–100Cr", status: "APPROVED" },
  { id: 7, scheme: "Innovation Fund", currentRole: "Director", action: "Accept", nextRole: "Finance Officer", condition: "no_condition", status: "DIR_APPROVED" },
  { id: 8, scheme: "Innovation Fund", currentRole: "Finance Officer", action: "Accept", nextRole: "Member Secretary (PAC)", condition: "no_condition", status: "FIN_CLEARED" },
];

export default function ApprovalMasterPage() {
  return (
    <PageShell
      title="Approval Master"
      subtitle="Comprehensive workflow rule builder — complete approval chains per scheme with conditions and status transitions."
      layerBadge="Orchestration"
      layerColor="#f27e00"
      columns={[
        { key: "scheme", label: "Scheme", render: (item) => (
          <span className="text-[12px] bg-[#f27e00]/10 text-[#f27e00] px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>{item.scheme}</span>
        )},
        { key: "currentRole", label: "Current Role", render: (item) => <span style={{ fontWeight: 500 }} className="text-[12.5px] text-gray-800">{item.currentRole}</span> },
        { key: "action", label: "Action", render: (item) => (
          <span className="text-[12px] bg-[#008484]/8 text-[#008484] px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>{item.action}</span>
        )},
        { key: "arrow", label: "", width: "30px", render: () => <ArrowRight className="w-3.5 h-3.5 text-gray-300" /> },
        { key: "nextRole", label: "Next Role", render: (item) => <span className="text-[12.5px] text-gray-600">{item.nextRole}</span> },
        { key: "condition", label: "Condition", render: (item) => <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.condition}</code> },
        { key: "status", label: "Status Code", render: (item) => (
          <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded" style={{ fontWeight: 600 }}>{item.status}</span>
        )},
        { key: "edit", label: "", width: "80px", render: () => (
          <button className="px-2.5 py-1 rounded-md text-[12px] text-[#008484] hover:bg-[#008484]/5 transition-colors" style={{ fontWeight: 500 }}>Edit</button>
        )},
      ]}
      data={data}
      addLabel="Add Rule"
      renderModal={(onClose) => (
        <FormModal title="Add Approval Rule" onClose={onClose}>
          <FormField label="Scheme"><FormSelect options={["Post Doctoral Fellowship", "Research Grant", "Innovation Fund", "Young Scientist Award"]} placeholder="Select scheme" /></FormField>
          <FormField label="Current Role"><FormSelect options={["Member Secretary (PAC)", "Chairperson (EC)", "Committee Member (EC)", "Finance Officer", "Director"]} placeholder="Select current role" /></FormField>
          <FormField label="Action"><FormSelect options={["Accept", "Reject", "Forward to Committee", "Technically Recommend", "Send Sanction Letter"]} placeholder="Select action" /></FormField>
          <FormField label="Next Role"><FormSelect options={["Member Secretary (PAC)", "Chairperson (EC)", "Committee Member (EC)", "Finance Officer", "Director"]} placeholder="Select next role" /></FormField>
          <FormField label="Condition Variable"><FormSelect options={["proposal_amt: 0–80L", "proposal_amt: 80L–5Cr", "proposal_amt: 5Cr–100Cr", "no_condition"]} placeholder="Select condition" /></FormField>
          <FormField label="Status Code"><FormSelect options={["FORWARDED", "TECHRECOM", "ACCEPTED", "SANCTIONED", "APPROVED", "REJECTED"]} placeholder="Select status" /></FormField>
        </FormModal>
      )}
    />
  );
}
