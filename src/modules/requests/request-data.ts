export const serviceOptions = [
  ["REAL_ESTATE_DOCUMENTS", "Real Estate Documents"],
  ["POWER_OF_ATTORNEY", "Power of Attorney"],
  ["ESTATE_OR_TRUST_DOCUMENTS", "Estate or Trust Documents"],
  ["HEALTHCARE_DOCUMENTS", "Healthcare Documents"],
  ["BUSINESS_DOCUMENTS", "Business Documents"],
  ["OTHER_DOCUMENT", "Other Document"],
] as const;

export const locationOptions = [
  ["HOME_OR_RESIDENCE", "Home or residence"],
  ["CUSTOMER_OFFICE", "Office"],
  ["HOSPITAL_OR_CARE_FACILITY", "Hospital or care facility"],
  ["PUBLIC_LOCATION", "Public location"],
  ["OTHER_MOBILE_LOCATION", "Other mobile location"],
  ["NOTARY_OFFICE", "772 Notary Office — St. Lucie West"],
] as const;

export const timeOptions = [
  ["MORNING", "Morning"],
  ["AFTERNOON", "Afternoon"],
  ["EVENING", "Evening"],
  ["FLEXIBLE", "Flexible"],
] as const;

export const contactOptions = [
  ["TEXT_MESSAGE", "Text message"],
  ["PHONE_CALL", "Phone call"],
  ["EMAIL", "Email"],
] as const;

export type RequestedService = (typeof serviceOptions)[number][0];
export type RequestedLocationType = (typeof locationOptions)[number][0];
export type PreferredTimeOfDay = (typeof timeOptions)[number][0];
export type PreferredContactMethod = (typeof contactOptions)[number][0];

export type RequestSubmission = {
  idempotencyKey: string;
  service: RequestedService | "";
  serviceDetails: string;
  documentCount: string;
  locationType: RequestedLocationType | "";
  locationName: string;
  address: string;
  city: string;
  postalCode: string;
  preferredDate: string;
  preferredTimeOfDay: PreferredTimeOfDay | "";
  notes: string;
  customerName: string;
  phone: string;
  email: string;
  preferredContactMethod: PreferredContactMethod | "";
  acknowledged: boolean;
};

export const isOfficeRequest = (locationType: string) => locationType === "NOTARY_OFFICE";
export const locationNeedsName = (locationType: string) =>
  !["", "NOTARY_OFFICE", "HOME_OR_RESIDENCE"].includes(locationType);

export function changeRequestLocation(
  current: RequestSubmission,
  locationType: RequestSubmission["locationType"],
): RequestSubmission {
  return {
    ...current,
    locationType,
    locationName: "",
    address: "",
    city: "",
    postalCode: "",
  };
}

export function optionLabel(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([key]) => key === value)?.[1] ?? value;
}
