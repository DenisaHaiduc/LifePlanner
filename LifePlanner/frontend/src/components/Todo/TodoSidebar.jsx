import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { todoApi } from '../../services/todoApi';

function TodoSidebar({ isOpen, onClose, onTodoChanged }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [deadline, setDeadline] = useState('');

  const fetchTodos = async () => {
    try {
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTodos();
    }
  }, [isOpen]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await todoApi.create({
      title,
      category,
      deadline: deadline ? deadline : null
    });
    
    setTitle('');
    setDeadline('');
    fetchTodos();
    if (onTodoChanged) onTodoChanged();
  };

  const handleToggle = async (id) => {
    await todoApi.toggle(id);
    fetchTodos();
    if (onTodoChanged) onTodoChanged();
  };

  const handleDelete = async (id) => {
    await todoApi.delete(id);
    fetchTodos();
    if (onTodoChanged) onTodoChanged();
  };

  // Group by category
  const groupedTodos = todos.reduce((acc, todo) => {
    if (!acc[todo.category]) acc[todo.category] = [];
    acc[todo.category].push(todo);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] shadow-[8px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col"
          >
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="text-xl font-semibold accent-gradient-text">To Do List</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-muted)] transition-apple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {Object.entries(groupedTodos).map(([cat, items]) => (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">{cat}</h3>
                  <div className="space-y-2">
                    {items.map(todo => (
                      <div key={todo.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] group">
                        <label className="relative flex items-center cursor-pointer mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={todo.isCompleted} 
                            onChange={() => handleToggle(todo.id)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded border-2 border-[var(--border-subtle)] peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] transition-all flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        </label>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${todo.isCompleted ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'} truncate`}>
                            {todo.title}
                          </p>
                          {todo.deadline && (
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Due: {format(new Date(todo.deadline), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <button onClick={() => handleDelete(todo.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-400/20 rounded transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {todos.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] text-center mt-10">No tasks yet.</p>
              )}
            </div>

            <form onSubmit={handleAdd} className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="New task..." 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
                <div className="flex gap-2">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  >
                    <option value="general">General</option>
                    <option value="healthy">Healthy</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                  </select>
                  <input 
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-[var(--shadow-glow)]">
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TodoSidebar;
