-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('CASH', 'CRYPTO');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "ParameterType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "firstName" TEXT,
    "familyName" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "AssetEntity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "buyable" BOOLEAN NOT NULL DEFAULT true,
    "assetType" "AssetType" NOT NULL,

    CONSTRAINT "AssetEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAsset" (
    "id" SERIAL NOT NULL,
    "assetEntityId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "userId" TEXT,

    CONSTRAINT "UserAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "assetEntityId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceTimeId" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceTime" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "assetEntityId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "priceId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parameter" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "ParameterType" NOT NULL,

    CONSTRAINT "Parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "rank" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "roi" DOUBLE PRECISION NOT NULL,
    "priceTimeId" INTEGER NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("rank")
);

-- CreateTable
CREATE TABLE "LastTransaction" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "userId" TEXT,
    "assetEntityId" INTEGER,

    CONSTRAINT "LastTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "AssetEntity_name_key" ON "AssetEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetEntity_symbol_key" ON "AssetEntity"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "UserAsset_userId_assetEntityId_key" ON "UserAsset"("userId", "assetEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_assetEntityId_priceTimeId_key" ON "Price"("assetEntityId", "priceTimeId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceTime_timestamp_key" ON "PriceTime"("timestamp");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parameter_key_key" ON "Parameter"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Rank_userId_key" ON "Rank"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LastTransaction_userId_assetEntityId_transactionType_key" ON "LastTransaction"("userId", "assetEntityId", "transactionType");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAsset" ADD CONSTRAINT "UserAsset_assetEntityId_fkey" FOREIGN KEY ("assetEntityId") REFERENCES "AssetEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAsset" ADD CONSTRAINT "UserAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_assetEntityId_fkey" FOREIGN KEY ("assetEntityId") REFERENCES "AssetEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_priceTimeId_fkey" FOREIGN KEY ("priceTimeId") REFERENCES "PriceTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetEntityId_fkey" FOREIGN KEY ("assetEntityId") REFERENCES "AssetEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rank" ADD CONSTRAINT "Rank_priceTimeId_fkey" FOREIGN KEY ("priceTimeId") REFERENCES "PriceTime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rank" ADD CONSTRAINT "Rank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastTransaction" ADD CONSTRAINT "LastTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastTransaction" ADD CONSTRAINT "LastTransaction_assetEntityId_fkey" FOREIGN KEY ("assetEntityId") REFERENCES "AssetEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
