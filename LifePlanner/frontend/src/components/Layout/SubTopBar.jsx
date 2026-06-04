// =============================================================================
// PRESENTATION LAYER - Sub Top Bar (Navigation)
// =============================================================================

import { useState } from 'react';
import { format } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function SubTopBar({ visibleMonth, onNavigate }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(visibleMonth?.getMonth() ?? new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(visibleMonth?.getFullYear() ?? new Date().getFullYear());

  const now = new Date();
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

  const displayMonth = visibleMonth ? format(visibleMonth, 'MMMM') : MONTHS[selectedMonth];
  const displayYear = visibleMonth ? visibleMonth.getFullYear() : selectedYear;

  const handleGo = () => {
    onNavigate(selectedMonth, selectedYear);
    setIsPickerOpen(false);
  };

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-center gap-4 px-8 py-3.5 bg-[var(--bg-secondary)] backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <span className="text-[15px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
        {displayMonth} {displayYear}
      </span>

      <button
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        className="p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-apple"
        aria-label="Navigate to month"
        title="Jump to month"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </button>

      {isPickerOpen && (
        <div className="absolute top-full mt-2 bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-[var(--border-subtle)] p-4 flex items-center gap-3 z-30">
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
        </div>
      )}
    </nav>
  );
}

export default SubTopBar;
