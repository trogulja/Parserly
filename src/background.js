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
} else {
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
    messageHandler = new MessageHandler(win);
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

// Exit cleanly on request from parent process in development mode.
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

// Logs
const reportIssues = false;
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
// Handle errors
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

        if (result.response === 1 && reportIssues) {
          submitIssue('https://github.com/trogulja/Parserly/issues/new', {
            title: `Error report for ${versions.app}`,
            body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions.os}`
          });
          return;
        }

        if (result.response === 2) {
          electron.app.quit();
        }
      })
      .catch(error => log.error('Error (' + error.message + '):\n```' + error.stack + '\n```\n' + `OS: ${versions.os}` + '\n```App: ' + versions.app));
  }
});

// Data handle logic
import notifier from './lib/util/notifier';
import CronController from './cronController';
import MessageHandler from './lib/util/messageHandler';
let messageHandler; // define it in did-finish-load part

notifier.on('log', message => {
  if (messageHandler) messageHandler.log(message);
});
notifier.on('debug', message => {
  if (messageHandler) messageHandler.debug(message);
});
notifier.on('progress', message => {
  if (messageHandler) messageHandler.progress(message);
});

ipcMain.on('job', async function(event, arg) {
  if (arg === 'start') {
    CronController.start();
    win.webContents.send('job', 'started');
    console.log({ paths });
    notifier.log({ event: 'log', text: `Target folder is ${paths.logs}`, meta: { job: 'ipcMain-on-job', status: 'event' } });
    notifier.log({ event: 'log', text: `Target db is ${paths.database}`, meta: { job: 'ipcMain-on-job', status: 'event' } });
  }
  if (arg === 'stop') {
    CronController.stop();
    win.webContents.send('job', 'stopped');
  }
  if (arg === 'forceStart') {
    CronController.forceStart();
  }
});

// Express logic
import express from 'express';
import cors from 'cors';
const paths = require('./lib/util/pathHandler');
const httpd = express();

httpd.use(express.json({ limit: '10MB' }));
httpd.use(cors());

httpd.use('/api/data', require('./api/data'));
httpd.use(express.static(paths.express));
httpd.get(/.*/, (req, res) => {
  console.log('Sending SPA index.html from', path.join(paths.express, 'index.html'));
  return res.sendFile(path.join(paths.express, 'index.html'));
});

const httpdPort = 8125;
httpd.listen(httpdPort, () => console.log(`Server started on port ${httpdPort}`));
