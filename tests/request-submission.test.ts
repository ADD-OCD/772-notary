import assert from "node:assert/strict";
import { test } from "node:test";
import {
  customerRequestReceivedEmail,
  type EmailMessage,
  type TransactionalEmailSender,
} from "../src/modules/notifications/request-email";
import type { RequestSubmission } from "../src/modules/requests/request-data";
import type { RequestStore, StoredRequest } from "../src/modules/requests/store";
import { submitNotaryRequest } from "../src/modules/requests/submit";
import { validateRequestSubmission } from "../src/modules/requests/validation";

const payload = (): RequestSubmission => ({
  idempotencyKey: "c859a55d-061f-4ac5-8a4a-8f3d4ce81234",
  service: "HEALTHCARE_DOCUMENTS",
  serviceDetails: "",
  documentCount: "1",
  locationType: "NOTARY_OFFICE",
  locationName: "",
  address: "",
  city: "",
  postalCode: "",
  preferredDate: "2026-10-15",
  preferredTimeOfDay: "AFTERNOON",
  notes: "",
  customerName: "Test Customer",
  phone: "(772) 555-0123",
  email: "test@example.com",
  preferredContactMethod: "TEXT_MESSAGE",
  acknowledged: true,
});

function memoryStore() {
  let stored: StoredRequest | undefined;
  const store: RequestStore = {
    async create(input, reference) {
      if (stored?.idempotencyKey === input.idempotencyKey) return { request: stored, created: false };
      stored = { ...input, reference, status: "RECEIVED", createdAt: new Date("2026-09-19T12:00:00Z") };
      return { request: stored, created: true };
    },
  };
  return { store, get: () => stored };
}

test("successful submission persists a received request without confirming an appointment", async () => {
  const memory = memoryStore();
  const result = await submitNotaryRequest(payload(), {
    store: memory.store,
    now: new Date("2026-09-19T12:00:00Z"),
  });
  assert.match(result.reference, /^772-[A-F0-9]{16}$/);
  assert.equal(result.status, "RECEIVED");
  assert.equal(result.appointmentConfirmed, false);
  assert.equal(memory.get()?.status, "RECEIVED");
  assert.equal(memory.get()?.locationType, "NOTARY_OFFICE");
  assert.equal(memory.get()?.address, null);
});

test("ordinary retries with the same idempotency key return the original request", async () => {
  const memory = memoryStore();
  const first = await submitNotaryRequest(payload(), { store: memory.store, now: new Date("2026-09-19T12:00:00Z") });
  const second = await submitNotaryRequest(payload(), { store: memory.store, now: new Date("2026-09-19T12:00:00Z") });
  assert.equal(second.reference, first.reference);
  assert.equal(second.created, false);
});

test("email being unconfigured does not lose or falsely fail a stored request", async () => {
  const memory = memoryStore();
  const result = await submitNotaryRequest(payload(), {
    store: memory.store,
    now: new Date("2026-09-19T12:00:00Z"),
  });
  assert.equal(result.created, true);
  assert.deepEqual(result.notificationStatuses, ["not_configured", "not_configured"]);
  assert.ok(memory.get());
});

test("preferred text message records a personal follow-up preference and creates no SMS delivery", async () => {
  const memory = memoryStore();
  const messages: EmailMessage[] = [];
  const emailSender: TransactionalEmailSender = {
    async send(message) {
      messages.push(message);
      return { status: "sent" };
    },
  };
  const result = await submitNotaryRequest(payload(), {
    store: memory.store,
    emailSender,
    now: new Date("2026-09-19T12:00:00Z"),
  });
  assert.deepEqual(result.notificationStatuses, ["sent", "sent"]);
  assert.equal(messages.length, 2);
  assert.equal(memory.get()?.preferredContactMethod, "TEXT_MESSAGE");
});

test("office customer email exposes no street address and says the appointment is unconfirmed", () => {
  const memory = memoryStore();
  const input = validateRequestSubmission(payload(), new Date("2026-09-19T12:00:00Z"));
  return memory.store.create(input, "772-0123456789ABCDEF").then(({ request }) => {
    const message = customerRequestReceivedEmail(request);
    assert.match(message.text, /exact address provided after appointment confirmation/i);
    assert.match(message.text, /not confirmed/i);
    assert.doesNotMatch(message.text, /123 Test Avenue/);
  });
});
