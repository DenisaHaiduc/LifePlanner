// =============================================================================
// BUSINESS LOGIC LAYER - Task Controller
// =============================================================================

const taskService = require('../services/taskService');
const { addDays, subDays, eachDayOfInterval, isSameDay } = require('date-fns');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// GET /api/tasks/range?start=...&end=...
// Splits multi-day tasks and prep periods into per-day entries,
// each independently checkable.
exports.getTasksByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query params required' });
    }

    const rangeStart = new Date(start);
    const rangeEnd = new Date(end);

    const tasks = await taskService.findByDateRange(rangeStart, rangeEnd);
    const result = [];

    for (const task of tasks) {
      const taskStart = new Date(task.startDate);
      const taskEnd = task.endDate ? new Date(task.endDate) : taskStart;
      const taskOverlaps = taskStart <= rangeEnd && taskEnd >= rangeStart;

      if (taskOverlaps) {
        const isMultiDay = task.endDate && !isSameDay(taskStart, taskEnd);

        if (isMultiDay) {
          // Multi-day task: generate one entry per day, each independently checkable
          const completions = await taskService.getDayCompletions(task.id, 'task');
          const completedDates = new Set(
            completions.map(c => c.date.toISOString().split('T')[0])
          );

          const days = eachDayOfInterval({ start: taskStart, end: taskEnd });
          for (const day of days) {
            if (day >= rangeStart && day <= rangeEnd) {
              const dateKey = day.toISOString().split('T')[0];
              result.push({
                id: `day-${task.id}-${dateKey}`,
                title: task.title,
                description: task.description,
                startDate: day.toISOString(),
                endDate: day.toISOString(),
                startTime: task.startTime,
                endTime: task.endTime,
                color: task.color,
                prepDays: 0,
                isCompleted: completedDates.has(dateKey),
                isPrep: false,
                isMultiDay: true,
                parentTaskId: task.id,
                dayDate: dateKey,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
              });
            }
          }
        } else {
          // Single-day task: use the original isCompleted field
          result.push({ ...task, isPrep: false, isMultiDay: false });
        }
      }

      // Generate individual prep day entries
      if (task.prepDays > 0) {
        const prepStart = subDays(new Date(task.startDate), task.prepDays);
        const prepEnd = subDays(new Date(task.startDate), 1);
        const prepOverlaps = prepStart <= rangeEnd && prepEnd >= rangeStart;

        if (prepOverlaps) {
          const completions = await taskService.getDayCompletions(task.id, 'prep');
          const completedDates = new Set(
            completions.map(c => c.date.toISOString().split('T')[0])
          );

          const days = eachDayOfInterval({ start: prepStart, end: prepEnd });
          for (const day of days) {
            if (day >= rangeStart && day <= rangeEnd) {
              const dateKey = day.toISOString().split('T')[0];
              result.push({
                id: `prep-${task.id}-${dateKey}`,
                title: `Pregătire - ${task.title}`,
                description: task.description,
                startDate: day.toISOString(),
                endDate: day.toISOString(),
                startTime: null,
                endTime: null,
                color: task.color,
                prepDays: 0,
                isCompleted: completedDates.has(dateKey),
                isPrep: true,
                isMultiDay: false,
                parentTaskId: task.id,
                dayDate: dateKey,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
              });
            }
          }
        }
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks by range' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await taskService.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, startDate, endDate, startTime, endTime, color, prepDays } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ error: 'Title and startDate are required' });
    }
    if (prepDays !== undefined && prepDays < 0) {
      return res.status(400).json({ error: 'prepDays must be non-negative' });
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'endDate cannot be before startDate' });
    }

    const task = await taskService.create({
      title,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      color: color || '#3B82F6',
      prepDays: prepDays || 0,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, startDate, endDate, startTime, endTime, color, prepDays, isCompleted } = req.body;

    const existing = await taskService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await taskService.update(req.params.id, {
      title, description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      startTime, endTime, color, prepDays, isCompleted,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// PATCH /api/tasks/:id/toggle - Toggle single-day task completion
exports.toggleComplete = async (req, res) => {
  try {
    const existing = await taskService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await taskService.update(req.params.id, {
      isCompleted: !existing.isCompleted,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task' });
  }
};

// PATCH /api/tasks/:id/day-toggle
// Body: { date: "2026-05-03", type: "task"|"prep" }
// Unified endpoint for toggling per-day completion on multi-day tasks and prep days.
exports.toggleDayCompletion = async (req, res) => {
  try {
    const { date, type } = req.body;
    if (!date || !type) {
      return res.status(400).json({ error: 'date and type are required' });
    }

    const existing = await taskService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isCompleted = await taskService.toggleDayCompletion(req.params.id, new Date(date), type);
    res.json({ taskId: req.params.id, date, type, isCompleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle day completion' });
  }
};

// GET /api/tasks/streak — compute streak data
exports.getStreak = async (req, res) => {
  try {
    const tasks = await taskService.findAllTasksWithCompletions();
    const dayMap = {}; // "YYYY-MM-DD" -> { total, completed }

    const ensureDay = (key) => {
      if (!dayMap[key]) dayMap[key] = { total: 0, completed: 0 };
    };

    const formatDay = (d) => d.toISOString().split('T')[0];

    for (const task of tasks) {
      const taskStart = new Date(task.startDate);
      taskStart.setHours(0, 0, 0, 0);
      const taskEnd = task.endDate ? new Date(task.endDate) : new Date(task.startDate);
      taskEnd.setHours(0, 0, 0, 0);
      const isMultiDay = task.endDate && !isSameDay(taskStart, taskEnd);

      const taskCompletions = new Set(
        task.dayCompletions.filter(c => c.type === 'task').map(c => formatDay(new Date(c.date)))
      );
      const prepCompletions = new Set(
        task.dayCompletions.filter(c => c.type === 'prep').map(c => formatDay(new Date(c.date)))
      );

      if (isMultiDay) {
        const days = eachDayOfInterval({ start: taskStart, end: taskEnd });
        for (const day of days) {
          const key = formatDay(day);
          ensureDay(key);
          dayMap[key].total++;
          if (taskCompletions.has(key)) dayMap[key].completed++;
        }
      } else {
        const key = formatDay(taskStart);
        ensureDay(key);
        dayMap[key].total++;
        if (task.isCompleted) dayMap[key].completed++;
      }

      if (task.prepDays > 0) {
        const prepStart = subDays(taskStart, task.prepDays);
        const prepEnd = subDays(taskStart, 1);
        const days = eachDayOfInterval({ start: prepStart, end: prepEnd });
        for (const day of days) {
          const key = formatDay(day);
          ensureDay(key);
          dayMap[key].total++;
          if (prepCompletions.has(key)) dayMap[key].completed++;
        }
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatDay(today);

    // Current streak: walk backwards, skip empty days
    let currentStreak = 0;
    let cursor = new Date(today);
    // If today is incomplete, start from yesterday
    if (dayMap[todayKey] && dayMap[todayKey].completed < dayMap[todayKey].total) {
      cursor = subDays(cursor, 1);
    }

    const earliestKey = Object.keys(dayMap).sort()[0];
    const earliest = earliestKey ? new Date(earliestKey) : today;

    while (cursor >= earliest) {
      const key = formatDay(cursor);
      if (!dayMap[key]) {
        cursor = subDays(cursor, 1);
        continue;
      }
      if (dayMap[key].completed === dayMap[key].total) {
        currentStreak++;
        cursor = subDays(cursor, 1);
      } else {
        break;
      }
    }

    // Best streak: walk forward from earliest to today
    let bestStreak = 0;
    let running = 0;
    if (earliestKey) {
      const allDays = eachDayOfInterval({ start: earliest, end: today });
      for (const day of allDays) {
        const key = formatDay(day);
        if (!dayMap[key]) continue;
        if (dayMap[key].completed === dayMap[key].total) {
          running++;
          if (running > bestStreak) bestStreak = running;
        } else {
          running = 0;
        }
      }
    }

    // Last 35 days (to fill a 7×5 grid)
    const last35Days = [];
    for (let i = 34; i >= 0; i--) {
      const day = subDays(today, i);
      const key = formatDay(day);
      if (dayMap[key]) {
        last35Days.push({
          date: key,
          totalTasks: dayMap[key].total,
          completedTasks: dayMap[key].completed,
          status: dayMap[key].completed === dayMap[key].total ? 'completed' : 'incomplete',
        });
      } else {
        last35Days.push({ date: key, totalTasks: 0, completedTasks: 0, status: 'empty' });
      }
    }

    res.json({ currentStreak, bestStreak, last35Days });
  } catch (error) {
    console.error('Streak computation error:', error);
    res.status(500).json({ error: 'Failed to compute streak' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const existing = await taskService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await taskService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
