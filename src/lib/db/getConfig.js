const db = require('./index');

/**
 * Gets key value pairs from config table and everything from files table
 * - config = key: value
 * - files = Map(hash, files.row)
 * @returns {{ config: {}, files: [] }}
 */
const getConfig = () => {
  try {
    const query1 = db.prepare('SELECT * FROM config');
    const query2 = db.prepare('SELECT * FROM files');
    const configRaw = query1.all();
    const config = {};
    configRaw.forEach(e => {
      config[e.key] = e.value;
    });

    const filesRaw = query2.all();
    const files = new Map();
    filesRaw.forEach(f => {
      files.set(f.hash, { ...f });
    });

    return { config, files };
  } catch (error) {
    console.log(error);
    return false;
  }
};

const config = getConfig();
module.exports = config;
