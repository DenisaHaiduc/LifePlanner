// =============================================================================
// PRESENTATION LAYER - Top Bar Component
// =============================================================================

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { todoApi, notificationApi } from '../../services/todoApi';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function TopBar({ visibleMonth, onNavigate, onSettingsClick, onTodoClick, refreshKey }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(visibleMonth?.getMonth() ?? new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(visibleMonth?.getFullYear() ?? new Date().getFullYear());
  
  const [healthyStats, setHealthyStats] = useState({ total: 0, completed: 0, percentage: 0 });
  const [notifications, setNotifications] = useState([]);

  const now = new Date();
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

  const displayMonth = visibleMonth ? format(visibleMonth, 'MMMM') : MONTHS[selectedMonth];
  const displayYear = visibleMonth ? visibleMonth.getFullYear() : selectedYear;

  const fetchData = async () => {
    try {
      const stats = await todoApi.getHealthyStats();
      setHealthyStats(stats);
      
      const notifs = await notificationApi.getAll();
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleGo = () => {
    onNavigate(selectedMonth, selectedYear);
    setIsPickerOpen(false);
  };

  return (
    <header className="relative flex items-center justify-between px-8 py-4 glass border-b border-[var(--border-subtle)] z-20">
      <div className="flex items-center gap-6">
        <h1 className="text-[20px] font-semibold tracking-[-0.03em] accent-gradient-text">
          LifePlanner
        </h1>
        
        {/* Healthy Status Bar */}
        <div className="flex flex-col gap-1 w-32 hidden sm:flex" title={`Monthly Healthy ToDos: ${healthyStats.completed} / ${healthyStats.total}`}>
          <div className="flex justify-between text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
            <span>Health</span>
            <span>{healthyStats.percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-input)] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${healthyStats.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 10px rgba(34,197,94,0.5)' }}
            />
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 hidden md:flex">
        <span className="text-[15px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
          {displayMonth}
        </span>
        <span className="text-[15px] font-light text-[var(--text-muted)]">
          {displayYear}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* To Do Button */}
        <button
          onClick={onTodoClick}
          className="px-3 py-2 text-sm font-medium rounded-xl text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
        >
          To Do
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2.5 rounded-xl transition-apple relative ${
              isNotifOpen ? 'bg-[var(--border-subtle)] text-[var(--text-accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-accent)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </button>
          
          <AnimatePresence>
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                <motion.div
                  className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)] overflow-hidden z-30"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                >
                  <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-[var(--text-muted)] text-center">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-input)] transition-colors">
                          <p className="text-sm text-[var(--text-primary)]">{n.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{format(new Date(n.date), 'MMM d, yyyy')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className={`p-2.5 rounded-xl transition-apple ${
            isPickerOpen
              ? 'bg-[var(--border-subtle)] text-[var(--text-accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-accent)] hover:bg-[var(--border-subtle)]'
          }`}
          aria-label="Jump to month"
          title="Jump to month"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>

        <button
          onClick={onSettingsClick}
          className="text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-apple p-2.5 rounded-xl hover:bg-[var(--border-subtle)]"
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isPickerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPickerOpen(false)}
            />

            <motion.div
              className="absolute right-8 top-full mt-2 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)] p-4 flex items-center gap-3 z-30"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow-30)] transition-apple"
              >
                {MONTHS.map((month, i) => (
                  <option key={month} value={i}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] bg-[var(--bg-input)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow-30)] transition-apple"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={handleGo}
                className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-apple"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                Go
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default TopBar;
