// =============================================================================
// PRESENTATION LAYER - Month Grid Component
// =============================================================================

import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { getMonthGrid, isTaskOnDay, toPastel } from '../../utils/calendarHelpers';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getBarEdges(task, day, colIndex) {
  const taskStart = new Date(task.startDate);
  taskStart.setHours(0, 0, 0, 0);
  const taskEnd = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
  taskEnd.setHours(0, 0, 0, 0);

  const dayTime = new Date(day);
  dayTime.setHours(0, 0, 0, 0);

  const isFirstDay = isSameDay(dayTime, taskStart);
  const isLastDay = isSameDay(dayTime, taskEnd);

  const cappedLeft = isFirstDay || colIndex === 0;
  const cappedRight = isLastDay || colIndex === 6;

  return { cappedLeft, cappedRight };
}

function MonthGrid({ monthDate, tasks, onDayClick }) {
  const days = getMonthGrid(monthDate);

  const getTasksForDay = (day) => {
    return tasks.filter(task => isTaskOnDay(task, day));
  };

  return (
    <div className="mb-10">
      <h2 className="text-[20px] font-semibold text-[var(--text-primary)] mb-4 px-1 tracking-[-0.02em]">
        {format(monthDate, 'MMMM')}{' '}
        <span className="font-light text-[var(--text-muted)]">{format(monthDate, 'yyyy')}</span>
      </h2>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider py-1.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, idx) => {
          const inMonth = isSameMonth(day, monthDate);
          const today = isToday(day);
          const dayTasks = getTasksForDay(day);
          const col = idx % 7;

          return (
            <button
              key={idx}
              onClick={() => onDayClick(day)}
              className={`
                relative min-h-[100px] rounded-2xl text-sm text-left
                transition-apple border overflow-hidden
                ${inMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}
                ${!today ? 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)]' : ''}
              `}
              style={today ? {
                backgroundColor: 'var(--accent-glow-08)',
                borderColor: 'var(--accent-glow-30)',
                boxShadow: `0 0 15px var(--accent-glow-08)`,
              } : undefined}
            >
              <span className={`block text-right text-[12px] font-medium p-2.5 pb-1 ${
                today ? 'text-[var(--text-accent)]' : ''
              }`}>
                {format(day, 'd')}
              </span>

              <div className="mt-0.5 space-y-[3px] pb-2">
                {dayTasks.slice(0, 4).map((task) => {
                  const { cappedLeft, cappedRight } = getBarEdges(task, day, col);
                  const color = task.isPrep ? toPastel(task.color, 0.5) : task.color;

                  const ml = cappedLeft ? '4px' : '0';
                  const mr = cappedRight ? '4px' : '0';
                  const borderRadius = `${cappedLeft ? '4px' : '0'} ${cappedRight ? '4px' : '0'} ${cappedRight ? '4px' : '0'} ${cappedLeft ? '4px' : '0'}`;

                  return (
                    <div
                      key={task.id}
                      className="h-[18px] flex items-center"
                      title={task.title}
                      style={{
                        marginLeft: ml,
                        marginRight: mr,
                        backgroundColor: color,
                        opacity: task.isPrep ? 0.5 : 0.85,
                        borderRadius,
                      }}
                    >
                      {cappedLeft && (
                        <span className="text-[10px] font-medium text-white truncate leading-none px-1.5 drop-shadow-sm">
                          {task.title}
                        </span>
                      )}
                    </div>
                  );
                })}
                {dayTasks.length > 4 && (
                  <span className="text-[9px] text-[var(--text-muted)] px-2">+{dayTasks.length - 4} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MonthGrid;
