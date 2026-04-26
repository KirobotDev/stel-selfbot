/**
 * @author xql.dev
 * @description backend ../dashboard/index.html
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.3.1
 * @license MIT
 * @error "https://github.com/kirobotdev/stash/issues/9"
 */

import express from 'express';
import cors from 'cors';
import { Database } from '../utils/database';
import DatabaseSync from 'better-sqlite3';
import { join, relative } from 'path';
import fs from 'fs';

const dbPath = join(process.cwd(), 'database.sqlite');
const sqlDb = new DatabaseSync(dbPath);

const logs: { time: string, msg: string, type: 'info' | 'error' | 'ok' }[] = [];
const MAX_LOGS = 100;

const originalLog = console.log;
const originalError = console.error;

function addLogToBuffer(msg: string, type: 'info' | 'error' | 'ok' = 'info') {
    const cleanMsg = msg.replace(/\x1B\[[0-9;]*[mK]/g, ''); 
    const time = new Date().toLocaleTimeString();
    logs.push({ time, msg: cleanMsg, type });
    if (logs.length > MAX_LOGS) logs.shift();
}

function findSqliteFiles(dir: string, baseDir: string = dir): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file === 'node_modules' || file.startsWith('.')) continue;
        const filePath = join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findSqliteFiles(filePath, baseDir));
        } else if (file.endsWith('.sqlite') || file.endsWith('.db')) {
            results.push(relative(baseDir, filePath).replace(/\\/g, '/'));
        }
    }
    return results;
}

console.log = (...args: any[]) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    originalLog(...args);
    addLogToBuffer(msg, msg.includes('[OK]') ? 'ok' : 'info');
};

console.error = (...args: any[]) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    originalError(...args);
    addLogToBuffer(msg, 'error');
};

export function startServer(initialClient: any, currentConfig: any) {
    const getClient = () => (global as any).client || initialClient;
    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());

    app.use((req, res, next) => {
        if (req.path.includes('configrpctuto.mp4')) {
            try {
                const decodedPath = decodeURIComponent(req.path);
                const filePath = join(process.cwd(), 'dashboard', decodedPath);
                if (fs.existsSync(filePath)) {
                    const stat = fs.statSync(filePath);
                    if (stat.size < 1000) { 
                        return res.status(200).set('Content-Type', 'text/plain').send('Video temporarily missing');
                    }
                }
            } catch (e) {
            }
        }
        next();
    });

    app.use(express.static(join(process.cwd(), 'dashboard')));
    app.get('/', (req, res) => {
        res.sendFile(join(process.cwd(), 'dashboard', 'index.html'));
    });

    app.get('/api/status', (req, res) => {
        const client = getClient();
        const connected = client && client.user && client.user.id;
        let avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        
        if (connected) {
            try {
                avatar = client.user.displayAvatarURL({ dynamic: true, size: 256 });
            } catch {
                if (client.user.avatar) {
                    avatar = `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.png`;
                }
            }
        }

        res.json({
            connected: !!connected,
            tag: client?.user?.tag || "Non connecté",
            id: client?.user?.id || null,
            avatar: avatar,
            guilds: client?.guilds?.cache?.size || 0,
            uptime: client?.uptime || 0,
            friends: client?.relationships?.cache?.filter((t: any) => t === 1).size || 0,
            activities: client?.user?.presence?.activities || [],
        });
    });

    app.get('/api/social/friends', (req, res) => {
        const client = getClient();
        if (!client || !client.user) return res.json([]);
        const friends: any[] = [];
        
        if (client.relationships?.cache) {
            for (const [id, type] of client.relationships.cache) {
                if (type === 1) { 
                    const user = client.users.cache.get(id);
                    let avatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(id.slice(-1)) % 5}.png`;
                    if (user && user.avatar) {
                        avatar = `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.png`;
                    } else if (user) {
                        try { avatar = user.displayAvatarURL(); } catch {}
                    }
                    
                    friends.push({
                        id,
                        tag: user?.tag || `Inconnu (${id.slice(-12)})`,
                        avatar: avatar,
                        status: user?.presence?.status || 'offline'
                    });
                }
            }
        }
        res.json(friends);
    });

    app.get('/api/config', (req, res) => {
        res.json(currentConfig);
    });

    app.get('/api/multistatus/config', (req, res) => {
        try {
            const client = getClient();
            const { MultiStatusDB } = require('../utils/multistatus_db');
            const userId = client.user?.id;
            if (!userId) return res.json({ isActive: false });
            const config = MultiStatusDB.getConfig(userId);
            res.json({ isActive: config.isActive });
        } catch (e) {
            res.json({ isActive: false });
        }
    });

    app.post('/api/multistatus/toggle', (req, res) => {
        try {
            const client = getClient();
            const { MultiStatusDB } = require('../utils/multistatus_db');
            const { startMultiStatusRotation, stopMultiStatus } = require('../utils/multistatus_manager');
            const userId = client.user?.id;
            if (!userId) return res.status(400).json({ error: 'Not connected' });
            
            const { active } = req.body;
            MultiStatusDB.setActive(userId, active);
            if (active) {
                startMultiStatusRotation(client, userId);
            } else {
                stopMultiStatus(userId);
            }
            res.json({ success: true, isActive: active });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/config', (req, res) => {
        const { token, prefix } = req.body;
        if (token) currentConfig.token = token;
        if (prefix) currentConfig.prefix = prefix;
        fs.writeFileSync(join(process.cwd(), 'config.json'), JSON.stringify(currentConfig, null, 4));
        res.json({ success: true });
    });

    let currentDbName = 'database.sqlite';
    let currentSqlDb = sqlDb;

    app.get('/api/db/databases', (req, res) => {
        const files = findSqliteFiles(process.cwd());
        res.json({ files, current: currentDbName });
    });

    app.post('/api/db/switch', (req, res) => {
        const { name } = req.body;
        if (!name || (!name.endsWith('.sqlite') && !name.endsWith('.db'))) return res.status(400).json({ error: 'Invalid DB name' });
        try {
            const newDb = new DatabaseSync(join(process.cwd(), name));
            currentDbName = name;
            currentSqlDb = newDb;
            res.json({ success: true, current: currentDbName });
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/db/tables', (req, res) => {
        try {
            const tables = currentSqlDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
            res.json(tables.map(t => t.name));
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/db/data/:table', (req, res) => {
        const table = req.params.table;
        try {
            const columns = (currentSqlDb.prepare(`PRAGMA table_info(${table})`).all() as any[]).map(c => ({
                name: c.name,
                type: c.type,
                pk: c.pk,
                notnull: c.notnull,
                dflt_value: c.dflt_value
            }));
            const rows = currentSqlDb.prepare(`SELECT * FROM ${table} LIMIT 100`).all();
            res.json({ columns, rows });
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    app.post('/api/db/exec', (req, res) => {
        const { query, params } = req.body;
        try {
            const result = currentSqlDb.prepare(query).run(params || []);
            res.json(result);
        } catch (e: any) {
            res.status(400).json({ error: e.message });
        }
    });

    app.get('/api/logs', (req, res) => {
        res.json(logs);
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err.status === 416 || err.message === 'Range Not Satisfiable') {
            return res.status(416).send('Range Not Satisfiable');
        }
        console.error(err);
        res.status(500).send('Internal Server Error');
    });

    app.listen(port, () => {
        console.log(`\n\x1b[35m[DASHBOARD]\x1b[0m Interface premium: \x1b[34mhttp://localhost:${port}\x1b[0m`);
    });
}
