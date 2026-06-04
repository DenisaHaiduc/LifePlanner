// =============================================================================
// PRESENTATION LAYER - App Root
// =============================================================================

import { useState, useCallback, useLayoutEffect } from 'react';
import TopBar from './components/Layout/TopBar';
import InfiniteCalendar from './components/Calendar/InfiniteCalendar';
import TaskFormModal from './components/TaskForm/TaskFormModal';
import DayView from './components/DayView/DayView';
import FloatingActionButton from './components/Layout/FloatingActionButton';
import StreakWidget from './components/Layout/StreakWidget';
import SettingsModal from './components/Settings/SettingsModal';
import TodoSidebar from './components/Todo/TodoSidebar';
import { loadTheme, applyTheme } from './utils/theme';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [navigateTarget, setNavigateTarget] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  // Apply saved theme on mount (useLayoutEffect avoids flash)
  useLayoutEffect(() => {
    applyTheme(loadTheme());
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleNewTask = useCallback(() => {
    setEditTask(null);
    setIsFormOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setEditTask(task);
    setIsFormOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    setIsFormOpen(false);
    setEditTask(null);
    refresh();
  }, [refresh]);

  const handleCloseModal = useCallback(() => {
    setIsFormOpen(false);
    setEditTask(null);
  }, []);

  const handleDayClick = useCallback((day) => {
    setSelectedDay(day);
  }, []);

  const handleCloseDayView = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const handleDeleteFromDayView = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleNavigate = useCallback((month, year) => {
    setNavigateTarget(new Date(year, month, 1));
  }, []);

  const handleVisibleMonthChange = useCallback((monthDate) => {
    setVisibleMonth(monthDate);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)] bg-noise">
      <TopBar
        visibleMonth={visibleMonth}
        onNavigate={handleNavigate}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onTodoClick={() => setIsTodoOpen(true)}
        refreshKey={refreshKey}
      />

      <main className="flex-1 relative overflow-hidden">
        <InfiniteCalendar
          onDayClick={handleDayClick}
          refreshKey={refreshKey}
          navigateTarget={navigateTarget}
          onVisibleMonthChange={handleVisibleMonthChange}
        />

        {selectedDay && (
          <DayView
            day={selectedDay}
            onClose={handleCloseDayView}
            onTaskToggled={refresh}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteFromDayView}
          />
        )}
      </main>

      <StreakWidget refreshKey={refreshKey} />
      <FloatingActionButton onClick={handleNewTask} />

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        onSaved={handleSaved}
        editTask={editTask}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <TodoSidebar 
        isOpen={isTodoOpen}
        onClose={() => setIsTodoOpen(false)}
        onTodoChanged={refresh}
      />
    </div>
  );
}

export default App;
