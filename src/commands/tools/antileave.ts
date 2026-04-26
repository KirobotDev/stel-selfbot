/**
 * @author xql.dev
 * @description Réinvite auto quelqun qui quitte le grp
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

const db = new Database(DB_PATH);

db.exec(`
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

export default {
    name: "antileave",
    description: "Réinvite un utilisateur s'il quitte un groupe DM spécifié",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const userId = client.user!.id;
        db.prepare('INSERT OR IGNORE INTO antileave_config (user_id, active) VALUES (?, 0)').run(userId);

        if (!args[0]) {
            const config = db.prepare('SELECT active FROM antileave_config WHERE user_id = ?').get(userId) as any;
            const state = config?.active ? "activé" : "désactivé";
            const count = (db.prepare('SELECT COUNT(*) as count FROM antileave_targets WHERE user_id = ?').get(userId) as any).count;

            return message.channel.send(
                `**AntiLeave** → **${state}** (${count} cibles)\n` +
                `> \`${prefix}antileave on\` / \`off\`\n` +
                `> \`${prefix}antileave add <ID_Groupe> <ID_User>\`\n` +
                `> \`${prefix}antileave remove <ID_Groupe> <ID_User>\`\n` +
                `> \`${prefix}antileave list\``
            ).then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
        }

        const sub = args[0].toLowerCase();

        if (sub === "on") {
            db.prepare('UPDATE antileave_config SET active = 1 WHERE user_id = ?').run(userId);
            message.channel.send("**AntiLeave** activé !").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "off") {
            db.prepare('UPDATE antileave_config SET active = 0 WHERE user_id = ?').run(userId);
            message.channel.send("**AntiLeave** désactivé.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "add") {
            const groupId = args[1];
            const rawTargetId = args[2];
            if (!groupId || !rawTargetId) return message.channel.send(`Usage : \`${prefix}antileave add <ID_Groupe> <ID_User/Mention>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            const targetId = rawTargetId.replace(/[<@!>]/g, '');
            db.prepare('INSERT INTO antileave_targets (user_id, group_id, target_user_id) VALUES (?, ?, ?)').run(userId, groupId, targetId);
            message.channel.send(`Surveillance activée pour <@${targetId}> dans le groupe \`${groupId}\`.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "remove") {
            const groupId = args[1];
            const rawTargetId = args[2];
            if (!groupId || !rawTargetId) return message.channel.send(`Usage : \`${prefix}antileave remove <ID_Groupe> <ID_User/Mention>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            const targetId = rawTargetId.replace(/[<@!>]/g, '');
            const res = db.prepare('DELETE FROM antileave_targets WHERE user_id = ? AND group_id = ? AND target_user_id = ?').run(userId, groupId, targetId);
            
            if (res.changes === 0) return message.channel.send("Cible non trouvée dans la liste.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            message.channel.send(`Surveillance retirée pour <@${targetId}> dans le groupe \`${groupId}\`.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "list") {
            const targets = db.prepare('SELECT group_id, target_user_id FROM antileave_targets WHERE user_id = ?').all(userId) as any[];
            if (targets.length === 0) return message.channel.send("La liste AntiLeave est vide.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            let response = "**Cibles AntiLeave :**\n";
            targets.forEach(t => {
                response += `> Groupe \`${t.group_id}\` : <@${t.target_user_id}> (\`${t.target_user_id}\`)\n`;
            });

            message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }
    }
};

export function getAntiLeaveData(userId: string) {
    const config = db.prepare('SELECT active FROM antileave_config WHERE user_id = ?').get(userId) as any;
    const targets = db.prepare('SELECT group_id, target_user_id FROM antileave_targets WHERE user_id = ?').all(userId) as { group_id: string, target_user_id: string }[];
    return {
        active: !!config?.active,
        targets: targets
    };
}
