const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('diceAPI', {
  onRoll: (handler) => {
    console.log("preload.js の dice:roll")
    const listener = (_e, payload) => handler(payload);
    ipcRenderer.on('dice:roll', listener);

    return () => ipcRenderer.removeListener('dice:roll', listener);
  },

  notifyDone: (payload) => {
    console.log("preload.js の dice:roll:done")
    ipcRenderer.send('dice:roll:done', payload); // { name }
  }
});
