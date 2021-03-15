const delimiter = require('./_delimiter');
const image = require('./_image');
const inspector = require('./_inspector');
const purge = require('./_purge');
const route = require('./_route');
const system = require('./_system');
const values = require('./_values');
const wrapper = require('./_wrapper');

const rules = [...delimiter, ...image, ...inspector, ...route, ...purge, ...system, ...wrapper];

function mergeRegex(r1, r2) {
  var count = function(r, str) {
    return str.match(r) ? str.match(r).length : 0;
  };
  var numberGroups = /([^\\]|^)(?=\((?!\?:))/; // Home-made regexp to count groups.
  var offset = count(numberGroups, r1.source);
  if (offset) console.log(r1);
  var escapedMatch = /[\\](?:(\d+)|.)/; // Home-made regexp for escaped literals, greedy on numbers.
  var r2newSource = r2.source.replace(escapedMatch, function(match, number) {
    return number ? '\\' + (number - 0 + offset) : match;
  });
  return new RegExp(r1.source + r2newSource, (r2.global ? 'g' : '') + (r2.ignoreCase ? 'i' : '') + (r2.multiline ? 'm' : ''));
}

const pre = /^(?:jvm \d+\s+\| )?/;
// const pre1 = /^jvm \d+\s+\| /;
// const pre2 = /^/;
// const wrapper = false;

const checkSet = new Set();

function init(array, parent) {
  if (!array) array = rules;
  for (const item of array) {
    if (item.id[0] !== 'w') item.match = mergeRegex(pre, item.match);
    item.count = values[item.id] ? values[item.id] : 0;
    if (checkSet.has(item.id)) console.log('duplicate found!', item);
    checkSet.add(item.id);
    if (parent) item.parent = parent;
    if (item.children) init(item.children, item);
  }
  array.sort((a, b) => (a.count > b.count ? -1 : 1));
  return array;
}

const config = init();
module.exports = config;
