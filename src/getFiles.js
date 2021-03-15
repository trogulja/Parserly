const fs = require('fs').promises;
const path = require('path');
const claroFiles = /JClaro.log(?:\.\d|.all\d.txt|)$/;
const claroFiles2 = /\d{8} \d{6}\.\d{3}-JClaro.+/

function fileSizeSI(a, b, c, d, e) {
  return ((b = Math), (c = b.log), (d = 1e3), (e = (c(a) / c(d)) | 0), a / b.pow(d, e)).toFixed(2) + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes');
}

async function getFiles(dir) {
  const rawContents = await fs.readdir(dir);
  const files = await Promise.all(
    rawContents
      .filter((file) => claroFiles.test(file))
      .map(async (file) => {
        const fullpath = path.resolve(dir, file);
        const status = await fs.stat(fullpath);
        return {
          path: fullpath,
          name: file,
          dir: path.resolve(dir),
          size: status.size,
          humanSize: fileSizeSI(status.size),
          t_created: status.birthtimeMs,
          t_modified: status.mtimeMs,
          t_changed: status.ctimeMs,
          t_accessed: status.atimeMs,
        };
      })
      .reverse()
  );
  return files;
}

async function getFiles2(dir) {
  const rawContents = await fs.readdir(dir);
  const files = await Promise.all(
    rawContents
      .filter((file) => claroFiles2.test(file))
      .map(async (file) => {
        const fullpath = path.resolve(dir, file);
        const status = await fs.stat(fullpath);
        return {
          path: fullpath,
          name: file,
          dir: path.resolve(dir),
          size: status.size,
          humanSize: fileSizeSI(status.size),
          t_created: status.birthtimeMs,
          t_modified: status.mtimeMs,
          t_changed: status.ctimeMs,
          t_accessed: status.atimeMs,
        };
      })
  );
  return files;
}

module.exports = getFiles2;
// getFiles2('../_mats/logs/HR').then(console.log);
