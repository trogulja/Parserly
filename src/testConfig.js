const config = require('./lib/config');
const actCollection = new Set();

function traverse(array = config) {
  const output = new Set();
  for (const item of array) {
    // if (item.id[0] === 'o' && item.act === 'startObject') {
    //   console.log(item.members);
    // }
    if (item.children) {
      const results = [...traverse(item.children)];
      results.forEach((el) => output.add(el));
    }
    // if (item.members.length && item.act === 'inspected') {
    //   for (const member of item.members) {
    //     output.add(member);
    //   }
    // }
    output.add(`${item.id[0]}${item.act}`);
  }
  return output;
}

const res = traverse();
// console.log(new Set([...res].sort()));

const arr = [...res];
arr.sort();

const out = {};

arr.forEach((el) => {
  if (!out[el[0]]) out[el[0]] = [];
  out[el[0]].push(el.slice(1));
});

// console.log(out);

const actions_all = {
  d: ['ignore', 'resetPointer'],
  i: ['error', 'errorResolve', 'ignore', 'inspected'],
  o: [
    'criticalError',
    'endImage',
    'endPDFNothingDone',
    'error',
    'errorResolve',
    'ignore',
    'inspectorLink',
    'processingCount',
    'processingErrorCount',
    'processingReject',
    'startImage',
    'startObject',
  ],
  p: ['purgeCount'],
  r: ['end', 'error', 'errorResolve', 'ignore', 'start'],
  s: ['criticalError', 'error', 'errorResolve', 'ignore'],
};
const actions = {
  d: ['resetPointer'],
  i: ['inspected', 'error', 'errorResolve'],
  o: [
    'startObject',
    'startImage',
    'processingCount',
    'processingErrorCount',
    'processingReject',
    'inspectorLink',
    'endImage',
    'endPDFNothingDone',
    'criticalError',
    'error',
    'errorResolve',
  ],
  p: ['purgeCount'],
  r: ['start', 'end', 'error', 'errorResolve'],
  s: ['criticalError', 'error', 'errorResolve'],
};

const members_act = [
  'channel',
  'durationS',
  'error',
  'filename',
  'filepath',
  'folderpath',
  'inspectAction',
  'inspectDuration',
  'inspectID',
  'threadID',
  'user',
];
const members_act_ignore = [
  'action',
  'channel',
  'durationMS',
  'error',
  'filename',
  'filepath',
  'hostname',
  'inspectID',
  'localUser',
  'threadID',
  'user',
];
const members_act_criticalError = ['channel', 'filepath', 'folderpath', 'reason'];

const members_act_resetPointer = ['dateConstruct'];
const members_act_inspected = [
  'dateConstruct',
  'channel',
  'filename',
  'inspectAction',
  'inspectDuration',
  'inspectID',
  'user',
];

const matched1 = config[1].children[0].children[1].children[0].children[1];
const matched2 = config[1].children[1].children[1];

const findParent = (matched) => {
  let result = false;
  let pointer = matched;
  while (!result) {
    console.log(pointer.id)
    if (pointer.id === 'o_01') result = 'pObj';
    if (pointer.id === 'o_02') result = 'pImg';

    if (pointer.parent) pointer = pointer.parent;
    else break;
  }
  return result;
};

console.log(findParent(matched1));
console.log(findParent(matched2));
