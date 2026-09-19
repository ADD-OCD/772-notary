-- Persist customer notary requests separately from confirmed appointments.
BEGIN;

CREATE TYPE "NotaryRequestStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'CONVERTED_TO_APPOINTMENT', 'CLOSED');
CREATE TYPE "RequestedService" AS ENUM ('REAL_ESTATE_DOCUMENTS', 'POWER_OF_ATTORNEY', 'ESTATE_OR_TRUST_DOCUMENTS', 'HEALTHCARE_DOCUMENTS', 'BUSINESS_DOCUMENTS', 'OTHER_DOCUMENT');
CREATE TYPE "RequestedLocationType" AS ENUM ('NOTARY_OFFICE', 'HOME_OR_RESIDENCE', 'CUSTOMER_OFFICE', 'HOSPITAL_OR_CARE_FACILITY', 'PUBLIC_LOCATION', 'OTHER_MOBILE_LOCATION');
CREATE TYPE "PreferredTimeOfDay" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'FLEXIBLE');
CREATE TYPE "PreferredContactMethod" AS ENUM ('TEXT_MESSAGE', 'PHONE_CALL', 'EMAIL');

CREATE TABLE "NotaryRequest" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(24) NOT NULL,
    "idempotencyKey" UUID NOT NULL,
    "status" "NotaryRequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "service" "RequestedService" NOT NULL,
    "serviceDetails" VARCHAR(120),
    "documentCount" INTEGER NOT NULL,
    "locationType" "RequestedLocationType" NOT NULL,
    "locationName" VARCHAR(120),
    "address" VARCHAR(160),
    "city" VARCHAR(80),
    "postalCode" VARCHAR(5),
    "preferredDate" DATE NOT NULL,
    "preferredTimeOfDay" "PreferredTimeOfDay" NOT NULL,
    "notes" VARCHAR(300),
    "customerName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "preferredContactMethod" "PreferredContactMethod" NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NotaryRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "NotaryRequest_documentCount_check" CHECK ("documentCount" BETWEEN 1 AND 25),
    CONSTRAINT "NotaryRequest_postalCode_check" CHECK ("postalCode" IS NULL OR "postalCode" ~ '^[0-9]{5}$'),
    CONSTRAINT "NotaryRequest_office_location_check" CHECK (
      ("locationType" = 'NOTARY_OFFICE' AND "locationName" IS NULL AND "address" IS NULL AND "city" IS NULL AND "postalCode" IS NULL)
      OR
      ("locationType" <> 'NOTARY_OFFICE' AND "address" IS NOT NULL AND "city" IS NOT NULL AND "postalCode" IS NOT NULL)
    ),
    CONSTRAINT "NotaryRequest_other_service_check" CHECK (
      ("service" = 'OTHER_DOCUMENT' AND "serviceDetails" IS NOT NULL)
      OR
      ("service" <> 'OTHER_DOCUMENT' AND "serviceDetails" IS NULL)
    )
);

CREATE UNIQUE INDEX "NotaryRequest_reference_key" ON "NotaryRequest"("reference");
CREATE UNIQUE INDEX "NotaryRequest_idempotencyKey_key" ON "NotaryRequest"("idempotencyKey");
CREATE INDEX "NotaryRequest_status_createdAt_idx" ON "NotaryRequest"("status", "createdAt");
CREATE INDEX "NotaryRequest_preferredDate_idx" ON "NotaryRequest"("preferredDate");

COMMIT;
