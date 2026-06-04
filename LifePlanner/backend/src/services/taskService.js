// =============================================================================
// DATA ACCESS LAYER - Task Service
// =============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findAll = async () => {
  return prisma.task.findMany({
    orderBy: { startDate: 'asc' },
  });
};

exports.findByDateRange = async (start, end) => {
  return prisma.task.findMany({
    where: {
      OR: [
        {
          startDate: { lte: end },
          OR: [
            { endDate: { gte: start } },
            { endDate: null, startDate: { gte: start } },
          ],
        },
        {
          prepDays: { gt: 0 },
          startDate: { gte: start },
        },
      ],
    },
    orderBy: { startDate: 'asc' },
  });
};

exports.findById = async (id) => {
  return prisma.task.findUnique({ where: { id } });
};

exports.create = async (data) => {
  return prisma.task.create({ data });
};

exports.update = async (id, data) => {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  return prisma.task.update({ where: { id }, data: cleanData });
};

exports.remove = async (id) => {
  return prisma.task.delete({ where: { id } });
};

// Get all day completions for a task, optionally filtered by type
exports.getDayCompletions = async (taskId, type) => {
  const where = { taskId };
  if (type) where.type = type;
  return prisma.dayCompletion.findMany({ where });
};

// Toggle a specific day's completion for a task
exports.toggleDayCompletion = async (taskId, date, type = 'task') => {
  const existing = await prisma.dayCompletion.findUnique({
    where: { taskId_date_type: { taskId, date, type } },
  });

  if (existing) {
    await prisma.dayCompletion.delete({ where: { id: existing.id } });
    return false;
  } else {
    await prisma.dayCompletion.create({ data: { taskId, date, type } });
    return true;
  }
};

// Fetch all tasks with their day completions (for streak computation)
exports.findAllTasksWithCompletions = async () => {
  return prisma.task.findMany({
    include: { dayCompletions: true },
    orderBy: { startDate: 'asc' },
  });
};
