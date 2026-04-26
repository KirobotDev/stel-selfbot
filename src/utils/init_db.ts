/**
 * @author xql.dev
 * @description Database initialization script
 * @version 1.0.0
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 */

import DatabaseSync from 'better-sqlite3';
import { join, dirname } from 'path';
import * as fs from 'fs';

const rootDir = process.cwd();

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      //  console.log(`[INIT_DB] Created directory: ${dir}`);
    }
}

export function initAllDatabases() {
  //  console.log('[INIT_DB] Initializing all databases...');

    const mainDbPath = join(rootDir, 'database.sqlite');
    const mainDb = new DatabaseSync(mainDbPath);
    mainDb.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    `);
    mainDb.close();
 //  console.log('[INIT_DB] Initialized database.sqlite');

    const usersDbPath = join(rootDir, 'users.sqlite');
    const usersDb = new DatabaseSync(usersDbPath);
    usersDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
            discordId TEXT PRIMARY KEY,
            token TEXT NOT NULL,
            username TEXT,
            prefix TEXT DEFAULT '+',
            status TEXT DEFAULT 'active',
            lastConnected DATETIME
        );
    `);
    usersDb.close();
   // console.log('[INIT_DB] Initialized users.sqlite');

    ensureDir(join(rootDir, 'db'));
    const multiStatusPath = join(rootDir, 'db', 'multistatus.sqlite');
    const multiStatusDb = new DatabaseSync(multiStatusPath);
    multiStatusDb.exec(`
        CREATE TABLE IF NOT EXISTS config (
            user_id TEXT PRIMARY KEY,
            is_active INTEGER DEFAULT 0,
            current_index INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS statuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            text TEXT,
            emoji_id TEXT,
            emoji_name TEXT,
            emoji_animated INTEGER,
            FOREIGN KEY(user_id) REFERENCES config(user_id)
        );
    `);
    multiStatusDb.close();
 //   console.log('[INIT_DB] Initialized db/multistatus.sqlite');

    ensureDir(join(rootDir, 'db', 'autogw'));
    const autogwPath = join(rootDir, 'db', 'autogw', 'autogw.db');
    const autogwDb = new DatabaseSync(autogwPath);
    autogwDb.exec(`
        CREATE TABLE IF NOT EXISTS autogw_config (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            active INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS autogw_bots (
            bot_id TEXT PRIMARY KEY
        );

        INSERT OR IGNORE INTO autogw_config (id, active) VALUES (1, 0);
        INSERT OR IGNORE INTO autogw_bots (bot_id) VALUES ('294882584201003009');
    `);
    autogwDb.close();
 //   console.log('[INIT_DB] Initialized db/autogw/autogw.db');

    ensureDir(join(rootDir, 'db', 'protection'));
    const protectionPath = join(rootDir, 'db', 'protection', 'protection.db');
    const protectionDb = new DatabaseSync(protectionPath);
    protectionDb.exec(`
        CREATE TABLE IF NOT EXISTS antigroup_config (
            user_id TEXT PRIMARY KEY,
            enabled INTEGER DEFAULT 0,
            message TEXT DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS antigroup_whitelist (
            user_id TEXT NOT NULL,
            whitelisted_id TEXT NOT NULL,
            PRIMARY KEY (user_id, whitelisted_id)
        );

        CREATE TABLE IF NOT EXISTS antigroup_locks (
            user_id TEXT NOT NULL,
            group_id TEXT NOT NULL,
            member_limit INTEGER NOT NULL,
            PRIMARY KEY (user_id, group_id)
        );

        CREATE TABLE IF NOT EXISTS group_name_locks (
            user_id TEXT NOT NULL,
            group_id TEXT NOT NULL,
            locked_name TEXT NOT NULL,
            PRIMARY KEY (user_id, group_id)
        );

        CREATE TABLE IF NOT EXISTS group_pdp_locks (
            user_id TEXT NOT NULL,
            group_id TEXT NOT NULL,
            locked_url TEXT NOT NULL,
            PRIMARY KEY (user_id, group_id)
        );

        CREATE TABLE IF NOT EXISTS antileave_config (
            user_id TEXT PRIMARY KEY,
            active INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS antileave_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            group_id TEXT NOT NULL,
            target_user_id TEXT NOT NULL
        );
    `);
    protectionDb.close();
    // console.log('[INIT_DB] Initialized db/protection/protection.db');

    ensureDir(join(rootDir, 'db', 'rotate'));
    const rotatePath = join(rootDir, 'db', 'rotate', 'descriptionrotate.db');
    const rotateDb = new DatabaseSync(rotatePath);
    rotateDb.exec(`
        CREATE TABLE IF NOT EXISTS rotate_status (
            user_id TEXT PRIMARY KEY,
            active INTEGER DEFAULT 0,
            current_index INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS rotate_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL
        );
    `);
    rotateDb.close();
    // console.log('[INIT_DB] Initialized db/rotate/descriptionrotate.db');

    ensureDir(join(rootDir, 'db', 'spreact'));
    const spreactPath = join(rootDir, 'db', 'spreact', 'spreact.db');
    const spreactDb = new DatabaseSync(spreactPath);
    spreactDb.exec(`
        CREATE TABLE IF NOT EXISTS spreact_targets (
            user_id TEXT PRIMARY KEY,
            emoji TEXT NOT NULL,
            active INTEGER DEFAULT 1
        );
    `);
    spreactDb.close();
   // console.log('[INIT_DB] Initialized db/spreact/spreact.db');

    ensureDir(join(rootDir, 'db', 'voice'));
    const voicePath = join(rootDir, 'db', 'voice', 'voicelock.sqlite');
    const voiceDb = new DatabaseSync(voicePath);
    voiceDb.exec(`
        CREATE TABLE IF NOT EXISTS locks (
            channel_id TEXT PRIMARY KEY,
            max_users INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS whitelist (
            channel_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            PRIMARY KEY (channel_id, user_id)
        );
    `);
    voiceDb.close();
   // console.log('[INIT_DB] Initialized db/voice/voicelock.sqlite');

    ensureDir(join(rootDir, 'db', 'tracker'));
    const trackerPath = join(rootDir, 'db', 'tracker', 'user-tracker.sqlite');
    const trackerDb = new DatabaseSync(trackerPath);
    trackerDb.exec(`
        CREATE TABLE IF NOT EXISTS tracker (
            userId TEXT PRIMARY KEY,
            username TEXT,
            addedAt INTEGER,
            activities TEXT,
            statusChanges TEXT,
            connections TEXT
        );
    `);
    trackerDb.close();
  //  console.log('[INIT_DB] Initialized db/tracker/user-tracker.sqlite');

    ensureDir(join(rootDir, 'db', 'owner'));
    const ownerPath = join(rootDir, 'db', 'owner', 'owner.sqlite');
    const ownerDb = new DatabaseSync(ownerPath);
    ownerDb.exec(`
        CREATE TABLE IF NOT EXISTS owners (
            user_id TEXT PRIMARY KEY
        );
    `);
    ownerDb.close();
   // console.log('[INIT_DB] Initialized db/owner/owner.sqlite');

    const backupDir = join(rootDir, 'src', 'commands', 'backup', 'db_backup');
    ensureDir(backupDir);
    const backupPath = join(backupDir, 'backup.db');
    const backupDb = new DatabaseSync(backupPath);
    backupDb.exec(`
        CREATE TABLE IF NOT EXISTS backups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            guild_id TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
    `);
    backupDb.close();
   // console.log('[INIT_DB] Initialized src/commands/backup/db_backup/backup.db');

    const proxyPath = join(rootDir, 'db', 'proxy.sqlite');
    const proxyDb = new DatabaseSync(proxyPath);
    proxyDb.close();
   // console.log('[INIT_DB] Initialized db/proxy.sqlite');

   // console.log('[INIT_DB] All databases initialized successfully!');
}

if (require.main === module) {
    initAllDatabases();
}
