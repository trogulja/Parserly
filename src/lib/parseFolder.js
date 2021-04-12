const path = require('path');
const LineByLineReader = require('line-by-line');
/** @typedef {import('./getFiles').FileObject} FileObject */
const getFiles = require('./getFiles');
const config = require('./config');
const fns = require('./actions');
const { writeNames, writeDays, writeImages, writeRoutes, writePurges } = require('./db/tools');
const writeFiles = require('./db/writeFiles');
const notifier = require('./util/notifier');
/** @typedef {import('./passableObject').PassableObject} PassableObject */
/** @typedef {import('./passableObject').claroConfigElement} claroConfigElement */
const po = require('./passableObject');

/** constructStartDate()
 * - Sets the start date to the start of previous month
 * @returns {number} UNIX timestamp, date value integer
 */
function constructStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1, 1);
  date.setHours(0, 0, 0, 1);
  return date.getTime();
}

/** croDate(n)
 * - Transforms UNIX timestamp to date string for easier reading (croatian locale)
 * @param {number} n UNIX timestamp
 * @returns {string} Date in D.M.YYYY format
 */
function croDate(n) {
  const date = new Date(n);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

/** writeout(s, sameline)
 * - Prefix string with date stamp and log to the console
 * @param {string} s String value that is to be reported
 * @param {boolean} sameline Write to console without newline
 */
function writeout(s, sameline) {
  const ts = `[${new Date().toTimeString().split(' ')[0]}]`;
  if (sameline) {
    process.stdout.write(`${ts} ${s}\x1b[0G`);
  } else {
    console.log(`${ts} ${s}`);
  }
}

/** writedebug(s)
 * - Logging for debugging purposes
 * @param {string} s String value that we are reporting to the console and to the notifier
 */
function writedebug(s, from) {
  console.log(s);
  if (s) notifier.emit('log', { event: 'debug', text: s, meta: { job: `parser-${from}` } });
}

/** jobStatus(lineNr, totalLines)
 * - Reports percentage of current parse process
 * @param {number} lineNr Current line number
 * @param {number} totalLines Total lines
 */
function jobStatus(lineNr, totalLines) {
  const percent = parseInt((lineNr / totalLines) * 100);
  writeout(`Job at: ${percent}%`, 0);
  notifier.emit('log', { event: 'progress', text: `Job at: ${percent}%`, meta: { job: 'parser-jobStatus', status: percent } });
}

/** countLines(inputFile, getMeta)
 * - Counts lines from file and gets meta information
 * @param {FileObject} inputFile file object
 * @param {boolean} getMeta
 * @return {Promise.<{lines: number, firstLine: string, lastLine: string, firstDate: number, lastDate: number}>}
 */
function countLines(inputFile, getMeta) {
  return new Promise((resolve, reject) => {
    const matchDate = /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3})/;
    let firstLine = null;
    let firstDate = null;
    let lastLine = null;
    let lastDate = null;

    if (inputFile == '../_mats/logs/all-au.log') {
      return resolve({ lines: 14704899, firstLine, lastLine, firstDate, lastDate }); // all-au.log = 14704899
    } else if (inputFile == '../_mats/logs/all-hr.log' || inputFile == '..\\_mats\\logs\\all-hr.log') {
      return resolve({ lines: 8596124, firstLine, lastLine, firstDate, lastDate }); // all-hr.log = 8596124
    }

    let num = 0;
    let file;
    const report = setInterval(() => {
      writeout(`Total of ${num} lines detected.`, 1);
      notifier.emit('log', { event: 'progress', text: `Total of ${num} lines detected.`, meta: { job: 'parser-countLines', status: num } });
    }, 500);

    file = new LineByLineReader(inputFile);

    file.on('line', line => {
      if (getMeta) {
        const res = matchDate.exec(line);
        if (res) {
          if (!firstLine) {
            firstLine = line;
            firstDate = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6], res[7]).getTime();
          }
          lastLine = line;
          lastDate = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6], res[7]).getTime();
        }
      }
      num++;
    });
    file.on('error', err => {
      clearInterval(report);
      return reject(err);
    });
    file.on('end', () => {
      clearInterval(report);
      writeout(`Total of ${num} lines detected. (${path.basename(inputFile)})`);
      notifier.emit('log', { event: 'info', text: `Total of ${num} lines detected. (${path.basename(inputFile)})`, meta: { job: 'parser-countLines', status: 'end' } });
      return resolve({ lines: num, firstLine, lastLine, firstDate, lastDate });
    });
  });
}

let recursiveInvocation = 0;

/** matchLine(line, lineNr, po, checkIndex = null, debug = false)
 * - Contextually checks if line matches current config node or one of it's childs or parents
 * @param {string} line line to be tested
 * @param {number} lineNr current line number in current file
 * @param {PassableObject} po common PassableObject
 * @param {number} checkIndex
 * @param {boolean} debug
 * @returns {claroConfigElement}
 */
function matchLine(line, lineNr, po, checkIndex = null, debug = false) {
  let matched = false;
  let matchedPointer;
  let currentInvocation;
  // if (lineNr > 132486 && lineNr < 132491) debug = true;
  // if (line === '20180812 13:16:43.711 CONVERT profile  sRGB IEC61966-2.1 (Perceptual rendering intent)') debug = true;
  // if (debug) console.log(lineNr);
  if (debug) {
    recursiveInvocation++;
    currentInvocation = recursiveInvocation;
    let out_s = null;
    let out_i = 0;
    for (const p of po.configPointer) {
      out_i++;
      if (out_s) out_s += ', ';
      else out_s = '';
      out_s += p[0].id;
    }
    writedebug();
    writedebug(`[${currentInvocation}] invoking this function for the ${currentInvocation}. time`, 'matchLine');
    writedebug(`[${currentInvocation}] pointer has ${out_i} members: ${out_s}`, 'matchLine');
    writedebug(`[${currentInvocation}] ${lineNr} ${line}`, 'matchLine');
  }

  let pointerIndex = 0;
  for (const [pointer, pointerCopy] of po.configPointer.entries()) {
    if (checkIndex) if (pointerIndex < checkIndex) continue; // in recursion, we want to check only previously unchecked lines
    if (debug) writedebug(`[${currentInvocation}] checking siblings of ${pointer[0].id} for match...`, 'matchLine');
    if (debug) writedebug(`[${currentInvocation}] pointerIndex = ${pointerIndex}, checkIndex = ${checkIndex}`, 'matchLine');
    for (const item of pointer) {
      if (item.match.test(line)) {
        item.count++;
        matched = item;
        matchedPointer = pointer;
        break;
      }
    }
    pointerIndex++;
  }
  if (matched) {
    if (matched.children) {
      if (matchedPointer !== matched.children) {
        // po.configPointer.delete(matchedPointer);
        po.configPointer.add(matched.children);
      }
    }
  }

  if (checkIndex) return matched; // in recursion, we want to stop here

  if (debug) writedebug(`[${currentInvocation}] after sibling search matched is ${matched ? matched.id : !!matched}`, 'matchLine');

  if (!matched) {
    let i = 0;
    for (const [pointer, pointerCopy] of po.configPointer.entries()) {
      // if (checkIndex) if (pointerIndex < checkIndex) continue; // in recursion, we want to check only previously unchecked lines
      if (debug) writedebug(`[${currentInvocation}] Checking for parents pointer: ${pointer[0].id}`, 'matchLine');
      if (pointer[0] && pointer[0].parent) {
        if (pointer[0].parent.parent) {
          po.configPointer.add(pointer[0].parent.parent.children);
          i++;
        } else {
          po.configPointer.add(po.config);
          i++;
        }
      }
    }

    matched = i ? matchLine(line, lineNr, po, i) : false;
  }

  if (debug) writedebug(`[${currentInvocation}] after recursion matched is ${matched ? matched.id : !!matched}`, 'matchLine');

  if (!matched) {
    if (debug) writedebug(`[${currentInvocation}] ${lineNr} unseen line: ${line}`, 'matchLine');
  } else {
    if (fns[matched.act]) {
      // console.log(`${matched.id} -> ${matched.act}`);
      fns[matched.act](line, matched, po);
    }
  }

  return matched;
}

/** parseFile(inputFile, po)
 * - Reads line by line of inputFile and calls matchLine() on each
 * @param {FileObject} inputFile
 * @param {PassableObject} po
 * @return {Promise}
 */
function parseFile(inputFile, po) {
  return new Promise((resolve, reject) => {
    const file = new LineByLineReader(inputFile.path, { encoding: 'utf8' });
    let lineNr = 0;
    const report = setInterval(() => {
      jobStatus(lineNr, inputFile.lines);
    }, 200);

    file.on('line', line => {
      lineNr++;
      recursiveInvocation = 0;
      const result = matchLine(line, lineNr, po);
      if (!result) matchLine(line, lineNr, po, undefined, true);
    });
    file.on('error', error => reject(error));
    file.on('end', () => {
      clearInterval(report);
      jobStatus(lineNr, inputFile.lines);
      return resolve('Job done.');
    });
  });
}

/** main(inputFolder)
 * - Main logic function - takes in path and does all the work
 * @param {string} inputFolder path to directory
 * @return
 */
async function main(inputFolder) {
  const files = await getFiles(inputFolder);
  writeout('Collecting file metadata...');
  notifier.emit('log', { event: 'info', text: 'Collecting file metadata...', meta: { job: 'parser-main', status: 'start metadataCollecting' } });

  try {
    const missing = [];
    for (const file of files) {
      if (!po.file.has(file.hash)) {
        const result = await countLines(file.path, true);
        file.lines = result.lines;
        file.firstDate = result.firstDate;
        file.firstLine = result.firstLine;
        file.lastDate = result.lastDate;
        file.lastLine = result.lastLine;
        missing.push({ hash: file.hash, ...result });
        po.file.set(file.hash, { hash: file.hash, ...result });
      }
    }
    if (missing.length) writeFiles(missing);
  } catch (error) {
    console.log(error);
    notifier.emit('log', { event: 'error', text: JSON.stringify(error), meta: { job: 'parser-main', status: 'error writeFiles' } });
    return error;
  }

  writeout('Started parsing files...');
  notifier.emit('log', { event: 'info', text: 'Started parsing files...', meta: { job: 'parser-main', status: 'start parsing' } });

  // TODO - make startDate constructable by user
  if (!po.rule.startDate) po.rule.startDate = constructStartDate();

  for (const file of files) {
    if (file.lastDate < po.rule.startDate) {
      writeout(`Skipping ${file.name} because file.lastDate (${croDate(file.lastDate)}) < rule.startDate (${croDate(po.rule.startDate)})`);
      notifier.emit('log', {
        event: 'info',
        text: `Skipping ${file.name} because file.lastDate (${croDate(file.lastDate)}) < rule.startDate (${croDate(po.rule.startDate)})`,
        meta: { job: 'parser-main', status: 'skip parsingFile' }
      });
      continue;
    }

    writeout(`Parsing ${file.name}`);
    notifier.emit('log', { event: 'info', text: `Parsing ${file.name}`, meta: { job: 'parser-main', status: 'start parsingFile' } });
    // TODO: test if we already parsed this file
    await parseFile(file, po);
    for (const key in po.output) {
      if (po.output[key].length) writedebug(`[${key}]: ${po.output[key].length}`, 'main');
    }

    digestAll(po);

    // console.log(`po is roughly ${fileSizeSI(roughSizeOfObject(po))}`);
  }

  writeout('Done.');
  notifier.emit('log', { event: 'info', text: 'Done.', meta: { job: 'parser-main', status: 'end' } });
  return true;
  // console.log(postWork().reduce((r, c) => Object.assign(r, c), {}));
}

/** dbResult
 * @typedef {Object} dbResult
 * @property {number} collected Number of items prepared for the database write
 * @property {number} written Number of items written in the database
 */

/** digestAll(po)
 * Calls individual digests and combines returns into one
 * @param {PassableObject} po common Passable object
 * @return {{names: dbResult, days: dbResult, pObj: dbResult, pImg: dbResult, pIns: dbResult, route: dbResult, purge: dbResult}} number of items collected and written to the database
 */
const digestAll = po => {
  const names = digestNames(po);
  const days = digestDays(po);
  const images = digestImages(po);
  const route = digestRoutes(po);
  const purge = digestPurges(po);
  return { ...names, ...days, ...images, ...route, ...purge };
};

/** digestNames(po)
 * - Writes names set to database, reports status, clears names set
 * @param {PassableObject} po common Passable object
 * @return {{names: dbResult}} Number of names collected and written to the database
 */
const digestNames = po => {
  const result = writeNames(po.names);
  const names = { collected: po.names.size, written: result.reduce((acc, val) => acc + val.changes, 0) };
  writedebug(`Collected ${names.collected} names, written ${names.written} in db.`, 'digestNames');
  po.names.clear();
  return { names };
};

/** digestDays(po)
 * - Writes days set to database, reports status, clears days set
 * @param {PassableObject} po common Passable object
 * @return {{days: dbResult}} Number of days collected and written to the database
 */
const digestDays = po => {
  const result = writeDays(po.days);
  const days = { collected: po.days.size, written: result.reduce((acc, val) => acc + val.changes, 0) };
  writedebug(`Collected ${days.collected} days, written ${days.written} in db.`, digestDays);
  po.days.clear();
  return { days };
};

/** digestImages(po)
 * - Writes images (pObj, pImg, pIns) array to database, reports status, clears referenced po.output array
 * @param {PassableObject} po common Passable object
 * @return {{pObj: dbResult, pImg: dbResult, pIns: dbResult}} Number of images collected and written to the database
 */
const digestImages = po => {
  const result = writeImages(po.output);
  const images = {
    pObj: {
      collected: po.output.pObj.length,
      written: result.pObj.reduce((acc, val) => acc + val.changes, 0)
    },
    pImg: {
      collected: po.output.pImg.length,
      written: result.pImg.reduce((acc, val) => acc + val.changes, 0)
    },
    pIns: {
      collected: po.output.pIns.length,
      written: result.pIns.reduce((acc, val) => acc + val.changes, 0)
    }
  };
  writedebug(`Collected ${po.output.pObj.length} objects, written ${result.pObj.reduce((acc, val) => acc + val.changes, 0)} in db.`, 'digestImages');
  po.output.pObj = [];
  writedebug(`Collected ${po.output.pImg.length} images, written ${result.pImg.reduce((acc, val) => acc + val.changes, 0)} in db.`, 'digestImages');
  po.output.pImg = [];
  writedebug(`Collected ${po.output.pIns.length} inspects, written ${result.pIns.reduce((acc, val) => acc + val.changes, 0)} in db.`, 'digestImages');
  po.output.pIns = [];
  return images;
};

/** digestRoutes(po)
 * - Writes routes array to database, reports status, clears po.output.route array
 * @param {PassableObject} po common Passable object
 * @return {{route: dbResult}} Number of routes collected and written to the database
 */
const digestRoutes = po => {
  const result = writeRoutes(po.output.route);
  const route = { collected: po.output.route.length, written: result.reduce((acc, val) => acc + val.changes, 0) };
  writedebug(`Collected ${route.collected} routes, written ${route.written} in db.`, 'digestRoutes');
  po.output.route = [];
  return { route };
};

/** digestPurges(po)
 * - Writes purges array to database, reports status, clears po.output.purge array
 * @param {PassableObject} po common Passable object
 * @return {{purge: dbResult}} Number of purges collected and written to the database
 */
const digestPurges = po => {
  const result = writePurges(po.output.purge);
  const purge = { collected: po.output.purge.length, written: result.reduce((acc, val) => acc + val.changes, 0) };
  writedebug(`Collected ${purge.collected} purges, written ${purge.written} in db.`, 'digestPurges');
  po.output.purge = [];
  return { purge };
};

/** postWork(array, parent)
 * - Extracts count and id from config nodes and flattens it into single array
 * @param {Object} [array] config array called when method recurses
 * @param {string} [parent] obsolete?
 * @return {Array.<Object.<string, number>>}
 */
function postWork(array, parent) {
  if (!array) array = config;
  if (!parent) parent = 'root';
  const output = [];
  for (const item of array) {
    if (item.count) output.push({ [item.id]: item.count });
    if (item.children) output.push(...postWork(item.children, item.id));
  }
  return output;
}

module.exports = main;
