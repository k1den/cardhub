'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export interface DailyStatItem {
  date: string;
  label: string;
  views: number;
  nfc: number;
  qr: number;
  direct: number;
  vcard: number;
  clicks: number;
}

interface DailyStatsChartProps {
  data: DailyStatItem[];
}

export default function DailyStatsChart({ data }: DailyStatsChartProps) {
  // Only track hover state - no pre-selection, no pinned state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate maximum views for relative bar heights
  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const totalPeriodViews = data.reduce((acc, d) => acc + d.views, 0);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-[32px] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-xl dark:shadow-2xl space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span>Динамика просмотров по дням (последние 14 дней)</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Подсчёт ведётся на защищенном сервере в реальном времени
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <span>Всего за период:</span>
          <span className="font-extrabold text-stone-900 dark:text-white px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            {totalPeriodViews} просм.
          </span>
        </div>
      </div>

      {/* Bar Chart Track: ample height so tooltips are never clipped */}
      <div className="overflow-x-auto no-scrollbar pt-2 pb-2">
        <div className="min-w-[480px] sm:min-w-0 h-64 flex items-end justify-between gap-1.5 sm:gap-3 px-2">
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index;

            // Bar height: scaled up to 55% of container height (leaves 45% clear above bar for tooltip)
            const heightPercent = Math.max((d.views / maxViews) * 55, 6);

            // Side alignment for floating tooltip to prevent horizontal overflow
            const isNearRight = index >= data.length - 3;
            const isNearLeft = index <= 2;
            const tooltipAlignClass = isNearRight
              ? 'right-0'
              : isNearLeft
                ? 'left-0'
                : 'left-1/2 -translate-x-1/2';

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip: ONLY visible when hovering */}
                {isHovered && (
                  <div
                    className={`transition-all duration-150 absolute z-30 pointer-events-none whitespace-nowrap ${tooltipAlignClass} animate-in fade-in zoom-in-95 duration-150`}
                    style={{
                      bottom: `calc(${heightPercent}% + 10px)`,
                    }}
                  >
                    <div className="text-[11px] bg-stone-900/95 dark:bg-stone-950 text-white border border-stone-700/80 dark:border-stone-700 px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md space-y-1">
                      <div className="font-bold flex items-center justify-between gap-3 border-b border-stone-800 pb-1 text-amber-400">
                        <span>{d.label}</span>
                        <span>{d.views} просм.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <span>NFC: {d.nfc}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>QR: {d.qr}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Клики: {d.clicks}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>vCard: {d.vcard}</span>
                        </div>
                      </div>
                    </div>
                    {/* Tooltip Arrow Pointer */}
                    <div
                      className={`w-2.5 h-2.5 bg-stone-900/95 dark:bg-stone-950 border-r border-b border-stone-700/80 rotate-45 mx-auto -mt-1.5 ${isNearRight ? 'mr-4 ml-auto' : isNearLeft ? 'ml-4 mr-auto' : ''
                        }`}
                    />
                  </div>
                )}

                {/* The Bar */}
                <div
                  className={`w-full max-w-[32px] rounded-t-2xl transition-all duration-200 relative ${isHovered
                      ? 'bg-gradient-to-t from-amber-600 via-orange-500 to-amber-300 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400 scale-[1.04]'
                      : 'bg-gradient-to-t from-amber-600/70 via-orange-500/80 to-amber-400/90 hover:from-amber-600 hover:to-orange-400'
                    }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Subtle highlight pill inside bar if views > 0 */}
                  {d.views > 0 && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/70" />
                  )}
                </div>

                {/* Date Label under the bar */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold transition-colors duration-150 ${isHovered
                      ? 'text-amber-600 dark:text-amber-400 scale-105 font-bold'
                      : 'text-stone-500 dark:text-stone-400'
                    }`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-5 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
          <span className="font-medium text-stone-800 dark:text-stone-200">Все просмотры</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shadow-xs" />
          <span>NFC-стикеры</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
          <span>QR-код</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
          <span>Сохранения vCard</span>
        </div>
      </div>
    </div>
  );
}
