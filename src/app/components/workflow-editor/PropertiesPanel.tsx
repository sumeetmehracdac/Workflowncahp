import React, { useState } from 'react';
import type { Node } from 'reactflow';
import { X, User, Check } from 'lucide-react';
import { ROLE_LIBRARY } from './mock-data';
import type { RoleNodeData } from './types';

interface PropertiesPanelProps {
  node: Node<RoleNodeData> | null;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: () => void;
}

const TEAL = '#008484';

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 transition-all outline-none focus:border-[#008484] focus:ring-2 focus:ring-[#008484]/10 focus:bg-white';

export default function PropertiesPanel({
  node,
  onUpdate,
  onClose,
  onDelete,
}: PropertiesPanelProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!node || node.type !== 'roleNode') return null;

  const data = node.data as RoleNodeData;

  const update = (key: keyof RoleNodeData, value: string) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  const selectPreset = (role: { id: string; label: string }) => {
    onUpdate(node.id, { ...data, label: role.label, roleId: role.id });
    setShowDropdown(false);
  };

  const filteredSuggestions = ROLE_LIBRARY.filter(
    (r) => !data.label || r.label.toLowerCase().includes(data.label.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #006868 100%)` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>Actual Role</p>
            <p className="text-white/60" style={{ fontSize: 10 }}>Properties</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)')}
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Actual Role ──────────────────────────────────── */}
        <div>
          <label
            className="flex items-center gap-1.5 uppercase tracking-widest text-gray-400 mb-1.5"
            style={{ fontSize: 9, fontWeight: 700 }}
          >
            <User style={{ width: 9, height: 9 }} />
            Actual Role
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.label || ''}
              onChange={(e) => update('label', e.target.value)}
              placeholder="e.g. Deputy Secretary — NCAHP"
              className={inputClass}
              style={{ fontSize: 13 }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && filteredSuggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 bg-white rounded-xl overflow-hidden z-50"
                style={{
                  top: '110%',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                  border: '1px solid #e5e7eb',
                  maxHeight: 240,
                  overflowY: 'auto',
                }}
              >
                <div
                  className="px-3 pt-2 pb-1"
                  style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Suggestions
                </div>
                {filteredSuggestions.map((r, i) => {
                  const [role, council] = r.label.split('—').map((s) => s.trim());
                  const isActive = r.label === data.label;
                  return (
                    <button
                      key={i}
                      onMouseDown={() => selectPreset(r)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                      style={{ backgroundColor: isActive ? '#f0fafa' : 'transparent' }}
                    >
                      <User style={{ width: 12, height: 12, color: TEAL }} className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{role}</p>
                        {council && <p style={{ fontSize: 10, color: '#9ca3af' }}>{council}</p>}
                      </div>
                      {isActive && <Check className="ml-auto shrink-0" style={{ width: 12, height: 12, color: TEAL }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-gray-400" style={{ fontSize: 10 }}>
            Format: <span style={{ fontStyle: 'italic' }}>Role Name — Council</span>
          </p>
        </div>

        {/* ── Role ID ───────────────────────────────────────── */}
        <div>
          <label
            className="flex items-center gap-1.5 uppercase tracking-widest text-gray-400 mb-1.5"
            style={{ fontSize: 9, fontWeight: 700 }}
          >
            Role ID
          </label>
          <div
            className={inputClass}
            style={{ fontSize: 13, backgroundColor: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }}
          >
            {data.roleId || 'Auto-assigned on selection'}
          </div>
        </div>

        {/* ── Node ID ──────────────────────────────────────── */}
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}
        >
          <p
            className="text-gray-400 uppercase tracking-widest mb-0.5"
            style={{ fontSize: 8, fontWeight: 700 }}
          >
            Node ID
          </p>
          <p className="text-gray-400 font-mono" style={{ fontSize: 10 }}>
            {node.id}
          </p>
        </div>
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          <X className="w-4 h-4" />
          Remove Role
        </button>
      </div>
    </div>
  );
}
