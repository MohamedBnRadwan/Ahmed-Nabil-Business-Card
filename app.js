/**
 * Ahmed Nabil — Digital Business Card
 * Dynamic Data Integration & Interactive Logic
 */

// Default Fallback Data (ensures 100% offline & local file:// protocol compatibility)
const DEFAULT_DATA = {
  personal: {
    name: "Ahmed Nabil",
    prefix: "Mr.",
    title: "Operations manager",
    department: "Logistics Operations",
    company: "Medscan Terminal",
    tagline: "Specialized Integrated Logistics & Cold Chain Solutions",
    bio: "Dedicated operations leader specializing in freight forwarding, terminal warehousing, supply chain optimization, and specialized logistics across Saudi Arabia & the GCC.",
    profileImage: "img/profile.png",
    companyLogo: "img/medscan_terminal_company_logo-2.jpg",
    companyBadge: "img/medscan_terminal_company_logo.jpg"
  },
  contact: {
    phone: "+966 56 104 9774",
    phoneRaw: "+966561049774",
    whatsapp: "+966 56 104 9774",
    whatsappRaw: "966561049774",
    email: "ahmed.n@medscansa.com",
    personalEmail: "Ahmednabilm574@gmail.com",
    website: "https://medscansa.com",
    websiteDisplay: "www.medscansa.com",
    location: "MEDSCAN TERMINAL",
    mapsUrl: "https://maps.google.com/?q=Medscan+Terminal+Saudi+Arabia"
  },
  social: [
    {
      platform: "LinkedIn",
      icon: "linkedin",
      url: "https://www.linkedin.com/in/ahmed-nabil-9a643984/",
      label: "Connect on LinkedIn"
    },
    {
      platform: "WhatsApp",
      icon: "message-circle",
      url: "https://wa.me/966561049774",
      label: "Chat on WhatsApp"
    },
    {
      platform: "Corporate Email",
      icon: "mail",
      url: "mailto:ahmed.n@medscansa.com",
      label: "Send Corporate Email"
    },
    {
      platform: "Personal Email",
      icon: "mail",
      url: "mailto:Ahmednabilm574@gmail.com",
      label: "Send Personal Email"
    },
    {
      platform: "Website",
      icon: "globe",
      url: "https://medscansa.com",
      label: "Visit Medscan Website"
    },
    {
      platform: "Location",
      icon: "map-pin",
      url: "https://maps.google.com/?q=Medscan+Terminal+Saudi+Arabia",
      label: "Office Location"
    }
  ],
  services: [
    "Terminal Storage & Handling",
    "Cold Chain Warehousing",
    "Customs Clearance",
    "Freight Forwarding & Transport"
  ]
};

// Application State
let cardData = typeof window !== "undefined" && window.CARD_DATA 
  ? JSON.parse(JSON.stringify(window.CARD_DATA)) 
  : JSON.parse(JSON.stringify(DEFAULT_DATA));

let mainQRInstance = null;
let modalQRInstance = null;
let toastTimer = null;
let activeTheme = "light"; // Default theme: Light Mode

// Service metadata helper with icons & descriptions
const SERVICE_METADATA = {
  "Terminal Storage & Handling": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
    desc: "Secure staging, cross-docking & high-capacity container handling"
  },
  "Cold Chain Warehousing": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    desc: "Temperature-controlled pharmaceutical & perishable cold storage"
  },
  "Customs Clearance": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    desc: "Rapid regulatory compliance, clearance & port documentation"
  },
  "Freight Forwarding & Transport": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
    desc: "Domestic & GCC multimodal fleet logistics & forwarding"
  }
};

/**
 * Entry Point
 */
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadData();
  renderCard();
  initQRCodes();
  setupEventListeners();
  setupScrollNavbar();
  updateFooterYear();
});

/**
 * 1. Theme Manager (Default: Light Mode)
 */
function initTheme() {
  const saved = localStorage.getItem("ahmed_nabil_card_theme") || "light";
  activeTheme = saved;
  applyTheme(activeTheme, false);
}

function applyTheme(theme, notify = true) {
  activeTheme = theme;
  localStorage.setItem("ahmed_nabil_card_theme", theme);

  const root = document.documentElement;
  const metaTheme = document.getElementById("themeColorMeta");
  
  // Navbar theme icons
  const sunIcon = document.getElementById("themeIconSun");
  const moonIcon = document.getElementById("themeIconMoon");
  const toggleBtn = document.getElementById("btnThemeToggle");

  // Hero card theme icons
  const heroSunIcon = document.getElementById("heroThemeIconSun");
  const heroMoonIcon = document.getElementById("heroThemeIconMoon");
  const heroToggleBtn = document.getElementById("btnHeroThemeToggle");

  const titleText = theme === "dark" 
    ? "Theme: Dark Mode — Click for Light Mode" 
    : "Theme: Light Mode — Click for Dark Mode";

  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
  }

  if (toggleBtn) toggleBtn.title = titleText;
  if (heroToggleBtn) heroToggleBtn.title = titleText;

  // Update browser header theme color
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "dark" ? "#000000" : "#F5F5F7");
  }

  // Update Navbar & Hero Icons
  const isDark = theme === "dark";
  if (sunIcon) sunIcon.style.display = isDark ? "none" : "block";
  if (moonIcon) moonIcon.style.display = isDark ? "block" : "none";
  if (heroSunIcon) heroSunIcon.style.display = isDark ? "none" : "block";
  if (heroMoonIcon) heroMoonIcon.style.display = isDark ? "block" : "none";

  if (notify) {
    showToast(`${theme === "light" ? "Light" : "Dark"} Mode enabled`);
  }
}

function toggleTheme() {
  applyTheme(activeTheme === "light" ? "dark" : "light", true);
}

/**
 * 2. Data Loading
 */
async function loadData() {
  try {
    const response = await fetch("data.json?t=" + Date.now());
    if (response.ok) {
      const json = await response.json();
      if (json && json.personal) {
        cardData = json;
        return;
      }
    }
  } catch (err) {
    // Expected on local file:/// protocol
  }

  if (typeof window !== "undefined" && window.CARD_DATA && window.CARD_DATA.personal) {
    cardData = window.CARD_DATA;
    return;
  }

  cardData = DEFAULT_DATA;
}

/**
 * 3. Dynamic Rendering
 */
function renderCard() {
  if (!cardData || !cardData.personal || !cardData.contact) return;
  const { personal, contact, services } = cardData;

  // Top Navigation Bar Info
  const elNavName = document.querySelector(".nav-profile-name");
  if (elNavName) elNavName.textContent = personal.name;

  const elNavTitle = document.querySelector(".nav-profile-title");
  if (elNavTitle) elNavTitle.textContent = personal.title;

  // Personal Info
  const elName = document.getElementById("profileName");
  if (elName) elName.textContent = personal.name;

  const elPrefix = document.getElementById("profilePrefix");
  if (elPrefix) {
    elPrefix.textContent = personal.prefix || "";
    elPrefix.style.display = personal.prefix ? "inline-block" : "none";
  }

  const elTitle = document.getElementById("profileTitle");
  if (elTitle) elTitle.textContent = personal.title;

  const elDept = document.getElementById("profileDepartment");
  if (elDept) elDept.textContent = personal.department || "";

  const elCompany = document.getElementById("profileCompany");
  if (elCompany) {
    elCompany.textContent = "MEDSCAN";
  }

  const elBio = document.getElementById("profileBio");
  if (elBio) elBio.textContent = personal.bio || "";

  // Images
  const elAvatar = document.getElementById("profileImage");
  if (elAvatar && personal.profileImage) {
    elAvatar.src = personal.profileImage;
    elAvatar.alt = personal.name;
  }

  const elNavAvatar = document.getElementById("navAvatarImage");
  if (elNavAvatar && personal.profileImage) {
    elNavAvatar.src = personal.profileImage;
    elNavAvatar.alt = personal.name;
  }

  // Clean values for URLs
  const cleanPhone = (contact.phoneRaw || contact.phone || "").replace(/\s+/g, "");
  const cleanWA = (contact.whatsappRaw || contact.whatsapp || "").replace(/[^0-9]/g, "");

  // Quick Action Buttons
  const btnCall = document.getElementById("btnQuickCall");
  if (btnCall) btnCall.href = `tel:${cleanPhone}`;

  const btnWA = document.getElementById("btnQuickWhatsApp");
  if (btnWA) btnWA.href = `https://wa.me/${cleanWA}`;

  const btnEmail = document.getElementById("btnQuickEmail");
  if (btnEmail) btnEmail.href = `mailto:${contact.email}`;

  // Contact list rows
  const linkPhone = document.getElementById("linkPhone");
  if (linkPhone) linkPhone.href = `tel:${cleanPhone}`;
  const textPhone = document.getElementById("textPhone");
  if (textPhone) textPhone.textContent = contact.phone;

  const linkEmail = document.getElementById("linkEmail");
  if (linkEmail) linkEmail.href = `mailto:${contact.email}`;
  const textEmail = document.getElementById("textEmail");
  if (textEmail) textEmail.textContent = contact.email;

  const linkWebsite = document.getElementById("linkWebsite");
  if (linkWebsite) linkWebsite.href = contact.website;
  const textWebsite = document.getElementById("textWebsite");
  if (textWebsite) textWebsite.textContent = contact.websiteDisplay || contact.website.replace(/^https?:\/\//, "");
  const linkWebsiteBtn = document.getElementById("linkWebsiteBtn");
  if (linkWebsiteBtn) linkWebsiteBtn.href = contact.website;

  const linkLocation = document.getElementById("linkLocation");
  if (linkLocation) linkLocation.href = contact.mapsUrl;
  const textLocation = document.getElementById("textLocation");
  if (textLocation) textLocation.textContent = contact.location;
  const linkLocationBtn = document.getElementById("linkLocationBtn");
  if (linkLocationBtn) linkLocationBtn.href = contact.mapsUrl;

  // Personal Details
  const linkPersonalWA = document.getElementById("linkPersonalWA");
  if (linkPersonalWA) linkPersonalWA.href = `https://wa.me/${cleanWA}`;
  const textPersonalWA = document.getElementById("textPersonalWA");
  if (textPersonalWA) textPersonalWA.textContent = contact.whatsapp || contact.phone;

  const linkPersonalEmail = document.getElementById("linkPersonalEmail");
  if (linkPersonalEmail && contact.personalEmail) {
    linkPersonalEmail.href = `mailto:${contact.personalEmail}`;
  }
  const textPersonalEmail = document.getElementById("textPersonalEmail");
  if (textPersonalEmail && contact.personalEmail) {
    textPersonalEmail.textContent = contact.personalEmail;
  }

  const linkLinkedIn = document.getElementById("linkLinkedIn");
  const linkLinkedInBtn = document.getElementById("linkLinkedInBtn");
  const textLinkedIn = document.getElementById("textLinkedIn");
  const linkedInItem = cardData.social ? cardData.social.find(s => s.platform === "LinkedIn") : null;
  const linkedInUrl = linkedInItem ? linkedInItem.url : "https://www.linkedin.com/in/ahmed-nabil-9a643984/";
  if (linkLinkedIn) linkLinkedIn.href = linkedInUrl;
  if (linkLinkedInBtn) linkLinkedInBtn.href = linkedInUrl;
  if (textLinkedIn) textLinkedIn.textContent = personal.name;

  // Services Rendering
  const servicesContainer = document.getElementById("servicesList");
  if (servicesContainer && Array.isArray(services) && services.length > 0) {
    servicesContainer.innerHTML = services.map(serviceName => {
      const meta = SERVICE_METADATA[serviceName] || {
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        desc: "Specialized logistics & supply chain solution"
      };
      return `
        <div class="service-apple-card">
          <div class="service-icon-box">
            ${meta.icon}
          </div>
          <div class="service-text-wrap">
            <h3 class="service-name">${serviceName}</h3>
            <p class="service-desc">${meta.desc}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  // Modal Header
  const modalQRTitle = document.getElementById("modalQRTitle");
  if (modalQRTitle) {
    modalQRTitle.textContent = `${personal.prefix ? personal.prefix + " " : ""}${personal.name}`;
  }

  // Dynamic Metadata
  const docTitle = `${personal.name} | ${personal.company} — Digital Business Card`;
  document.title = docTitle;

  const metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle) metaTitle.setAttribute("content", `${personal.name} — ${personal.title} | ${personal.company}`);

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `Digital Business Card for ${personal.name}, ${personal.title} at ${personal.company}. Specialized Integrated Logistics & Cold Chain Solutions.`);
}

/**
 * 4. Generate Standard vCard 3.0 String
 */
function buildVCardString() {
  const { personal, contact } = cardData;
  const fullName = `${personal.prefix ? personal.prefix + " " : ""}${personal.name}`.trim();
  const cleanPhone = (contact.phoneRaw || contact.phone).replace(/\s+/g, "");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fullName}`,
    `N:${personal.name};;;${personal.prefix || ""};`,
    `TITLE:${personal.title}`,
    `ORG:${personal.company};${personal.department || ""}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    `EMAIL;TYPE=WORK,INTERNET:${contact.email}`
  ];

  if (contact.personalEmail) {
    lines.push(`EMAIL;TYPE=HOME,INTERNET:${contact.personalEmail}`);
  }

  if (contact.website) {
    lines.push(`URL;TYPE=WORK:${contact.website}`);
  }

  if (contact.location) {
    lines.push(`ADR;TYPE=WORK:;;${contact.location};;;;`);
  }

  if (personal.tagline || personal.bio) {
    lines.push(`NOTE:${personal.tagline || ""} - ${personal.bio || ""}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/**
 * 5. Initialize QR Codes
 */
function initQRCodes() {
  const vcard = buildVCardString();
  const qrMainEl = document.getElementById("qrcode");
  const qrModalEl = document.getElementById("modal-qrcode");

  if (!qrMainEl || !qrModalEl || typeof QRCode === "undefined") return;

  qrMainEl.innerHTML = "";
  qrModalEl.innerHTML = "";

  try {
    mainQRInstance = new QRCode(qrMainEl, {
      text: vcard,
      width: 140,
      height: 140,
      colorDark: "#1D1D1F",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M
    });

    modalQRInstance = new QRCode(qrModalEl, {
      text: vcard,
      width: 220,
      height: 220,
      colorDark: "#1D1D1F",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
  }
}

/**
 * 6. Download vCard (.vcf)
 */
function downloadVCard() {
  const vcard = buildVCardString();
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const sanitizedName = (cardData.personal.name || "Contact").replace(/\s+/g, "_");
  link.href = url;
  link.setAttribute("download", `${sanitizedName}_Medscan.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Contact card downloaded");
}

/**
 * 7. Copy to Clipboard
 */
async function copyToClipboard(text, label = "Item") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast(`${label} copied`);
  } catch (err) {
    showToast(`Copied: ${text}`);
  }
}

/**
 * 8. Toast Feedback
 */
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMessage");

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/**
 * 9. Native Web Share API
 */
async function shareCard() {
  const title = `${cardData.personal.name} — ${cardData.personal.company}`;
  const text = `Digital Business Card of ${cardData.personal.name} (${cardData.personal.title} at ${cardData.personal.company})`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      if (err.name !== "AbortError") {
        copyToClipboard(url, "Card link");
      }
    }
  } else {
    copyToClipboard(url, "Card link");
  }
}

/**
 * 10. Footer Year
 */
function updateFooterYear() {
  const elYear = document.getElementById("currentYear");
  if (elYear) elYear.textContent = new Date().getFullYear();
}

/**
 * 11. Event Listeners Setup
 */
function setupEventListeners() {
  // Save Contact / Download vCard
  const btnQuickVCard = document.getElementById("btnQuickVCard");
  if (btnQuickVCard) btnQuickVCard.addEventListener("click", downloadVCard);

  const btnDownloadVCard = document.getElementById("btnDownloadVCard");
  if (btnDownloadVCard) btnDownloadVCard.addEventListener("click", downloadVCard);

  const btnMainSaveContact = document.getElementById("btnMainSaveContact");
  if (btnMainSaveContact) btnMainSaveContact.addEventListener("click", downloadVCard);

  const btnModalDownloadVCF = document.getElementById("btnModalDownloadVCF");
  if (btnModalDownloadVCF) btnModalDownloadVCF.addEventListener("click", downloadVCard);

  // Theme Toggle Buttons (Navbar & Hero Card)
  const btnThemeToggle = document.getElementById("btnThemeToggle");
  if (btnThemeToggle) btnThemeToggle.addEventListener("click", toggleTheme);

  const btnHeroThemeToggle = document.getElementById("btnHeroThemeToggle");
  if (btnHeroThemeToggle) btnHeroThemeToggle.addEventListener("click", toggleTheme);

  // Share Card Buttons (Navbar & Hero Card)
  const btnShareCard = document.getElementById("btnShareCard");
  if (btnShareCard) btnShareCard.addEventListener("click", shareCard);

  const btnHeroShare = document.getElementById("btnHeroShare");
  if (btnHeroShare) btnHeroShare.addEventListener("click", shareCard);

  // QR Modal Handlers
  const modalQR = document.getElementById("modalQR");
  const btnEnlargeQR = document.getElementById("btnEnlargeQR");
  const qrBoxWrap = document.getElementById("qrBoxWrap");

  const openModal = () => {
    if (modalQR) modalQR.classList.add("active");
  };

  if (btnEnlargeQR) btnEnlargeQR.addEventListener("click", openModal);
  if (qrBoxWrap) {
    qrBoxWrap.addEventListener("click", openModal);
    qrBoxWrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal();
      }
    });
  }

  // Modal Close Handlers
  document.querySelectorAll(".modal-close-btn, [data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      const targetModal = modalId ? document.getElementById(modalId) : btn.closest(".apple-modal-overlay");
      if (targetModal) targetModal.classList.remove("active");
    });
  });

  // Close on background click
  if (modalQR) {
    modalQR.addEventListener("click", (e) => {
      if (e.target === modalQR) {
        modalQR.classList.remove("active");
      }
    });
  }

  // Close on Escape Key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".apple-modal-overlay.active").forEach((modal) => {
        modal.classList.remove("active");
      });
    }
  });

  // Copy Buttons for Contact Details
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const type = btn.getAttribute("data-copy");
      if (type === "phone") {
        copyToClipboard(cardData.contact.phone, "Phone number");
      } else if (type === "email") {
        copyToClipboard(cardData.contact.email, "Corporate email");
      } else if (type === "personalEmail") {
        copyToClipboard(cardData.contact.personalEmail, "Personal email");
      } else if (type === "whatsapp") {
        copyToClipboard(cardData.contact.whatsapp || cardData.contact.phone, "WhatsApp number");
      }
    });
  });
}

/**
 * 12. Navbar Scroll Reveal Controller
 * Reveals floating Apple navbar only when scrolled down past the hero card
 */
function setupScrollNavbar() {
  const navbar = document.getElementById("appleNavbar");
  const heroSection = document.querySelector(".hero-section");
  if (!navbar || !heroSection) return;

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const heroBottom = heroSection.offsetTop + (heroSection.offsetHeight * 0.55);
        if (window.scrollY > heroBottom) {
          navbar.classList.add("visible");
        } else {
          navbar.classList.remove("visible");
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
