const { dateConstruct } = require('./common');

const delimiter = [
  {
    id: 'd_01',
    act: 'resetPointer',
    desc: 'newline dash',
    members: [],
    match: /-$/,
  },
  {
    id: 'd_02',
    act: 'ignore',
    desc: 'channel next pdf image',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) $/i,
  },
  {
    id: 'd_03',
    act: 'resetPointer',
    desc: 'channel done',
    members: [...dateConstruct],
    match: /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) -$/,
  },
  {
    id: 'd_04',
    act: 'ignore',
    desc: 'extra newline',
    members: [],
    match: /$/,
  },

];

module.exports = delimiter;
