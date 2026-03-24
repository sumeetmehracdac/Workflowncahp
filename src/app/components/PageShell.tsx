import { ReactNode, useState } from "react";
import { Search, Plus, Download, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render?: (item: T, index: number) => ReactNode;
}

interface PageShellProps<T> {
  title: string;
  subtitle: string;
  layerBadge: string;
  layerColor: string;
  columns: Column<T>[];
  data: T[];
  onAdd?: () => void;
  addLabel?: string;
  renderModal?: (onClose: () => void) => ReactNode;
}

export default function PageShell<T extends Record<string, any>>({
  title,
  subtitle,
  layerBadge,
  layerColor,
  columns,
  data,
  onAdd,
  addLabel = "Add New",
  renderModal,
}: PageShellProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filteredData = data.filter((item) =>
    Object.values(item).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-gray-900">{title}</h1>
            <span
              className="text-[10px] px-2.5 py-0.5 rounded-full tracking-wide"
              style={{
                backgroundColor: `${layerColor}12`,
                color: layerColor,
                fontWeight: 600,
              }}
            >
              {layerBadge.toUpperCase()}
            </span>
          </div>
          <p className="text-[13.5px] text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={() => (renderModal ? setShowModal(true) : onAdd?.())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-[13px] transition-all hover:shadow-lg hover:shadow-[#008484]/20 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #008484, #00a5a5)", fontWeight: 500 }}
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008484]/20 focus:border-[#008484]/40 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <div className="ml-auto text-[12px] text-gray-400">
          {filteredData.length} record{filteredData.length !== 1 && "s"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left text-[11px] tracking-wide text-gray-400 px-5 py-3.5"
                    style={{ fontWeight: 600, width: col.width }}
                  >
                    {col.label.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5 text-[13px] text-gray-700">
                      {col.render ? col.render(item, (currentPage - 1) * perPage + idx) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-[13px] text-gray-400">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-[12px] text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, currentPage - 3),
                currentPage + 2
              ).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-md text-[12px] transition-colors ${
                    pg === currentPage
                      ? "bg-[#008484] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  style={{ fontWeight: pg === currentPage ? 600 : 400 }}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && renderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {renderModal(() => setShowModal(false))}
          </div>
        </div>
      )}
    </div>
  );
}
