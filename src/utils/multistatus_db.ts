/**
 * @author xql.dev
 * @description database for multistatus
 * @version 0.1.9
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 * @error "https://github.com/kirobotdev/stash/issues/6"
 */

import DatabaseSync from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'db', 'multistatus.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(`
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

export interface MultiStatus {
    id?: number;
    text: string;
    emoji?: {
        id?: string;
        name: string;
        animated?: boolean;
    } | string | null;
}

export interface UserMultiConfig {
    userId: string;
    isActive: boolean;
    currentIndex: number;
    statuses: MultiStatus[];
}

export class MultiStatusDB {
    static getConfig(userId: string): UserMultiConfig {
        const configRow = db.prepare('SELECT * FROM config WHERE user_id = ?').get(userId) as any;
        
        if (!configRow) {
            db.prepare('INSERT INTO config (user_id, is_active, current_index) VALUES (?, 0, 0)').run(userId);
            return { userId, isActive: false, currentIndex: 0, statuses: [] };
        }

        const statusRows = db.prepare('SELECT * FROM statuses WHERE user_id = ? ORDER BY id ASC').all(userId) as any[];
        
        const statuses: MultiStatus[] = statusRows.map(row => {
            let emoji: any = null;
            if (row.emoji_id || row.emoji_name) {
                if (row.emoji_id === 'UNICODE') {
                    emoji = row.emoji_name;
                } else {
                    emoji = {
                        id: row.emoji_id,
                        name: row.emoji_name,
                        animated: row.emoji_animated === 1
                    };
                }
            }
            return {
                id: row.id,
                text: row.text,
                emoji
            };
        });

        return {
            userId,
            isActive: configRow.is_active === 1,
            currentIndex: configRow.current_index,
            statuses
        };
    }

    static setActive(userId: string, active: boolean) {
        db.prepare('UPDATE config SET is_active = ? WHERE user_id = ?').run(active ? 1 : 0, userId);
    }

    static updateIndex(userId: string, index: number) {
        db.prepare('UPDATE config SET current_index = ? WHERE user_id = ?').run(index, userId);
    }

    static addStatus(userId: string, text: string, emoji?: any) {
        let eId = '';
        let eName = '';
        let eAnim = 0;

        if (emoji) {
            if (typeof emoji === 'string') {
                eId = 'UNICODE';
                eName = emoji;
            } else {
                eId = emoji.id || '';
                eName = emoji.name || '';
                eAnim = emoji.animated ? 1 : 0;
            }
        }

        db.prepare('INSERT INTO statuses (user_id, text, emoji_id, emoji_name, emoji_animated) VALUES (?, ?, ?, ?, ?)')
            .run(userId, text, eId, eName, eAnim);
    }

    static removeStatus(userId: string, index: number) {
        const statuses = db.prepare('SELECT id FROM statuses WHERE user_id = ? ORDER BY id ASC').all(userId) as any[];
        if (statuses[index]) {
            db.prepare('DELETE FROM statuses WHERE id = ?').run(statuses[index].id);
        }
    }

    static clearStatuses(userId: string) {
        db.prepare('DELETE FROM statuses WHERE user_id = ?').run(userId);
        db.prepare('UPDATE config SET is_active = 0, current_index = 0 WHERE user_id = ?').run(userId);
    }
}
