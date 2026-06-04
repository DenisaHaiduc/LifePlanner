-- CreateTable
CREATE TABLE "PrepDayCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "PrepDayCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PrepDayCompletion_taskId_date_key" ON "PrepDayCompletion"("taskId", "date");
