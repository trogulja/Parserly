const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'imaginary');
let result;
try {
  result = fs.statSync(dir).isDirectory();
} catch (error) {
  result = error.code;
}
console.log(result);
