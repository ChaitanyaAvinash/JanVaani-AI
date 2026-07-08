-- CreateTable
CREATE TABLE "Ward" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL DEFAULT 'text',
    "rawText" TEXT,
    "language" TEXT,
    "translatedText" TEXT,
    "photoUrl" TEXT,
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

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estCostLakh" REAL NOT NULL,
    "wardId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'development_plan',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proposal_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
