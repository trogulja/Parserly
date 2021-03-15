const Database = require('better-sqlite3');
const fs = require('fs');
const paths = require('../util/pathHandler');
const path = require('path');

const db = new Database(paths.database);
const schema = fs.readFileSync(path.join(paths.db, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
