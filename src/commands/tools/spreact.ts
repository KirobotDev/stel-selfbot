/**
 * @author xql.dev
 * @description Auto-reaction system managed by SQLite
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_PATH = join(process.cwd(), 'db', 'spreact', 'spreact.db');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS spreact_targets (
    user_id TEXT PRIMARY KEY,
    emoji TEXT NOT NULL,
    active INTEGER DEFAULT 1
);
`);

export default {
    name: "spreact",
    description: "Ajoute une réaction automatique aux messages d'un utilisateur",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const cleanId = (text: string) => text.replace(/[<@!>]/g, '');

        if (!args[0]) {
            return message.channel.send(
                `**Spreact Commands**\n> \`${prefix}spreact start <ID/Mention> <Emoji>\`\n` +
                `> \`${prefix}spreact stop <ID/Mention>\`\n` +
                `> \`${prefix}spreact list\``
            ).then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
        }

        const sub = args[0].toLowerCase();

        if (sub === "start") {
            const rawId = args[1];
            const emoji = args[2];

            if (!rawId || !emoji) {
                return message.channel.send(`Usage : \`${prefix}spreact start <ID/Mention> <Emoji>\``)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            const targetId = cleanId(rawId);
            db.prepare('INSERT OR REPLACE INTO spreact_targets (user_id, emoji, active) VALUES (?, ?, 1)').run(targetId, emoji);
            message.channel.send(`Réaction auto activée pour <@${targetId}> avec l'emoji ${emoji}`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "stop") {
            const rawId = args[1];
            if (!rawId) {
                return message.channel.send(`Usage : \`${prefix}spreact stop <ID/Mention>\``)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            const targetId = cleanId(rawId);
            const res = db.prepare('DELETE FROM spreact_targets WHERE user_id = ?').run(targetId);
            if (res.changes === 0) {
                return message.channel.send("Cet utilisateur n'est pas dans la liste des cibles.").then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
            }

            message.channel.send(`Réaction auto désactivée pour l'utilisateur \`${targetId}\`.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "list") {
            const targets = db.prepare('SELECT user_id, emoji FROM spreact_targets WHERE active = 1').all() as any[];
            if (targets.length === 0) {
                return message.channel.send("Aucune cible de réaction auto active.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            let response = "**Cibles Spreact actives :**\n";
            targets.forEach(t => {
                response += `> <@${t.user_id}> (\`${t.user_id}\`) : ${t.emoji}\n`;
            });

            message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }
        
        else {
            message.channel.send(`**Spreact** : \`${prefix}spreact\` <\`start\` • \`stop\` • \`list\`>`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }
    }
};

export function getSpreactTargets() {
    return db.prepare('SELECT user_id, emoji FROM spreact_targets WHERE active = 1').all() as { user_id: string, emoji: string }[];
}
