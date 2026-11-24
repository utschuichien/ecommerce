/*
  Warnings:

  - You are about to drop the column `price_at_add` on the `cart_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cart_items` DROP COLUMN `price_at_add`,
    ADD COLUMN `is_selected` BOOLEAN NOT NULL DEFAULT true;

