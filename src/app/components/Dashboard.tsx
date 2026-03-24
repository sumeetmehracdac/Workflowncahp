import { Link } from "react-router";
import {
  Zap,
  Variable,
  ShieldCheck,
  Users,
  ArrowRightLeft,
  GitBranch,
  ListChecks,
  UserCheck,
  FileSearch,
  Copy,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
} from "lucide-react";

const stats = [
  { label: "Total Actions", value: 24, change: "+3 this week", icon: Zap, color: "#008484" },
  { label: "Active Workflows", value: 8, change: "2 schemes", icon: GitBranch, color: "#f27e00" },
  { label: "Roles Mapped", value: 16, change: "5 committee types", icon: Users, color: "#008484" },
  { label: "Status Codes", value: 12, change: "All active", icon: ListChecks, color: "#0ea5a5" },
];

const layerCards = [
  {
    layer: "Foundation",
    description: "Core building blocks — actions, conditions, roles, and statuses",
    items: [
      { label: "Actions", to: "/actions", icon: Zap, count: 24 },
      { label: "Condition Variables", to: "/condition-variables", icon: Variable, count: 6 },
      { label: "Role-Committee", to: "/role-committee", icon: Users, count: 16 },
      { label: "Proposal Status", to: "/proposal-status", icon: ListChecks, count: 12 },
      { label: "PI Status", to: "/pi-status", icon: UserCheck, count: 9 },
    ],
    color: "#008484",
  },
  {
    layer: "Permissions",
    description: "Role-action authorization matrices",
    items: [
      { label: "Condition Approval", to: "/condition-approval", icon: ShieldCheck, count: 18 },
      { label: "Monitoring Condition", to: "/monitoring-condition", icon: ShieldCheck, count: 14 },
    ],
    color: "#008484",
  },
  {
    layer: "Routing",
    description: "State transition definitions — where proposals go next",
    items: [
      { label: "Next Role After Action", to: "/next-role", icon: ArrowRightLeft, count: 22 },
      { label: "Monitoring Next Role", to: "/monitoring-next-role", icon: ArrowRightLeft, count: 15 },
    ],
    color: "#0ea5a5",
  },
  {
    layer: "Orchestration",
    description: "Complete approval chains per scheme/request type",
    items: [
      { label: "Approval Master", to: "/approval-master", icon: GitBranch, count: 32 },
      { label: "Monitoring Approval", to: "/monitoring-approval", icon: GitBranch, count: 20 },
    ],
    color: "#f27e00",
  },
  {
    layer: "Presentation",
    description: "Document visibility and navigation configuration",
    items: [{ label: "Configure File View", to: "/file-view", icon: FileSearch, count: 10 }],
    color: "#008484",
  },
  {
    layer: "Utility",
    description: "Workflow cloning and replication tools",
    items: [{ label: "Workflow Configuration", to: "/workflow-config", icon: Copy, count: 4 }],
    color: "#64748b",
  },
];

const recentActivity = [
  { action: "Added action", detail: '"Send for Expert Review"', time: "2 hours ago", type: "create" },
  { action: "Modified approval chain", detail: "Post Doctoral Fellowship scheme", time: "5 hours ago", type: "edit" },
  { action: "Cloned workflow", detail: "Research Grant → Innovation Fund", time: "1 day ago", type: "clone" },
  { action: "Deactivated status", detail: '"Under Internal Review"', time: "2 days ago", type: "deactivate" },
  { action: "Updated role mapping", detail: "Finance Officer + Apex Committee", time: "3 days ago", type: "edit" },
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900">Workflow Management</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">
          Configure and manage the complete workflow engine — actions, roles, transitions, and approval chains.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200/80 p-5 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-400 tracking-wide" style={{ fontWeight: 500 }}>
                    {stat.label.toUpperCase()}
                  </p>
                  <p className="text-[28px] text-gray-900 mt-1" style={{ fontWeight: 600 }}>
                    {stat.value}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" style={{ color: stat.color }} />
                    {stat.change}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}10` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow Layers + Recent Activity */}
      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Layer cards */}
        <div className="space-y-4">
          <h2 className="text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#008484]" />
            Configuration Layers
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {layerCards.map((layer) => (
              <div
                key={layer.layer}
                className="bg-white rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <h3 style={{ color: layer.color }}>{layer.layer}</h3>
                  </div>
                  <p className="text-[12px] text-gray-400">{layer.description}</p>
                </div>
                <div className="px-3 pb-3">
                  {layer.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#008484] transition-colors" />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-800 transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                            {item.count}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#008484] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 h-fit">
          <h3 className="text-gray-900 flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#f27e00]" />
            Recent Activity
          </h3>
          <div className="space-y-1">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="mt-0.5">
                  {item.type === "create" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : item.type === "deactivate" ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Activity className="w-4 h-4 text-[#008484]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700">
                    {item.action}{" "}
                    <span className="text-[#008484]" style={{ fontWeight: 500 }}>{item.detail}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Health */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h4 className="text-gray-700 text-[13px] mb-3" style={{ fontWeight: 500 }}>Workflow Health</h4>
            <div className="space-y-3">
              {[
                { label: "Proposal workflows", pct: 92, color: "#008484" },
                { label: "Monitoring workflows", pct: 78, color: "#f27e00" },
                { label: "Role coverage", pct: 100, color: "#10b981" },
              ].map((h) => (
                <div key={h.label}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-gray-500">{h.label}</span>
                    <span style={{ color: h.color, fontWeight: 600 }}>{h.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${h.pct}%`, backgroundColor: h.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
