const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getSongs: () => ipcRenderer.invoke("get-songs"),
});
