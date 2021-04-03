const fs = require('fs').promises;
const { createReadStream } = require('fs');
const path = require('path');
const claroFiles = /JClaro.log(?:\.\d|.all\d.txt|)$/;
const claroFiles2 = /\d{8} \d{6}\.\d{3}-JClaro.+/;
const crypto = require('crypto');

/** FileObject
 * Complete information about file
 * @typedef {Object} FileObject
 * @property {string} path full path + filename + extension - ready to pass on
 * @property {string} name filename with extension
 * @property {string} dir folder in which filename resides
 * @property {number} size file size in bytes
 * @property {string} humanSize human readable file size
 * @property {number} t_created time value in ms
 * @property {number} t_modified time value in ms
 * @property {number} t_changed time value in ms
 * @property {number} t_accessed time value in ms
 * @property {number} [lines] number of lines in file
 * @property {Date} [firstDate] date object: first encountered date in file
 * @property {string} [firstLine] first line in file that contains date
 * @property {Date} [lastDate] date object: last encountered date in file
 * @property {string} [lastLine] last line in file that contains date
 */

/** fileSizeSI(a, b, c, d, e)
 * - One line function that converts bytes into human readable size
 * @param {number} a file size in bytes
 * @return {string} human readable file size
 */
function fileSizeSI(a, b, c, d, e) {
  return ((b = Math), (c = b.log), (d = 1e3), (e = (c(a) / c(d)) | 0), a / b.pow(d, e)).toFixed(2) + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes');
}

/** getFiles(dir)
 * - Reads files from dir, reverses them (log rotated files are in reverse order)
 * @param {string} dir path to directory
 * @return {FileObject}
 */
async function getFiles(dir) {
  const rawContents = await fs.readdir(dir);
  const files = await Promise.all(
    rawContents
      .filter(file => claroFiles.test(file))
      .map(async file => {
        const fullpath = path.resolve(dir, file);
        const status = await fs.stat(fullpath);
        return {
          path: fullpath,
          hash: createHashFromFile(fullpath),
          name: file,
          dir: path.resolve(dir),
          size: status.size,
          humanSize: fileSizeSI(status.size),
          t_created: status.birthtimeMs,
          t_modified: status.mtimeMs,
          t_changed: status.ctimeMs,
          t_accessed: status.atimeMs
        };
      })
      .reverse()
  );
  return files;
}

/** getFiles2(dir)
 * - Reads files from dir - test files, they are in correct order
 * @param {string} dir path to directory
 * @return {FileObject}
 */
async function getFiles2(dir) {
  const rawContents = await fs.readdir(dir);
  const files = await Promise.all(
    rawContents
      .filter(file => claroFiles2.test(file))
      .map(async file => {
        const fullpath = path.resolve(dir, file);
        const status = await fs.stat(fullpath);
        return {
          path: fullpath,
          hash: createHashFromFile(fullpath),
          name: file,
          dir: path.resolve(dir),
          size: status.size,
          humanSize: fileSizeSI(status.size),
          t_created: status.birthtimeMs,
          t_modified: status.mtimeMs,
          t_changed: status.ctimeMs,
          t_accessed: status.atimeMs
        };
      })
  );
  return files;
}

/** createHashFromFile(filePath)
 * - Creates sha1 hash from the file
 * @param {string} filePath path to file
 * @returns {string} sha1 hash of the file
 */
const createHashFromFile = filePath =>
  new Promise(resolve => {
    const hash = crypto.createHash('sha1');
    createReadStream(filePath)
      .on('data', data => hash.update(data))
      .on('end', () => resolve(hash.digest('hex')));
  });

module.exports = getFiles2;
// getFiles2('../_mats/logs/HR').then(console.log);
