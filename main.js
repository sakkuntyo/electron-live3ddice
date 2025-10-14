// main.js
const { app, BrowserWindow, Menu } = require('electron');
const http = require('http');
const { URL } = require('url');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 640,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');

  win.webContents.on('context-menu', (event, params) => {
    const template = [
      { label: 'コピー', role: 'copy', enabled: params.editFlags.canCopy },
      { label: '貼り付け', role: 'paste', enabled: params.editFlags.canPaste },
      { label: '切り取り', role: 'cut', enabled: params.editFlags.canCut },
      { label: '再読み込み', role: 'reload' },
      { label: '開発者ツール', role: 'toggleDevTools' },
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: win });
  });
}

function startHttpServer() {
  const server = http.createServer((req, res) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);

    const url = new URL(req.url, 'http://localhost');

    // CORS/Content-Type
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') {
      res.statusCode = 405;
      return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    }

    // 疎通確認: /ping
    if (url.pathname === '/ping') {
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, pong: true }));
    }

    // 例: /roll?face=6
    if (url.pathname === '/roll') {
      res.statusCode = 200;
      return res.end(JSON.stringify({
        action: 'roll',
        face : null,
      }));
    }

    // その他は 404
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
  });

  const PORT = process.env.PORT || 14456;
  server.listen(PORT, () => {
    console.log(`HTTP GET server listening on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('HTTP server error:', err);
  });
}

startHttpServer();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
