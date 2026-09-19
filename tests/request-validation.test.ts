import assert from "node:assert/strict";
import { test } from "node:test";
import {
  changeRequestLocation,
  type RequestSubmission,
} from "../src/modules/requests/request-data";
import {
  RequestValidationError,
  validateRequestSubmission,
} from "../src/modules/requests/validation";

const now = new Date("2026-09-19T12:00:00.000Z");
const valid = (): RequestSubmission => ({
  idempotencyKey: "c859a55d-061f-4ac5-8a4a-8f3d4ce81234",
  service: "REAL_ESTATE_DOCUMENTS",
  serviceDetails: "",
  documentCount: "2",
  locationType: "HOME_OR_RESIDENCE",
  locationName: "",
  address: "123 Test Avenue",
  city: "Port St. Lucie",
  postalCode: "34900",
  preferredDate: "2026-10-15",
  preferredTimeOfDay: "MORNING",
  notes: "",
  customerName: "Test Customer",
  phone: "(772) 555-0123",
  email: "TEST@example.com",
  preferredContactMethod: "PHONE_CALL",
  acknowledged: true,
});

function fieldErrors(payload: RequestSubmission) {
  try {
    validateRequestSubmission(payload, now);
    return {};
  } catch (error) {
    assert.ok(error instanceof RequestValidationError);
    return error.fieldErrors;
  }
}

test("phone, email, and preferred contact method are required server-side", () => {
  const payload = valid();
  payload.phone = "";
  payload.email = "";
  payload.preferredContactMethod = "";
  const errors = fieldErrors(payload);
  assert.match(errors.phone, /valid phone/);
  assert.match(errors.email, /valid email/);
  assert.match(errors.preferredContactMethod, /preferred contact/);
});

test("office selection does not accept or require mobile address data", () => {
  const payload = changeRequestLocation(valid(), "NOTARY_OFFICE");
  const result = validateRequestSubmission(payload, now);
  assert.equal(result.locationType, "NOTARY_OFFICE");
  assert.equal(result.address, null);
  assert.equal(result.city, null);
  assert.equal(result.postalCode, null);
  assert.equal(result.locationName, null);
});

test("switching to the 772 Notary office clears stale mobile-location values", () => {
  const payload = changeRequestLocation(valid(), "NOTARY_OFFICE");
  assert.equal(payload.locationName, "");
  assert.equal(payload.address, "");
  assert.equal(payload.city, "");
  assert.equal(payload.postalCode, "");
});

test("mobile locations require the appropriate location data", () => {
  const payload = valid();
  payload.locationType = "HOSPITAL_OR_CARE_FACILITY";
  payload.locationName = "";
  payload.address = "";
  payload.city = "";
  payload.postalCode = "";
  const errors = fieldErrors(payload);
  assert.ok(errors.locationName);
  assert.ok(errors.address);
  assert.ok(errors.city);
  assert.ok(errors.postalCode);
});

test("server validation normalizes contact data and strips irrelevant service details", () => {
  const payload = valid();
  payload.customerName = "  Test   Customer  ";
  payload.email = "  TEST@Example.COM ";
  payload.serviceDetails = "must not persist";
  const result = validateRequestSubmission(payload, now);
  assert.equal(result.customerName, "Test Customer");
  assert.equal(result.email, "test@example.com");
  assert.equal(result.serviceDetails, null);
});

test("an acknowledgment and a non-past preferred date are required", () => {
  const payload = valid();
  payload.acknowledged = false;
  payload.preferredDate = "2026-09-18";
  const errors = fieldErrors(payload);
  assert.ok(errors.acknowledged);
  assert.match(errors.preferredDate, /not in the past/);
});
