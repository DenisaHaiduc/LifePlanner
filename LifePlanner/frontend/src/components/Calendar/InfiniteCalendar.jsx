// =============================================================================
// PRESENTATION LAYER - Infinite Calendar Component
// =============================================================================
// User-controlled scrollable calendar. Starts at the current month.
// Loads more months when the user scrolls near the top/bottom edges.
// Reports which month is currently visible so the top bar can update.

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { generateMonthsRange } from '../../utils/calendarHelpers';
import taskApi from '../../services/taskApi';
import MonthGrid from './MonthGrid';

function InfiniteCalendar({ onDayClick, refreshKey, navigateTarget, onVisibleMonthChange }) {
  const [months, setMonths] = useState(() => generateMonthsRange(new Date(), 6));
  const [tasks, setTasks] = useState([]);
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);
  const scrollRef = useRef(null);
  const monthRefs = useRef({});
  const prevScrollHeightRef = useRef(0);
  const hasScrolledToToday = useRef(false);

  // Fetch tasks for the visible range
  useEffect(() => {
    const fetchTasks = async () => {
      if (months.length === 0) return;
      const rangeStart = startOfMonth(months[0]);
      const rangeEnd = endOfMonth(months[months.length - 1]);
      try {
        const data = await taskApi.getByDateRange(rangeStart, rangeEnd);
        setTasks(data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    fetchTasks();
  }, [months, refreshKey]);

  // On first render, scroll to the current month
  useLayoutEffect(() => {
    if (hasScrolledToToday.current) return;
    const now = new Date();
    const key = format(now, 'yyyy-MM');
    const el = monthRefs.current[key];
    if (el && scrollRef.current) {
      el.scrollIntoView({ block: 'start' });
      hasScrolledToToday.current = true;
    }
  }, [months]);

  // Navigate to target month when user picks from the dropdown
  useEffect(() => {
    if (!navigateTarget) return;
    const key = format(navigateTarget, 'yyyy-MM');
    const el = monthRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Target month not loaded yet — recenter months around it
      setMonths(generateMonthsRange(navigateTarget, 6));
      setTimeout(() => {
        const el2 = monthRefs.current[key];
        if (el2) el2.scrollIntoView({ block: 'start' });
      }, 50);
    }
  }, [navigateTarget]);

  // Detect which month is currently visible and report it up
  const detectVisibleMonth = useCallback(() => {
    if (!scrollRef.current || !onVisibleMonthChange) return;
    const container = scrollRef.current;
    const containerTop = container.getBoundingClientRect().top;

    for (const monthDate of months) {
      const key = format(monthDate, 'yyyy-MM');
      const el = monthRefs.current[key];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // The first month whose bottom is below the container top
      if (rect.bottom > containerTop + 50) {
        onVisibleMonthChange(monthDate);
        break;
      }
    }
  }, [months, onVisibleMonthChange]);

  // Handle user scroll
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    detectVisibleMonth();

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 300;

    // User scrolled near the top — prepend earlier months
    if (scrollTop < threshold && !isLoadingTop) {
      setIsLoadingTop(true);
      prevScrollHeightRef.current = scrollHeight;

      setMonths(prev => {
        const earliest = prev[0];
        return [
          subMonths(earliest, 3),
          subMonths(earliest, 2),
          subMonths(earliest, 1),
          ...prev,
        ];
      });
    }

    // User scrolled near the bottom — append future months
    if (scrollTop + clientHeight > scrollHeight - threshold && !isLoadingBottom) {
      setIsLoadingBottom(true);

      setMonths(prev => {
        const latest = prev[prev.length - 1];
        return [
          ...prev,
          addMonths(latest, 1),
          addMonths(latest, 2),
          addMonths(latest, 3),
        ];
      });
    }
  }, [isLoadingTop, isLoadingBottom, detectVisibleMonth]);

  // After prepending months, restore scroll position
  useEffect(() => {
    if (isLoadingTop && scrollRef.current) {
      const container = scrollRef.current;
      const newScrollHeight = container.scrollHeight;
      const addedHeight = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop = addedHeight;
      setIsLoadingTop(false);
    }
  }, [months, isLoadingTop]);

  // Reset bottom loading flag
  useEffect(() => {
    if (isLoadingBottom) {
      setIsLoadingBottom(false);
    }
  }, [months, isLoadingBottom]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto calendar-scroll px-6 py-4"
    >
      {months.map((monthDate) => {
        const key = format(monthDate, 'yyyy-MM');
        return (
          <div key={key} ref={(el) => { monthRefs.current[key] = el; }}>
            <MonthGrid
              monthDate={monthDate}
              tasks={tasks}
              onDayClick={onDayClick}
            />
          </div>
        );
      })}
    </div>
  );
}

export default InfiniteCalendar;
