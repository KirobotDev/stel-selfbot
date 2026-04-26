/**
 * @author xql.dev
 * @description enable spotify
 * @version 2.0.1
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 */

import DatabaseSync from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database.sqlite');
const db = new DatabaseSync(dbPath);

const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
upsert.run('spotifyonoff', 'true');
console.log('Spotify force-enabled in database.');
db.close();
