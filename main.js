const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const THEMES = ["classic.css", "wine.css"];
const DEFAULT_STATE = {
  version: 1,
  theme: THEMES[0],
  lastSongPath: null,
  volume: 1,
};

let state = { ...DEFAULT_STATE };
let knownPaths = new Set();

const stateFile = () => path.join(app.getPath("userData"), "state.json");

// Treat any input as untrusted: keep only valid fields, ignore the rest.
function sanitize(input, base, requireKnownPath) {
  const out = { ...base };
  if (!input || typeof input !== "object") return out;
  if (THEMES.includes(input.theme)) out.theme = input.theme;
  if (
    typeof input.lastSongPath === "string" &&
    (!requireKnownPath || knownPaths.has(input.lastSongPath))
  ) {
    out.lastSongPath = input.lastSongPath;
  }
  if (Number.isFinite(input.volume)) {
    out.volume = Math.min(1, Math.max(0, input.volume));
  }
  return out;
}

function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(stateFile(), "utf8"));
    state = sanitize(raw, DEFAULT_STATE, false);
  } catch {
    state = { ...DEFAULT_STATE }; // first launch, or missing/corrupt file
  }
}

function writeState() {
  try {
    const file = stateFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, file); // atomic: a crash never leaves half a file
  } catch (err) {
    console.error("Could not save state:", err);
  }
}

ipcMain.handle("get-state", () => state);

ipcMain.handle("save-state", (_event, partial) => {
  state = sanitize(partial, state, true);
  writeState();
});

function findMp3s(dir) {
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((f) => f.toLowerCase().endsWith(".mp3"))
    .map((f) => path.join(dir, f));
}

ipcMain.handle("get-songs", () => {
  try {
    const paths = findMp3s(app.getPath("music"));
    knownPaths = new Set(paths);
    return paths.map((p) => ({
      path: p,
      url: pathToFileURL(p).href,
      title: path.basename(p, path.extname(p)),
    }));
  } catch (err) {
    console.error("Could not read Music folder:", err);
    return [];
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  loadState();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
