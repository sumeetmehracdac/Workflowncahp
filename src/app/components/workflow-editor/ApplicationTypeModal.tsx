import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onApply: (selectedTypes: string[]) => void;
}

const APP_TYPES = [
  "Regular Registration (Form 1A | Regular Regis — Indian Nationals with Indian Qualification)",
  "Regular Registration (Form 1B | Regular Reg — Indian Nationals with Foreign Qualification)",
  "Provisional Registration (Form 2A | ProvReg — Working Allied and Healthcare Indian Professionals who do not possess a recognized qualification)",
  "Temporary Registration (Form 3A | TempReg — Indian Nationals with Foreign Qualification)",
  "Temporary Registration (Form 3B | TR — Foreign Nationals with Indian Qualification)",
  "Temporary Registration (Form 3C | TRC — Foreign Nationals with Foreign Qualification)",
  "Interim Registration (Form 4A | IR — Students pursuing a recognised qualification)",
  "Interim Registration (Form 1C | IntReg — Students pursuing a recognised qualification)"
];

export default function ApplicationTypeModal({ onClose, onApply }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (t: string) => {
    const next = new Set(selected);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelected(next);
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-[200]"
      style={{ background: 'rgba(8,16,40,0.52)', backdropFilter: 'blur(3px)' }}
    >
      <div
        className="flex flex-col rounded-2xl overflow-hidden w-full max-w-3xl max-h-[90vh]"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 24px 80px rgba(0,0,0,0.26)',
          animation: 'slideUpPanel 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: 'linear-gradient(135deg, #008484, #004f4f)' }}>
          <div className="text-white">
            <p style={{ fontSize: 16, fontWeight: 700 }}>Publish Workflow</p>
            <p style={{ fontSize: 12, opacity: 0.8 }}>For which application type do you want to publish this workflow?</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)')}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative bg-gray-50">
          {APP_TYPES.map((type, i) => {
            const isChecked = selected.has(type);
            const isTop = type.split('(')[0].trim();
            const isSub = type.split('(')[1].replace(')', '').trim();

            return (
              <div
                key={i}
                onClick={() => toggle(type)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  isChecked ? 'bg-teal-50 border-teal-500' : 'bg-white border-gray-200 hover:border-teal-300'
                }`}
                style={{
                  boxShadow: isChecked ? '0 4px 12px rgba(0,132,132,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: isChecked ? '#008484' : '#d1d5db',
                    backgroundColor: isChecked ? '#008484' : 'transparent',
                  }}>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div>
                  <p className="text-gray-900 font-bold" style={{ fontSize: 13 }}>{i + 1}. {isTop}</p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: 12 }}>{isSub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selected.size === 0) return;
              onApply(Array.from(selected));
            }}
            disabled={selected.size === 0}
            className="px-6 py-2 rounded-xl text-white font-bold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #008484, #006868)',
              boxShadow: selected.size > 0 ? '0 4px 14px rgba(0,132,132,0.25)' : 'none'
            }}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
