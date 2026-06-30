/**
 * Dynamic Layout & Core State Engine for AI Vision Static Dashboard
 * Renders the Sidebar, Topbar, and Footer dynamically across all pages.
 * Integrates directly with the Express API where applicable, falling back to simulated states cleanly.
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderSidebar();
  renderTopbar();
  renderFooter();
  setupSessionTimeout();
  setupNotificationsEngine();
  startClock();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("dashboard-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("dashboard-theme", newTheme);
  
  // Update toggle icons
  const themeIcons = document.querySelectorAll(".theme-toggle-icon");
  themeIcons.forEach(icon => {
    icon.innerHTML = newTheme === "dark" ? "light_mode" : "dark_mode";
  });
}

// Render Premium Sidebar
function renderSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  const currentPath = window.location.pathname;
  const activePage = currentPath.split("/").pop() || "index.html";

  // Sidebar items definition
  const menuItems = [
    { name: "Dashboard", file: "dashboard.html", icon: "dashboard" },
    { name: "Live Monitor", file: "live.html", icon: "sensors" },
    { name: "Detection History", file: "history.html", icon: "history" },
    { name: "Known Faces", file: "known_faces.html", icon: "face" },
    { name: "Unknown Faces", file: "unknown_faces.html", icon: "portrait" },
    { name: "Animals", file: "animals.html", icon: "pets" },
    { name: "Image Gallery", file: "gallery.html", icon: "collections" },
    { name: "Statistics", file: "statistics.html", icon: "analytics" },
    { name: "Devices", file: "devices.html", icon: "phone_android" },
    { name: "Notifications", file: "notifications.html", icon: "notifications" },
    { name: "Settings", file: "settings.html", icon: "settings" },
    { name: "Portal Home", file: "index.html", icon: "home" },
  ];

  let menuHtml = `
    <div class="sidebar animate-fade">
      <div class="sidebar-brand">
        <i class="material-icons text-primary" style="font-size: 28px; color: var(--accent-color);">security</i>
        <div>
          <h6 class="m-0 font-sans text-primary fw-bold">AI VISION</h6>
          <span class="text-secondary" style="font-size: 11px;">Surveillance v2.4</span>
        </div>
      </div>
      <ul class="sidebar-menu">
  `;

  menuItems.forEach(item => {
    const isActive = activePage === item.file ? "active" : "";
    menuHtml += `
      <li class="sidebar-item">
        <a href="${item.file}" class="sidebar-link ${isActive}">
          <i class="material-icons">${item.icon}</i>
          <span>${item.name}</span>
        </a>
      </li>
    `;
  });

  menuHtml += `
        <li class="sidebar-item mt-4">
          <a href="login.html" class="sidebar-link text-danger" onclick="logoutSession(event)">
            <i class="material-icons text-danger">logout</i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </div>
  `;

  sidebarContainer.innerHTML = menuHtml;
}

// Render Premium Topbar
function renderTopbar() {
  const topbarContainer = document.getElementById("topbar-container");
  if (!topbarContainer) return;

  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const themeIcon = currentTheme === "dark" ? "light_mode" : "dark_mode";

  // Dynamic Page Title
  const currentPath = window.location.pathname;
  const fileName = currentPath.split("/").pop() || "index.html";
  let pageTitle = "Surveillance Center";
  if (fileName === "dashboard.html") pageTitle = "Dashboard Analytics";
  else if (fileName === "live.html") pageTitle = "Live Surveillance Monitor";
  else if (fileName === "history.html") pageTitle = "Detection History Log";
  else if (fileName === "known_faces.html") pageTitle = "Known Faces Database";
  else if (fileName === "unknown_faces.html") pageTitle = "Alerted Unknown Faces";
  else if (fileName === "animals.html") pageTitle = "Animal Motion Detections";
  else if (fileName === "gallery.html") pageTitle = "Captured Image Gallery";
  else if (fileName === "statistics.html") pageTitle = "Statistical Analysis";
  else if (fileName === "devices.html") pageTitle = "Registered Devices";
  else if (fileName === "notifications.html") pageTitle = "System Alerts Center";
  else if (fileName === "settings.html") pageTitle = "System & API Configuration";
  else if (fileName === "index.html") pageTitle = "AI Vision Portal";

  topbarContainer.innerHTML = `
    <header class="topbar animate-fade">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm d-lg-none sidebar-toggle-btn border text-primary" style="border-radius: 8px;" onclick="toggleSidebarMenu()">
          <i class="material-icons m-0">menu</i>
        </button>
        <h4 class="m-0 text-primary font-sans fw-bold">${pageTitle}</h4>
      </div>

      <!-- Live Search Box -->
      <div class="d-none d-md-flex align-items-center position-relative mx-3" style="flex-grow: 0.5; max-width: 400px;">
        <i class="material-icons text-secondary position-absolute ms-3">search</i>
        <input type="text" class="form-control form-control-glass ps-5 py-2 w-full text-xs" id="top-search-input" placeholder="Instant Search matching targets..." onkeyup="handleGlobalSearch(this.value)">
      </div>

      <!-- Right Control Block -->
      <div class="d-flex align-items-center gap-2 gap-md-3">
        <!-- Live Calendar Time -->
        <div class="text-end d-none d-xl-block">
          <div class="text-primary font-sans fw-semibold text-sm" id="live-time">00:00:00 UTC</div>
          <div class="text-secondary text-xs" id="live-date">Loading date...</div>
        </div>

        <!-- Health Badges Grid -->
        <div class="d-none d-sm-flex align-items-center gap-2">
          <span class="status-badge status-online cursor-pointer" title="Server Connection State" onclick="triggerNotification('Server API node fully online and active.', 'success')">
            <span class="pulse-indicator"></span>SRV
          </span>
          <span class="status-badge status-online cursor-pointer" title="Local SQLite Sync" onclick="triggerNotification('In-memory database connection synced and healthy.', 'success')">
            <span class="pulse-indicator"></span>DB
          </span>
          <span class="status-badge status-ai cursor-pointer" title="Gemini-3.5-Flash Active" onclick="triggerNotification('Gemini-3.5-Flash AI pipeline responding.', 'info')">
            <span class="pulse-indicator"></span>AI
          </span>
          <span class="status-badge status-online cursor-pointer" title="Camera Streams Active" onclick="triggerNotification('All 5 network cameras are transmitting frames.', 'success')">
            <span class="pulse-indicator"></span>CAM
          </span>
        </div>

        <!-- Theme Toggle -->
        <button class="btn btn-glass d-flex align-items-center justify-content-center p-2" style="border-radius: 50%;" onclick="toggleTheme()" title="Toggle Color Theme">
          <i class="material-icons m-0 theme-toggle-icon" style="font-size: 20px;">${themeIcon}</i>
        </button>

        <!-- User profile -->
        <div class="dropdown">
          <button class="btn btn-glass d-flex align-items-center gap-2 px-3 py-1.5" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="border-radius: 12px;">
            <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white text-xs fw-bold" style="width: 28px; height: 28px;">
              AD
            </div>
            <span class="text-primary d-none d-md-inline fw-semibold" style="font-size: 13px;">Admin Only</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end glass-card p-2 mt-2" style="border-radius: 12px; width: 220px;">
            <li>
              <div class="px-3 py-2 border-bottom border-secondary" style="border-color: rgba(255,255,255,0.1) !important;">
                <p class="text-primary fw-bold m-0 text-sm">Administrator</p>
                <p class="text-secondary m-0 text-xs text-truncate">donbhi305@gmail.com</p>
              </div>
            </li>
            <li><a class="dropdown-item text-primary text-xs py-2 mt-1" href="settings.html"><i class="material-icons align-middle text-sm me-2">settings</i>Settings</a></li>
            <li><a class="dropdown-item text-primary text-xs py-2" href="notifications.html"><i class="material-icons align-middle text-sm me-2">notifications</i>Alerts Center</a></li>
            <li><hr class="dropdown-divider border-secondary" style="border-color: rgba(255,255,255,0.1) !important;"></li>
            <li><a class="dropdown-item text-danger text-xs py-2" href="login.html" onclick="logoutSession(event)"><i class="material-icons align-middle text-sm me-2 text-danger">logout</i>Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
  `;
}

// Render Footer
function renderFooter() {
  const footerContainer = document.getElementById("footer-container");
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="mt-auto py-3 px-4 glass-card d-flex flex-wrap justify-content-between align-items-center gap-2 text-xs text-secondary border-0 border-top mt-5" style="border-radius: 0; background: rgba(0,0,0,0.1);">
      <div>
        <span>AI Vision Web Suite v2.4.0</span> | <span>Server Node: Express v4.21</span> | <span>Database Engine: InMemory-SQLite</span>
      </div>
      <div>
        &copy; 2026 AI Vision Security. Certified Enterprise Grade.
      </div>
    </footer>
  `;
}

// Side Drawer Toggle
function toggleSidebarMenu() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.toggle("show");
  }
}

// Start Clock
function startClock() {
  const updateTimes = () => {
    const timeEl = document.getElementById("live-time");
    const dateEl = document.getElementById("live-date");
    if (!timeEl || !dateEl) return;

    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString() + " Local";
    
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    dateEl.innerText = now.toLocaleDateString(undefined, options);
  };
  setInterval(updateTimes, 1000);
  updateTimes();
}

// Logout session
function logoutSession(e) {
  if (e) e.preventDefault();
  localStorage.removeItem("isAdminAuthenticated");
  triggerNotification("Logging out of active admin session...", "warning");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// Session timeout warning (Security Requirement)
function setupSessionTimeout() {
  // Check if authenticated
  const currentPath = window.location.pathname;
  if (currentPath.includes("login.html") || currentPath.includes("index.html")) return;

  const auth = localStorage.getItem("isAdminAuthenticated");
  if (auth !== "true" && !currentPath.includes("login.html")) {
    window.location.href = "login.html";
    return;
  }

  let timeoutTime = Date.now() + 15 * 60 * 1000; // 15 mins timeout
  
  const resetTimer = () => {
    timeoutTime = Date.now() + 15 * 60 * 1000;
  };

  // Activity events
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keypress", resetTimer);
  window.addEventListener("click", resetTimer);

  const checkInterval = setInterval(() => {
    if (Date.now() > timeoutTime) {
      clearInterval(checkInterval);
      triggerNotification("Session expired due to inactivity. Logging out...", "danger");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }
  }, 10000);
}

// Instant Global Search filter (Instant Search requirement)
function handleGlobalSearch(term) {
  const lowerTerm = term.toLowerCase().trim();
  const highlightableElements = document.querySelectorAll(".highlightable-row, .gallery-item, .face-card, .animal-card, .device-card");
  
  highlightableElements.forEach(elem => {
    const textContent = elem.textContent.toLowerCase();
    if (textContent.includes(lowerTerm)) {
      elem.style.display = "";
      // Highlight matching spans
      if (lowerTerm.length > 2) {
        elem.classList.add("pulse-highlight");
      } else {
        elem.classList.remove("pulse-highlight");
      }
    } else {
      elem.style.display = "none";
    }
  });
}

// Floating Toast Notifications Center
let toastContainer = null;
function setupNotificationsEngine() {
  toastContainer = document.createElement("div");
  toastContainer.style.position = "fixed";
  toastContainer.style.bottom = "24px";
  toastContainer.style.right = "24px";
  toastContainer.style.zIndex = "9999";
  toastContainer.style.display = "flex";
  toastContainer.style.flexDirection = "column";
  toastContainer.style.gap = "10px";
  toastContainer.style.maxWidth = "350px";
  document.body.appendChild(toastContainer);
}

window.triggerNotification = function(message, type = "success") {
  if (!toastContainer) setupNotificationsEngine();

  const toast = document.createElement("div");
  toast.className = `glass-card p-3 animate-fade`;
  toast.style.borderRadius = "12px";
  toast.style.borderLeft = `5px solid var(--${type}-color)`;
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "12px";
  toast.style.minWidth = "280px";
  toast.style.boxShadow = "var(--card-shadow)";

  let icon = "info";
  if (type === "success") icon = "check_circle";
  else if (type === "warning") icon = "warning";
  else if (type === "danger") icon = "error_outline";

  toast.innerHTML = `
    <i class="material-icons" style="color: var(--${type}-color); font-size: 24px;">${icon}</i>
    <div style="flex-grow: 1;">
      <p class="m-0 text-primary fw-semibold text-xs">${message}</p>
    </div>
    <button class="btn btn-sm border-0 text-secondary p-0" onclick="this.parentElement.remove()">
      <i class="material-icons" style="font-size: 16px;">close</i>
    </button>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.4s ease";
    setTimeout(() => toast.remove(), 400);
  }, 5000);
};
