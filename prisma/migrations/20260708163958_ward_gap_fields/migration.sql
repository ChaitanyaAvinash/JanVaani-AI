/*
  Warnings:

  - Added the required column `electricityGapPct` to the `Ward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `housingGapPct` to the `Ward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadGapScore` to the `Ward` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameHi" TEXT,
    "nameTe" TEXT,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "population" INTEGER NOT NULL,
    "literacyRate" REAL NOT NULL,
    "unemploymentRate" REAL NOT NULL,
    "schoolEnrollment" INTEGER NOT NULL,
    "schoolCapacity" INTEGER NOT NULL,
    "nearestSchoolKm" REAL NOT NULL,
    "nearestHospitalKm" REAL NOT NULL,
    "householdsNoPipedWater" INTEGER NOT NULL,
    "households" INTEGER NOT NULL,
    "electricityGapPct" REAL NOT NULL,
    "roadGapScore" REAL NOT NULL,
    "housingGapPct" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Ward" ("createdAt", "households", "householdsNoPipedWater", "id", "lat", "literacyRate", "lng", "name", "nameHi", "nameTe", "nearestHospitalKm", "nearestSchoolKm", "population", "schoolCapacity", "schoolEnrollment", "unemploymentRate") SELECT "createdAt", "households", "householdsNoPipedWater", "id", "lat", "literacyRate", "lng", "name", "nameHi", "nameTe", "nearestHospitalKm", "nearestSchoolKm", "population", "schoolCapacity", "schoolEnrollment", "unemploymentRate" FROM "Ward";
DROP TABLE "Ward";
ALTER TABLE "new_Ward" RENAME TO "Ward";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
