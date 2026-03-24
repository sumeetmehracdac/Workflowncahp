import PageShell from "../PageShell";
import FormModal, { FormField, FormSelect } from "../FormModal";

const data = [
  { id: 1, role: "Member Secretary", committee: "PAC", actions: ["Approve Progress Report", "Forward Equipment Change", "Approve Extension"], count: 3 },
  { id: 2, role: "Chairperson", committee: "Apex Committee", actions: ["Approve Additional Grant", "Reject Additional Grant"], count: 2 },
  { id: 3, role: "Finance Officer", committee: "No Committee Type", actions: ["Accept UC", "Request UC Revision"], count: 2 },
  { id: 4, role: "Committee Member", committee: "Expert Committee", actions: ["Approve Progress Report", "Forward Equipment Change"], count: 2 },
  { id: 5, role: "Director", committee: "No Committee Type", actions: ["Approve Extension", "Approve Additional Grant", "Accept UC"], count: 3 },
  { id: 6, role: "Accounts Officer", committee: "No Committee Type", actions: ["Request UC Revision", "Accept UC"], count: 2 },
];

export default function MonitoringConditionPage() {
  return (
    <PageShell
      title="Monitoring Condition Approval"
      subtitle="Role-action permission matrix for monitoring and post-sanctioning workflows."
      layerBadge="Permissions · Monitoring"
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
        <FormModal title="Add Monitoring Condition Approval" onClose={onClose}>
          <FormField label="Role"><FormSelect options={["Member Secretary", "Chairperson", "Committee Member", "Finance Officer", "Director", "Accounts Officer"]} placeholder="Select role" /></FormField>
          <FormField label="Committee Type"><FormSelect options={["Expert Committee", "PAC", "Apex Committee", "Task Force", "No Committee Type"]} placeholder="Select committee type" /></FormField>
          <FormField label="Permitted Actions">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {["Approve Progress Report", "Request UC Revision", "Approve Additional Grant", "Forward Equipment Change", "Approve Extension", "Accept UC", "Reject Additional Grant"].map((a) => (
                <label key={a} className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#008484]" />
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
