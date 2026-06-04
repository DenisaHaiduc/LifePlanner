/*
  Warnings:

  - You are about to drop the `PrepDayCompletion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PrepDayCompletion";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DayCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'task',
    CONSTRAINT "DayCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DayCompletion_taskId_date_type_key" ON "DayCompletion"("taskId", "date", "type");
