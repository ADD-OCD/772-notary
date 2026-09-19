import {
  contactOptions,
  locationNeedsName,
  locationOptions,
  serviceOptions,
  timeOptions,
  type PreferredContactMethod,
  type PreferredTimeOfDay,
  type RequestedLocationType,
  type RequestedService,
} from "./request-data";

export type ValidRequest = {
  idempotencyKey: string;
  service: RequestedService;
  serviceDetails: string | null;
  documentCount: number;
  locationType: RequestedLocationType;
  locationName: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  preferredDate: Date;
  preferredTimeOfDay: PreferredTimeOfDay;
  notes: string | null;
  customerName: string;
  phone: string;
  email: string;
  preferredContactMethod: PreferredContactMethod;
  acknowledgedAt: Date;
};

export class RequestValidationError extends Error {
  constructor(public readonly fieldErrors: Record<string, string>) {
    super("The request contains invalid fields.");
    this.name = "RequestValidationError";
  }
}

const ids = <T extends readonly (readonly [string, string])[]>(options: T) =>
  new Set(options.map(([id]) => id));
const serviceIds = ids(serviceOptions);
const locationIds = ids(locationOptions);
const timeIds = ids(timeOptions);
const contactIds = ids(contactOptions);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const phonePattern = /^\+?[0-9 ().-]{10,40}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(record: Record<string, unknown>, key: string, max: number) {
  const value = typeof record[key] === "string" ? record[key].trim() : "";
  return value.length <= max ? value : "";
}

function localToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts();
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function validateRequestSubmission(value: unknown, now = new Date()): ValidRequest {
  const errors: Record<string, string> = {};
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

  const idempotencyKey = text(record, "idempotencyKey", 36);
  if (!uuid.test(idempotencyKey)) errors.idempotencyKey = "Start a new request and try again.";

  const serviceValue = text(record, "service", 40);
  if (!serviceIds.has(serviceValue)) errors.service = "Select a document type.";
  const service = serviceValue as RequestedService;

  const serviceDetailsValue = text(record, "serviceDetails", 120);
  if (service === "OTHER_DOCUMENT" && !serviceDetailsValue) {
    errors.serviceDetails = "Enter the document type or general purpose.";
  }
  const serviceDetails = service === "OTHER_DOCUMENT" ? serviceDetailsValue || null : null;

  const documentCount = Number(record.documentCount);
  if (!Number.isInteger(documentCount) || documentCount < 1 || documentCount > 25) {
    errors.documentCount = "Enter a number from 1 to 25.";
  }

  const locationValue = text(record, "locationType", 40);
  if (!locationIds.has(locationValue)) errors.locationType = "Select an appointment location.";
  const locationType = locationValue as RequestedLocationType;

  const locationNameValue = text(record, "locationName", 120);
  const addressValue = text(record, "address", 160);
  const cityValue = text(record, "city", 80);
  const postalCodeValue = text(record, "postalCode", 5);
  const office = locationType === "NOTARY_OFFICE";
  if (!office) {
    if (locationNeedsName(locationType) && !locationNameValue) {
      errors.locationName = "Enter the location or facility name.";
    }
    if (!addressValue) errors.address = "Enter the proposed meeting address.";
    if (!cityValue) errors.city = "Enter the city.";
    if (!/^\d{5}$/.test(postalCodeValue)) errors.postalCode = "Enter a five-digit ZIP code.";
  }

  const preferredDateValue = text(record, "preferredDate", 10);
  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(preferredDateValue) &&
    !Number.isNaN(Date.parse(`${preferredDateValue}T00:00:00.000Z`));
  if (!dateValid) errors.preferredDate = "Select a preferred date.";
  else {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    });
    const today = now === undefined ? localToday() : formatter.format(now);
    if (preferredDateValue < today) errors.preferredDate = "Select a date that is not in the past.";
  }

  const preferredTimeValue = text(record, "preferredTimeOfDay", 20);
  if (!timeIds.has(preferredTimeValue)) errors.preferredTimeOfDay = "Select a preferred time of day.";
  const preferredTimeOfDay = preferredTimeValue as PreferredTimeOfDay;

  const notesValue = text(record, "notes", 300);
  const customerName = text(record, "customerName", 120).replace(/\s+/g, " ");
  if (!customerName) errors.customerName = "Enter your full name.";

  const phone = text(record, "phone", 40);
  if (!phonePattern.test(phone)) errors.phone = "Enter a valid phone number.";

  const email = text(record, "email", 254).toLowerCase();
  if (!emailPattern.test(email)) errors.email = "Enter a valid email address.";

  const contactValue = text(record, "preferredContactMethod", 20);
  if (!contactIds.has(contactValue)) errors.preferredContactMethod = "Select a preferred contact method.";
  const preferredContactMethod = contactValue as PreferredContactMethod;

  if (record.acknowledged !== true) errors.acknowledged = "Accept the request acknowledgment before submitting.";

  if (Object.keys(errors).length) throw new RequestValidationError(errors);

  return {
    idempotencyKey,
    service,
    serviceDetails,
    documentCount,
    locationType,
    locationName: office ? null : locationNameValue || null,
    address: office ? null : addressValue,
    city: office ? null : cityValue,
    postalCode: office ? null : postalCodeValue,
    preferredDate: new Date(`${preferredDateValue}T00:00:00.000Z`),
    preferredTimeOfDay,
    notes: notesValue || null,
    customerName,
    phone,
    email,
    preferredContactMethod,
    acknowledgedAt: now,
  };
}
