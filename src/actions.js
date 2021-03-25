const { cloneDeep } = require('lodash');
const path = require('path');
const { calcInspectTime } = require('./lib/util/tools');

/**
 * Utility
 */
function getIndex(array, string) {
  return array.indexOf(string) + 1;
}

function getDateIndex(array) {
  const YY = getIndex(array, 't_year');
  const MM = getIndex(array, 't_month');
  const DD = getIndex(array, 't_day');
  const hh = getIndex(array, 't_hour');
  const mm = getIndex(array, 't_minute');
  const ss = getIndex(array, 't_second');
  const ms = getIndex(array, 't_ms');
  return { YY, MM, DD, hh, mm, ss, ms };
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Image processing channel
 * Creates new pObj item, concludes old one if exists
 * @param {String} line - line from log file
 * @param {Object} matched - config's object that tested against line
 * @param {Object} po - passable object we are mutating
 * @return po
 */
const startObject = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iFilepath = getIndex(matched.members, 'filepath');
  const iThreadID = getIndex(matched.members, 'threadID');

  // Check if we need to conclude previous object
  if (po.detected.pObj.t_start) {
    if (!po.detected.pObj.t_end) po.detected.pObj.error = 'Missing conclusion';
    if (!po.detected.pObj.t_end) po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
    if (!po.detected.pObj.duration) po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;
    concludePObj(po, line);
  }

  po.detected.pObj.t_start = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  po.detected.pObj.objectName = path.parse(m[iFilepath]).name;
  po.detected.pObj.day = Number(`${m[YY]}${m[MM]}${m[DD]}`);
  po.detected.pObj.threadID = Number(m[iThreadID]);

  // Backward compatibility - when logging was done without threadID
  if (isNaN(po.detected.pObj.threadID)) po.detected.pObj.threadID = po.output.pObj.length + 1;

  if (po.detected.pObj.objectName) po.names.add(po.detected.pObj.objectName);
  else {
    console.log({ line });
    console.log({ px: po.detected.pObj });
    throw new Error('objectName missing');
  }
  if (po.detected.pObj.day) po.days.add(po.detected.pObj.day);
  else {
    console.log({ line });
    console.log({ px: po.detected.pObj });
    throw new Error('day missing');
  }

  return po;
};

const startImage = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iChannel = getIndex(matched.members, 'channel');
  const iFilename = getIndex(matched.members, 'filename');
  const file = path.parse(m[iFilename]);

  // Check if we need to conclude previous image
  if (po.detected.pImg.t_start) {
    // Check for PDF special case - we can ignore parent object
    if (po.detected.pImg.imageName.length && file.name.length - po.detected.pImg.imageName.length >= 4 && file.name.indexOf(po.detected.pImg.imageName) === 0 && file.ext === '.tiff') {
      // ignore
      console.log('Ignoring started object %s, replacing with %s', po.detected.pImg.imageName, file.name);
    } else {
      if (!po.detected.pImg.t_end) po.detected.pImg.error = 'Missing conclusion';
      if (!po.detected.pImg.t_end) po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      if (!po.detected.pImg.duration) po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;
      concludePImg(po, line);
    }
  }

  po.detected.pImg.t_start = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  po.detected.pImg.channelName = m[iChannel];
  if (!po.detected.pObj.channelName) po.detected.pObj.channelName = m[iChannel];
  po.detected.pImg.imageName = path.parse(m[iFilename]).name;
  po.detected.pImg.threadID = po.detected.pObj.threadID;
  po.detected.pImg.day = po.detected.pObj.day;

  if (po.detected.pImg.imageName) po.names.add(po.detected.pImg.imageName);
  else {
    console.log({ line });
    console.log({ px: po.detected.pImg });
    throw new Error('imageName missing');
  }
  if (po.detected.pImg.channelName) po.names.add(po.detected.pImg.channelName);
  else {
    console.log({ line });
    console.log({ px: po.detected.pImg });
    throw new Error('channelName missing');
  }
  if (po.detected.pImg.day) po.days.add(po.detected.pImg.day);
  else {
    console.log({ line });
    console.log({ px: po.detected.pImg });
    throw new Error('day missing');
  }

  return po;
};

const processingCount = (line, matched, po) => {
  if (!po.detected.pObj.t_start) {
    console.log({ line });
    console.log({ px: po.detected.pObj });
    throw new Error('Counting processing, but no parent!');
  }
  if (!po.detected.pImg.t_start) {
    console.log({ line });
    console.log({ px: po.detected.pImg });
    for (const [pointer, pointerCopy] of po.configPointer.entries()) {
      console.log(`Points to siblings of ${pointer[0].id}`);
      console.dir(pointer[0], { depth: 0 });
    }
    throw new Error('Counting processing, but no parent!');
  }

  if (!po.detected.pObj.numSteps) po.detected.pObj.numSteps = 0;
  if (!po.detected.pImg.numSteps) po.detected.pImg.numSteps = 0;
  po.detected.pObj.numSteps++;
  po.detected.pImg.numSteps++;

  return po;
};

const processingErrorCount = (line, matched, po) => {
  if (!po.detected.pObj.t_start) {
    console.log({ line });
    console.log({ px: po.detected.pObj });
    throw new Error('Counting processing error, but no parent!');
  }
  if (!po.detected.pImg.t_start) {
    console.log({ line });
    console.log({ px: po.detected.pImg });
    throw new Error('Counting processing error, but no parent!');
  }

  if (!po.detected.pObj.numErrors) po.detected.pObj.numErrors = 0;
  if (!po.detected.pImg.numErrors) po.detected.pImg.numErrors = 0;
  po.detected.pObj.numErrors++;
  po.detected.pImg.numErrors++;

  return po;
};

const processingReject = (line, matched, po) => {
  // For future use
  return po;
};

const inspectorLink = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iFilename = getIndex(matched.members, 'filename');
  const iInspectID = getIndex(matched.members, 'inspectID');

  po.detected.pImg.inspectID = Number(m[iInspectID]);

  if (path.parse(m[iFilename]).name) po.names.add(path.parse(m[iFilename]).name);
  else {
    console.log({ line });
    console.log({ px: po.detected.pImg });
    throw new Error('fileName missing');
  }

  return po;
};

const endImage = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iChannel = getIndex(matched.members, 'channel');
  const iDurationS = getIndex(matched.members, 'durationS');
  const iFilename = getIndex(matched.members, 'filename');
  const file = path.parse(m[iFilename]);

  po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;

  po.detected.pObj.t_end = po.detected.pImg.t_end;
  po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;

  if (file.name !== po.detected.pImg.imageName) {
    if (
      !file.name.match(new RegExp(String.raw`^${escapeRegExp(po.detected.pImg.imageName)}-\d+$`)) &&
      !po.detected.pImg.imageName.match(new RegExp(String.raw`^${escapeRegExp(file.name)}(?:-\d+){1,2}$`))
    ) {
      console.log();
      console.log('============== DEBUG ==============');
      console.log('RegExp #1 is:');
      console.log(new RegExp(String.raw`^${escapeRegExp(po.detected.pImg.imageName)}(?:-\d+){1,2}$`));
      console.log('RegExp #2 is:');
      console.log(new RegExp(String.raw`^${escapeRegExp(file.name)}(?:-\d+){1,2}$`));
      console.log('file.name.match is:');
      console.log(file.name.match(new RegExp(String.raw`^${escapeRegExp(po.detected.pImg.imageName)}-\d+$`)));
      console.log('po.detected.pImg.imageName.match is:');
      console.log(po.detected.pImg.imageName.match(new RegExp(String.raw`^${escapeRegExp(file.name)}(?:-\d+){1,2}$`)));
      console.log({ line });
      console.log({ file });
      console.log({ pImg: po.detected.pImg });
      console.log('============== DEBUG ==============');
      console.log();
      throw new Error('end image name should be the same as start');
    }
  }
  if (m[iChannel] !== po.detected.pImg.channelName) throw new Error('end channel name should be the same as start');
  if (po.detected.pImg.t_end < po.detected.pImg.t_start) throw new Error('t_end should be bigger or equal than t_start');

  return po;
};

const endPDFNothingDone = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iChannel = getIndex(matched.members, 'channel');
  const iFilename = getIndex(matched.members, 'filename');

  po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;

  po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;

  if (path.parse(m[iFilename]).name !== po.detected.pImg.imageName) throw new Error('end image name should be the same as start');
  if (m[iChannel] !== po.detected.pImg.channelName) throw new Error('end channel name shouldbe the same as start');
  if (po.detected.pImg.t_end < po.detected.pImg.t_start) throw new Error('t_end should be bigger or equal than t_start');

  return po;
};

const endObject = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iThreadID = getIndex(matched.members, 'threadID');
  const iHostname = getIndex(matched.members, 'hostname');

  if (line === "jvm 8    | 20210104 15:20:55.099 Channel 'klz-inspectorEdit' processed file (3.8 sec.): aa5f22ce-5480-453f-8d56-5c0d13346407.jpg") {
    console.log('got the line!!');
  }

  po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;

  if (Number(m[iThreadID]) !== po.detected.pObj.threadID) throw new Error('end threadID should be the same as start');
  if (po.detected.pObj.t_end < po.detected.pObj.t_start) throw new Error('t_end should be bigger or equal than t_start');

  return po;
};

const concludePImg = (po, line) => {
  // move from detected to output
  // errors: null | 'error_name' | 'resolved'
  // pImg writes: t_start, t_end, duration, imageName, numSteps, numErrors, inspectID, error
  // pImg checks: threadID, channelName
  // pImg must have: t_start, t_end, imageName, channelName, threadID
  // pImg optional: duration, numSteps, numErrors, inspectID, error
  if (!po.detected.pImg.t_start || !po.detected.pImg.t_end || !po.detected.pImg.imageName || !po.detected.pImg.channelName || !po.detected.pImg.threadID) {
    console.log();
    console.log('============== DEBUG ==============');
    console.log('Unable to conclude pImg, not enough info');
    console.log({ pImg: po.detected.pImg });
    console.log(line);
    console.log();
    console.log({ pObj: po.detected.pObj });
    console.log('============== DEBUG ==============');
    console.log();
    throw new Error('Missing crucial info that should not miss!');
  }

  if (!po.detected.pImg.t_end) {
    // Missing t_end means we did not detect block ending
    console.log({ pImg: po.detected.pImg });
    throw new Error('Missing t_end - it should be set');
  }

  if (!po.detected.pImg.duration && po.detected.pImg.duration !== 0) {
    // Missing duration is indicative of an error
    if (!po.detected.pImg.error) po.detected.pImg.error = 'Unexpected error';
    po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;
  }

  po.output.pImg.push({
    t_start: po.detected.pImg.t_start,
    t_end: po.detected.pImg.t_end,
    duration: po.detected.pImg.duration,
    day: po.detected.pImg.day,
    imageName: po.detected.pImg.imageName,
    channelName: po.detected.pImg.channelName,
    numSteps: po.detected.pImg.numSteps,
    numErrors: po.detected.pImg.numErrors,
    inspectID: po.detected.pImg.inspectID,
    threadID: po.detected.pImg.threadID,
    error: po.detected.pImg.error,
  });

  for (const key in po.detected.pImg) {
    delete po.detected.pImg[key];
  }

  return po;
};

const concludePObj = (po, line) => {
  // move from detected to output
  // errors: null | 'error_name' | 'resolved'
  // pObj writes: t_start, t_end, duration, objectName, day, threadID, channelName, numSteps, numErrors, error
  // pObj checks:
  // pObj must have: t_start, t_end, objectName, threadID, day
  // pObj optional: channelName, numSteps, numErrors, error
  if (!po.detected.pObj.t_start || !po.detected.pObj.t_end || !po.detected.pObj.objectName || !po.detected.pObj.threadID || !po.detected.pObj.day) {
    console.log();
    console.log('============== DEBUG ==============');
    console.log('Unable to conclude pObj, not enough info');
    console.log({ pObj: po.detected.pObj });
    console.log(line);
    console.log();
    console.log({ pImg: po.detected.pImg });
    console.log('============== DEBUG ==============');
    console.log();

    for (const key in po.detected.pObj) {
      delete po.detected.pObj[key];
    }
    return po;
    // throw new Error('Missing crucial info that should not miss!');
  }

  if (!po.detected.pObj.t_end) {
    // Missing t_end means we did not detect block ending
    console.log({ pObj: po.detected.pObj });
    throw new Error('Missing t_end - it should be set');
  }

  if (!po.detected.pObj.duration && po.detected.pObj.duration !== 0) {
    // Missing duration is indicative of an error
    console.log();
    console.log('============== DEBUG ==============');
    console.log(po.detected.pObj);
    console.log('============== DEBUG ==============');
    console.log();
    if (!po.detected.pObj.error) po.detected.pObj.error = 'Unexpected error';
    po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;
  }

  po.output.pObj.push({
    t_start: po.detected.pObj.t_start,
    t_end: po.detected.pObj.t_end,
    duration: po.detected.pObj.duration,
    day: po.detected.pObj.day,
    objectName: po.detected.pObj.objectName,
    channelName: po.detected.pObj.channelName,
    numSteps: po.detected.pObj.numSteps,
    numErrors: po.detected.pObj.numErrors,
    error: po.detected.pObj.error,
    threadID: po.detected.pObj.threadID,
  });

  for (const key in po.detected.pObj) {
    delete po.detected.pObj[key];
  }

  return po;
};

/**
 * Inspector Events
 */
const inspected = (line, matched, po) => {
  // 'user', 'filename', 'inspectID', 'channel', 'inspectAction', 'inspectDuration'
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iUser = getIndex(matched.members, 'user');
  const iFilename = getIndex(matched.members, 'filename');
  const iInspectID = getIndex(matched.members, 'inspectID');
  const iChannel = getIndex(matched.members, 'channel');
  const iInspectAction = getIndex(matched.members, 'inspectAction');
  const iInspectDuration = getIndex(matched.members, 'inspectDuration');

  po.detected.pIns = {
    t_start: new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime(),
    day: Number(`${m[YY]}${m[MM]}${m[DD]}`),
    imageName: path.parse(m[iFilename]).name,
    channelName: m[iChannel],
    userName: m[iUser],
    inspectAction: m[iInspectAction],
    psTime: Number(m[iInspectDuration]),
    calcTime: m[iInspectDuration] === undefined ? calcInspectTime(-1) : calcInspectTime(Number(m[iInspectDuration])),
    inspectID: Number(m[iInspectID]),
  };

  if (po.detected.pIns.userName) po.names.add(po.detected.pIns.userName);
  else {
    console.log({ line });
    console.log({ px: po.detected.pIns });
    throw new Error('userName missing');
  }
  if (po.detected.pIns.imageName) po.names.add(po.detected.pIns.imageName);
  else {
    console.log({ line });
    console.log({ px: po.detected.pIns });
    throw new Error('imageName missing');
  }
  if (po.detected.pIns.channelName) po.names.add(po.detected.pIns.channelName);
  else {
    console.log({ line });
    console.log({ px: po.detected.pIns });
    throw new Error('channelName missing');
  }
  if (po.detected.pIns.inspectAction) po.names.add(po.detected.pIns.inspectAction);
  else {
    console.log({ line });
    console.log({ px: po.detected.pIns });
    throw new Error('inspectAction missing');
  }
  if (po.detected.pIns.day) po.days.add(po.detected.pIns.day);
  else {
    console.log({ line });
    console.log({ px: po.detected.pIns });
    throw new Error('day missing');
  }

  po.output.pIns.push({ ...po.detected.pIns });

  return po;
};

/**
 * Route channel
 */
const startRoute = (line, matched, po) => {
  const px = po.detected.route;
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iFilename = getIndex(matched.members, 'filename');
  const iChannel = getIndex(matched.members, 'channel');

  // Check if we need to conclude previous route event
  if (px.t_start) {
    px.error = 'Missing conclusion';
    if (!px.t_end) px.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
    if (!px.duration) px.duration = px.t_end - px.t_start;
    concludeRoute(po);
  }

  px.t_start = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  px.objectName = path.parse(m[iFilename]).name;
  px.channelName = m[iChannel];
  px.day = Number(`${m[YY]}${m[MM]}${m[DD]}`);

  if (px.objectName) po.names.add(px.objectName);
  else {
    console.log({ line });
    console.log({ px });
    throw new Error('objectName missing');
  }
  if (px.channelName) po.names.add(px.channelName);
  else {
    console.log({ line });
    console.log({ px });
    throw new Error('channelName missing');
  }
  if (px.day) po.days.add(px.day);
  else {
    console.log({ line });
    console.log({ px });
    throw new Error('days missing');
  }

  return po;
};

const endRoute = (line, matched, po) => {
  const px = po.detected.route;
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iFilename = getIndex(matched.members, 'filename');
  const iFolderpath = getIndex(matched.members, 'folderpath');

  px.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
  px.duration = px.t_end - px.t_start;

  if (path.parse(m[iFilename]).name !== px.objectName) throw new Error('end image name should be the same as start');
  if (px.t_end < px.t_start) throw new Error('t_end should be bigger or equal than t_start');

  return concludeRoute(po, line);
};

const concludeRoute = (po, line) => {
  // move from detected to output
  // errors: null | 'error_name' | 'resolved'
  // route writes: t_start, t_end, duration, objectName, day, channelName, error
  // route checks:
  // route must have: t_start, t_end, objectName, channelName, day
  // route optional: duration (can be 0), error
  const px = po.detected.route;
  if (!px.t_start || !px.t_end || !px.objectName || !px.channelName || !px.day) {
    console.log(line);
    console.log({ px });
    throw new Error('Missing crucial info that should not miss!');
  }

  po.output.route.push({
    t_start: px.t_start,
    t_end: px.t_end,
    duration: px.duration,
    day: px.day,
    objectName: px.objectName,
    channelName: px.channelName,
    error: px.error,
  });

  return po;
};

/**
 * Error handling
 */
const findParent = (matched) => {
  // o_01 - startObject -> parent => pObj.error
  // o_02 - startImage -> parent => pImg.error
  let result = false;
  let pointer = cloneDeep(matched);
  while (!result) {
    if (pointer.id === 'o_01') result = 'pObj';
    if (pointer.id === 'o_02') result = 'pImg';

    if (pointer.parent) pointer = pointer.parent;
    else break;
  }
  return result;
};

const error = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);

  // d, p -> no errors there
  if (matched.id[0] === 'i') {
    // inspect event error
    const i = po.output.pIns.length - 1;
    po.output.pIns[i].error = `${matched.id} - ${matched.desc}`;
    po.output.pIns[i].t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();

    // inspect event error
  } else if (matched.id[0] === 'o') {
    // image processing error
    const parent = findParent(matched);
    if (!parent) throw new Error('Unable to find parent object.');

    if (parent === 'pImg') {
      // Image receives full error
      if (!po.detected.pImg.t_start) throw new Error('pImg detected object start missing!');
      if (!po.detected.pImg.numErrors) po.detected.pImg.numErrors = 0;
      po.detected.pImg.numErrors++;
      po.detected.pImg.error = `${matched.id} - ${matched.desc}`;
      po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;

      // Object receives only end time and error count
      if (!po.detected.pObj.t_start) throw new Error('pObj detected object start missing!');
      if (!po.detected.pObj.numErrors) po.detected.pObj.numErrors = 0;
      po.detected.pObj.numErrors++;
      // po.detected.pObj.error = `${matched.id} - ${matched.desc}`;
      po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;
    } else if (parent === 'pObj') {
      // Object receives full error
      if (!po.detected.pObj.t_start) throw new Error('pObj detected object start missing!');
      if (!po.detected.pObj.numErrors) po.detected.pObj.numErrors = 0;
      po.detected.pObj.numErrors++;
      po.detected.pObj.error = `${matched.id} - ${matched.desc}`;
      po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;

      // Image receives full error if exists and is not wrapped
      if (po.detected.pImg.t_start) {
        if (!po.detected.pImg.t_end) {
          if (!po.detected.pImg.numErrors) po.detected.pImg.numErrors = 0;
          po.detected.pImg.numErrors++;
          po.detected.pImg.error = `${matched.id} - ${matched.desc}`;
          po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
          po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;
        }
      }
    }

    // image processing error
  } else if (matched.id[0] === 'r') {
    // routing channel error
    if (!po.detected.route.t_start) throw new Error('route detected object start missing!');
    po.detected.route.error = `${matched.id} - ${matched.desc}`;
    po.detected.route.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
    po.detected.route.duration = po.detected.route.t_end - po.detected.route.t_start;

    // routing channel error
  } else if (matched.id[0] === 's') {
    // system error - ignore for now
    po.detected.system.error = `${matched.id} - ${matched.desc}`;
    po.detected.system.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();

    // system error - ignore for now
  }

  return po;
};

const errorResolve = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);

  // d, p -> no errors there
  if (matched.id[0] === 'i') {
    // inspect event error resolve
    const i = po.output.pIns.length - 1;
    po.output.pIns[i].error = undefined;
    po.output.pIns[i].t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();

    // inspect event error resolve
  } else if (matched.id[0] === 'o') {
    // image processing error resolve
    const parent = findParent(matched);
    if (!parent) throw new Error('Unable to find parent object.');

    if (parent === 'pImg') {
      // Image resolves error
      if (!po.detected.pImg.t_start) throw new Error('pImg detected object start missing!');
      po.detected.pImg.error = undefined;
      po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;

      // Object updates end time
      if (!po.detected.pObj.t_start) throw new Error('pObj detected object start missing!');
      po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;
    } else if (parent === 'pObj') {
      // Image resolves error if it matches object error
      if (po.detected.pObj.error === po.detected.pImg.error) {
        po.detected.pImg.error = undefined;
        po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
        po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;
      }

      // Object resolves error
      if (!po.detected.pObj.t_start) throw new Error('pObj detected object start missing!');
      po.detected.pObj.error = undefined;
      po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;
    }

    // image processing error resolve
  } else if (matched.id[0] === 'r') {
    // routing channel error resolve
    if (!po.detected.route.t_start) throw new Error('route detected object start missing!');
    po.detected.route.error = undefined;
    po.detected.route.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
    po.detected.route.duration = po.detected.route.t_end - po.detected.route.t_start;

    // routing channel error resolve
  } else if (matched.id[0] === 's') {
    // system error resolve
    po.detected.system.error = undefined;
    po.detected.system.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();

    // system error resolve
  }

  return po;
};

const criticalError = (line, matched, po) => {
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);

  if (!YY) {
    // TODO - send notification about this error somewhere
    // Error does not contain any useful info, just report it somewhere and stop processing
    return po;
  }

  // d, i, p, r -> no critical errors there
  if (matched.id[0] === 'o') {
    // image processing error
    const parent = findParent(matched);
    if (!parent) throw new Error('Unable to find parent object.');

    if (parent === 'pImg') {
      // Image receives full error
      if (!po.detected.pImg.t_start) throw new Error('pImg detected object start missing!');
      if (!po.detected.pImg.numErrors) po.detected.pImg.numErrors = 0;
      po.detected.pImg.numErrors++;
      po.detected.pImg.error = `${matched.id} - ${matched.desc}`;
      po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;

      // Object receives only end time and error count
      if (!po.detected.pObj.t_start) throw new Error('pObj detected object start missing!');
      if (!po.detected.pObj.numErrors) po.detected.pObj.numErrors = 0;
      po.detected.pObj.numErrors++;
      // po.detected.pObj.error = `${matched.id} - ${matched.desc}`;
      po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;
    } else if (parent === 'pObj') {
      // Object receives full error
      if (!po.detected.pObj.t_start) throw new Error('pObj detected object start missing!');
      if (!po.detected.pObj.numErrors) po.detected.pObj.numErrors = 0;
      po.detected.pObj.numErrors++;
      po.detected.pObj.error = `${matched.id} - ${matched.desc}`;
      po.detected.pObj.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
      po.detected.pObj.duration = po.detected.pObj.t_end - po.detected.pObj.t_start;

      // Image receives full error if exists and is not wrapped
      if (po.detected.pImg.t_start) {
        if (!po.detected.pImg.t_end) {
          if (!po.detected.pImg.numErrors) po.detected.pImg.numErrors = 0;
          po.detected.pImg.numErrors++;
          po.detected.pImg.error = `${matched.id} - ${matched.desc}`;
          po.detected.pImg.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();
          po.detected.pImg.duration = po.detected.pImg.t_end - po.detected.pImg.t_start;
        }
      }
    }
  } else if (matched.id[0] === 's') {
    // system error
    po.detected.system.error = `${matched.id} - ${matched.desc}`;
    po.detected.system.t_end = new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime();

    // system error
  }

  return po;
};

/**
 * Data size handler
 */
const checkDataSize = (po) => {
  const limit = 10000; // limit set to 10k items

  if (po.names.size >= limit) {
    // write names
    // po.names.clear();
  }

  if (po.days.size >= limit) {
    // write days
    // po.days.clear();
  }
};

/**
 * Purge events
 */
const purgeFile = (line, matched, po) => {
  // 20190112 03:00:19.717 PURGING channel 'klz-BACKUP-monthly-purge' delete successfully  '\\srvczg-files\ftp_claro\_BACKUP_KLZ\1_svi_originali\0087ae72-a9c1-4f9a-95ad-690418143019.jpg'
  // members: [...dateConstruct, 'channel', 'filepath'],
  // match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PURGING channel '(.+)' delete successfully\s+'(.+)'$/,
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iChannel = getIndex(matched.members, 'channel');
  const iFilepath = getIndex(matched.members, 'filepath');
  const purgedElement = path.parse(m[iFilepath]);

  const purge = {
    t_start: new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime(),
    day: Number(`${m[YY]}${m[MM]}${m[DD]}`),
    channelName: m[iChannel],
    folderName: purgedElement.dir,
    objectName: purgedElement.name,
    error: undefined,
  };

  if (purge.channelName) po.names.add(purge.channelName);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('channelName missing');
  }
  if (purge.folderName) po.names.add(purge.folderName);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('folderName missing');
  }
  if (purge.objectName) po.names.add(purge.objectName);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('objectName missing');
  }
  if (purge.day) po.days.add(purge.day);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('day missing');
  }

  po.output.purge.push(purge);

  return po;
};

const purgeFolder = (line, matched, po) => {
  // 20180626 03:00:00.481 PURGING  channel 'cro-00-auto-input-purge3AM' delete empty subfolder successfully '\\srvczg-files\ftp_claro\CRO\auto-IN\Tom'
  // members: [...dateConstruct, 'channel', 'folderpath'],
  // match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) PURGING  channel '(.+)' delete empty subfolder successfully\s+'(.+)'\s*$/,
  const m = matched.match.exec(line);
  const { YY, MM, DD, hh, mm, ss, ms } = getDateIndex(matched.members);
  const iChannel = getIndex(matched.members, 'channel');
  const iFolderpath = getIndex(matched.members, 'folderpath');
  const purgedElement = path.parse(m[iFolderpath]);

  const purge = {
    t_start: new Date(m[YY], m[MM] - 1, m[DD], m[hh], m[mm], m[ss], m[ms]).getTime(),
    day: Number(`${m[YY]}${m[MM]}${m[DD]}`),
    channelName: m[iChannel],
    folderName: purgedElement.dir,
    objectName: purgedElement.name,
    error: undefined,
  };

  if (purge.channelName) po.names.add(purge.channelName);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('channelName missing');
  }
  if (purge.folderName) po.names.add(purge.folderName);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('folderName missing');
  }
  if (purge.objectName) po.names.add(purge.objectName);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('objectName missing');
  }
  if (purge.day) po.days.add(purge.day);
  else {
    console.log({ line });
    console.log({ purge });
    throw new Error('day missing');
  }

  po.output.purge.push(purge);

  return po;
};

/**
 * Reset pointer + handle image conclusion
 */
const resetPointer = (line, matched, po) => {
  // conclude anything existing
  if (po.detected.pImg.t_start) concludePImg(po, line);
  if (po.detected.pObj.t_start) concludePObj(po, line);
  if (po.detected.route.t_start) concludeRoute(po, line);

  // reset pointer to default
  po.configPointer.clear();
  po.configPointer.add(po.config);

  return po;
};

/**
 * Export functions
 */
const fns = {
  resetPointer,

  // Image Processing channel
  startObject,
  startImage,
  processingCount,
  processingErrorCount,
  processingReject,
  inspectorLink,
  endImage,
  endPDFNothingDone,
  endObject,

  // Inspector events
  inspected,

  // Route channel
  startRoute,
  endRoute,

  // Purge events
  purgeFile,
  purgeFolder,

  // Errors
  error,
  errorResolve,
  criticalError,
};

module.exports = fns;
