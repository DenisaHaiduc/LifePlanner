// =============================================================================
// PRESENTATION LAYER - Settings Modal
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorWheel from '../TaskForm/ColorWheel';
import { DEFAULT_DARK, DEFAULT_LIGHT, applyTheme, saveTheme, loadTheme, isDarkColor } from '../../utils/theme';

const COLOR_SECTIONS = [
  { key: 'bg', label: 'Background', description: 'Main app background' },
  { key: 'card', label: 'Cards & Surfaces', description: 'Panels, cells, modals' },
  { key: 'accent', label: 'Accent', description: 'Buttons, highlights, links' },
  { key: 'text', label: 'Text', description: 'Primary text color' },
];

function SettingsModal({ isOpen, onClose }) {
  const [theme, setTheme] = useState(() => loadTheme());
  const [expandedSection, setExpandedSection] = useState(null);
  const saveTimer = useRef(null);

  // Apply theme live as user changes colors
  useEffect(() => {
    if (isOpen) {
      applyTheme(theme);
      // Debounced save to localStorage
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveTheme(theme), 500);
    }
    return () => clearTimeout(saveTimer.current);
  }, [theme, isOpen]);

  // Reload theme when modal opens
  useEffect(() => {
    if (isOpen) {
      setTheme(loadTheme());
      setExpandedSection(null);
    }
  }, [isOpen]);

  const isDark = isDarkColor(theme.bg);

  const handleToggleTheme = () => {
    const preset = isDark ? DEFAULT_LIGHT : DEFAULT_DARK;
    setTheme(preset);
  };

  const handleColorChange = useCallback((key, color) => {
    setTheme(prev => ({ ...prev, [key]: color }));
  }, []);

  const handleReset = () => {
    const preset = isDark ? DEFAULT_DARK : DEFAULT_LIGHT;
    setTheme(preset);
  };

  const handleHexInput = (key, value) => {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      handleColorChange(key, value);
    }
  };

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
              className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] p-7 border"
              style={{
                backgroundColor: `${theme.card}f2`,
                borderColor: `${theme.text}14`,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-[22px] font-semibold tracking-[-0.02em]"
                  style={{ color: theme.text }}
                >
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-apple"
                  style={{ backgroundColor: `${theme.text}14`, color: `${theme.text}88` }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Dark/Light Toggle */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl mb-6 border"
                style={{
                  backgroundColor: `${theme.bg}`,
                  borderColor: `${theme.text}0a`,
                }}
              >
                <div>
                  <p className="text-[15px] font-medium" style={{ color: theme.text }}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: `${theme.text}66` }}>
                    Switch to {isDark ? 'light' : 'dark'} theme
                  </p>
                </div>
                <button
                  onClick={handleToggleTheme}
                  className="relative w-12 h-7 rounded-full transition-apple"
                  style={{ backgroundColor: isDark ? theme.accent : `${theme.text}33` }}
                >
                  <div
                    className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-apple"
                    style={{ left: isDark ? '22px' : '2px' }}
                  />
                </button>
              </div>

              {/* Color Sections */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: `${theme.text}55` }}>
                  Color Customization
                </p>

                {COLOR_SECTIONS.map(({ key, label, description }) => {
                  const isExpanded = expandedSection === key;
                  return (
                    <div
                      key={key}
                      className="rounded-2xl border overflow-hidden transition-apple"
                      style={{
                        backgroundColor: `${theme.bg}`,
                        borderColor: `${theme.text}0a`,
                      }}
                    >
                      {/* Section header — click to expand */}
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : key)}
                        className="w-full flex items-center gap-3 p-4 transition-apple"
                        style={{ color: theme.text }}
                      >
                        {/* Color swatch */}
                        <div
                          className="w-8 h-8 rounded-xl border flex-shrink-0"
                          style={{
                            backgroundColor: theme[key],
                            borderColor: `${theme.text}1a`,
                            boxShadow: `0 0 8px ${theme[key]}40`,
                          }}
                        />
                        <div className="flex-1 text-left">
                          <p className="text-[14px] font-medium">{label}</p>
                          <p className="text-[11px]" style={{ color: `${theme.text}66` }}>{description}</p>
                        </div>
                        {/* Hex value */}
                        <span className="text-[12px] font-mono uppercase" style={{ color: `${theme.text}55` }}>
                          {theme[key]}
                        </span>
                        {/* Expand arrow */}
                        <svg
                          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round"
                          className="transition-apple"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: `${theme.text}44`,
                          }}
                        >
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>

                      {/* Expanded: ColorWheel + hex input */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 flex flex-col items-center gap-3">
                              <ColorWheel
                                key={`settings-${key}`}
                                initialColor={theme[key]}
                                onChange={(color) => handleColorChange(key, color)}
                              />
                              {/* Manual hex input */}
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-mono" style={{ color: `${theme.text}55` }}>#</span>
                                <input
                                  type="text"
                                  defaultValue={theme[key].slice(1)}
                                  onBlur={(e) => handleHexInput(key, `#${e.target.value}`)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleHexInput(key, `#${e.target.value}`);
                                  }}
                                  maxLength={6}
                                  className="w-24 px-3 py-1.5 rounded-lg text-[13px] font-mono uppercase border outline-none transition-apple"
                                  style={{
                                    backgroundColor: theme.bg,
                                    borderColor: `${theme.text}14`,
                                    color: theme.text,
                                  }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full mt-6 py-3 rounded-xl text-[14px] font-medium border transition-apple"
                style={{
                  backgroundColor: `${theme.text}06`,
                  borderColor: `${theme.text}0a`,
                  color: `${theme.text}88`,
                }}
              >
                Reset to Default
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SettingsModal;
