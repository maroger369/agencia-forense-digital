-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENTE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "amount" REAL NOT NULL DEFAULT 50.00,
    "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
    "paymentProofPath" TEXT,
    "qrPaymentPath" TEXT,
    "hash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "elaScore" REAL,
    "elaResult" TEXT,
    "elaImagePath" TEXT,
    "histogramData" TEXT,
    "exifData" TEXT,
    "hashesData" TEXT,
    "compressionData" TEXT,
    "noiseData" TEXT,
    "forensicReport" TEXT,
    "analyzedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisResult_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnalysisResult_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evidenceId" TEXT NOT NULL,
    "certificateHash" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "pdfPath" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT NOT NULL,
    CONSTRAINT "Certificate_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Certificate_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_ci_key" ON "User"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_evidenceId_key" ON "AnalysisResult"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_evidenceId_key" ON "Certificate"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateHash_key" ON "Certificate"("certificateHash");
