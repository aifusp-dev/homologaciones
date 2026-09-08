-- AlterTable
ALTER TABLE "login_tokens" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;
