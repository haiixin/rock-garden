const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const FULL = { width: 300, height: 520 };
const MINI = { width: 300, height: 130 };

let win;
const stateFile = () => path.join(app.getPath('userData'), 'window.json');

function loadPos() {
  try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return null; }
}
function savePos() {
  if (!win) return;
  const [x, y] = win.getPosition();
  try { fs.writeFileSync(stateFile(), JSON.stringify({ x, y })); } catch {}
}

function createWindow() {
  const area = screen.getPrimaryDisplay().workArea;
  const saved = loadPos();
  win = new BrowserWindow({
    ...FULL,
    x: saved ? saved.x : area.x + area.width - FULL.width - 20,
    y: saved ? saved.y : area.y + area.height - FULL.height - 20,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    backgroundColor: '#1f2326',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  win.setAlwaysOnTop(true, 'floating');
  win.loadFile('index.html');
  win.on('moved', savePos);
}

ipcMain.on('win:close', () => app.quit());
ipcMain.on('win:minimize', () => win.minimize());
ipcMain.on('win:pin', (_e, on) => win.setAlwaysOnTop(!!on, 'floating'));
ipcMain.on('win:compact', (_e, compact) => {
  const [x, y] = win.getPosition();
  const [, h] = win.getSize();
  const next = compact ? MINI : FULL;
  // keep the bottom edge anchored so the window doesn't jump around
  win.setBounds({ x, y: y + h - next.height, width: next.width, height: next.height });
});

// ---------- desktop pet ----------
const PET = { width: 120, height: 95 };
let petWin = null;

let petLaunch = null; // { target: {x, y} } while the rock is jumping out of the app

// rect = the in-app rock's box in window coordinates; when given, the pet starts there and jumps out
function openPet(rect) {
  if (petWin) return;
  const [mx, my] = win.getPosition();
  const area = screen.getDisplayNearestPoint({ x: mx, y: my }).workArea;
  // land just left of the app window, standing on the bottom edge of the screen
  let x = mx - PET.width;
  if (x < area.x) x = mx + FULL.width;
  const floorY = area.y + area.height - PET.height;
  let startX = x, startY = floorY;
  petLaunch = null;
  if (rect) {
    // the pet's rock is 50px wide, centred in its 120px window, feet on the window's bottom edge
    startX = Math.round(mx + rect.left + rect.width / 2 - PET.width / 2);
    startY = Math.round(my + rect.bottom - PET.height);
    petLaunch = { target: { x, y: floorY } };
  }
  petWin = new BrowserWindow({
    ...PET,
    x: startX,
    y: startY,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  petWin.setAlwaysOnTop(true, 'floating');
  petWin.loadFile('pet.html');
  petWin.on('closed', () => { petWin = null; });
}
function closePet() {
  if (petWin) petWin.destroy();
  petWin = null;
}

ipcMain.on('pet:set', (_e, on, rect) => (on ? openPet(rect) : closePet()));
ipcMain.on('pet:sync', (_e, msg) => { if (petWin) petWin.webContents.send('pet:sync', msg); });
ipcMain.on('pet:ready', () => { if (win) win.webContents.send('pet:need-sync'); });
ipcMain.on('pet:go-home', () => { closePet(); if (win) win.webContents.send('pet:home'); });
ipcMain.on('pet:setPos', (_e, x, y) => {
  if (petWin) petWin.setBounds({ x: Math.round(x), y: Math.round(y), width: PET.width, height: PET.height });
});
ipcMain.handle('pet:info', () => {
  if (!petWin) return null;
  const b = petWin.getBounds();
  const launch = petLaunch;
  petLaunch = null; // only the first call (pet start-up) gets the jump
  return { x: b.x, y: b.y, area: screen.getDisplayMatching(b).workArea, launch };
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
