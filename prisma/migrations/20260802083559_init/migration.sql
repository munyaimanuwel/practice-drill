-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('quiz', 'code');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('draft', 'ready', 'in_progress', 'submitted', 'grade_requested', 'graded', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillSession" (
    "id" UUID NOT NULL,
    "type" "SessionType" NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "topicTags" TEXT[],
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 45,
    "scheduledFor" TIMESTAMP(3),
    "payload" JSONB NOT NULL,
    "answerPayload" JSONB,
    "starterPath" TEXT,
    "submissionPath" TEXT,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "gradeRubricNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "openedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,

    CONSTRAINT "DrillSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DrillSession_userId_status_scheduledFor_idx" ON "DrillSession"("userId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "DrillSession_status_createdAt_idx" ON "DrillSession"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "DrillSession" ADD CONSTRAINT "DrillSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
