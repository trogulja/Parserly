const db = require('./index');
const notifier = require('../util/notifier');
/** @typedef {import('../getFiles').FileObject} FileObject */

/** writeFiles(files)
 * - Write files into the database and return write results for each insert
 * @param {Array.<FileObject>} files Array of file objects to be written into db
 * @returns {Array.<{ changes: number, lastInsertRowid: number }>} Inserts
 */
const writeFiles = files => {
  try {
    const insert = db.prepare('INSERT OR IGNORE INTO files (hash, lines, firstLine, firstDate, lastLine, lastDate) VALUES (@hash, @lines, @firstLine, @firstDate, @lastLine, @lastDate)');
    const insertMany = db.transaction(files => files.map(file => insert.run(file)));
    return insertMany(files);
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    notifier.emit('log', { event: 'error', text: JSON.stringify(error), meta: { job: 'writeFiles', status: 'failed' } });
    console.log(error);
    return false;
  }
};

module.exports = writeFiles;
