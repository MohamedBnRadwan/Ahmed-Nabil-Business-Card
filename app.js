/**
 * Ahmed Nabil - Digital Business Card Logic
 * Medscan Terminal
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
    profileImage: "img/profile.jpeg",
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

// Current active card state
let cardData = typeof window !== "undefined" && window.CARD_DATA ? JSON.parse(JSON.stringify(window.CARD_DATA)) : JSON.parse(JSON.stringify(DEFAULT_DATA));
let mainQR = null;
let modalQR = null;
let toastTimeout = null;
let currentTheme = "system"; // "system" | "light" | "dark"

// Initialize Application
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadData();
  renderCard();
  initQRCodes();
  setupEventListeners();
});

/**
 * Theme Manager: Auto System Preference + Manual Toggle Support
 */
function initTheme() {
  const savedTheme = localStorage.getItem("medscan_card_theme") || "system";
  currentTheme = savedTheme;

  // Listen to OS / System color scheme changes
  const systemPref = window.matchMedia("(prefers-color-scheme: dark)");
  systemPref.addEventListener("change", () => {
    if (currentTheme === "system") {
      applyTheme("system", false);
    }
  });

  applyTheme(currentTheme, false);
}

function applyTheme(theme, notify = true) {
  currentTheme = theme;
  localStorage.setItem("medscan_card_theme", theme);
  
  const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const effectiveIsDark = theme === "system" ? systemIsDark : theme === "dark";
  const metaTheme = document.getElementById("themeColorMeta");
  const iconDark = document.getElementById("themeIconDark");
  const iconLight = document.getElementById("themeIconLight");
  const btnToggle = document.getElementById("btnThemeToggle");

  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    if (btnToggle) btnToggle.title = `Theme: System (${systemIsDark ? "Dark" : "Light"}) - Click to switch`;
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    if (btnToggle) btnToggle.title = `Theme: ${theme === "light" ? "Light" : "Dark"} - Click to switch`;
  }

  // Update mobile browser toolbar color
  if (metaTheme) {
    metaTheme.setAttribute("content", effectiveIsDark ? "#070B14" : "#F1F5F9");
  }

  // Update theme toggle icon
  if (iconDark && iconLight) {
    if (effectiveIsDark) {
      iconDark.style.display = "block";
      iconLight.style.display = "none";
    } else {
      iconDark.style.display = "none";
      iconLight.style.display = "block";
    }
  }

  if (notify) {
    if (theme === "system") {
      showToast(`System Theme: ${systemIsDark ? "Dark" : "Light"} mode`);
    } else {
      showToast(`${theme === "light" ? "Light" : "Dark"} Mode enabled`);
    }
  }
}

function cycleTheme() {
  if (currentTheme === "system") {
    applyTheme("light", true);
  } else if (currentTheme === "light") {
    applyTheme("dark", true);
  } else {
    applyTheme("system", true);
  }
}

/**
 * Load data from data.json (HTTP/HTTPS/DevServer) or data.js (Offline/file:// protocol)
 */
async function loadData() {
  // 1. Try fetching data.json dynamically
  try {
    const response = await fetch("data.json?cache_bust=" + Date.now());
    if (response.ok) {
      const json = await response.json();
      if (json && json.personal) {
        cardData = json;
        return;
      }
    }
  } catch (e) {
    // Expected on local file:/// protocol
  }

  // 2. Check window.CARD_DATA (from data.js)
  if (typeof window !== "undefined" && window.CARD_DATA && window.CARD_DATA.personal) {
    cardData = window.CARD_DATA;
    return;
  }

  // 3. Fallback to DEFAULT_DATA
  cardData = DEFAULT_DATA;
}

/**
 * Render all card elements dynamically from current cardData
 */
function renderCard() {
  if (!cardData || !cardData.personal || !cardData.contact) return;
  const { personal, contact, services } = cardData;

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

  const elBio = document.getElementById("profileBio");
  if (elBio) elBio.textContent = personal.bio || "";
  
  const elAvatar = document.getElementById("profileImage");
  if (elAvatar && personal.profileImage) {
    elAvatar.src = personal.profileImage;
    elAvatar.alt = personal.name;
  }

  const elLogo = document.getElementById("companyLogo");
  if (elLogo && personal.companyLogo) {
    elLogo.src = personal.companyLogo;
    elLogo.alt = personal.company;
  }

  // Clean strings for URLs
  const cleanPhone = (contact.phoneRaw || contact.phone || "").replace(/\s+/g, "");
  const cleanAlt = (contact.altPhoneRaw || contact.altPhone || "").replace(/\s+/g, "");
  const cleanWA = (contact.whatsappRaw || contact.whatsapp || "").replace(/[^0-9]/g, "");

  // Quick Action Buttons
  const btnCall = document.getElementById("btnQuickCall");
  if (btnCall) btnCall.href = `tel:${cleanPhone}`;

  const btnWA = document.getElementById("btnQuickWhatsApp");
  if (btnWA) btnWA.href = `https://wa.me/${cleanWA}`;

  const btnEmail = document.getElementById("btnQuickEmail");
  if (btnEmail) btnEmail.href = `mailto:${contact.email}`;

  // Contact list items
  const linkPhone = document.getElementById("linkPhone");
  if (linkPhone) linkPhone.href = `tel:${cleanPhone}`;
  const textPhone = document.getElementById("textPhone");
  if (textPhone) textPhone.textContent = contact.phone;

  const linkEmail = document.getElementById("linkEmail");
  if (linkEmail) linkEmail.href = `mailto:${contact.email}`;
  const textEmail = document.getElementById("textEmail");
  if (textEmail) textEmail.textContent = contact.email;

  const linkPersonalEmail = document.getElementById("linkPersonalEmail");
  if (linkPersonalEmail && contact.personalEmail) {
    linkPersonalEmail.href = `mailto:${contact.personalEmail}`;
    const itemPersonalEmail = linkPersonalEmail.closest(".contact-item");
    if (itemPersonalEmail) itemPersonalEmail.style.display = "flex";
  }
  const textPersonalEmail = document.getElementById("textPersonalEmail");
  if (textPersonalEmail && contact.personalEmail) {
    textPersonalEmail.textContent = contact.personalEmail;
  }

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

  // Services List Rendering
  const servicesList = document.getElementById("servicesList");
  if (servicesList && Array.isArray(services) && services.length > 0) {
    servicesList.innerHTML = services.map(service => `
      <div class="service-tag">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${service}</span>
      </div>
    `).join("");
  }

  // Modal QR Title
  const modalQRTitle = document.getElementById("modalQRTitle");
  if (modalQRTitle) {
    modalQRTitle.textContent = `${personal.prefix ? personal.prefix + " " : ""}${personal.name} vCard`;
  }

  // Update Page Title & Metadata
  const fullTitle = `${personal.prefix ? personal.prefix + " " : ""}${personal.name} | ${personal.company} - Digital Business Card`;
  document.title = fullTitle;

  const metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle) metaTitle.setAttribute("content", `${personal.prefix ? personal.prefix + " " : ""}${personal.name} - ${personal.company}`);

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `Digital Business Card for ${personal.prefix ? personal.prefix + " " : ""}${personal.name}, ${personal.title} at ${personal.company}.`);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${personal.prefix ? personal.prefix + " " : ""}${personal.name} | ${personal.company}`);
}

/**
 * Generate vCard 3.0 Standard String
 */
function buildVCardString() {
  const { personal, contact } = cardData;
  const fullName = `${personal.prefix ? personal.prefix + " " : ""}${personal.name}`.trim();
  const cleanPhone = (contact.phoneRaw || contact.phone).replace(/\s+/g, "");

  const vcardLines = [
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
    vcardLines.push(`EMAIL;TYPE=HOME,INTERNET:${contact.personalEmail}`);
  }

  if (contact.altPhone) {
    const cleanAlt = (contact.altPhoneRaw || contact.altPhone).replace(/\s+/g, "");
    vcardLines.push(`TEL;TYPE=WORK,VOICE:${cleanAlt}`);
  }

  vcardLines.push(
    `URL;TYPE=WORK:${contact.website}`,
    `ADR;TYPE=WORK:;;${contact.location};;;;`,
    `NOTE:${personal.tagline || ""} - ${personal.bio || ""}`,
    "END:VCARD"
  );

  return vcardLines.join("\r\n");
}

/**
 * Initialize QR codes on main page and enlarge modal
 */
function initQRCodes() {
  const vcard = buildVCardString();
  const qrBox = document.getElementById("qrcode");
  const modalQRBox = document.getElementById("modal-qrcode");

  qrBox.innerHTML = "";
  modalQRBox.innerHTML = "";

  if (typeof QRCode !== "undefined") {
    mainQR = new QRCode(qrBox, {
      text: vcard,
      width: 160,
      height: 160,
      colorDark: "#0B0F19",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M
    });

    modalQR = new QRCode(modalQRBox, {
      text: vcard,
      width: 220,
      height: 220,
      colorDark: "#0B0F19",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

/**
 * Refresh QR codes with updated data
 */
function updateQRCodes() {
  const vcard = buildVCardString();
  if (mainQR && typeof mainQR.makeCode === "function") {
    mainQR.makeCode(vcard);
  } else {
    initQRCodes();
  }

  if (modalQR && typeof modalQR.makeCode === "function") {
    modalQR.makeCode(vcard);
  }
}

/**
 * Download vCard (.vcf) file directly to phone/desktop address book
 */
function downloadVCard() {
  const vcard = buildVCardString();
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const sanitizedName = (cardData.personal.name || "Contact").replace(/\s+/g, "_");
  link.href = url;
  link.setAttribute("download", `${sanitizedName}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("Contact card downloaded!");
}

/**
 * Copy to clipboard helper
 */
async function copyToClipboard(text, label = "Item") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast(`${label} copied to clipboard!`);
  } catch (err) {
    showToast(`Copied: ${text}`);
  }
}

/**
 * Display toast notification
 */
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMessage");
  
  toastMsg.textContent = message;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/**
 * Share business card
 */
async function shareCard() {
  const title = `${cardData.personal.prefix ? cardData.personal.prefix + " " : ""}${cardData.personal.name} - ${cardData.personal.company}`;
  const text = `Digital Business Card for ${cardData.personal.name} (${cardData.personal.title} at ${cardData.personal.company})`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (e) {
      if (e.name !== "AbortError") {
        copyToClipboard(url, "Card link");
      }
    }
  } else {
    copyToClipboard(url, "Card link");
  }
}

/**
 * Setup All Event Listeners & Modals
 */
function setupEventListeners() {
  // Download VCF Buttons
  document.getElementById("btnQuickVCard").addEventListener("click", downloadVCard);
  document.getElementById("btnDownloadVCard").addEventListener("click", downloadVCard);
  document.getElementById("btnMainSaveContact").addEventListener("click", downloadVCard);
  document.getElementById("btnModalDownloadVCF").addEventListener("click", downloadVCard);

  // Theme Toggle Button
  const btnThemeToggle = document.getElementById("btnThemeToggle");
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", cycleTheme);
  }

  // Share Card Button
  document.getElementById("btnShareCard").addEventListener("click", shareCard);

  // QR Enlarge Modal
  const modalQR = document.getElementById("modalQR");
  const btnEnlarge = document.getElementById("btnEnlargeQR");
  const qrBoxWrap = document.getElementById("qrBoxWrap");

  const openQRModal = () => modalQR.classList.add("active");
  btnEnlarge.addEventListener("click", openQRModal);
  qrBoxWrap.addEventListener("click", openQRModal);

  // Modal Close Buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      if (modalId) {
        document.getElementById(modalId).classList.remove("active");
      }
    });
  });

  // Close modals on backdrop click
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Close modals on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach((overlay) => {
        overlay.classList.remove("active");
      });
    }
  });

  // Copy Buttons for Contact Details
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const type = btn.getAttribute("data-copy");
      if (type === "phone") {
        copyToClipboard(cardData.contact.phone, "Phone number");
      } else if (type === "altPhone") {
        copyToClipboard(cardData.contact.altPhone, "Office desk number");
      } else if (type === "email") {
        copyToClipboard(cardData.contact.email, "Corporate email");
      } else if (type === "personalEmail") {
        copyToClipboard(cardData.contact.personalEmail, "Personal email");
      }
    });
  });
}
