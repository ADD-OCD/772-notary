"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import {
  changeRequestLocation,
  contactOptions,
  isOfficeRequest,
  locationNeedsName,
  locationOptions,
  optionLabel,
  serviceOptions,
  timeOptions,
  type RequestSubmission,
} from "@/modules/requests/request-data";

const steps = ["Service", "Visit", "Contact", "Review"];
const createInitial = (): RequestSubmission => ({
  idempotencyKey: globalThis.crypto.randomUUID(),
  service: "",
  serviceDetails: "",
  documentCount: "1",
  locationType: "",
  locationName: "",
  address: "",
  city: "",
  postalCode: "",
  preferredDate: "",
  preferredTimeOfDay: "",
  notes: "",
  customerName: "",
  phone: "",
  email: "",
  preferredContactMethod: "",
  acknowledged: false,
});
type FieldErrors = Record<string, string>;

export function RequestWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RequestSubmission>(createInitial);
  const [reference, setReference] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const initialRender = useRef(true);
  const today = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  }, []);
  const office = isOfficeRequest(data.locationType);

  const update = <K extends keyof RequestSubmission>(key: K, value: RequestSubmission[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const selectService = (service: RequestSubmission["service"]) => {
    setData((current) => ({ ...current, service, serviceDetails: service === "OTHER_DOCUMENT" ? current.serviceDetails : "" }));
    setFieldErrors({});
  };
  const selectLocation = (locationType: RequestSubmission["locationType"]) => {
    setData((current) => changeRequestLocation(current, locationType));
    setFieldErrors({});
  };

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    headingRef.current?.focus();
  }, [step]);

  function errorsForStep(): FieldErrors {
    const errors: FieldErrors = {};
    if (step === 0) {
      if (!data.service) errors.service = "Select a document type.";
      if (data.service === "OTHER_DOCUMENT" && !data.serviceDetails.trim()) errors.serviceDetails = "Enter the document type or general purpose.";
      const count = Number(data.documentCount);
      if (!Number.isInteger(count) || count < 1 || count > 25) errors.documentCount = "Enter a number from 1 to 25.";
    }
    if (step === 1) {
      if (!data.locationType) errors.locationType = "Select an appointment location.";
      if (!office && locationNeedsName(data.locationType) && !data.locationName.trim()) errors.locationName = "Enter the location or facility name.";
      if (!office && !data.address.trim()) errors.address = "Enter the proposed meeting address.";
      if (!office && !data.city.trim()) errors.city = "Enter the city.";
      if (!office && !/^\d{5}$/.test(data.postalCode)) errors.postalCode = "Enter a five-digit ZIP code.";
      if (!data.preferredDate) errors.preferredDate = "Select a preferred date.";
      if (!data.preferredTimeOfDay) errors.preferredTimeOfDay = "Select a preferred time of day.";
    }
    if (step === 2) {
      if (!data.customerName.trim()) errors.customerName = "Enter your full name.";
      if (!/^\+?[0-9 ().-]{10,40}$/.test(data.phone.trim())) errors.phone = "Enter a valid phone number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Enter a valid email address.";
      if (!data.preferredContactMethod) errors.preferredContactMethod = "Select a preferred contact method.";
    }
    if (step === 3 && !data.acknowledged) errors.acknowledged = "Accept the request acknowledgment before submitting.";
    return errors;
  }

  async function next(event: FormEvent) {
    event.preventDefault();
    const errors = errorsForStep();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    if (step < 3) {
      setStep((current) => current + 1);
      setFieldErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as {
        reference?: string;
        error?: string;
        fieldErrors?: FieldErrors;
      };
      if (!response.ok || !result.reference) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        throw new Error(result.error ?? "We could not submit your request.");
      }
      setReference(result.reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (name: string) => fieldErrors[name]
    ? <span className="field-error" id={`${name}-error`}>{fieldErrors[name]}</span>
    : null;
  const invalid = (name: string) => fieldErrors[name] ? true : undefined;
  const describedBy = (name: string) => fieldErrors[name] ? `${name}-error` : undefined;
  const formattedDate = data.preferredDate
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
      .format(new Date(`${data.preferredDate}T00:00:00.000Z`))
    : "";

  if (reference) return <section className="wizard-card completion" aria-live="polite">
    <span className="completion-icon"><CheckIcon /></span>
    <p className="kicker">Request submitted</p>
    <h2>Thank you. Your request has been received.</h2>
    <p>772 Notary will review your request and follow up using the contact information you provided. Your appointment is not confirmed until you receive confirmation of the date, time, meeting option or location, and other appointment details.</p>
    {office && <p>The exact office address will be provided after the appointment is confirmed.</p>}
    <p className="request-reference"><strong>Request reference:</strong> {reference}</p>
    <div className="completion-actions">
      <button className="button button-gold" type="button" onClick={() => {
        setData(createInitial()); setStep(0); setReference(""); setFieldErrors({}); setSubmitError("");
      }}>Submit another request</button>
      <Link className="text-link" href="/">Return home</Link>
    </div>
  </section>;

  return <section className="wizard-card" aria-labelledby="wizard-title">
    <div className="wizard-top"><div><p className="kicker">Request a notary</p><h2 id="wizard-title" ref={headingRef} tabIndex={-1}>{steps[step]}</h2></div><span>Step {step + 1} of {steps.length}</span></div>
    <ol className="progress" aria-label="Request progress">{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index === step ? "active" : index < step ? "done" : ""}><span>{index < step ? <CheckIcon /> : index + 1}</span><small>{label}</small></li>)}</ol>

    {Object.keys(fieldErrors).length > 0 && <div className="error-summary" role="alert"><strong>Please correct the highlighted fields.</strong></div>}

    <form onSubmit={next} noValidate>
      {step === 0 && <fieldset>
        <legend>What type of document is involved?</legend>
        <p className="field-help">Choose the option that best describes your request. Requirements can vary by document and notarial act.</p>
        <div className="choice-grid">{serviceOptions.map(([value, label]) => <label className={data.service === value ? "choice selected" : "choice"} key={value}><input aria-invalid={invalid("service")} type="radio" name="service" value={value} checked={data.service === value} onChange={() => selectService(value)} /><span>{label}</span></label>)}</div>
        {fieldError("service")}
        {data.service === "OTHER_DOCUMENT" && <label className="field">Document type or general purpose<input aria-invalid={invalid("serviceDetails")} aria-describedby={describedBy("serviceDetails")} maxLength={120} value={data.serviceDetails} onChange={(event) => update("serviceDetails", event.target.value)} placeholder="Brief description only — no document contents" />{fieldError("serviceDetails")}</label>}
        <label className="field compact-field">Number of documents<input aria-invalid={invalid("documentCount")} aria-describedby={describedBy("documentCount")} min="1" max="25" inputMode="numeric" type="number" value={data.documentCount} onChange={(event) => update("documentCount", event.target.value)} />{fieldError("documentCount")}</label>
        <div className="privacy-callout"><strong>Protect your privacy.</strong> Do not enter document contents, Social Security numbers, identification numbers, credit or debit card information, or other unnecessary sensitive information.</div>
      </fieldset>}

      {step === 1 && <fieldset>
        <legend>Choose where and when you would prefer to meet</legend>
        <p className="field-help">Request an office appointment or mobile service at a proposed location. Your selected date and time of day are preferences; final availability and appointment details are confirmed separately.</p>
        <fieldset className="sub-fieldset location-type"><legend>Appointment location</legend><div className="inline-choices location-choices">{locationOptions.map(([value, label]) => <label key={value}><input aria-invalid={invalid("locationType")} type="radio" name="locationType" value={value} checked={data.locationType === value} onChange={() => selectLocation(value)} /> {label}</label>)}</div>{fieldError("locationType")}</fieldset>

        {office && <div className="office-callout"><strong>Office appointment</strong><p>The 772 Notary office is in the St. Lucie West area. The exact address is provided after the appointment is confirmed. Submitting this request does not confirm an appointment.</p></div>}

        {data.locationType && !office && <>
          <p className="mobile-location-help">Enter the proposed mobile meeting location. Service-area availability and final appointment details will be confirmed after submission.</p>
          {locationNeedsName(data.locationType) && <label className="field">{data.locationType === "OTHER_MOBILE_LOCATION" ? "Location description" : "Location or facility name"}<input aria-invalid={invalid("locationName")} aria-describedby={describedBy("locationName")} maxLength={120} value={data.locationName} onChange={(event) => update("locationName", event.target.value)} placeholder={data.locationType === "HOSPITAL_OR_CARE_FACILITY" ? "Hospital or facility name" : "Location name"} />{fieldError("locationName")}</label>}
          <label className="field">Meeting address<input aria-invalid={invalid("address")} aria-describedby={describedBy("address")} autoComplete="street-address" maxLength={160} value={data.address} onChange={(event) => update("address", event.target.value)} placeholder="Street address" />{fieldError("address")}</label>
          <div className="field-row city-row">
            <label className="field">City<input aria-invalid={invalid("city")} aria-describedby={describedBy("city")} autoComplete="address-level2" maxLength={80} value={data.city} onChange={(event) => update("city", event.target.value)} />{fieldError("city")}</label>
            <label className="field zip">ZIP code<input aria-invalid={invalid("postalCode")} aria-describedby={describedBy("postalCode")} autoComplete="postal-code" inputMode="numeric" maxLength={5} value={data.postalCode} onChange={(event) => update("postalCode", event.target.value.replace(/\D/g, ""))} />{fieldError("postalCode")}</label>
          </div>
        </>}

        <div className="field-row">
          <label className="field">Preferred date<input aria-invalid={invalid("preferredDate")} aria-describedby={describedBy("preferredDate")} min={today} type="date" value={data.preferredDate} onChange={(event) => update("preferredDate", event.target.value)} />{fieldError("preferredDate")}</label>
          <label className="field">Preferred time of day<select aria-invalid={invalid("preferredTimeOfDay")} aria-describedby={describedBy("preferredTimeOfDay")} value={data.preferredTimeOfDay} onChange={(event) => update("preferredTimeOfDay", event.target.value as RequestSubmission["preferredTimeOfDay"])}><option value="">Select a time</option>{timeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>{fieldError("preferredTimeOfDay")}</label>
        </div>
        <label className="field">{office ? "Appointment notes" : "Access notes"} <span>(optional)</span><textarea maxLength={300} value={data.notes} onChange={(event) => update("notes", event.target.value)} placeholder={office ? "Include information that may help 772 Notary review your request. Do not include sensitive information." : "For example: lobby entrance or parking instructions. Do not include sensitive information."} /><small>{data.notes.length}/300</small></label>
      </fieldset>}

      {step === 2 && <fieldset>
        <legend>How can we reach you?</legend>
        <p className="field-help">Provide your name, phone number, email address, and preferred method for personal follow-up. You do not need an account.</p>
        <label className="field">Full name<input aria-invalid={invalid("customerName")} aria-describedby={describedBy("customerName")} autoComplete="name" maxLength={120} value={data.customerName} onChange={(event) => update("customerName", event.target.value)} />{fieldError("customerName")}</label>
        <div className="field-row">
          <label className="field">Phone<input aria-invalid={invalid("phone")} aria-describedby={describedBy("phone")} autoComplete="tel" type="tel" value={data.phone} onChange={(event) => update("phone", event.target.value)} placeholder="(772) 555-0123" />{fieldError("phone")}</label>
          <label className="field">Email<input aria-invalid={invalid("email")} aria-describedby={describedBy("email")} autoComplete="email" type="email" maxLength={254} value={data.email} onChange={(event) => update("email", event.target.value)} />{fieldError("email")}</label>
        </div>
        <fieldset className="sub-fieldset"><legend>Preferred contact method</legend><p className="field-help compact-help">This tells 772 Notary how you would prefer to receive personal follow-up.</p><div className="inline-choices">{contactOptions.map(([value, label]) => <label key={value}><input aria-invalid={invalid("preferredContactMethod")} type="radio" name="contact" value={value} checked={data.preferredContactMethod === value} onChange={() => update("preferredContactMethod", value)} /> {label}</label>)}</div>{fieldError("preferredContactMethod")}</fieldset>
      </fieldset>}

      {step === 3 && <fieldset>
        <legend>Review your request</legend>
        <p className="field-help">Check the information below before submitting it to 772 Notary.</p>
        <dl className="review-list">
          <div><dt>Service</dt><dd>{optionLabel(serviceOptions, data.service)}{data.service === "OTHER_DOCUMENT" ? ` — ${data.serviceDetails}` : ""}<br />{data.documentCount} {data.documentCount === "1" ? "document" : "documents"}</dd><button type="button" onClick={() => setStep(0)}>Edit</button></div>
          <div><dt>Preferred visit</dt><dd>{formattedDate} · {optionLabel(timeOptions, data.preferredTimeOfDay)}<br /><strong>Appointment option:</strong> {optionLabel(locationOptions, data.locationType)}{office ? <><br /><strong>Location:</strong> St. Lucie West area<br />Exact address provided after appointment confirmation.</> : <><br />{data.locationName && <>{data.locationName}<br /></>}{data.address}, {data.city}, FL {data.postalCode}</>}</dd><button type="button" onClick={() => setStep(1)}>Edit</button></div>
          <div><dt>Contact</dt><dd>{data.customerName}<br />{data.phone} · {data.email}<br />Preferred: {optionLabel(contactOptions, data.preferredContactMethod)}</dd><button type="button" onClick={() => setStep(2)}>Edit</button></div>
          {data.notes && <div><dt>{office ? "Appointment notes" : "Access notes"}</dt><dd>{data.notes}</dd><button type="button" onClick={() => setStep(1)}>Edit</button></div>}
        </dl>
        <label className="consent"><input aria-invalid={invalid("acknowledged")} aria-describedby={describedBy("acknowledged")} type="checkbox" checked={data.acknowledged} onChange={(event) => update("acknowledged", event.target.checked)} /><span>I understand that submitting this request does not confirm an appointment. 772 Notary will review the request and contact me about availability and appointment details using the contact information I provided.</span></label>
        {fieldError("acknowledged")}
      </fieldset>}

      {submitError && <p className="submission-error" role="alert">{submitError}</p>}
      <div className="wizard-actions">{step > 0 ? <button className="back-button" type="button" onClick={() => { setStep((current) => current - 1); setFieldErrors({}); setSubmitError(""); }}>Back</button> : <Link className="back-button" href="/">Cancel</Link>}<button className="button button-gold" type="submit" disabled={submitting}>{step === 3 ? submitting ? "Submitting…" : "Submit Request" : "Continue"}<ArrowRightIcon /></button></div>
    </form>
  </section>;
}
