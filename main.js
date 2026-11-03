const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

function findMp3s(dir) {
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((f) => f.toLowerCase().endsWith(".mp3"))
    .map((f) => path.join(dir, f));
}

ipcMain.handle("get-songs", () => {
  try {
    return findMp3s(app.getPath("music")).map((p) => ({
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
  createWindow();


  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
