import { Outlet, NavLink, useLocation } from "react-router";
import { useState } from "react";
import {
  LayoutDashboard,
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
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  Settings,
  Activity,
} from "lucide-react";

const navGroups = [
  {
    label: "Foundation",
    color: "#008484",
    items: [
      { to: "/actions", label: "Actions", icon: Zap },
      { to: "/condition-variables", label: "Condition Variables", icon: Variable },
      { to: "/role-committee", label: "Role-Committee Mapping", icon: Users },
      { to: "/proposal-status", label: "Proposal Status", icon: ListChecks },
      { to: "/pi-status", label: "PI Status", icon: UserCheck },
    ],
  },
  {
    label: "Permissions",
    color: "#008484",
    items: [
      { to: "/condition-approval", label: "Condition Approval", icon: ShieldCheck },
      { to: "/monitoring-condition", label: "Monitoring Condition Approval", icon: ShieldCheck },
    ],
  },
  {
    label: "Routing",
    color: "#008484",
    items: [
      { to: "/next-role", label: "Next Role After Action", icon: ArrowRightLeft },
      { to: "/monitoring-next-role", label: "Monitoring Next Role", icon: ArrowRightLeft },
    ],
  },
  {
    label: "Orchestration",
    color: "#f27e00",
    items: [
      { to: "/approval-master", label: "Approval Master", icon: GitBranch },
      { to: "/monitoring-approval", label: "Monitoring Approval Master", icon: GitBranch },
    ],
  },
  {
    label: "Presentation",
    color: "#008484",
    items: [{ to: "/file-view", label: "Configure File View", icon: FileSearch }],
  },
  {
    label: "Utility",
    color: "#008484",
    items: [{ to: "/workflow-config", label: "Workflow Configuration", icon: Copy }],
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Foundation: true,
    Permissions: true,
    Routing: true,
    Orchestration: true,
    Presentation: true,
    Utility: true,
  });
  const location = useLocation();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[68px]" : "w-[272px]"
        } flex flex-col bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #008484, #00a5a5)" }}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-[13px] text-[#008484] tracking-wide" style={{ fontWeight: 600 }}>
                NCAHP
              </div>
              <div className="text-[10px] text-gray-400 tracking-wider">WORKFLOW ENGINE</div>
            </div>
          )}
        </div>

        {/* Dashboard link */}
        <div className="px-3 pt-4 pb-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-[#008484]/10 text-[#008484]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`
            }
          >
            <LayoutDashboard className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-[13.5px]">Dashboard</span>}
          </NavLink>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="mt-1">
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-2 text-[10.5px] tracking-[0.08em] text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  <span>{group.label.toUpperCase()}</span>
                  {expandedGroups[group.label] ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              ) : (
                <div className="h-px bg-gray-100 mx-2 my-2" />
              )}

              {(collapsed || expandedGroups[group.label]) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                          isActive
                            ? "bg-[#008484]/10 text-[#008484]"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#008484]" />
                        )}
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                        {!collapsed && (
                          <span className="text-[13px] truncate">{item.label}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
          >
            {collapsed ? (
              <PanelLeft className="w-[18px] h-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px]" />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search configurations..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] w-72 focus:outline-none focus:ring-2 focus:ring-[#008484]/20 focus:border-[#008484]/40 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f27e00] rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-[18px] h-[18px]" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <div className="flex items-center gap-2.5 px-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px]"
                style={{ background: "linear-gradient(135deg, #008484, #00a5a5)", fontWeight: 600 }}
              >
                SA
              </div>
              <div className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>
                System Admin
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
