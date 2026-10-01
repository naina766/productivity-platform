-- CreateEnum
CREATE TYPE "RecurrenceInterval" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "recurrenceInterval" "RecurrenceInterval",
ADD COLUMN "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN "recurringParentId" UUID;

-- CreateIndex
CREATE INDEX "Task_isRecurring_idx" ON "Task"("isRecurring");

-- CreateIndex
CREATE INDEX "Task_recurringParentId_idx" ON "Task"("recurringParentId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recurringParentId_fkey" FOREIGN KEY ("recurringParentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
