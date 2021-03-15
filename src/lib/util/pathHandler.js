/**
 * Folder structure:
 * - root folder (where we run the app from)
 * - db folder (where we keep our databse)
 * - logs folder (where we keep our logs)
 *
 * -= development =-
 * - process.execPath (electron or node)
 * E:\code\Apps\FolderWatcher\node_modules\electron\dist\electron.exe
 * C:\Program Files\nodejs\node.exe - testing (node script.js)
 * - paths
 *  root: 'E:\code\Apps\FolderWatcher'
 *    db: 'E:\code\Apps\FolderWatcher\db'
 *
 * -= production =-
 * - process.execPath
 * E:\code\Apps\FolderWatcher\release-builds\dashboard-win32-x64\dashboard.exe
 * - paths
 *  root: 'E:\code\Apps\FolderWatcher\release-builds\dashboard-win32-x64\resources',
 *    db: 'E:\code\Apps\FolderWatcher\release-builds\dashboard-win32-x64\resources\db',
 */

const path = require('path');
const fs = require('fs');
const { app } = require('electron')
const paths = { root: '', db: '' };

let appType = 'prod';
if (process.execPath.search('electron.exe') >= 0) appType = 'dev';
if (process.execPath.search('node.exe') >= 0) appType = 'test';
if (process.execPath.search('AppData') >= 0) appType = 'installed';

if (appType === 'prod') {
  paths.root = path.join(path.dirname(process.execPath), 'resources');
} else if (appType === 'dev' || appType == 'test') {
  let frag = __dirname.split(path.sep);
  let searchable = false;

  if (__dirname.search('src') > 0) searchable = 'src';
  else if (__dirname.search('dist_electron') > 0) searchable = 'dist_electron';

  if (searchable) frag.length = frag.indexOf(searchable);
  else throw new Error(`Path is unexpected, check it: ${__dirname}`);
  paths.root = path.join(...frag);
} else if (appType === 'installed') {
  paths.root = app.getPath('userData');
}

paths.db = path.join(paths.root, 'db');

const db_file = path.join(paths.root, 'db', 'parserly.db');
// Throw an error if we don't have a db!
// fs.accessSync(db_file, fs.constants.F_OK | fs.constants.W_OK);
// if there is no db, we can init with default data

paths.database = db_file;
console.log({ appType });
console.log({ paths });

module.exports = paths;
