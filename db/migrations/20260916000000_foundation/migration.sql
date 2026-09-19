-- Initial foundation migration: generated offline, not applied.
BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('REQUEST', 'INSTANT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DECLINED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ChargeKind" AS ENUM ('SERVICE', 'TRAVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('UNRECONCILED', 'RECONCILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(254),
    "phone" VARCHAR(40),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchedulingPolicy" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "bookingMode" "BookingMode" NOT NULL,
    "timezone" VARCHAR(100) NOT NULL,
    "bufferBeforeMinutes" INTEGER NOT NULL,
    "bufferAfterMinutes" INTEGER NOT NULL,
    "minimumNoticeMinutes" INTEGER NOT NULL,
    "maximumAdvanceDays" INTEGER NOT NULL,
    "cancellationCutoffMinutes" INTEGER,
    "rescheduleCutoffMinutes" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchedulingPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHours" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,

    CONSTRAINT "BusinessHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedTime" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BlockedTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "serviceAreaId" UUID,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL,
    "serviceName" VARCHAR(200) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "bufferBeforeMinutes" INTEGER NOT NULL,
    "bufferAfterMinutes" INTEGER NOT NULL,
    "location" VARCHAR(500) NOT NULL,
    "operationalNotes" VARCHAR(2000),
    "currency" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentManagementToken" (
    "id" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentManagementToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "kind" "ChargeKind" NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "appointmentId" UUID NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "providerPaymentId" VARCHAR(255),
    "idempotencyKey" UUID NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reconciliationStatus" "ReconciliationStatus" NOT NULL DEFAULT 'UNRECONCILED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "providerRefundId" VARCHAR(255),
    "idempotencyKey" UUID NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reconciliationStatus" "ReconciliationStatus" NOT NULL DEFAULT 'UNRECONCILED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" UUID NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "paymentId" UUID NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "issuedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MileageEntry" (
    "id" UUID NOT NULL,
    "appointmentId" UUID,
    "occurredOn" DATE NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "purpose" VARCHAR(300) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MileageEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "appointmentId" UUID,
    "occurredOn" DATE NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "reconciliationStatus" "ReconciliationStatus" NOT NULL DEFAULT 'UNRECONCILED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "eventId" VARCHAR(255) NOT NULL,
    "eventType" VARCHAR(150) NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulingPolicy_version_key" ON "SchedulingPolicy"("version");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHours_policyId_weekday_startMinute_key" ON "BusinessHours"("policyId", "weekday", "startMinute");

-- CreateIndex
CREATE INDEX "BlockedTime_policyId_startsAt_idx" ON "BlockedTime"("policyId", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");

-- CreateIndex
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");

-- CreateIndex
CREATE INDEX "Appointment_policyId_idx" ON "Appointment"("policyId");

-- CreateIndex
CREATE INDEX "Appointment_serviceAreaId_idx" ON "Appointment"("serviceAreaId");

-- CreateIndex
CREATE INDEX "Appointment_status_startsAt_idx" ON "Appointment"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_id_currency_key" ON "Appointment"("id", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentManagementToken_tokenHash_key" ON "AppointmentManagementToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AppointmentManagementToken_appointmentId_idx" ON "AppointmentManagementToken"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentManagementToken_expiresAt_idx" ON "AppointmentManagementToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Charge_appointmentId_currency_idx" ON "Charge"("appointmentId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_appointmentId_currency_idx" ON "Payment"("appointmentId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_currency_key" ON "Payment"("id", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_providerPaymentId_key" ON "Payment"("provider", "providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Refund_paymentId_currency_idx" ON "Refund"("paymentId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_paymentId_providerRefundId_key" ON "Refund"("paymentId", "providerRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_number_key" ON "Receipt"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_currency_key" ON "Receipt"("paymentId", "currency");

-- CreateIndex
CREATE INDEX "MileageEntry_appointmentId_idx" ON "MileageEntry"("appointmentId");

-- CreateIndex
CREATE INDEX "MileageEntry_occurredOn_idx" ON "MileageEntry"("occurredOn");

-- CreateIndex
CREATE INDEX "Expense_appointmentId_idx" ON "Expense"("appointmentId");

-- CreateIndex
CREATE INDEX "Expense_occurredOn_idx" ON "Expense"("occurredOn");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_receivedAt_idx" ON "WebhookEvent"("status", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key" ON "WebhookEvent"("provider", "eventId");

-- AddForeignKey
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "SchedulingPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedTime" ADD CONSTRAINT "BlockedTime_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "SchedulingPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "SchedulingPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentManagementToken" ADD CONSTRAINT "AppointmentManagementToken_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_appointmentId_currency_fkey" FOREIGN KEY ("appointmentId", "currency") REFERENCES "Appointment"("id", "currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_currency_fkey" FOREIGN KEY ("appointmentId", "currency") REFERENCES "Appointment"("id", "currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_currency_fkey" FOREIGN KEY ("paymentId", "currency") REFERENCES "Payment"("id", "currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_currency_fkey" FOREIGN KEY ("paymentId", "currency") REFERENCES "Payment"("id", "currency") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MileageEntry" ADD CONSTRAINT "MileageEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Hand-reviewed invariants not expressible in Prisma's schema language.
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_contact_required"
  CHECK (NULLIF(btrim("email"), '') IS NOT NULL OR NULLIF(btrim("phone"), '') IS NOT NULL);
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_name_nonempty" CHECK (length(btrim("name")) > 0);
ALTER TABLE "Service" ADD CONSTRAINT "Service_duration_positive" CHECK ("durationMinutes" > 0);
ALTER TABLE "SchedulingPolicy" ADD CONSTRAINT "SchedulingPolicy_ranges" CHECK (
  "version" > 0 AND "bufferBeforeMinutes" >= 0 AND "bufferAfterMinutes" >= 0
  AND "minimumNoticeMinutes" >= 0 AND "maximumAdvanceDays" > 0
  AND ("cancellationCutoffMinutes" IS NULL OR "cancellationCutoffMinutes" >= 0)
  AND ("rescheduleCutoffMinutes" IS NULL OR "rescheduleCutoffMinutes" >= 0));
ALTER TABLE "BusinessHours" ADD CONSTRAINT "BusinessHours_interval" CHECK (
  "weekday" BETWEEN 1 AND 7 AND "startMinute" >= 0 AND "endMinute" <= 1440 AND "startMinute" < "endMinute");
ALTER TABLE "BlockedTime" ADD CONSTRAINT "BlockedTime_interval" CHECK ("endsAt" > "startsAt");
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_interval" CHECK (
  "endsAt" > "startsAt" AND "durationMinutes" > 0 AND "bufferBeforeMinutes" >= 0 AND "bufferAfterMinutes" >= 0
  AND "endsAt" = "startsAt" + "durationMinutes" * INTERVAL '1 minute');
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_currency" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "AppointmentManagementToken" ADD CONSTRAINT "ManagementToken_expiry" CHECK ("expiresAt" > "createdAt");
ALTER TABLE "AppointmentManagementToken" ADD CONSTRAINT "ManagementToken_hash" CHECK ("tokenHash" ~ '^[a-f0-9]{64}$');
ALTER TABLE "MileageEntry" ADD CONSTRAINT "MileageEntry_distance" CHECK ("distanceMeters" > 0);
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_attempts" CHECK ("attempts" >= 0);
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_amount_currency" CHECK ("amountMinor" >= 0 AND "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amount_currency" CHECK ("amountMinor" >= 0 AND "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_amount_currency" CHECK ("amountMinor" >= 0 AND "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_amount_currency" CHECK ("amountMinor" >= 0 AND "currency" ~ '^[A-Z]{3}$');
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_amount_currency" CHECK ("amountMinor" >= 0 AND "currency" ~ '^[A-Z]{3}$');

COMMIT;
