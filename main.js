// main.js
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const http = require('http');
const { URL } = require('url');
const path = require('path');

let win;
let rollId = 0;
let rollQueue = []; //{rollId}

function createWindow() {
  win = new BrowserWindow({
    width: 640,
    height: 370,
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
  const server = http.createServer(async (req, res) => {
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

    if (url.pathname === '/roll') {
      const name = String(url.searchParams.get('name'));
      if (win && !win.isDestroyed()) {
        var face = Math.floor(Math.random() * 6 ) + 1
        console.log(`face:${face}`)
        console.log(`name:${name}`)
        rollId += 1;
	const myRollId = rollId;
	rollQueue.push(rollId);
	let intervalId;
        await new Promise((resolve) => {
          intervalId = setInterval(()=>{
            //console.log("rollQueue[0] -> " + rollQueue[0])
            //console.log("myRollId -> " + myRollId)
            if(rollQueue[0] === myRollId){
              resolve();
	    }
	  },100);
	});
        clearInterval(intervalId);
        win.webContents.send('dice:roll', { face, name } );
        const result = await new Promise((resolve) => {
          const onDone = (_ev, payload) => { resolve({ ok:true, ...payload }); };
          ipcMain.once('dice:roll:done', onDone);
        });
        res.statusCode = 200;
        rollQueue.shift();
        return res.end(JSON.stringify({ action: 'roll', face: face, name: name}));
      }
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
