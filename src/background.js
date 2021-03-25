import { app, protocol, BrowserWindow, Menu, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
const windowStateKeeper = require('electron-window-state');
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';
import log from 'electron-log';
import path from 'path';
import { electron } from 'process';
if (isDevelopment) require('dotenv').config();

let win;

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];
if (process.platform === 'darwin') mainMenuTemplate.unshift({});
if (isDevelopment) {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{ role: 'toggledevtools' }, { role: 'reload' }]
  });
}

async function createWindow() {
  const allowResize = true;
  const winState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  });

  win = new BrowserWindow({
    x: winState.x,
    y: winState.y,
    width: allowResize ? winState.width : 800,
    height: allowResize ? winState.height : 600,
    minWidth: 600,
    minHeight: 580,
    resizable: allowResize,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: isDevelopment ? path.join(__dirname, '..', 'public', 'favicon.ico') : path.join(__dirname, 'favicon.ico')
  });

  winState.manage(win);

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  win.webContents.on('did-finish-load', () => {
    let name = require('../package.json').productName;
    let version = require('../package.json').version;
    let title = name + ' app v' + version;
    win.setTitle(title);
    win.webContents.send('title', { name, version, title });
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (error) {
      console.error('Vue Devtools failed to install:', error.toString());
    }
  }
  if (!isDevelopment) {
    autoUpdater.checkForUpdatesAndNotify();
  }
  createWindow();
});

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

if (!isDevelopment) {
  Object.assign(console, log.functions);
  log.transports.file.level = 'debug';
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
  });
  autoUpdater.on('update-available', info => {
    log.info('Update available.');
  });
  autoUpdater.on('update-not-available', info => {
    log.info('Update not available.');
  });
  autoUpdater.on('error', err => {
    log.error('Error in auto-updater. ' + err);
  });
  autoUpdater.on('download-progress', progressObj => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    log.info(log_message);
  });
  autoUpdater.on('update-downloaded', info => {
    log.info('Update downloaded');
  });
}

log.catchErrors({
  showDialog: false,
  onError(error, versions, submitIssue) {
    electron.dialog
      .showMessageBox({
        title: 'An error occurred',
        message: error.message,
        detail: error.stack,
        type: 'error',
        buttons: ['Ignore', 'Report', 'Exit']
      })
      .then(result => {
        log.error('Error (' + error.message + '):\n```' + error.stack + '\n```\n' + `OS: ${versions.os}` + '\n```App: ' + versions.app);

        if (result.response === 1) {
          submitIssue('https://github.com/trogulja/Parserly/issues/new', {
            title: `Error report for ${versions.app}`,
            body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions.os}`
          });
          return;
        }

        if (result.response === 2) {
          electron.app.quit();
        }
      });
  }
});