# Homepage and request-wizard validation — 2026-09-17

## Implemented

The homepage follows the approved visual reference with a white branded header, navy coastal hero,
gold primary actions, trust row, six service cards, local-benefit and service-area panels, simple process,
FAQs, strong request CTA, contact strip, and compact footer. It uses responsive React markup and CSS,
not a flattened mockup image. All prominent request actions lead to `/request`.

The four-step request demo covers service/document count, visit location/date/time, customer contact,
and review. Conditional fields appear for “Other document” and non-residential meeting locations.
Back/edit navigation preserves entered state. Completion explicitly confirms that the demo did not save
information, create an appointment, send email/SMS, or process payment. Browser instrumentation verified
completion makes no network request.

Business identity used throughout: **772 Notary**, **(772) 800-4555**,
**info@772notary.com**.

## Visual asset

The hero uses `public/images/river-sunset.jpg`, sourced from the Pexels photo “Palm Trees Reflecting on
River at Dawn” (photo 5722197) under the Pexels license. Source:
https://www.pexels.com/photo/palm-trees-reflecting-on-river-at-dawn-5722197/

## Validation

- Chromium viewport checks: 1440×1000, 768×900, and 390×844; no horizontal overflow.
- Full wizard browser flow: required fields, invalid contact rejection, both conditional branches,
  step navigation, edit/state preservation, review rendering, consent, and demo confirmation passed.
- axe scans: zero reported violations on desktop homepage, request step one, and completion state.
- `/api/health`: HTTP 200 with `{ "status": "ok", "service": "772-notary" }`; no-store response.
- Docker app healthcheck calls loopback inside the app container; no new published port.
- Repository lint, typecheck, eight unit tests, and production build passed.

Browser checks ran in an ephemeral matching Playwright container on the private project app network,
with no published ports; it was removed automatically. Screenshots and test evidence are git-ignored
under `.local/runtime`. The Playwright image remains cached locally but no test container remains.
