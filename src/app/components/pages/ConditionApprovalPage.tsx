import PageShell from "../PageShell";
import FormModal, { FormField, FormSelect } from "../FormModal";

const data = [
  { id: 1, role: "Chairperson", committee: "Expert Committee", actions: ["Accept", "Reject", "Send for Review"], count: 3 },
  { id: 2, role: "Member Secretary", committee: "PAC", actions: ["Forward to Committee", "Return to Previous", "Accept"], count: 3 },
  { id: 3, role: "Committee Member", committee: "Expert Committee", actions: ["Technically Recommend", "Send Revision to PI"], count: 2 },
  { id: 4, role: "Finance Officer", committee: "No Committee Type", actions: ["Accept", "Hold", "Return to Previous"], count: 3 },
  { id: 5, role: "Chairperson", committee: "Apex Committee", actions: ["Accept", "Reject", "Send Sanction Letter"], count: 3 },
  { id: 6, role: "Committee Member", committee: "Task Force", actions: ["Technically Recommend", "Reject"], count: 2 },
  { id: 7, role: "Director", committee: "No Committee Type", actions: ["Accept", "Reject", "Forward to Committee", "Hold"], count: 4 },
];

export default function ConditionApprovalPage() {
  return (
    <PageShell
      title="Condition Approval Master"
      subtitle="Map which actions a specific role is allowed to perform — the role-action permission matrix."
      layerBadge="Permissions"
      layerColor="#008484"
      columns={[
        { key: "id", label: "ID", width: "60px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "role", label: "Role", render: (item) => <span style={{ fontWeight: 500 }} className="text-gray-800">{item.role}</span> },
        { key: "committee", label: "Committee Type", render: (item) => (
          <span className="text-[12px] bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>{item.committee}</span>
        )},
        { key: "actions", label: "Permitted Actions", render: (item) => (
          <div className="flex flex-wrap gap-1.5">
            {item.actions.map((a: string) => (
              <span key={a} className="text-[11px] bg-[#008484]/8 text-[#008484] px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>{a}</span>
            ))}
          </div>
        )},
        { key: "count", label: "Count", width: "80px", render: (item) => (
          <span className="text-[12px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{item.count}</span>
        )},
        { key: "edit", label: "", width: "80px", render: () => (
          <button className="px-2.5 py-1 rounded-md text-[12px] text-[#008484] hover:bg-[#008484]/5 transition-colors" style={{ fontWeight: 500 }}>Edit</button>
        )},
      ]}
      data={data}
      addLabel="Add Mapping"
      renderModal={(onClose) => (
        <FormModal title="Add Condition Approval" onClose={onClose}>
          <FormField label="Role"><FormSelect options={["Chairperson", "Member Secretary", "Committee Member", "Finance Officer", "Director"]} placeholder="Select role" /></FormField>
          <FormField label="Committee Type"><FormSelect options={["Expert Committee", "PAC", "Apex Committee", "Task Force", "No Committee Type"]} placeholder="Select committee type" /></FormField>
          <FormField label="Permitted Actions">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {["Accept", "Reject", "Send for Review", "Forward to Committee", "Technically Recommend", "Hold", "Return to Previous", "Send Sanction Letter"].map((a) => (
                <label key={a} className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#008484] focus:ring-[#008484]/20" />
                  {a}
                </label>
              ))}
            </div>
          </FormField>
        </FormModal>
      )}
    />
  );
}
