/*
  Warnings:

  - You are about to drop the column `quantity` on the `article_installations` table. All the data in the column will be lost.
  - Added the required column `serialReference` to the `article_installations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "article_installations" DROP COLUMN "quantity",
ADD COLUMN     "serialReference" TEXT NOT NULL;
