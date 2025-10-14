const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('diceAPI', {
  onRoll: (handler) => {
    const listener = (_e, payload) => handler(payload);
    ipcRenderer.on('dice:roll', listener);
    return () => ipcRenderer.removeListener('dice:roll', listener);
  }
});