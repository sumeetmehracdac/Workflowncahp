import { ReactNode } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit?: () => void;
}

export default function FormModal({ title, onClose, children, onSubmit }: FormModalProps) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">{children}</div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={onClose} className="px-4 py-2 text-[13px] text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" style={{ fontWeight: 500 }}>
          Cancel
        </button>
        <button
          onClick={() => { onSubmit?.(); onClose(); }}
          className="px-5 py-2 text-[13px] text-white rounded-lg transition-all hover:shadow-lg hover:shadow-[#008484]/20 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #008484, #00a5a5)", fontWeight: 500 }}
        >
          Save
        </button>
      </div>
    </>
  );
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-[12px] text-gray-500 mb-1.5 block" style={{ fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

export function FormInput({ placeholder, defaultValue }: { placeholder?: string; defaultValue?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008484]/20 focus:border-[#008484]/40 transition-all bg-white"
    />
  );
}

export function FormSelect({ options, placeholder }: { options: string[]; placeholder?: string }) {
  return (
    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#008484]/20 focus:border-[#008484]/40 transition-all bg-white text-gray-700 appearance-none">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
