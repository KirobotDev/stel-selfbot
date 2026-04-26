import DatabaseSync from 'better-sqlite3';
import { join } from 'path';
import * as fs from 'fs';

const dbDir = join(process.cwd(), 'db', 'tracker');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'user-tracker.sqlite');
const db = new DatabaseSync(dbPath);

export interface TrackedActivity {
    name: string;
    type: number;
    timestamp: number;
}

export interface StatusChange {
    from: string;
    to: string;
    timestamp: number;
}

export interface ConnectionRecord {
    type: string;
    timestamp: number;
}

export interface TrackedUser {
    userId: string;
    username: string;
    addedAt: number;
    activities: TrackedActivity[];
    statusChanges: StatusChange[];
    connections: ConnectionRecord[];
}

db.exec(`
    CREATE TABLE IF NOT EXISTS tracker (
        userId TEXT PRIMARY KEY,
        username TEXT,
        addedAt INTEGER,
        activities TEXT,
        statusChanges TEXT,
        connections TEXT
    );
`);

export class TrackerDB {
    private static parseUser(row: any): TrackedUser {
        return {
            userId: row.userId,
            username: row.username,
            addedAt: row.addedAt,
            activities: JSON.parse(row.activities),
            statusChanges: JSON.parse(row.statusChanges),
            connections: JSON.parse(row.connections)
        };
    }

    static getAllTracteds(): TrackedUser[] {
        const rows = db.prepare('SELECT * FROM tracker').all() as any[];
        return rows.map(this.parseUser);
    }

    static getTrackedUser(userId: string): TrackedUser | null {
        const row = db.prepare('SELECT * FROM tracker WHERE userId = ?').get(userId);
        if (!row) return null;
        return this.parseUser(row);
    }

    static startTracking(userId: string, username: string): boolean {
        if (this.getTrackedUser(userId)) return false;

        const stmt = db.prepare(`
            INSERT INTO tracker (userId, username, addedAt, activities, statusChanges, connections)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            userId,
            username,
            Date.now(),
            JSON.stringify([]),
            JSON.stringify([]),
            JSON.stringify([])
        );
        return true;
    }

    static stopTracking(userId: string): boolean {
        const info = db.prepare('DELETE FROM tracker WHERE userId = ?').run(userId);
        return info.changes > 0;
    }

    private static updateUser(user: TrackedUser) {
        if (user.statusChanges.length > 100) user.statusChanges = user.statusChanges.slice(-100);
        if (user.activities.length > 100) user.activities = user.activities.slice(-100);
        if (user.connections.length > 100) user.connections = user.connections.slice(-100);

        const stmt = db.prepare(`
            UPDATE tracker
            SET username = ?, activities = ?, statusChanges = ?, connections = ?
            WHERE userId = ?
        `);

        stmt.run(
            user.username,
            JSON.stringify(user.activities),
            JSON.stringify(user.statusChanges),
            JSON.stringify(user.connections),
            user.userId
        );
    }

    static addStatusChange(userId: string, from: string, to: string) {
        const user = this.getTrackedUser(userId);
        if (!user) return;

        user.statusChanges.push({
            from,
            to,
            timestamp: Date.now()
        });
        
        this.updateUser(user);
    }

    static addActivity(userId: string, activityName: string, type: number) {
        const user = this.getTrackedUser(userId);
        if (!user) return;

        user.activities.push({
            name: activityName,
            type: type,
            timestamp: Date.now()
        });

        this.updateUser(user);
    }

    static addConnection(userId: string, type: string) {
        const user = this.getTrackedUser(userId);
        if (!user) return;

        user.connections.push({
            type,
            timestamp: Date.now()
        });

        this.updateUser(user);
    }
}
