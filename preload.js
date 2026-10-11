const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('win', {
  // main window chrome
  close: () => ipcRenderer.send('win:close'),
  minimize: () => ipcRenderer.send('win:minimize'),
  pin: (on) => ipcRenderer.send('win:pin', on),
  compact: (on) => ipcRenderer.send('win:compact', on),

  // desktop pet: app window side
  pet: (on, rect) => ipcRenderer.send('pet:set', on, rect),
  petSync: (msg) => ipcRenderer.send('pet:sync', msg),
  onPetNeedSync: (cb) => ipcRenderer.on('pet:need-sync', () => cb()),
  onPetHome: (cb) => ipcRenderer.on('pet:home', () => cb()),

  // desktop pet: pet window side
  petReady: () => ipcRenderer.send('pet:ready'),
  onSync: (cb) => ipcRenderer.on('pet:sync', (_e, msg) => cb(msg)),
  petInfo: () => ipcRenderer.invoke('pet:info'),
  petSetPos: (x, y) => ipcRenderer.send('pet:setPos', x, y),
  petGoHome: () => ipcRenderer.send('pet:go-home')
});
