import "server-only";
import { sendRequestEmails, type TransactionalEmailSender, unconfiguredEmailSender } from "@/modules/notifications/request-email";
import { createRequestReference } from "./reference";
import { prismaRequestStore, type RequestStore } from "./store";
import { validateRequestSubmission } from "./validation";

export type SubmissionDependencies = {
  store?: RequestStore;
  emailSender?: TransactionalEmailSender;
  now?: Date;
};

export async function submitNotaryRequest(payload: unknown, dependencies: SubmissionDependencies = {}) {
  const input = validateRequestSubmission(payload, dependencies.now ?? new Date());
  const store = dependencies.store ?? prismaRequestStore;
  const { request, created } = await store.create(input, createRequestReference());

  let notificationStatuses: string[] = [];
  if (created) {
    try {
      const results = await sendRequestEmails(request, dependencies.emailSender ?? unconfiguredEmailSender);
      notificationStatuses = results.map(({ status }) => status);
      if (notificationStatuses.some((status) => status !== "sent")) {
        console.warn("Request persisted; transactional email was not fully delivered.", {
          reference: request.reference,
          notificationStatuses,
        });
      }
    } catch {
      notificationStatuses = ["failed"];
      console.warn("Request persisted; transactional email delivery failed.", { reference: request.reference });
    }
  }

  return {
    reference: request.reference,
    status: request.status,
    created,
    appointmentConfirmed: false as const,
    notificationStatuses,
  };
}
