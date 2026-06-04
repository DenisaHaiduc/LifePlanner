// =============================================================================
// PRESENTATION LAYER - 24-Hour Timeline Component
// =============================================================================

function Timeline({ allDayTasks, timedTasks }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const timeToPosition = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60 + m) / (24 * 60) * 100;
  };

  const getBlockStyle = (task) => {
    const startPct = timeToPosition(task.startTime);
    const endPct = task.endTime ? timeToPosition(task.endTime) : startPct + (100 / 24);
    return {
      top: `${startPct}%`,
      height: `${Math.max(endPct - startPct, 2)}%`,
      backgroundColor: task.isCompleted ? 'var(--bg-elevated)' : `${task.color}18`,
      opacity: task.isCompleted ? 0.5 : 1,
      borderLeft: `3px solid ${task.isCompleted ? 'var(--text-muted)' : task.color}`,
    };
  };

  return (
    <div>
      {allDayTasks.length > 0 && (
        <div className="mb-5 pb-4 border-b border-[var(--border-subtle)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">All Day</span>
          <div className="mt-2.5 space-y-1.5">
            {allDayTasks.map(task => (
              <div
                key={task.id}
                className={`px-3.5 py-2 rounded-xl text-[13px] font-medium border-l-[3px] bg-[var(--bg-input)] ${
                  task.isCompleted ? 'line-through opacity-50 text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                }`}
                style={{ borderLeftColor: task.isCompleted ? 'var(--text-muted)' : task.color }}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative" style={{ height: '1440px' }}>
        {hours.map(hour => (
          <div
            key={hour}
            className="absolute w-full flex items-start"
            style={{ top: `${(hour / 24) * 100}%` }}
          >
            <span className="text-[10px] text-[var(--text-muted)] w-10 -mt-2 text-right pr-3 font-light">
              {String(hour).padStart(2, '0')}:00
            </span>
            <div className="flex-1 border-t border-[var(--border-subtle)]" />
          </div>
        ))}

        <div className="absolute left-12 right-2 top-0 bottom-0">
          {timedTasks.map(task => (
            <div
              key={task.id}
              className={`absolute left-0 right-0 rounded-xl px-3 py-1.5 text-[12px] font-medium overflow-hidden transition-apple border border-[var(--border-subtle)] ${
                task.isCompleted ? 'line-through' : ''
              }`}
              style={getBlockStyle(task)}
            >
              <span className={task.isCompleted ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}>
                {task.title}
              </span>
              {task.startTime && (
                <span className="block text-[10px] opacity-60 mt-0.5">
                  {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
