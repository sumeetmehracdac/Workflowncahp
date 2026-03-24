export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${
        active
          ? "bg-emerald-50 text-emerald-600"
          : "bg-gray-100 text-gray-400"
      }`}
      style={{ fontWeight: 500 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function ActionButtons({ onEdit, onToggle, isActive }: { onEdit?: () => void; onToggle?: () => void; isActive?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="px-2.5 py-1 rounded-md text-[12px] text-[#008484] hover:bg-[#008484]/5 transition-colors"
        style={{ fontWeight: 500 }}
      >
        Edit
      </button>
      <button
        onClick={onToggle}
        className={`px-2.5 py-1 rounded-md text-[12px] transition-colors ${
          isActive
            ? "text-amber-600 hover:bg-amber-50"
            : "text-emerald-600 hover:bg-emerald-50"
        }`}
        style={{ fontWeight: 500 }}
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}
