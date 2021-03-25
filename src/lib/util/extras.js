/**
 * Binary (International Electrotechnical Commission [IEC])
 * KiB,MiB,GiB.. = 1024
 * @param {number} a Number of Bytes
 * @param {*} [b] shorthand declaration, ignore
 * @param {*} [c] shorthand declaration, ignore
 * @param {*} [d] shorthand declaration, ignore
 * @param {*} [e] shorthand declaration, ignore
 * @return {string} Formatted string
 */
function fileSizeIEC(a, b, c, d, e) {
  return ((b = Math), (c = b.log), (d = 1024), (e = (c(a) / c(d)) | 0), a / b.pow(d, e)).toFixed(2) + ' ' + (e ? 'KMGTPEZY'[--e] + 'iB' : 'Bytes');
}

/**
 * Decimal (International System of Units [SI])
 * kB,MB,GB.. = 1000
 * @param {number} a Number of Bytes
 * @param {*} [b] shorthand declaration, ignore
 * @param {*} [c] shorthand declaration, ignore
 * @param {*} [d] shorthand declaration, ignore
 * @param {*} [e] shorthand declaration, ignore
 * @return {string} Formatted string
 */
function fileSizeSI(a, b, c, d, e) {
  return ((b = Math), (c = b.log), (d = 1e3), (e = (c(a) / c(d)) | 0), a / b.pow(d, e)).toFixed(2) + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes');
}

/**
 * Format bytes as human-readable text
 * @param {number} bytes Number of Bytes
 * @param {boolean} si True to use metric (SI) units, aka powers of 1000. False to use binary (IEC), aka powers of 1024.
 * @param {number} dp Number of decimal places to display
 * @return {string} Formatted string
 */
function humanFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return bytes.toFixed(dp) + ' ' + units[u];
}

/**
 * Calculate rough size of an object
 * @param {Object} object Object we want to calculate rough size of
 * @return {number} Size of object in bytes
 */
function roughSizeOfObject(object) {
  var objectList = [];
  var stack = [object];
  var bytes = 0;
  while (stack.length) {
    var value = stack.pop();
    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
  // return humanFileSize(bytes);
}

/**
 * Transforms Date object into
 * @param {Date} d date object
 * @return {number} date value in YYYYMMDD format
 */
function getDateNum(d) {
  return `${d.getFullYear()}${d.getMonth() + 1 < 10 ? '0' : ''}${d.getMonth() + 1}${d.getDate() < 10 ? '0' : ''}${d.getDate()}`;
}

module.exports = { humanFileSize, roughSizeOfObject, fileSizeSI, fileSizeIEC, getDateNum };
