-- CreateTable
CREATE TABLE "Catch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "dateCaught" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Catch_userId_dateCaught_idx" ON "Catch"("userId", "dateCaught" DESC);

-- CreateIndex
CREATE INDEX "Catch_userId_species_idx" ON "Catch"("userId", "species");

-- CreateIndex
CREATE INDEX "Catch_userId_location_idx" ON "Catch"("userId", "location");

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

