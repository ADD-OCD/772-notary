import "server-only";
import {
  contactOptions,
  locationOptions,
  optionLabel,
  serviceOptions,
  timeOptions,
} from "@/modules/requests/request-data";
import type { StoredRequest } from "@/modules/requests/store";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailDeliveryResult =
  | { status: "sent"; providerMessageId?: string }
  | { status: "not_configured" }
  | { status: "failed"; error: string };

export interface TransactionalEmailSender {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}

export const unconfiguredEmailSender: TransactionalEmailSender = {
  async send() {
    return { status: "not_configured" };
  },
};

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
})[character] ?? character);

const dateLabel = (date: Date) => new Intl.DateTimeFormat("en-US", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
}).format(date);

const requestLocation = (request: StoredRequest) => request.locationType === "NOTARY_OFFICE"
  ? "772 Notary Office — St. Lucie West area (exact address provided after appointment confirmation)"
  : [
      optionLabel(locationOptions, request.locationType),
      request.locationName,
      request.address,
      request.city && request.postalCode ? `${request.city}, FL ${request.postalCode}` : null,
    ].filter(Boolean).join(", ");

export function customerRequestReceivedEmail(request: StoredRequest): EmailMessage {
  const subject = `772 Notary request received — ${request.reference}`;
  const text = `Thank you. Your request has been received.

Request reference: ${request.reference}
Preferred date: ${dateLabel(request.preferredDate)}
Preferred time of day: ${optionLabel(timeOptions, request.preferredTimeOfDay)}
Meeting option: ${requestLocation(request)}

772 Notary will review your request and follow up using the contact information you provided. Your appointment is not confirmed until you receive confirmation of the date, time, meeting option or location, and other appointment details.`;
  return {
    to: request.email,
    subject,
    text,
    html: `<h1>Request received</h1><p>Thank you. Your request has been received.</p><dl><dt>Request reference</dt><dd>${escapeHtml(request.reference)}</dd><dt>Preferred date</dt><dd>${escapeHtml(dateLabel(request.preferredDate))}</dd><dt>Preferred time of day</dt><dd>${escapeHtml(optionLabel(timeOptions, request.preferredTimeOfDay))}</dd><dt>Meeting option</dt><dd>${escapeHtml(requestLocation(request))}</dd></dl><p>772 Notary will review your request and follow up using the contact information you provided. Your appointment is not confirmed until you receive confirmation of the date, time, meeting option or location, and other appointment details.</p>`,
  };
}

export function internalNewRequestEmail(request: StoredRequest): EmailMessage {
  const service = optionLabel(serviceOptions, request.service);
  const subject = `New 772 Notary request — ${request.reference}`;
  const text = `A new request was received.

Reference: ${request.reference}
Service: ${service}${request.serviceDetails ? ` — ${request.serviceDetails}` : ""}
Documents: ${request.documentCount}
Preferred visit: ${dateLabel(request.preferredDate)}, ${optionLabel(timeOptions, request.preferredTimeOfDay)}
Meeting option: ${requestLocation(request)}
Customer: ${request.customerName}
Phone: ${request.phone}
Email: ${request.email}
Preferred personal follow-up: ${optionLabel(contactOptions, request.preferredContactMethod)}
Notes: ${request.notes ?? "None"}

This request is received and has not been confirmed as an appointment.`;
  return {
    to: "info@772notary.com",
    subject,
    text,
    html: `<h1>New notary request</h1><p><strong>Reference:</strong> ${escapeHtml(request.reference)}</p><p><strong>Service:</strong> ${escapeHtml(service)}${request.serviceDetails ? ` — ${escapeHtml(request.serviceDetails)}` : ""}</p><p><strong>Documents:</strong> ${request.documentCount}</p><p><strong>Preferred visit:</strong> ${escapeHtml(dateLabel(request.preferredDate))}, ${escapeHtml(optionLabel(timeOptions, request.preferredTimeOfDay))}</p><p><strong>Meeting option:</strong> ${escapeHtml(requestLocation(request))}</p><p><strong>Customer:</strong> ${escapeHtml(request.customerName)}<br><strong>Phone:</strong> ${escapeHtml(request.phone)}<br><strong>Email:</strong> ${escapeHtml(request.email)}<br><strong>Preferred personal follow-up:</strong> ${escapeHtml(optionLabel(contactOptions, request.preferredContactMethod))}</p><p><strong>Notes:</strong> ${escapeHtml(request.notes ?? "None")}</p><p>This request is received and has not been confirmed as an appointment.</p>`,
  };
}

export async function sendRequestEmails(
  request: StoredRequest,
  sender: TransactionalEmailSender = unconfiguredEmailSender,
) {
  return Promise.all([
    sender.send(customerRequestReceivedEmail(request)),
    sender.send(internalNewRequestEmail(request)),
  ]);
}
