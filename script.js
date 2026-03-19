// ---------- DATA ----------

const suggestedFolders = [
  { id: "folder_english", name: "English Coursework" },
  { id: "folder_math", name: "Math Homework" },
  { id: "folder_science", name: "Science Lab Reports" },
  { id: "folder_history", name: "History Essays" },
  { id: "folder_geography", name: "Geography Projects" }
];

const suggestedFiles = [
  { id: "file_essay_final", name: "Essay Draft (final).docx" },
  { id: "file_bio_notes", name: "Biology Notes – Week 3.pdf" },
  { id: "file_math_ws7", name: "Math Worksheet 7.png" },
  { id: "file_history_timeline", name: "History Timeline.docx" },
  { id: "file_science_revision", name: "Science Revision Sheet.pdf" }
];

const myDriveFiles = [
  { id: "file_english_para", name: "English Paragraph Practice.docx" },
  { id: "file_science_lab_prep", name: "Biology Lab Prep.docx" },
  { id: "file_geography_week4", name: "Geography Notes – Week 4.docx" },
  { id: "file_history_hw", name: "History Homework.docx" },
  { id: "file_group_project", name: "Group Project Outline.docx" },
  { id: "file_research_summary", name: "Research Summary.docx" },
  { id: "file_untitled1", name: "Untitled document (1).docx" },
  { id: "file_untitled2", name: "Untitled document (2).docx" },
  { id: "file_untitled3", name: "Untitled document (3).docx" },
  { id: "file_revision_plan", name: "Exam Revision Plan.docx" }
];

const sharedFiles = [
  { id: "file_class_notes_shared", name: "Class Notes - Shared.docx" },
  { id: "file_project_resources", name: "Project Resources.docx" },
  { id: "file_reading_list", name: "Reading List.docx" },
  { id: "file_revision_checklist", name: "Revision Checklist.docx" }
];

// ---------- LOCAL STORAGE KEYS ----------

const LS_RECENT_FILES = "drive_recent_files";
const LS_RECENT_URLS = "drive_recent_urls";
const LS_FILE_PREFIX = "drive_file_";

const LS_BROWSER_TABS = "browser_tabs";
const LS_BROWSER_ACTIVE_TAB = "browser_active_tab";

// ---------- STATE ----------

let currentView = "home";
let previousView = "home";
let currentFileId = null;
let currentFileName = null;
let saveTimeout = null;

let browserModeActive = false;
let tabs = [];
let activeTabId = null;

// ---------- DOM ----------

const navItems = document.querySelectorAll(".nav-item[data-view]");
const browserButton = document.getElementById("browserButton");

const views = {
  home: document.getElementById("view-home"),
  mydrive: document.getElementById("view-mydrive"),
  shared: document.getElementById("view-shared"),
  recent: document.getElementById("view-recent"),
  editor: document.getElementById("view-editor")
};

const topBar = document.getElementById("topBar");
const topbarTitle = document.getElementById("topbarTitle");
const backBtn = document.getElementById("backBtn");

const homeFoldersEl = document.getElementById("homeFolders");
const homeFilesEl = document.getElementById("homeFiles");
const myDriveFilesEl = document.getElementById("myDriveFiles");
const sharedFilesEl = document.getElementById("sharedFiles");
const recentFilesEl = document.getElementById("recentFiles");
const recentUrlsEl = document.getElementById("recentUrls");

const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const editorEl = document.getElementById("editor");
const editorFilenameEl = document.getElementById("editorFilename");
const editorStatusEl = document.getElementById("editorStatus");

const fontFamilySelect = document.getElementById("fontFamilySelect");
const fontSizeSelect = document.getElementById("fontSizeSelect");
const fontColorInput = document.getElementById("fontColorInput");
const highlightColorInput = document.getElementById("highlightColorInput");
const styleSelect = document.getElementById("styleSelect");

// Browser mode
const mainContent = document.getElementById("mainContent");
const browserModeEl = document.getElementById("browserMode");
const browserTabsEl = document.getElementById("browserTabs");
const browserFrame = document.getElementById("browserFrame");

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", () => {
  renderHome();
  renderMyDrive();
  renderShared();
  renderRecent();
  renderRecentUrls();

  setupNav();
  setupBackButton();
  setupEditor();
  setupClearHistory();
  setupBrowserButton();

  loadBrowserTabs();
  switchView("home");
});

// ---------- RENDERING (DRIVE) ----------

function createFileCard(file, metaText = "") {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.fileId = file.id;
  card.dataset.fileName = file.name;

  card.innerHTML = `
    <div class="card-icon">📄</div>
    <div class="card-title">${file.name}</div>
    <div class="card-meta">${metaText}</div>
  `;

  card.addEventListener("click", () => openFile(file.id, file.name));
  return card;
}

function createFolderCard(folder) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.folderId = folder.id;

  card.innerHTML = `
    <div class="card-icon">📁</div>
    <div class="card-title">${folder.name}</div>
    <div class="card-meta">School folder</div>
  `;

  card.addEventListener("click", () => openFolder(folder));
  return card;
}

function renderHome() {
  homeFoldersEl.innerHTML = "";
  suggestedFolders.forEach(folder => {
    homeFoldersEl.appendChild(createFolderCard(folder));
  });

  homeFilesEl.innerHTML = "";
  suggestedFiles.forEach(file => {
    homeFilesEl.appendChild(createFileCard(file, "Suggested file"));
  });
}

function renderMyDrive() {
  myDriveFilesEl.innerHTML = "";
  myDriveFiles.forEach(file => {
    myDriveFilesEl.appendChild(createFileCard(file, "My Drive"));
  });
}

function renderShared() {
  sharedFilesEl.innerHTML = "";
  sharedFiles.forEach(file => {
    sharedFilesEl.appendChild(createFileCard(file, "Shared with you"));
  });
}

function renderRecent() {
  recentFilesEl.innerHTML = "";
  const recent = getRecentFiles();
  if (!recent.length) {
    recentFilesEl.innerHTML = "<div class='card-meta'>No recent items yet.</div>";
    return;
  }

  recent.forEach(item => {
    const file = { id: item.id, name: item.name };
    const meta = `Last opened: ${new Date(item.timestamp).toLocaleString()}`;
    recentFilesEl.appendChild(createFileCard(file, meta));
  });
}

function renderRecentUrls() {
  recentUrlsEl.innerHTML = "";
  const urls = getRecentUrls();
  if (!urls.length) {
    recentUrlsEl.innerHTML = "<div class='card-meta'>No recent URLs yet.</div>";
    return;
  }

  urls.forEach(entry => {
    const row = document.createElement("div");
    row.className = "list-item";

    row.innerHTML = `
      <div class="list-main">
        <div class="list-title">${entry.url}</div>
        <div class="list-sub">Last opened: ${new Date(entry.timestamp).toLocaleString()}</div>
      </div>
      <button class="list-open-btn">Open</button>
    `;

    row.querySelector(".list-open-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openUrlInBrowser(entry.url);
    });

    row.addEventListener("click", () => openUrlInBrowser(entry.url));
    recentUrlsEl.appendChild(row);
  });
}

// ---------- NAVIGATION (DRIVE) ----------

function setupNav() {
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      if (!view) return;
      exitBrowserMode();
      switchView(view);
    });
  });
}

function switchView(view) {
  currentView = view;

  Object.values(views).forEach(v => v.classList.remove("active"));
  if (views[view]) views[view].classList.add("active");

  navItems.forEach(item => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  topbarTitle.textContent = viewTitle(view);
}

function viewTitle(view) {
  switch (view) {
    case "home": return "Home";
    case "mydrive": return "My Drive";
    case "shared": return "Shared with me";
    case "recent": return "Recent";
    case "editor": return currentFileName || "Document";
    default: return "Drive";
  }
}

function setupBackButton() {
  backBtn.addEventListener("click", () => {
    if (currentView === "editor") {
      switchView(previousView || "home");
    }
  });
}

// ---------- FILE OPEN / EDITOR ----------

function openFolder(folder) {
  addRecentFile({ id: folder.id, name: folder.name });
  renderRecent();
}

function openFile(id, name) {
  previousView = currentView;
  currentView = "editor";
  currentFileId = id;
  currentFileName = name;

  Object.values(views).forEach(v => v.classList.remove("active"));
  views.editor.classList.add("active");

  topbarTitle.textContent = name;
  editorFilenameEl.textContent = name;

  const saved = localStorage.getItem(LS_FILE_PREFIX + id);
  editorEl.innerHTML = saved || `<p>Start writing your "${name}" here...</p>`;

  addRecentFile({ id, name });
  renderRecent();
  editorStatusEl.textContent = "Saved";
}

function setupEditor() {
  document.querySelectorAll(".ribbon-group button[data-cmd]").forEach(btn => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
      scheduleSave();
    });
  });

  fontFamilySelect.addEventListener("change", () => {
    document.execCommand("fontName", false, fontFamilySelect.value);
    scheduleSave();
  });

  fontSizeSelect.addEventListener("change", () => {
    document.execCommand("fontSize", false, fontSizeSelect.value);
    scheduleSave();
  });

  fontColorInput.addEventListener("input", () => {
    document.execCommand("foreColor", false, fontColorInput.value);
    scheduleSave();
  });

  highlightColorInput.addEventListener("input", () => {
    document.execCommand("backColor", false, highlightColorInput.value);
    scheduleSave();
  });

  styleSelect.addEventListener("change", () => {
    document.execCommand("formatBlock", false, styleSelect.value);
    scheduleSave();
  });

  editorEl.addEventListener("input", () => {
    scheduleSave();
  });
}

function scheduleSave() {
  if (!currentFileId) return;
  editorStatusEl.textContent = "Saving...";
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCurrentFile, 400);
}

function saveCurrentFile() {
  if (!currentFileId) return;
  const key = LS_FILE_PREFIX + currentFileId;
  localStorage.setItem(key, editorEl.innerHTML);
  editorStatusEl.textContent = "Saved";
}

// ---------- RECENT FILES / URLS ----------

function getRecentFiles() {
  const raw = localStorage.getItem(LS_RECENT_FILES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function addRecentFile(file) {
  let recent = getRecentFiles();
  recent = recent.filter(item => item.id !== file.id);
  recent.unshift({
    id: file.id,
    name: file.name,
    timestamp: Date.now()
  });
  if (recent.length > 30) recent = recent.slice(0, 30);
  localStorage.setItem(LS_RECENT_FILES, JSON.stringify(recent));
}

function getRecentUrls() {
  const raw = localStorage.getItem(LS_RECENT_URLS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function addRecentUrl(url) {
  let urls = getRecentUrls();
  urls = urls.filter(entry => entry.url !== url);
  urls.unshift({
    url,
    timestamp: Date.now()
  });
  if (urls.length > 30) urls = urls.slice(0, 30);
  localStorage.setItem(LS_RECENT_URLS, JSON.stringify(urls));
}

// ---------- CLEAR HISTORY ----------

function setupClearHistory() {
  clearHistoryBtn.addEventListener("click", () => {
    if (!confirm("Clear recent files and recent URLs? Your document content will stay saved.")) return;
    localStorage.removeItem(LS_RECENT_FILES);
    localStorage.removeItem(LS_RECENT_URLS);
    renderRecent();
    renderRecentUrls();
  });
}

// ---------- BROWSER MODE ----------

function setupBrowserButton() {
  browserButton.addEventListener("click", () => {
    enterBrowserMode();
  });
}

function enterBrowserMode() {
  browserModeActive = true;
  mainContent.classList.add("browser-active");

  // Hide normal views, show browser
  browserModeEl.classList.remove("hidden");

  // If no tabs, create one
  if (!tabs.length) {
    createTab("about:blank");
  } else {
    renderTabs();
    const tab = tabs.find(t => t.id === activeTabId) || tabs[0];
    if (tab) {
      loadTab(tab);
    }
  }
}

function exitBrowserMode() {
  if (!browserModeActive) return;
  browserModeActive = false;
  mainContent.classList.remove("browser-active");
  browserModeEl.classList.add("hidden");

  // Show current normal view
  if (views[currentView]) {
    views[currentView].classList.add("active");
  }
}

// ---------- BROWSER TABS PERSISTENCE ----------

function loadBrowserTabs() {
  try {
    const savedTabs = JSON.parse(localStorage.getItem(LS_BROWSER_TABS) || "[]");
    const savedActive = localStorage.getItem(LS_BROWSER_ACTIVE_TAB);

    tabs = savedTabs;
    activeTabId = savedActive;

    if (!tabs.length) return;

    renderTabs();
  } catch {
    tabs = [];
    activeTabId = null;
  }
}

function saveBrowserTabs() {
  localStorage.setItem(LS_BROWSER_TABS, JSON.stringify(tabs));
  if (activeTabId) {
    localStorage.setItem(LS_BROWSER_ACTIVE_TAB, activeTabId);
  }
}

// ---------- BROWSER TAB OPERATIONS ----------

function createTab(url = "about:blank") {
  const id = "tab_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
  const tab = { id, url };
  tabs.push(tab);
  activeTabId = id;
  saveBrowserTabs();
  renderTabs();
  loadTab(tab);
}

function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;

  tabs.splice(idx, 1);

  if (!tabs.length) {
    activeTabId = null;
    saveBrowserTabs();
    browserFrame.src = "about:blank";
    renderTabs();
    return;
  }

  if (activeTabId === id) {
    const newIndex = Math.max(0, idx - 1);
    activeTabId = tabs[newIndex].id;
  }

  saveBrowserTabs();
  renderTabs();
  const active = tabs.find(t => t.id === activeTabId);
  if (active) loadTab(active);
}

function switchTab(id) {
  const tab = tabs.find(t => t.id === id);
  if (!tab) return;
  activeTabId = id;
  saveBrowserTabs();
  renderTabs();
  loadTab(tab);
}

function loadTab(tab) {
  let url = tab.url || "about:blank";

  if (url !== "about:blank" &&
      !url.startsWith("http://") &&
      !url.startsWith("https://")) {
    url = "https://" + url;
  }

  browserFrame.src = url;
  addRecentUrl(url);
  renderRecentUrls();
}

// Open URL from Recent list directly into browser
function openUrlInBrowser(rawUrl) {
  enterBrowserMode();

  const active = tabs.find(t => t.id === activeTabId);
  if (!active) {
    createTab(rawUrl);
    return;
  }

  active.url = rawUrl;
  saveBrowserTabs();
  loadTab(active);
  renderTabs();
}

// ---------- RENDER TABS ----------

function renderTabs() {
  browserTabsEl.innerHTML = "";

  tabs.forEach(tab => {
    const tabEl = document.createElement("div");
    tabEl.className = "browser-tab" + (tab.id === activeTabId ? " active" : "");
    tabEl.dataset.tabId = tab.id;

    tabEl.innerHTML = `
      <span class="tab-lock">🔒</span>
      <input class="tab-url-input" type="text" value="${tab.url}">
      <button class="tab-close">✕</button>
    `;

    // Click to switch
    tabEl.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-url-input") ||
          e.target.classList.contains("tab-close")) return;
      switchTab(tab.id);
    });

    // Middle-click to close
    tabEl.addEventListener("auxclick", (e) => {
      if (e.button === 1) {
        closeTab(tab.id);
      }
    });

    // URL input
    const input = tabEl.querySelector(".tab-url-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const newUrl = input.value.trim() || "about:blank";
        tab.url = newUrl;
        saveBrowserTabs();
        if (tab.id === activeTabId) {
          loadTab(tab);
        }
      }
    });

    // Close button
    const closeBtn = tabEl.querySelector(".tab-close");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    browserTabsEl.appendChild(tabEl);
  });

  // New tab button
  const newTabBtn = document.createElement("button");
  newTabBtn.id = "newTabButton";
  newTabBtn.textContent = "+";
  newTabBtn.addEventListener("click", () => {
    createTab("about:blank");
  });
  browserTabsEl.appendChild(newTabBtn);
}
