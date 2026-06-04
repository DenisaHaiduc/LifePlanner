// Seed file to populate the database with sample tasks for development.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  await prisma.task.createMany({
    data: [
      {
        title: 'Team Standup',
        description: 'Daily sync with the development team',
        startDate: today,
        startTime: '09:00',
        endTime: '09:30',
        color: '#3B82F6',
        prepDays: 0,
      },
      {
        title: 'Project Deadline',
        description: 'Submit final deliverables',
        startDate: nextWeek,
        color: '#EF4444',
        prepDays: 3,
      },
      {
        title: 'Vacation',
        startDate: tomorrow,
        endDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        color: '#10B981',
        prepDays: 1,
      },
      {
        title: 'Gym Session',
        startDate: today,
        startTime: '18:00',
        endTime: '19:30',
        color: '#F59E0B',
        prepDays: 0,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
