const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Tasks due tomorrow (for calendar tasks)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        startDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        }
      }
    });

    // ToDos due tomorrow
    const upcomingTodos = await prisma.todo.findMany({
      where: {
        deadline: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        },
        isCompleted: false
      }
    });

    const notifications = [
      ...upcomingTasks.map(t => ({
        id: `task-${t.id}`,
        type: 'task',
        title: `Reminder: ${t.title} starts tomorrow!`,
        date: t.startDate
      })),
      ...upcomingTodos.map(t => ({
        id: `todo-${t.id}`,
        type: 'todo',
        title: `Deadline: ${t.title} is due tomorrow!`,
        date: t.deadline
      }))
    ];

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
