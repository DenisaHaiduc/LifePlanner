// =============================================================================
// PRESENTATION LAYER - Floating Action Button (FAB)
// =============================================================================

import { motion } from 'framer-motion';

function FloatingActionButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 px-5 py-3.5 text-white rounded-full flex items-center gap-2 font-medium text-[15px] focus:outline-none z-40 transition-apple"
      style={{
        background: `linear-gradient(to right, var(--accent), var(--accent-secondary))`,
        boxShadow: 'var(--shadow-glow)',
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      aria-label="Add new task"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      <span>New Task</span>
    </motion.button>
  );
}

export default FloatingActionButton;
