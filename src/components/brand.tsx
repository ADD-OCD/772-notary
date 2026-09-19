import Image from "next/image";

export function Brand() {
  return <span className="brand"><svg viewBox="0 0 58 48" aria-hidden="true"><path d="M29 35V14m0 0c-5-8-13-8-18-2 7-1 12 2 18 9m0-7c5-8 13-8 18-2-7-1-12 2-18 9m0-7c-1-9-8-13-14-10 6 2 10 7 14 14m0-14c1-9 8-13 14-10-6 2-10 7-14 14"/><path d="M5 37c8-4 15-4 23 0s15 4 25 0M8 43c7-3 13-3 20 0s13 3 22 0"/></svg><span><strong><b>772</b> NOTARY</strong><small>Mobile Notary Services</small></span></span>;
}


export function HeaderLogo() {
  return <Image className="header-logo" src="/images/772-notary-logo.png" alt="772 Notary — Mobile Notary Services" width={2172} height={724} sizes="(max-width: 560px) 192px, (max-width: 820px) 210px, (max-width: 1050px) 198px, 240px" quality={90} preload />;
}
