import PageShell from "../PageShell";
import FormModal, { FormField, FormSelect } from "../FormModal";
import { ArrowRight } from "lucide-react";

const data = [
  { id: 1, action: "Approve Progress Report", nextRoles: ["Member Secretary (PAC)"] },
  { id: 2, action: "Request UC Revision", nextRoles: ["Finance Officer", "Accounts Officer"] },
  { id: 3, action: "Approve Additional Grant", nextRoles: ["Chairperson (Apex Committee)"] },
  { id: 4, action: "Forward Equipment Change", nextRoles: ["Committee Member (Expert Committee)"] },
  { id: 5, action: "Approve Extension", nextRoles: ["Director", "Member Secretary (PAC)"] },
  { id: 6, action: "Accept UC", nextRoles: ["Finance Officer"] },
  { id: 7, action: "Reject Additional Grant", nextRoles: ["Member Secretary (PAC)"] },
];

export default function MonitoringNextRolePage() {
  return (
    <PageShell
      title="Monitoring Next Role"
      subtitle="Routing transitions for post-sanctioning and monitoring workflows."
      layerBadge="Routing · Monitoring"
      layerColor="#0ea5a5"
      columns={[
        { key: "id", label: "ID", width: "60px", render: (item) => <span className="text-gray-400">#{item.id}</span> },
        { key: "action", label: "Monitoring Action", render: (item) => (
          <span className="text-[12px] bg-[#008484]/8 text-[#008484] px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>{item.action}</span>
        )},
        { key: "arrow", label: "", width: "40px", render: () => <ArrowRight className="w-4 h-4 text-gray-300" /> },
        { key: "nextRoles", label: "Next Role(s)", render: (item) => (
          <div className="flex flex-wrap gap-1.5">
            {item.nextRoles.map((r: string) => (
              <span key={r} className="text-[11px] bg-[#f27e00]/8 text-[#f27e00] px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>{r}</span>
            ))}
          </div>
        )},
        { key: "count", label: "Targets", width: "80px", render: (item) => (
          <span className="text-[12px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>{item.nextRoles.length}</span>
        )},
        { key: "edit", label: "", width: "80px", render: () => (
          <button className="px-2.5 py-1 rounded-md text-[12px] text-[#008484] hover:bg-[#008484]/5 transition-colors" style={{ fontWeight: 500 }}>Edit</button>
        )},
      ]}
      data={data}
      addLabel="Add Transition"
      renderModal={(onClose) => (
        <FormModal title="Add Monitoring Transition" onClose={onClose}>
          <FormField label="Monitoring Action"><FormSelect options={["Approve Progress Report", "Request UC Revision", "Approve Additional Grant", "Accept UC", "Approve Extension"]} placeholder="Select action" /></FormField>
          <FormField label="Next Role(s)">
            <div className="grid grid-cols-1 gap-2 mt-1">
              {["Member Secretary (PAC)", "Chairperson (Apex Committee)", "Finance Officer", "Director", "Accounts Officer"].map((r) => (
                <label key={r} className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#008484]" />
                  {r}
                </label>
              ))}
            </div>
          </FormField>
        </FormModal>
      )}
    />
  );
}
