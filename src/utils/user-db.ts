import DatabaseSync from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'users.sqlite');
const db = new DatabaseSync(dbPath);

export interface UserAccount {
    discordId: string;
    token: string;
    username: string;
    prefix: string;
    status: 'active' | 'inactive';
    lastConnected?: string;
}

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        discordId TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        username TEXT,
        prefix TEXT DEFAULT '+',
        status TEXT DEFAULT 'active',
        lastConnected DATETIME
    );
`);

export class UserDatabase {
    static getAllAccounts(): UserAccount[] {
        return db.prepare('SELECT * FROM users').all() as UserAccount[];
    }

    static getAccount(discordId: string): UserAccount | null {
        return db.prepare('SELECT * FROM users WHERE discordId = ?').get(discordId) as UserAccount || null;
    }

    static saveAccount(account: UserAccount) {
        const upsert = db.prepare(`
            INSERT OR REPLACE INTO users (discordId, token, username, prefix, status, lastConnected)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        upsert.run(
            account.discordId,
            account.token,
            account.username,
            account.prefix,
            account.status,
            account.lastConnected || new Date().toISOString()
        );
    }

    static deleteAccount(discordId: string) {
        db.prepare('DELETE FROM users WHERE discordId = ?').run(discordId);
    }

    static updateStatus(discordId: string, status: 'active' | 'inactive') {
        db.prepare('UPDATE users SET status = ? WHERE discordId = ?').run(status, discordId);
    }
}
