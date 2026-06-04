const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findAll = async () => {
  return prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

exports.findByCategory = async (category) => {
  return prisma.todo.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
  });
};

exports.findById = async (id) => {
  return prisma.todo.findUnique({ where: { id } });
};

exports.create = async (data) => {
  return prisma.todo.create({ data });
};

exports.update = async (id, data) => {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  return prisma.todo.update({ where: { id }, data: cleanData });
};

exports.remove = async (id) => {
  return prisma.todo.delete({ where: { id } });
};

exports.getHealthyStats = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const todos = await prisma.todo.findMany({
    where: {
      category: 'healthy',
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      }
    }
  });

  const total = todos.length;
  const completed = todos.filter(t => t.isCompleted).length;
  
  return {
    total,
    completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
  };
};
