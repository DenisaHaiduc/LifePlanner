// =============================================================================
// PRESENTATION LAYER - Streak Widget
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import taskApi from '../../services/taskApi';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StreakWidget({ refreshKey }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const result = await taskApi.getStreak();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch streak:', err);
      }
    };
    fetchStreak();
  }, [refreshKey]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isExpanded]);

  const streak = data?.currentStreak ?? 0;

  // Build a lookup map from the API data
  const dayStatusMap = {};
  if (data?.last35Days) {
    for (const d of data.last35Days) {
      dayStatusMap[d.date] = d;
    }
  }

  // Generate a full 5-week calendar grid aligned to weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gridEnd = today;
  const gridStart = startOfWeek(subDays(today, 34), { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Pad to fill the last week row
  const remainder = allDays.length % 7;
  const padDays = remainder === 0 ? 0 : 7 - remainder;
  for (let i = 0; i < padDays; i++) {
    allDays.push(subDays(gridStart, padDays - i));
  }

  // Split into rows of 7
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <div ref={widgetRef} className="fixed bottom-8 left-8 z-40">
      <AnimatePresence>
        {isExpanded && data && (
          <motion.div
            className="absolute bottom-full left-0 mb-3 w-80 rounded-2xl p-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[32px] leading-none">🔥</span>
                <div>
                  <p className="text-[28px] font-bold text-[var(--text-primary)] leading-none tracking-tight">
                    {data.currentStreak}
                  </p>
                  <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-0.5">
                    day streak!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Best</p>
                <p className="text-[18px] font-bold text-[var(--text-secondary)] leading-none">
                  {data.bestStreak}
                </p>
              </div>
            </div>

            {/* Mini calendar grid */}
            <div className="bg-[var(--bg-primary)] rounded-xl p-3 border border-[var(--border-subtle)]">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-[9px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 gap-1.5 mb-1.5 last:mb-0">
                  {week.map((day, dIdx) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const info = dayStatusMap[key];
                    const isToday = key === format(new Date(), 'yyyy-MM-dd');
                    const isFuture = day > today;
                    const dayNum = format(day, 'd');

                    let bgColor;
                    let textColor = 'var(--text-muted)';
                    let tooltip = `${format(day, 'MMM d')}: no tasks`;

                    if (isFuture) {
                      bgColor = 'transparent';
                      textColor = 'var(--border-subtle)';
                      tooltip = '';
                    } else if (info?.status === 'completed') {
                      bgColor = 'var(--accent)';
                      textColor = '#fff';
                      tooltip = `${format(day, 'MMM d')}: ${info.completedTasks}/${info.totalTasks} done ✓`;
                    } else if (info?.status === 'incomplete') {
                      bgColor = 'var(--accent-glow-30)';
                      textColor = 'var(--text-primary)';
                      tooltip = `${format(day, 'MMM d')}: ${info.completedTasks}/${info.totalTasks} done`;
                    } else {
                      bgColor = 'var(--bg-card)';
                    }

                    return (
                      <div
                        key={dIdx}
                        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-medium transition-apple"
                        style={{ backgroundColor: bgColor, color: textColor }}
                        title={tooltip}
                      >
                        {dayNum}
                        {isToday && (
                          <div
                            className="absolute bottom-0.5 w-1 h-1 rounded-full"
                            style={{ backgroundColor: bgColor === 'var(--accent)' ? '#fff' : 'var(--accent)' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: 'var(--accent)' }} />
                <span>All done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: 'var(--accent-glow-30)' }} />
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
                <span>No tasks</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed pill */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-[15px] transition-apple"
        style={{
          background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))',
          boxShadow: 'var(--shadow-glow)',
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <span className="text-[18px] leading-none">🔥</span>
        <span>{streak}</span>
      </motion.button>
    </div>
  );
}

export default StreakWidget;
