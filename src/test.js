const { startsWith } = require('lodash');
const path = require('path')

const name = 'zaboravljeni';
const name2 = 'ozaboravljeni-1-1';
const name3 = 'zaboravljeni-1-1.tiff'

if (name.length > 3 && startsWith(name2, name, 1)) {
  console.log('difference should be 4-6 long')
  console.log('name should be 1+ long')
  console.log('indexof must be 0')
  console.log(name2.indexOf(name));
  console.log('parent is %d long', name.length);
  console.log('child is %d long', name2.length);
  console.log('difference is %d', name2.length - name.length);
}

console.log(path.parse(name3).ext === '.tiff')