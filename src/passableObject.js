const config = require('./lib/config');
const tables = ['crop', 'dlink', 'pImg', 'pIns', 'pObj', 'purge', 'route', 'system'];
const po = { detectedDefault: {}, detected: {}, output: {}, names: new Set(), days: new Set(), configPointer: new Set(), config };
tables.forEach((el) => {
  po.detectedDefault[el] = {};
  po.detected[el] = {};
  po.output[el] = [];
});

module.exports = po;
console.dir(po, { depth: 1 });


const rules = {
  pObj: {}
}