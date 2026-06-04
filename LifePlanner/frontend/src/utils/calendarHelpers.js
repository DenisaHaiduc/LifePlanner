// =============================================================================
// UTILITY - Calendar Helper Functions
// =============================================================================
// Pure utility functions for calendar date calculations.

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  format,
  isSameDay,
  isWithinInterval,
} from 'date-fns';

// Generate the grid of days for a given month (including padding days from
// adjacent months to fill complete weeks)
export function getMonthGrid(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

// Check if a task falls on a specific day (including multi-day span)
export function isTaskOnDay(task, day) {
  const start = new Date(task.startDate);
  const end = task.endDate ? new Date(task.endDate) : start;
  return isWithinInterval(day, { start, end }) || isSameDay(day, start);
}

// Convert a hex color to a pastel version (for prep tasks)
export function toPastel(hex, opacity = 0.3) {
  return `${hex}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

// Generate months array for infinite scroll (previous, current, next N months)
export function generateMonthsRange(centerDate, radius = 3) {
  const months = [];
  for (let i = -radius; i <= radius; i++) {
    months.push(addMonths(centerDate, i));
  }
  return months;
}
