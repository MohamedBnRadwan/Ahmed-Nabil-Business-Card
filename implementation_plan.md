# Implementation Plan: Dynamic Digital Business Card

Build a modern, phone-friendly, and responsive digital business card web application for Ahmed Nabil (Medscan Terminal), powered by a JSON data source, featuring live QR code generation for contacts, vCard export, and modern aesthetics.

## Proposed Changes

### 1. Data Layer (`data.json`)
- [NEW] [data.json](file:///d:/radwan/rWW/Ahmed-Nabil-Business-Card/data.json)
  - Profile metadata: Name, Title, Company, Bio, Profile Image (`img/profile.jpg`), Company Logo (`img/medscan_terminal_company_logo-2.jpg`).
  - Contact info: Mobile, WhatsApp, Email, Website, Address/Location.
  - Social & Professional links: LinkedIn, WhatsApp, Location Map.

### 2. Markup & Presentation (`index.html` & `style.css`)
- [NEW] [index.html](file:///d:/radwan/rWW/Ahmed-Nabil-Business-Card/index.html)
  - Mobile-first card container with centered profile avatar, company logo, titles, quick-action buttons (Call, Email, WhatsApp, Save Contact).
  - Detailed contact item cards with quick-copy and deep-link actions.
  - Interactive QR code card section with full-screen QR scan modal.
  - Live data editor modal/drawer to showcase real-time QR and card updates upon data change.
- [NEW] [style.css](file:///d:/radwan/rWW/Ahmed-Nabil-Business-Card/style.css)
  - Curated color scheme matching Medscan brand palette (Warm Orange `#F26522`, deep navy/slate backgrounds `#0B1120`, `#1E293B`, crisp typography).
  - Modern glassmorphic cards, smooth gradient glows, micro-interactions, responsive sizing, and mobile viewport optimizations.

### 3. Application Logic (`app.js` & `qrcode.min.js`)
- [NEW] [app.js](file:///d:/radwan/rWW/Ahmed-Nabil-Business-Card/app.js)
  - Asynchronous loader for `data.json` with fallback for standalone `file://` protocol.
  - Dynamic vCard 3.0 string builder for instant contact addition to iOS/Android address books.
  - Dynamic QR code generation that automatically regenerates whenever data fields are changed.
  - Direct `.vcf` file downloader ("Save to Contacts").
  - Clipboard copy interaction with animated toast feedback.
- [NEW] [lib/qrcode.min.js](file:///d:/radwan/rWW/Ahmed-Nabil-Business-Card/lib/qrcode.min.js)
  - Bundled local QR Code engine ensuring 100% offline & local file execution reliability alongside CDN fallback.

## Verification Plan
1. Open and test in browser across mobile viewports (iPhone, Android, tablet) and desktop.
2. Verify dynamic QR code renders valid vCard data.
3. Test direct call links (`tel:`), email links (`mailto:`), and WhatsApp links (`https://wa.me/`).
4. Test "Save Contact" button download of `.vcf` contact card.
5. Verify JSON live edit updates the card UI and the QR code instantaneously.
