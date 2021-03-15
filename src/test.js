// const { startsWith } = require('lodash');
// const path = require('path')

// const name = 'zaboravljeni';
// const name2 = 'ozaboravljeni-1-1';
// const name3 = 'zaboravljeni-1-1.tiff'

// if (name.length > 3 && startsWith(name2, name, 1)) {
//   console.log('difference should be 4-6 long')
//   console.log('name should be 1+ long')
//   console.log('indexof must be 0')
//   console.log(name2.indexOf(name));
//   console.log('parent is %d long', name.length);
//   console.log('child is %d long', name2.length);
//   console.log('difference is %d', name2.length - name.length);
// }

// console.log(path.parse(name3).ext === '.tiff')

const str1 = `jvm 1    | 20210202 17:29:11.923 INSPECT UserName: bikickre ImageName: 662e9322-5c34-4c48-8016-25aa05ee0f8e.jpg(5082) InspectorChannel: klz-inspectorEdit Action: Use Processed PStime:0 sec.`
const str2 = `jvm 1    | 20210202 17:32:55.696 INSPECT UserName: bikickre ImageName: 308fca2b-3c14-4a21-88c2-ac6fa5bc02b8.jpg(5086) InspectorChannel: klz-inspectorEdit Action: Use Processed`

const regex = /(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2}).(\d{3}) INSPECT UserName: (.+) ImageName: (.+)\((\d+)\) InspectorChannel: (.+) Action: ([\w ]+)(?: PStime:(\d+) sec\.)?$/

// console.log(regex.exec(str1)[13])
// console.log(regex.exec(str2)[13])


const result = [
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 1, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 1, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
  { changes: 0, lastInsertRowid: 0 },
]

console.log(result.reduce((acc, val) => acc + val.changes, 0))