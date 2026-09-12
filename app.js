/**
 * Ahmed Nabil - Digital Business Card Logic
 * Medscan Terminal
 */

// Default Fallback Data (ensures 100% offline & file:// protocol compatibility)
const DEFAULT_DATA = {
  personal: {
    name: "Ahmed Nabil",
    prefix: "Eng.",
    title: "Operations & Commercial Manager",
    department: "Logistics & Terminal Operations",
    company: "Medscan Terminal",
    tagline: "Specialized Integrated Logistics & Cold Chain Solutions",
    bio: "Dedicated operations leader specializing in freight forwarding, terminal warehousing, supply chain optimization, and specialized logistics across Saudi Arabia & the GCC.",
    profileImage: "img/profile.jpg",
    companyLogo: "img/medscan_terminal_company_logo-2.jpg",
    companyBadge: "img/medscan_terminal_company_logo.jpg"
  },
  contact: {
    phone: "+966 50 123 4567",
    phoneRaw: "+966501234567",
    altPhone: "+966 13 800 0000",
    altPhoneRaw: "+966138000000",
    whatsapp: "+966 50 123 4567",
    whatsappRaw: "966501234567",
    email: "ahmed.nabil@medscan.com.sa",
    website: "https://medscan.com.sa",
    websiteDisplay: "www.medscan.com.sa",
    location: "Dammam 2nd Industrial City, Eastern Province, Saudi Arabia",
    mapsUrl: "https://maps.google.com/?q=Medscan+Terminal+Saudi+Arabia"
  },
  social: [
    {
      platform: "LinkedIn",
      icon: "linkedin",
      url: "https://www.linkedin.com/in/ahmed-nabil",
      label: "Connect on LinkedIn"
    },
    {
      platform: "WhatsApp",
      icon: "message-circle",
      url: "https://wa.me/966501234567?text=Hello%20Ahmed,%20I%20would%20like%20to%20connect%20regarding%20Medscan%20Terminal%20services.",
      label: "Chat on WhatsApp"
    },
    {
      platform: "Email",
      icon: "mail",
      url: "mailto:ahmed.nabil@medscan.com.sa",
      label: "Send Email"
    },
    {
      platform: "Website",
      icon: "globe",
      url: "https://medscan.com.sa",
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
let cardData = JSON.parse(JSON.stringify(DEFAULT_DATA));
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
  systemPref.addEventListener("change", (e) => {
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
 * Load data from data.json if available via HTTP/fetch, or keep fallback
 */
async function loadData() {
  try {
    const response = await fetch("data.json");
    if (response.ok) {
      const json = await response.json();
      cardData = { ...cardData, ...json };
    }
  } catch (e) {
    console.info("Using embedded default data source (Local/Offline mode).");
  }
}

/**
 * Render all card elements dynamically from current cardData
 */
function renderCard() {
  const { personal, contact } = cardData;

  // Personal Info
  document.getElementById("profileName").textContent = personal.name;
  document.getElementById("profilePrefix").textContent = personal.prefix || "";
  document.getElementById("profilePrefix").style.display = personal.prefix ? "inline-block" : "none";
  document.getElementById("profileTitle").textContent = personal.title;
  document.getElementById("profileDepartment").textContent = personal.department || "";
  document.getElementById("profileBio").textContent = personal.bio || "";
  
  if (personal.profileImage) {
    document.getElementById("profileImage").src = personal.profileImage;
  }
  if (personal.companyLogo) {
    document.getElementById("companyLogo").src = personal.companyLogo;
  }

  // Quick Action Buttons
  const cleanPhone = (contact.phoneRaw || contact.phone).replace(/\s+/g, "");
  const cleanAlt = (contact.altPhoneRaw || contact.altPhone).replace(/\s+/g, "");
  const cleanWA = (contact.whatsappRaw || contact.whatsapp).replace(/[^0-9]/g, "");

  document.getElementById("btnQuickCall").href = `tel:${cleanPhone}`;
  document.getElementById("btnQuickWhatsApp").href = `https://wa.me/${cleanWA}?text=Hello%20Ahmed,%20I%20would%20like%20to%20connect%20regarding%20Medscan%20Terminal%20services.`;
  document.getElementById("btnQuickEmail").href = `mailto:${contact.email}?subject=Inquiry%20from%20Digital%20Business%20Card`;

  // Contact list items
  document.getElementById("linkPhone").href = `tel:${cleanPhone}`;
  document.getElementById("textPhone").textContent = contact.phone;

  document.getElementById("linkAltPhone").href = `tel:${cleanAlt}`;
  document.getElementById("textAltPhone").textContent = contact.altPhone;

  document.getElementById("linkEmail").href = `mailto:${contact.email}`;
  document.getElementById("textEmail").textContent = contact.email;

  document.getElementById("linkWebsite").href = contact.website;
  document.getElementById("textWebsite").textContent = contact.websiteDisplay || contact.website.replace(/^https?:\/\//, "");
  document.getElementById("linkWebsiteBtn").href = contact.website;

  document.getElementById("linkLocation").href = contact.mapsUrl;
  document.getElementById("textLocation").textContent = contact.location;
  document.getElementById("linkLocationBtn").href = contact.mapsUrl;

  // Update Page Title
  document.title = `${personal.prefix ? personal.prefix + " " : ""}${personal.name} | ${personal.company} - Digital Business Card`;
}

/**
 * Generate vCard 3.0 Standard String
 */
function buildVCardString() {
  const { personal, contact } = cardData;
  const fullName = `${personal.prefix ? personal.prefix + " " : ""}${personal.name}`.trim();
  const cleanPhone = (contact.phoneRaw || contact.phone).replace(/\s+/g, "");
  const cleanAlt = (contact.altPhoneRaw || contact.altPhone).replace(/\s+/g, "");

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fullName}`,
    `N:${personal.name};;;${personal.prefix || ""};`,
    `TITLE:${personal.title}`,
    `ORG:${personal.company};${personal.department || ""}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    `TEL;TYPE=WORK,VOICE:${cleanAlt}`,
    `EMAIL;TYPE=WORK,INTERNET:${contact.email}`,
    `URL;TYPE=WORK:${contact.website}`,
    `ADR;TYPE=WORK:;;${contact.location};;;;`,
    `NOTE:${personal.tagline || ""} - ${personal.bio || ""}`,
    "END:VCARD"
  ].join("\r\n");
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

  // Live Editor Drawer / Modal
  const modalEditor = document.getElementById("modalEditor");
  const btnOpenEditor = document.getElementById("btnOpenEditor");
  const btnToggleFooter = document.getElementById("btnToggleEditorFooter");
  const editorForm = document.getElementById("editorForm");
  const btnResetData = document.getElementById("btnResetData");

  const openEditor = () => {
    document.getElementById("editName").value = cardData.personal.name;
    document.getElementById("editPrefix").value = cardData.personal.prefix || "";
    document.getElementById("editTitle").value = cardData.personal.title;
    document.getElementById("editDepartment").value = cardData.personal.department || "";
    document.getElementById("editPhone").value = cardData.contact.phone;
    document.getElementById("editEmail").value = cardData.contact.email;
    document.getElementById("editBio").value = cardData.personal.bio || "";
    modalEditor.classList.add("active");
  };

  btnOpenEditor.addEventListener("click", openEditor);
  btnToggleFooter.addEventListener("click", openEditor);

  // Editor Form Submit (Realtime Live Card + QR Update)
  editorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    cardData.personal.name = document.getElementById("editName").value.trim();
    cardData.personal.prefix = document.getElementById("editPrefix").value.trim();
    cardData.personal.title = document.getElementById("editTitle").value.trim();
    cardData.personal.department = document.getElementById("editDepartment").value.trim();
    cardData.contact.phone = document.getElementById("editPhone").value.trim();
    cardData.contact.phoneRaw = document.getElementById("editPhone").value.trim();
    cardData.contact.email = document.getElementById("editEmail").value.trim();
    cardData.personal.bio = document.getElementById("editBio").value.trim();

    renderCard();
    updateQRCodes();
    modalEditor.classList.remove("active");
    showToast("Business card and QR updated successfully!");
  });

  // Reset to original data
  btnResetData.addEventListener("click", () => {
    cardData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    renderCard();
    updateQRCodes();
    modalEditor.classList.remove("active");
    showToast("Reset to default contact details.");
  });

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
      }
    });
  });
}
