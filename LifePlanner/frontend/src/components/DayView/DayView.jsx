// =============================================================================
// PRESENTATION LAYER - Day View Component
// =============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import taskApi from '../../services/taskApi';
import Timeline from './Timeline';
import TaskPanel from './TaskPanel';

function DayView({ day, onClose, onTaskToggled, onEditTask, onDeleteTask }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDayTasks = async () => {
      setLoading(true);
      try {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        const allTasks = await taskApi.getByDateRange(dayStart, dayEnd);
        const dayTasks = allTasks.filter(task => {
          const start = new Date(task.startDate);
          start.setHours(0, 0, 0, 0);
          const end = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
          end.setHours(23, 59, 59, 999);
          return dayStart >= start && dayStart <= end;
        });
        setTasks(dayTasks);
      } catch (err) {
        console.error('Failed to fetch day tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDayTasks();
  }, [day]);

  const handleToggle = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.isPrep || task.isMultiDay) {
        const type = task.isPrep ? 'prep' : 'task';
        const result = await taskApi.toggleDayCompletion(task.parentTaskId, task.dayDate, type);
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, isCompleted: result.isCompleted } : t
        ));
      } else {
        const updated = await taskApi.toggleComplete(taskId);
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, isCompleted: updated.isCompleted } : t
        ));
      }
      onTaskToggled();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleEdit = async (taskId) => {
    try {
      const task = await taskApi.getById(taskId);
      onEditTask(task);
    } catch (err) {
      console.error('Failed to fetch task for editing:', err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskApi.delete(taskId);
      setTasks(prev => prev.filter(t => {
        if (t.id === taskId) return false;
        if (t.parentTaskId === taskId) return false;
        return true;
      }));
      onDeleteTask();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const allDayTasks = tasks.filter(t => !t.startTime);
  const timedTasks = tasks.filter(t => t.startTime);

  return (
    <motion.div
      className="absolute inset-0 bg-[var(--bg-secondary)] z-30 flex flex-col rounded-t-3xl border-t border-[var(--border-subtle)]"
      style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-[var(--border-subtle)]" />
      </div>

      <div className="flex items-center justify-between px-7 py-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-[-0.02em]">
            {format(day, 'EEEE, MMMM d')}
          </h2>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-accent)] transition-apple"
          aria-label="Close day view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden mx-5 mb-5 gap-4">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[0_2px_12px_rgba(0,0,0,0.3)] p-5">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-[15px]">Loading...</div>
          ) : (
            <Timeline allDayTasks={allDayTasks} timedTasks={timedTasks} />
          )}
        </div>

        <motion.div
          className="w-80 overflow-y-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[0_2px_12px_rgba(0,0,0,0.3)] p-5"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        >
          <TaskPanel
            tasks={tasks}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DayView;
