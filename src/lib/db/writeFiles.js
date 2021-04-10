const db = require('./index');

const writeFiles = files => {
  try {
    const insert = db.prepare('INSERT OR IGNORE INTO files (hash, lines, firstLine, firstDate, lastLine, lastDate) VALUES (@hash, @lines, @firstLine, @firstDate, @lastLine, @lastDate)');
    const insertMany = db.transaction(files => files.map(file => insert.run(file)));
    return insertMany(files);
  } catch (error) {
    if (!db.inTransaction) throw error; // (transaction was forcefully rolled back)
    console.log(error);
    return false;
  }
};

module.exports = writeFiles;
