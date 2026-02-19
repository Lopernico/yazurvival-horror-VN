const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const allowed = ['log'];
    if (allowed.includes(channel)) ipcRenderer.send(channel, data);
  }
});
