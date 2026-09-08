-- AlterTable
ALTER TABLE "users" ALTER COLUMN "googleId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "login_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_tokens_tokenHash_key" ON "login_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "login_tokens_email_idx" ON "login_tokens"("email");
