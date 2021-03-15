const fs = require('fs');
const path = require('path');
const LineByLineReader = require('line-by-line');
const getFiles = require('./getFiles');
const config = require('./lib/config');
const fns = require('./actions');
const { writeNames, writeDays, writeImages } = require('./lib/db/tools');
const { roughSizeOfObject, humanFileSize } = require('./lib/util/extras');

function getDateNum(d) {
  return `${d.getFullYear()}${d.getMonth() + 1 < 10 ? '0' : ''}${d.getMonth() + 1}${
    d.getDate() < 10 ? '0' : ''
  }${d.getDate()}`;
}

function writeout(s, sameline) {
  const ts = `[${new Date().toTimeString().split(' ')[0]}]`;
  if (sameline) {
    process.stdout.write(`${ts} ${s}\x1b[0G`);
  } else {
    console.log(`${ts} ${s}`);
  }
}

function jobStatus(lineNr, totalLines) {
  const percent = parseInt((lineNr / totalLines) * 100);
  writeout(`Job at: ${percent}%`, 0);
}

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
    }, 500);

    file = new LineByLineReader(inputFile);

    file.on('line', (line) => {
      if (getMeta) {
        const res = matchDate.exec(line);
        if (res) {
          if (!firstLine) {
            firstLine = line;
            firstDate = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6], res[7]);
          }
          lastLine = line;
          lastDate = new Date(res[1], res[2] - 1, res[3], res[4], res[5], res[6], res[7]);
        }
      }
      num++;
    });
    file.on('error', (err) => {
      clearInterval(report);
      return reject(err);
    });
    file.on('end', () => {
      clearInterval(report);
      writeout(`Total of ${num} lines detected. (${path.basename(inputFile)})`);
      return resolve({ lines: num, firstLine, lastLine, firstDate, lastDate });
    });
  });
}

let recursiveInvocation = 0;

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
    console.log();
    console.log(`[${currentInvocation}] invoking this function for the ${currentInvocation}. time`);
    console.log(`[${currentInvocation}] pointer has ${out_i} members: ${out_s}`);
    console.log(`[${currentInvocation}]`, lineNr, line);
  }

  let pointerIndex = 0;
  for (const [pointer, pointerCopy] of po.configPointer.entries()) {
    if (checkIndex) if (pointerIndex < checkIndex) continue; // in recursion, we want to check only previously unchecked lines
    if (debug) console.log(`[${currentInvocation}] checking siblings of ${pointer[0].id} for match...`);
    if (debug) console.log(`[${currentInvocation}] pointerIndex = ${pointerIndex}, checkIndex = ${checkIndex}`);
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

  if (debug) console.log(`[${currentInvocation}] after sibling search matched is ${matched ? matched.id : !!matched}`);

  if (!matched) {
    let i = 0;
    for (const [pointer, pointerCopy] of po.configPointer.entries()) {
      // if (checkIndex) if (pointerIndex < checkIndex) continue; // in recursion, we want to check only previously unchecked lines
      if (debug) console.log(`[${currentInvocation}] Checking for parents pointer: ${pointer[0].id}`);
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

  if (debug) console.log(`[${currentInvocation}] after recursion matched is ${matched ? matched.id : !!matched}`);

  if (!matched) {
    if (debug) console.log(`[${currentInvocation}]`, lineNr, 'unseen line:', line);
  } else {
    if (fns[matched.act]) {
      // console.log(`${matched.id} -> ${matched.act}`);
      fns[matched.act](line, matched, po);
    }
  }

  return matched;
}

function parseFile(inputFile, po) {
  return new Promise((resolve, reject) => {
    const file = new LineByLineReader(inputFile.path, { encoding: 'utf8' });
    let lineNr = 0;
    const report = setInterval(() => {
      jobStatus(lineNr, inputFile.lines);
    }, 200);

    file.on('line', (line) => {
      lineNr++;
      recursiveInvocation = 0;
      const result = matchLine(line, lineNr, po);
      if (!result) matchLine(line, lineNr, po, undefined, true);
    });
    file.on('error', (error) => reject(error));
    file.on('end', () => {
      clearInterval(report);
      jobStatus(lineNr, inputFile.lines);
      return resolve('Job done.');
    });
  });
}

async function main(inputFolder) {
  // {
  //   path: 'E:\\code\\Apps\\Parserly\\_mats\\claro logs\\logs\\JClaro.log',
  //   name: 'JClaro.log',
  //   dir: 'E:\\code\\Apps\\Parserly\\_mats\\claro logs\\logs',
  //   size: 6595460,
  //   humanSize: '6.60 MB',
  //   t_created: 1613645790610.293,
  //   t_modified: 1613231910756.4705,
  //   t_changed: 1613231910756.4705,
  //   t_accessed: 1613645791547.812
  // }
  // {
  //   ...Set,
  //   lines: 50000,
  //   firstLine: '20210201 12:01:24.831 01ec6fd8-3aac-46f1-aec8-07e4116669a3.jpg sent to inspector(3999)',
  //   lastLine: "20210201 13:16:32.193 file 'd71f8eac-159a-4bfb-8771-9bb04a959bae.jpg' copied to folder: C:\_claro\InternalRoutes\KLZ\InspectorIN"
  // }
  // const inputFile = '../_mats/logs/JClaro.log';
  // const inputFile = '../_mats/logs/all-au.log';
  // const inputFile = '../_mats/logs/all-hr.log';
  // const inputFile = './all.log';
  // const outputFile = 'remains.log';
  const tables = ['crop', 'dlink', 'pImg', 'pIns', 'pObj', 'purge', 'route', 'system'];
  const po = {
    detectedDefault: {},
    detected: {},
    output: {},
    names: new Set(),
    days: new Set(),
    configPointer: new Set(),
    config,
  };
  po.configPointer.add(po.config);

  tables.forEach((el) => {
    po.detectedDefault[el] = {};
    po.detected[el] = {};
    po.output[el] = [];
  });

  const files = await getFiles(inputFolder);

  // const files = [
  //   {
  //     path: 'test.log',
  //     name: 'encoding.log',
  //     dir: '..\\_mats\\logs',
  //     size: 6595460,
  //     humanSize: '6.60 MB',
  //     t_created: 1613645790610.293,
  //     t_modified: 1613231910756.4705,
  //     t_changed: 1613231910756.4705,
  //     t_accessed: 1613645791547.812,
  //   },
  // ];

  writeout('Collecting file metadata...');
  try {
    for (const file of files) {
      const result = await countLines(file.path, true);
      file.lines = result.lines;
      file.firstDate = result.firstDate;
      file.lastDate = result.lastDate;
    }
  } catch (error) {
    console.log(error);
    return error;
  }

  writeout('Started parsing files...');
  for (const file of files) {
    writeout(`Parsing ${file.name}`);
    await parseFile(file, po);
    // console.log(getDateNum(file.firstDate), ' - ', getDateNum(file.lastDate));
    // console.log([...po.days].sort());
    for (const key in po.output) {
      if (po.output[key].length) console.log({ [key]: po.output[key].length });
    }
    const dbResult1 = writeNames(po.names);
    console.log(
      `Colected ${po.names.size} names, written ${dbResult1.reduce((acc, val) => acc + val.changes, 0)} in db.`
    );
    if (!!dbResult1) {
      po.names.clear();
    }

    const dbResult2 = writeDays(po.days);
    console.log(
      `Colected ${po.days.size} days, written ${dbResult2.reduce((acc, val) => acc + val.changes, 0)} in db.`
    );
    if (!!dbResult2) po.days.clear();

    const dbResult3 = writeImages(po.output);
    if (dbResult3) {
      // delete po.output.pObj;
      po.output.pObj = [];
      // delete po.output.pImg;
      po.output.pImg = [];
      // delete po.output.pIns;
      po.output.pIns = [];
      po.output.purge = [];
      po.output.route = [];
    }

    console.log(`po is roughly ${humanFileSize(roughSizeOfObject(po))}`);
  }

  // console.log(dbResult1, dbResult2);

  writeout('Done.');
  // console.log(postWork().reduce((r, c) => Object.assign(r, c), {}));
}

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
main('../_mats/logs/HR');
// console.log(db)
