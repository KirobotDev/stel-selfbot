/**
 * @author xql.dev
 * @description check database
 * @version 4.9.1
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 */

import DatabaseSync from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database.sqlite');
const db = new DatabaseSync(dbPath);

const rows = db.prepare('SELECT * FROM settings').all();
console.log(JSON.stringify(rows, null, 2));
db.close();
