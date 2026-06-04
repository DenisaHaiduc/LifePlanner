// =============================================================================
// PRESENTATION LAYER - Task Panel (Checklist) with Edit/Delete
// =============================================================================

import { motion } from 'framer-motion';

function TaskPanel({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <p className="text-[15px]">No tasks for this day</p>
        <p className="text-[13px] mt-1.5 opacity-60">Tap + to add one</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
        Tasks
      </h3>
      <ul className="space-y-2.5">
        {tasks.map((task, idx) => {
          const canEdit = !task.isPrep && !task.isMultiDay;
          const canEditParent = task.isMultiDay && task.parentTaskId;

          return (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className={`group p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] border-l-[3px] transition-apple ${
                task.isCompleted ? 'opacity-40' : ''
              }`}
              style={{ borderLeftColor: task.color }}
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => onToggle(task.id)}
                  className="apple-checkbox mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-medium text-[var(--text-primary)] ${
                    task.isCompleted ? 'line-through text-[var(--text-muted)]' : ''
                  }`}>
                    {task.title}
                  </p>
                  {task.startTime && (
                    <p className="text-[12px] text-[var(--text-muted)] mt-1">
                      {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                    </p>
                  )}
                  {task.description && (
                    <p className="text-[12px] text-[var(--text-muted)] mt-1 truncate opacity-70">{task.description}</p>
                  )}
                </div>
              </div>

              {(canEdit || canEditParent) && (
                <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-apple">
                  <button
                    onClick={() => onEdit(canEditParent ? task.parentTaskId : task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--border-subtle)] hover:bg-[var(--accent-glow-08)] text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-apple"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(canEditParent ? task.parentTaskId : task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--border-subtle)] hover:bg-red-500/10 text-[12px] text-[var(--text-secondary)] hover:text-red-400 transition-apple"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}

              {task.isPrep && (
                <p className="text-[10px] text-[var(--text-muted)] mt-2 italic opacity-60">Preparation day</p>
              )}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

export default TaskPanel;
