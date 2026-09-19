import type { Metadata } from "next";
import Link from "next/link";
import { HeaderLogo } from "@/components/brand";
import { RequestWizard } from "./request-wizard";

export const metadata: Metadata = {
  title: "Request a Notary | 772 Notary",
  description: "Request mobile notary service at a proposed location or an office appointment in the St. Lucie West area. Appointment details are confirmed separately.",
};

export default function RequestPage() {
  return <div className="request-page">
    <a className="skip-link" href="#request-wizard">Skip to request form</a>
    <header className="request-header"><div className="shell"><Link className="brand-link header-brand-link" href="/" aria-label="772 Notary home"><HeaderLogo /></Link><div><a href="tel:+17728004555">(772) 800-4555</a><Link href="/">Back to home</Link></div></div></header>
    <main className="request-backdrop" id="request-wizard"><div className="shell request-layout"><aside><p className="kicker kicker-light">Request a notary</p><h1>Tell us what you need.</h1><p>Choose mobile service at a proposed location or an appointment at the 772 Notary office in the St. Lucie West area. Then provide your preferred date, time of day, and contact information.</p><p className="request-intro-note">772 Notary will review your request and follow up to confirm availability and appointment details. Submitting this form does not confirm an appointment.</p><div className="request-help"><strong>Need help?</strong><a href="tel:+17728004555">(772) 800-4555</a><a href="mailto:info@772notary.com">info@772notary.com</a></div></aside><RequestWizard /></div></main>
  </div>;
}
