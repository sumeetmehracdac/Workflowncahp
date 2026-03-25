import React, { useState, useMemo } from 'react';
import { X, Zap, Search, Check, Trash2 } from 'lucide-react';
import { ACTION_DEFS } from './ActionEdge';
import type { ActionType, ActionEdgeData } from './types';

interface ActionPropertiesPanelProps {
  id: string;
  data: ActionEdgeData;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
  onDelete: () => void;
}

const ORANGE = '#f27e00';

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 transition-all outline-none focus:border-[#f27e00] focus:ring-2 focus:ring-[#f27e00]/10 focus:bg-white';

const ALL_ACTIONS = Array.from({ length: 1000 }, (_, i) => ({
  id: (i + 1).toString().padStart(2, '0'),
  name: i < 6 ? Object.values(ACTION_DEFS)[i].label : `Custom Action ${i + 1}`,
  type: (Object.keys(ACTION_DEFS)[i % 6]) as ActionType,
}));

export default function ActionPropertiesPanel({
  id,
  data,
  onUpdate,
  onClose,
  onDelete,
}: ActionPropertiesPanelProps) {
  const [search, setSearch] = useState('');

  const update = (key: keyof ActionEdgeData, value: string) => {
    onUpdate(id, { ...data, [key]: value });
  };

  const filteredActions = useMemo(() => {
    return ALL_ACTIONS.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50); // limit display for performance
  }, [search]);

  const selectAction = (a: typeof ALL_ACTIONS[0]) => {
    onUpdate(id, {
      ...data,
      action: a.type,
      actionLabel: a.name,
      actionId: a.id,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #d96c00 100%)` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>Action Properties</p>
            <p className="text-white/60" style={{ fontSize: 10 }}>Connector {id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)')}
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        

        {/* ── Search & Select ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0">
          <label
            className="flex items-center gap-1.5 uppercase tracking-widest text-gray-400 mb-1.5"
            style={{ fontSize: 9, fontWeight: 700 }}
          >
            <Search style={{ width: 9, height: 9 }} />
            Search Actions (1000+)
          </label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} pl-9`}
              style={{ fontSize: 13 }}
            />
          </div>
          
          <div className="flex-1 border border-gray-100 rounded-xl overflow-y-auto bg-gray-50/50">
            {filteredActions.map((a) => {
              const isActive = (data.actionLabel || ACTION_DEFS[data.action]?.label) === a.name;
              return (
                <button
                  key={a.id}
                  onClick={() => selectAction(a)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-gray-50 last:border-0 hover:bg-white"
                  style={{ backgroundColor: isActive ? 'white' : 'transparent' }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isActive ? ORANGE : '#f3f4f6' }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? 'white' : '#9ca3af' }}>{a.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? ORANGE : '#374151' }}>{a.name}</p>
                    <p style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase' }}>{a.type}</p>
                  </div>
                  {isActive && <Check style={{ width: 14, height: 14, color: ORANGE }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Delete */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          <Trash2 className="w-4 h-4" />
          Delete Action
        </button>
      </div>
    </div>
  );
}
