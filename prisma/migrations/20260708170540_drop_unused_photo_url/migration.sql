/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Submission` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL DEFAULT 'text',
    "rawText" TEXT,
    "language" TEXT,
    "translatedText" TEXT,
    "photoDataUrl" TEXT,
    "photoDescription" TEXT,
    "audioDataUrl" TEXT,
    "category" TEXT,
    "urgency" INTEGER,
    "sentiment" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "citizenName" TEXT,
    "lat" REAL,
    "lng" REAL,
    "wardId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("audioDataUrl", "category", "channel", "citizenName", "createdAt", "errorMessage", "id", "language", "lat", "lng", "photoDataUrl", "photoDescription", "rawText", "sentiment", "status", "summary", "translatedText", "urgency", "wardId") SELECT "audioDataUrl", "category", "channel", "citizenName", "createdAt", "errorMessage", "id", "language", "lat", "lng", "photoDataUrl", "photoDescription", "rawText", "sentiment", "status", "summary", "translatedText", "urgency", "wardId" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
