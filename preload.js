const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('diceAPI', {
  onRoll: (handler) => ipcRenderer.on('dice:roll', () => handler())
});