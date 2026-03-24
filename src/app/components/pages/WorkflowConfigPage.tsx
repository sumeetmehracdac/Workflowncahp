import { useState } from "react";
import { Copy, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

const schemes = ["Post Doctoral Fellowship", "Research Grant", "Innovation Fund", "Young Scientist Award", "Women Scientist Scheme", "INSPIRE Fellowship"];
const requestTypes = ["Additional Grants", "Progress Report", "UC Submitted", "Change of Equipment", "Addition of COPI", "Extension Request"];

export default function WorkflowConfigPage() {
  const [activeTab, setActiveTab] = useState<"scheme" | "request">("scheme");
  const [stream, setStream] = useState("all");

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-gray-900">Workflow Configuration</h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full tracking-wide bg-gray-100 text-gray-500" style={{ fontWeight: 600 }}>
              UTILITY
            </span>
          </div>
          <p className="text-[13.5px] text-gray-500">
            Clone and replicate entire workflow definitions between schemes and request types.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[
          { key: "scheme", label: "Copy Scheme Flow" },
          { key: "request", label: "Copy Request Type Flow" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md text-[13px] transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#008484] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={{ fontWeight: activeTab === tab.key ? 500 : 400 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Main clone card */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6">
          {/* Stream filter */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[12px] text-gray-400" style={{ fontWeight: 500 }}>WORKFLOW STREAM:</span>
            {["all", "regular", "monitoring"].map((s) => (
              <button
                key={s}
                onClick={() => setStream(s)}
                className={`px-3 py-1.5 rounded-md text-[12px] transition-all ${
                  stream === s
                    ? "bg-[#008484]/10 text-[#008484]"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
                style={{ fontWeight: stream === s ? 600 : 400 }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {/* Source */}
            <div className="flex-1">
              <label className="text-[12px] text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>
                SOURCE {activeTab === "scheme" ? "SCHEME" : "REQUEST TYPE"}
              </label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008484]/20 focus:border-[#008484]/40">
                <option value="">Select source...</option>
                {(activeTab === "scheme" ? schemes : requestTypes).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="pt-6">
              <div className="w-10 h-10 rounded-full bg-[#008484]/10 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-[#008484]" />
              </div>
            </div>

            {/* Target */}
            <div className="flex-1">
              <label className="text-[12px] text-gray-400 mb-2 block" style={{ fontWeight: 500 }}>
                TARGET {activeTab === "scheme" ? "SCHEME" : "REQUEST TYPE"}
              </label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008484]/20 focus:border-[#008484]/40">
                <option value="">Select target...</option>
                {(activeTab === "scheme" ? schemes : requestTypes).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50/50 rounded-lg border border-amber-100 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] text-amber-700" style={{ fontWeight: 500 }}>This action will overwrite existing workflow</p>
              <p className="text-[12px] text-amber-600/70 mt-0.5">
                All approval chains, role mappings, and conditions in the target will be replaced with the source configuration.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] transition-all hover:shadow-lg hover:shadow-[#008484]/20 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #008484, #00a5a5)", fontWeight: 500 }}
            >
              <Copy className="w-4 h-4" />
              Clone Workflow
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
              <RefreshCw className="w-4 h-4" />
              Preview Changes
            </button>
          </div>
        </div>

        {/* Recent clones */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5">
          <h3 className="text-gray-900 mb-4">Clone History</h3>
          <div className="space-y-3">
            {[
              { source: "Research Grant", target: "Innovation Fund", date: "Mar 20, 2026", stream: "All" },
              { source: "Post Doctoral Fellowship", target: "Women Scientist", date: "Mar 18, 2026", stream: "Regular" },
              { source: "Additional Grants", target: "Extension Request", date: "Mar 15, 2026", stream: "Monitoring" },
              { source: "Research Grant", target: "Young Scientist", date: "Mar 12, 2026", stream: "All" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-gray-700">
                    <span style={{ fontWeight: 500 }}>{item.source}</span>
                    <ArrowRight className="w-3 h-3 inline mx-1 text-gray-400" />
                    <span style={{ fontWeight: 500 }}>{item.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-400">{item.date}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded" style={{ fontWeight: 500 }}>{item.stream}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
