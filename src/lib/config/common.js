const dateConstruct = ['t_year', 't_month', 't_day', 't_hour', 't_minute', 't_second', 't_ms'];

const memberConstruct = {
  year: 1,
  month: 1,
  day: 1,
  hour: 1,
  minute: 1,
  second: 1,
  ms: 1,
  channel: 1,
  fullpath: 1,
  filename: 1,
};

const results = {
  purge: ['file', 'folder'],
  route: ['start', 'done', 'error1', 'ignore', 'error2', 'error resolve'],
  image: [ 'start object', 'start image', 'image processing', 'image processing auto reject 1', 'image processing error', 'image processing error - critical', 'image processing error resolve', 'image processing extra', 'image processing extra error', 'image processing end', 'image processing auto reject', 'error resolve', 'error resolve ignore', 'error', 'error ignore', 'error critical', 'pdf processing' ]
};

module.exports = { dateConstruct, memberConstruct };
