const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getSongs: () => ipcRenderer.invoke("get-songs"),
  getState: () => ipcRenderer.invoke("get-state"),
  saveState: (partial) => ipcRenderer.invoke("save-state", partial),
});
