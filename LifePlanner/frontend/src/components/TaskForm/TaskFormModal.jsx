// =============================================================================
// PRESENTATION LAYER - Task Form Modal (Create + Edit + Delete)
// =============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import taskApi from '../../services/taskApi';
import ColorWheel from './ColorWheel';

const EMPTY_FORM = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  color: '#a855f7',
  needsPrep: false,
  prepDays: 0,
};

function TaskFormModal({ isOpen, onClose, onSaved, editTask }) {
  const isEditMode = Boolean(editTask);

  function buildFormData(task) {
    if (!task) return EMPTY_FORM;
    return {
      title: task.title || '',
      description: task.description || '',
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      startTime: task.startTime || '',
      endTime: task.endTime || '',
      color: task.color || '#a855f7',
      needsPrep: (task.prepDays || 0) > 0,
      prepDays: task.prepDays || 0,
    };
  }

  const [formData, setFormData] = useState(() => buildFormData(editTask));
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(buildFormData(editTask));
    setShowDeleteConfirm(false);
  }, [editTask, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      startTime: formData.startTime || null,
      endTime: formData.endTime || null,
      color: formData.color,
      prepDays: formData.needsPrep ? Number(formData.prepDays) : 0,
    };

    try {
      if (isEditMode) {
        await taskApi.update(editTask.id, payload);
      } else {
        await taskApi.create(payload);
      }
      setFormData(EMPTY_FORM);
      onSaved();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await taskApi.delete(editTask.id);
      setFormData(EMPTY_FORM);
      onSaved();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow-30)] text-[15px] text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-apple";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] w-full max-w-md max-h-[85vh] overflow-y-auto p-7 border border-[var(--border-subtle)]"
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-[-0.02em]">
                  {isEditMode ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-apple"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="What needs to be done?"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Optional details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">Start Date *</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="bg-[var(--bg-input)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="needsPrep" checked={formData.needsPrep} onChange={handleChange} className="apple-checkbox" />
                    <span className="text-[15px] font-medium text-[var(--text-primary)]">Needs preparation?</span>
                  </label>

                  {formData.needsPrep && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="mt-3"
                    >
                      <label className="block text-[13px] text-[var(--text-muted)] mb-1.5">How many days before?</label>
                      <input
                        type="number"
                        name="prepDays"
                        value={formData.prepDays}
                        onChange={handleChange}
                        min="1"
                        max="30"
                        className="w-20 px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow-30)] text-[15px] text-[var(--text-primary)] transition-apple"
                      />
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-3">Color</label>
                  <ColorWheel
                    key={isEditMode ? `edit-${editTask.id}` : `new-${isOpen}`}
                    initialColor={isEditMode ? editTask.color : formData.color}
                    onChange={(color) => setFormData(prev => ({ ...prev, color }))}
                  />
                </div>

                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-white rounded-xl font-medium text-[15px] transition-apple disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(to right, var(--accent), var(--accent-secondary))',
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Save Task'}
                  </button>

                  {isEditMode && (
                    <>
                      {showDeleteConfirm ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium text-[14px] hover:bg-red-500/30 transition-apple disabled:opacity-50"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-3 bg-[var(--border-subtle)] text-[var(--text-secondary)] rounded-xl font-medium text-[14px] hover:bg-[var(--accent-glow-08)] transition-apple"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full py-3 bg-[var(--border-subtle)] text-red-400 rounded-xl font-medium text-[14px] hover:bg-red-500/10 transition-apple"
                        >
                          Delete Task
                        </button>
                      )}
                    </>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TaskFormModal;
