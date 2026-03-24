import React from 'react';
import { User, GripVertical } from 'lucide-react';
import { STAGE_CONFIG } from './mock-data';
import type { StageId } from './types';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string, stageId?: string) => void;
}

const TEAL = '#008484';

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <div className="flex flex-col gap-6 h-full">

      {/* ── Actual Role draggable ─────────────────────────────────── */}
      <div>
        <p
          className="uppercase tracking-widest text-gray-400 px-1 mb-2.5"
          style={{ fontSize: 10, fontWeight: 700 }}
        >
          Role Node
        </p>

        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'roleNode')}
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-200 group"
          style={{
            background: 'linear-gradient(135deg, #e0f4f4 0%, #f0fafa 100%)',
            border: `2px dashed rgba(0,132,132,0.4)`,
            userSelect: 'none',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = TEAL)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor =
              'rgba(0,132,132,0.4)')
          }
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${TEAL}, #006868)` }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800" style={{ fontSize: 13, fontWeight: 700 }}>
              Actual Role
            </p>
            <p className="text-gray-500" style={{ fontSize: 10 }}>
              Drag onto a stage lane
            </p>
          </div>
          <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0" />
        </div>
      </div>

      {/* ── Stage Lanes ───────────────────────────────────────────── */}
      <div className="flex-1">
        <p
          className="uppercase tracking-widest text-gray-400 px-1 mb-2.5"
          style={{ fontSize: 10, fontWeight: 700 }}
        >
          Stage Lanes
        </p>
        <p className="text-gray-400 px-1 mb-3" style={{ fontSize: 10 }}>
          Drag a stage onto the canvas to place it
        </p>
        <div className="flex flex-col gap-2">
          {(Object.keys(STAGE_CONFIG) as StageId[]).map((stage) => {
            const conf = STAGE_CONFIG[stage];
            return (
              <div
                key={stage}
                draggable
                onDragStart={(e) => onDragStart(e, 'swimlaneNode', stage)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                style={{
                  backgroundColor: conf.lightBg,
                  border: `1.5px dashed ${conf.borderColor}`,
                  userSelect: 'none',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor = conf.color)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor = conf.borderColor)
                }
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: conf.color }}
                >
                  <span className="text-white" style={{ fontSize: 11, fontWeight: 800 }}>
                    {conf.step}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 12, fontWeight: 700, color: conf.color }}>
                    {conf.label}
                  </p>
                  <p
                    className="text-gray-400 truncate"
                    style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    {conf.sublabel}
                  </p>
                </div>
                <GripVertical
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: conf.color, opacity: 0.4 }}
                />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
