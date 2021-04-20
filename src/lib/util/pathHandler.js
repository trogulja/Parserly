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
const { app } = require('electron');
const paths = { root: '', db: '', logs: null };

let appType = 'production';
if (process.execPath.search('electron.exe') >= 0) appType = 'development';
if (process.execPath.search('node.exe') >= 0) appType = 'testing';
if (process.execPath.search('AppData') >= 0) appType = 'installed';

let testDir;
try {
  testDir = path.join('C:', 'Program Files', 'Elpical Claro', 'log');
  console.log('testing %s', testDir);
  if (fs.statSync(testDir).isDirectory()) paths.logs = testDir;
} catch (error) {
  console.log('dir1 does not exist');
}

if (!paths.logs) {
  try {
    testDir = path.join('E:', 'code', 'Apps', 'Parserly', '_mats', 'logs', 'HR');
    console.log('testing %s', testDir);
    if (fs.statSync(testDir).isDirectory()) paths.logs = testDir;
  } catch (error) {
    console.log('dir2 does not exist');
  }
}

if (!paths.logs) {
  try {
    testDir = path.join(app.getPath('home'), 'code', 'Apps', 'Parserly', '_mats', 'logs', 'HR');
    console.log('testing %s', testDir);
    if (fs.statSync(testDir).isDirectory()) paths.logs = testDir;
  } catch (error) {
    console.log('dir3 does not exist');
  }
}

if (appType === 'production') {
  paths.root = path.join(path.dirname(process.execPath), 'resources');
} else if (appType === 'development' || appType == 'testing') {
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
