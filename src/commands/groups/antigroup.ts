/**
 * @author xql.dev
 * @description Gère la protection group
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_PATH = join(process.cwd(), 'db', 'protection', 'protection.db');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH);

db.exec(`
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
`);

export default {
    name: "antigroup",
    description: "Protection contre les ajouts en groupe non désirés",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const userId = client.user!.id;

        db.prepare('INSERT OR IGNORE INTO antigroup_config (user_id, enabled) VALUES (?, 0)').run(userId);

        if (!args[0]) {
            const config = db.prepare('SELECT enabled, message FROM antigroup_config WHERE user_id = ?').get(userId) as any;
            const status = config?.enabled ? "activé" : "désactivé";
            const wlCount = (db.prepare('SELECT COUNT(*) as count FROM antigroup_whitelist WHERE user_id = ?').get(userId) as any).count;
            const locksCount = (db.prepare('SELECT COUNT(*) as count FROM antigroup_locks WHERE user_id = ?').get(userId) as any).count;

            const helpMsg = `**AntiGroup** → **${status}**\n` +
                `> Whitelist : \`${wlCount}\` cibles\n` +
                `> Verrous : \`${locksCount}\` groupes\n\n` +
                `**Commandes :**\n` +
                `> \`${prefix}antigroup on\` / \`off\`\n` +
                `> \`${prefix}antigroup wl <ID/Mention>\` / \`unwl <ID/Mention>\`\n` +
                `> \`${prefix}antigroup setmsg <texte>\` / \`stop setmsg\`\n` +
                `> \`${prefix}antigroup lock <nombre> [ID_Groupe]\` / \`unlock [ID_Groupe]\`\n` +
                `> \`${prefix}antigroup list\``;

            return message.channel.send(helpMsg).then(m => setTimeout(() => m.delete().catch(() => {}), 20000));
        }

        const sub = args[0].toLowerCase();

        if (sub === "on") {
            db.prepare('UPDATE antigroup_config SET enabled = 1 WHERE user_id = ?').run(userId);
            message.channel.send("**AntiGroup** activé !").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "off") {
            db.prepare('UPDATE antigroup_config SET enabled = 0 WHERE user_id = ?').run(userId);
            message.channel.send("**AntiGroup** désactivé.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "wl") {
            const rawId = args[1];
            if (!rawId) return message.channel.send(`Usage : \`${prefix}antigroup wl <ID/Mention>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            const targetId = rawId.replace(/[<@!>]/g, '');
            db.prepare('INSERT OR IGNORE INTO antigroup_whitelist (user_id, whitelisted_id) VALUES (?, ?)').run(userId, targetId);
            message.channel.send(`Utilisateur \`${targetId}\` ajouté à la whitelist.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "unwl") {
            const rawId = args[1];
            if (!rawId) return message.channel.send(`Usage : \`${prefix}antigroup unwl <ID/Mention>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            const targetId = rawId.replace(/[<@!>]/g, '');
            db.prepare('DELETE FROM antigroup_whitelist WHERE user_id = ? AND whitelisted_id = ?').run(userId, targetId);
            message.channel.send(`Utilisateur \`${targetId}\` retiré de la whitelist.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "setmsg") {
            const msg = args.slice(1).join(" ");
            if (!msg) return message.channel.send(`Usage : \`${prefix}antigroup setmsg <texte>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            db.prepare('UPDATE antigroup_config SET message = ? WHERE user_id = ?').run(msg, userId);
            message.channel.send("Message d'AntiGroup défini !").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "stop" && args[1]?.toLowerCase() === "setmsg") {
            db.prepare('UPDATE antigroup_config SET message = NULL WHERE user_id = ?').run(userId);
            message.channel.send("Message d'AntiGroup supprimé.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "lock") {
            const limit = parseInt(args[1]);
            const groupId = args[2] || message.channel.id;

            if (isNaN(limit) || !groupId) return message.channel.send(`Usage : \`${prefix}antigroup lock <nombre> [ID_Groupe]\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            db.prepare('INSERT OR REPLACE INTO antigroup_locks (user_id, group_id, member_limit) VALUES (?, ?, ?)').run(userId, groupId, limit);
            message.channel.send(`Groupe \`${groupId}\` verrouillé à \`${limit}\` membres.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "unlock") {
            const groupId = args[1] || message.channel.id;
            db.prepare('DELETE FROM antigroup_locks WHERE user_id = ? AND group_id = ?').run(userId, groupId);
            message.channel.send(`Verrouillage supprimé pour le groupe \`${groupId}\`.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "list") {
            const wl = db.prepare('SELECT whitelisted_id FROM antigroup_whitelist WHERE user_id = ?').all(userId) as any[];
            const locks = db.prepare('SELECT group_id, member_limit FROM antigroup_locks WHERE user_id = ?').all(userId) as any[];

            let response = "**Configuration AntiGroup**\n\n**Whitelist :**\n";
            if (wl.length === 0) response += "> *Aucun utilisateur*\n";
            else wl.forEach(w => response += `> \`${w.whitelisted_id}\` (<@${w.whitelisted_id}>)\n`);

            response += "\n**Verrous :**\n";
            if (locks.length === 0) response += "> *Aucun verrou*\n";
            else locks.forEach(l => response += `> \`${l.group_id}\` : limite ${l.member_limit}\n`);

            message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }
    }
};

export function getAntiGroupConfig(userId: string) {
    const config = db.prepare('SELECT enabled, message FROM antigroup_config WHERE user_id = ?').get(userId) as any;
    const wl = db.prepare('SELECT whitelisted_id FROM antigroup_whitelist WHERE user_id = ?').all(userId) as { whitelisted_id: string }[];
    const locks = db.prepare('SELECT group_id, member_limit FROM antigroup_locks WHERE user_id = ?').all(userId) as { group_id: string, member_limit: number }[];
    
    return {
        enabled: !!config?.enabled,
        message: config?.message || null,
        whitelist: wl.map(w => w.whitelisted_id),
        locks: locks
    };
}

export function getNameLock(groupId: string) {
    const lock = db.prepare('SELECT locked_name FROM group_name_locks WHERE group_id = ?').get(groupId) as { locked_name: string };
    return lock?.locked_name || null;
}

export function getPDPLock(groupId: string) {
    const lock = db.prepare('SELECT locked_url FROM group_pdp_locks WHERE group_id = ?').get(groupId) as { locked_url: string };
    return lock?.locked_url || null;
}
