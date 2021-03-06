const { app, BrowserWindow } = require('electron');
const { Tray, Menu} = require('electron');
const { ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const { map } = require('rxjs/operators');
// const { webSocket } = require('rxjs/webSocket');
// const { WebSocketSubject } = require('rxjs/webSocket');
const logger = require('./desktop/lib/log-manager');

// (global).WebSocket = require('ws');
// let publicWs = null;

const DEBUG_MODE = true;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let chatWins = new Map();
let tray = null;

let upttData = {
  user: {
    pttId: '',
    token: ''
  }
};

app.on('ready', () => {
  // initWebsocket();
  createWindow();
});

// 在所有視窗都關閉時結束程式。
app.on('window-all-closed', () => {
  // 在 macOS 中，一般會讓應用程式及選單列繼續留著，
  // 除非使用者按了 Cmd + Q 確定終止它們
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在 macOS 中，一般會在使用者按了 Dock 圖示
  // 且沒有其他視窗開啟的情況下，
  // 重新在應用程式裡建立視窗。
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('login', (event, data) => {
  console.log('event: login-success');
  console.log(data);
  publicWs.multiplex(
    () => ({ operation: 'login', payload: { pttId: data.pttId, pwd: data.pwd } }),
    () => ({ type: 'unsubscribe', tag: 'login' }),
    (resp) => resp.operation === 'login'
  ).pipe(
    map(resp => {
      event.reply('login-resp', resp);
      if (resp.code === 0) {
        upttData.user.pttId = data.pttId;
        upttData.user.token = resp.payload.token;
      }
      //  else {
      //   throw resp;
      // }
    })
  ).subscribe(x => console.log(x));
});

ipcMain.on('login-success', (event, data) => {


  upttData.currentUser.pttId = data.pttId;
  upttData.currentUser.token = data.token;

  win.hide();
  const contextMenu = Menu.buildFromTemplate([
    { label: '丟水球', type: 'normal', click: function() {
      win.setSize(350, 450);
      win.loadURL(url.format({
        pathname: path.join(__dirname, './build/index.html'),
        protocol: 'file:',
        slashes: true,
        hash: '/main-window/new-chat'
      }));
      win.show();
    } },
    { label: '設定', type: 'normal' },
    { label: '關於', type: 'normal' },
    { label: '登出', type: 'normal' },
    { label: '結束', type: 'normal', click: function() {
      app.isQuiting = true;
      app.quit();
    } }
  ])
  tray.setContextMenu(contextMenu)
});

ipcMain.on('new-chat', (event, data) => {
  console.log('event: new-chat');
  console.log(data);
  win.hide();
  const chatWin = new BrowserWindow({
    width: 400,
    height: 700,
    title: data.pttId,
    icon:'build/assets/images/uptt.ico',
    webPreferences: {
      nodeIntegration: true
    }
  });
  chatWin.loadURL(url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true,
    hash: '/chat-window'
  }));

  chatWin.webContents.openDevTools();
  chatWin.chater = {
    pttId: data.pttId
  };
  chatWins.set(data.pttId, chatWin);
});

// ---------------------------------- Function
function createWindow () {

  // 建立 System Tray
  tray = new Tray(path.join(__dirname, './build/assets/images/uptt.ico'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '關於', type: 'normal' },
    { label: '結束', type: 'normal', click: function() {
      app.isQuiting = true;
      app.quit();
    } }
  ])
  tray.setToolTip('uPtt')
  tray.setContextMenu(contextMenu)

  // 建立瀏覽器視窗。
  win = new BrowserWindow({
    width: 400,
    height: 700,
    title: "uPtt",
    icon:'build/assets/images/uptt.ico',
    webPreferences: {
      nodeIntegration: true
    }
  })

  logger.debug('test __dirname:' + path.join(__dirname, './build/index.html'));

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  if (DEBUG_MODE) {
    win.webContents.openDevTools();
  }

  // 視窗關閉時會觸發。
  win.on('closed', () => {
    // 拿掉 window 物件的參照。如果你的應用程式支援多個視窗，
    // 你可能會將它們存成陣列，現在該是時候清除相關的物件了。
    win = null
  })

  win.on('close', function (event) {
    if(!app.isQuiting){
        event.preventDefault();
        win.hide();
    }
    // 建立 System Tray
    const contextMenu = Menu.buildFromTemplate([
      { label: '登入', type: 'normal', click: function (){
        win.show();
      }},
      { label: '關於', type: 'normal' },
      { label: '結束', type: 'normal', click: function() {
        app.isQuiting = true;
        app.quit();
      } }
    ])
    tray.setContextMenu(contextMenu)
    return false;
  });
}

// function initWebsocket() {
//   publicWs = webSocket({ url: 'ws://localhost:50732/uptt/public' });
// }
