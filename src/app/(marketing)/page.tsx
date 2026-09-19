import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CalendarIcon, CheckIcon, ClockIcon, DocumentIcon, HeartIcon, HomeIcon, MapPinIcon, MoreIcon, PenIcon, ShieldIcon, UsersIcon } from "@/components/icons";
import { Brand, HeaderLogo } from "@/components/brand";

export const metadata: Metadata = {
  title: "772 Notary | Mobile Notary Services in Port St. Lucie",
  description: "Request mobile notary service across the Treasure Coast or an office appointment with 772 Notary in the St. Lucie West area. Availability is confirmed separately.",
};

const services = [
  { icon: HomeIcon, title: "Real Estate Documents", text: "Deeds, mortgages, and refinance documents" },
  { icon: DocumentIcon, title: "Power of Attorney", text: "Customer-provided general, durable, medical, and vehicle powers of attorney" },
  { icon: PenIcon, title: "Estate or Trust Documents", text: "Customer-provided estate and trust documents" },
  { icon: HeartIcon, title: "Healthcare Documents", text: "Advance directives, medical releases, and related customer-provided documents" },
  { icon: UsersIcon, title: "Business Documents", text: "Contracts, agreements, and corporate forms" },
  { icon: MoreIcon, title: "Other Documents", text: "Contact us to ask whether notarial service is available for another document type" },
];
const benefits = [
  "Request mobile service at a proposed meeting location",
  "Request an office appointment in the St. Lucie West area",
  "Select a preferred date and time of day",
  "Review your information before submitting",
  "Receive follow-up about availability and appointment details",
];
const communities = ["Port St. Lucie", "Jupiter", "Fort Pierce", "Vero Beach", "Jensen Beach", "Palm City", "Stuart", "Surrounding communities", "Hobe Sound"];
const navigation = [["Home", "#home"], ["Services", "#services"], ["How It Works", "#how-it-works"], ["About", "#about"], ["FAQs", "#faqs"], ["Contact", "#contact"]] as const;

function Navigation({ footer = false }: { footer?: boolean }) {
  return <nav className={footer ? "footer-nav" : "desktop-nav"} aria-label={footer ? "Footer" : "Primary"}>{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>;
}

export default function HomePage() {
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="site-header"><div className="shell header-inner">
      <a className="brand-link header-brand-link" href="#home" aria-label="772 Notary home"><HeaderLogo /></a>
      <Navigation />
      <div className="header-action"><Link className="button button-navy button-compact" href="/request">Request a Notary</Link></div>
      <details className="mobile-menu"><summary aria-label="Open navigation"><span /><span /><span /></summary><nav aria-label="Mobile">{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<Link className="button button-gold" href="/request">Request a Notary</Link></nav></details>
    </div></header>

    <main id="main-content"><span id="home" className="anchor-target" />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" role="img" aria-label="Palm trees reflected in a calm Florida waterway at sunset" /><div className="hero-wash" />
        <div className="shell hero-inner"><div className="hero-copy">
          <p className="kicker kicker-light">Mobile notary services</p><h1 id="hero-title">Notary Service<br />Where It Works<br />for You</h1>
          <p className="hero-lede">Professional, reliable, and convenient mobile notary services throughout Florida&apos;s Treasure Coast. We come to your home, office, hospital, or another convenient location.</p>
          <div className="hero-actions"><Link className="button button-gold" href="/request"><CalendarIcon /> Request a Notary</Link><a className="button button-outline" href="tel:+17728004555">Call (772) 800-4555</a></div>
        </div><p className="hero-script" aria-hidden="true">Serving<br />local communities</p></div>
        <div className="shell trust-row" aria-label="Service highlights"><div><ShieldIcon /><span><strong>Two Appointment Options</strong>Mobile or 772 Notary office</span></div><div><MapPinIcon /><span><strong>Local Service Area</strong>See the communities served</span></div><div><ClockIcon /><span><strong>Scheduling Requests</strong>Availability confirmed separately</span></div></div>
      </section>

      <section className="section services" id="services" aria-labelledby="services-title"><div className="shell">
        <div className="section-heading split-heading"><div><p className="kicker">Notary services</p><h2 id="services-title">Common Notary Requests</h2></div><p>Customers commonly request notarial services for the document types below. Service may be requested at an agreed mobile location or at the 772 Notary office. Requirements vary by document and notarial act.</p></div>
        <div className="service-grid">{services.map(({ icon: Icon, title, text }) => <article className="service-card" key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div>
        <p className="services-boundary">772 Notary provides notarial services only. We do not prepare or select legal documents, explain their legal effect, or provide legal advice.</p>
      </div></section>

      <section className="section why-section" id="about" aria-labelledby="why-title"><div className="shell why-grid">
        <div className="benefits"><p className="kicker">About 772 Notary</p><h2 id="why-title">Local Service with Two Meeting Options</h2><p className="about-copy">772 Notary provides in-person notarial services for individuals and businesses. Request mobile service at an agreed location or an appointment at the 772 Notary office in the St. Lucie West area.</p><ul>{benefits.map((benefit) => <li key={benefit}><span><CheckIcon /></span>{benefit}</li>)}</ul></div>
        <div className="area-card" aria-labelledby="area-title"><div className="area-title"><MapPinIcon /><div><h2 id="area-title">Service Area</h2><p>Mobile service in local communities</p></div></div><p className="area-intro">Mobile appointments may be requested in the communities below. Office appointments are also available in the St. Lucie West area. Final availability and meeting details are confirmed separately.</p><ul>{communities.map((community) => <li className={community === "Surrounding communities" ? "community-wide" : undefined} key={community}><CheckIcon />{community}</li>)}</ul><p className="area-script" aria-hidden="true">In-person service<br />by appointment</p></div>
      </div></section>

      <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="shell"><p className="kicker">How it works</p><h2 id="how-title">Requesting Notary Service</h2><div className="step-grid"><article><span>1</span><h3>Tell us what you need</h3><p>Share the document type and number of documents involved without including document contents.</p></article><article><span>2</span><h3>Choose a meeting option</h3><p>Request mobile service or a 772 Notary office appointment, then select your preferred date and time of day.</p></article><article><span>3</span><h3>Review and submit</h3><p>Check your request and contact information, then send it to 772 Notary.</p></article><article><span>4</span><h3>Receive follow-up</h3><p>772 Notary reviews availability and follows up. A submitted request is not a confirmed appointment.</p></article></div></div></section>

      <section className="faq-section" id="faqs" aria-labelledby="faq-title"><div className="shell faq-grid"><div><p className="kicker">Before your appointment</p><h2 id="faq-title">Good to Know</h2></div><div className="faq-list"><details><summary>What should I have ready?</summary><p>Have the complete document and an acceptable form of identification available. Do not sign in advance unless you have been instructed to do so; signing requirements depend on the notarial act. Contact 772 Notary before the appointment if you are unsure what to bring.</p></details><details><summary>Do you provide legal advice?</summary><p>No. 772 Notary provides notarial services only. We do not prepare or select legal documents, explain their legal effect, or provide legal advice.</p></details><details><summary>Does submitting a request confirm my appointment?</summary><p>No. Submitting a request sends your information to 772 Notary for review. Your appointment is confirmed only after you receive follow-up confirming availability and the appointment details.</p></details></div></div></section>

      <section className="cta-wrap" id="contact" aria-labelledby="cta-title"><div className="shell cta-band"><CalendarIcon /><div><h2 id="cta-title">Need a Notary?</h2><p>Request mobile service at a proposed location or an appointment at the 772 Notary office. We will review your request and follow up to confirm availability.</p></div><Link className="button button-gold" href="/request">Request a Notary <ArrowRightIcon /></Link></div><div className="shell contact-strip"><a href="tel:+17728004555"><span>Call</span>(772) 800-4555</a><a href="mailto:info@772notary.com"><span>Email</span>info@772notary.com</a></div></section>
    </main>

    <footer className="site-footer"><div className="shell footer-main"><a className="brand-link" href="#home" aria-label="772 Notary home"><Brand /></a><Navigation footer /><div className="footer-contact"><a href="tel:+17728004555">(772) 800-4555</a><a href="mailto:info@772notary.com">info@772notary.com</a></div></div><div className="shell footer-bottom"><p>© {new Date().getFullYear()} 772 Notary. All rights reserved.</p><p>In-person notary service across Florida&apos;s Treasure Coast.</p></div></footer>
  </>;
}
