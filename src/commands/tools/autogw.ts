/**
 * @author xql.dev
 * @description Auto-giveaway system for clicking buttons and reacting
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 * @license MIT
*/

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_PATH = join(process.cwd(), 'db', 'autogw', 'autogw.db');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
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

export default {
    name: "autogw",
    description: "Système automatique pour participer aux giveaways (boutons et réactions)",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        if (!args[0]) {
            const config = db.prepare('SELECT active FROM autogw_config WHERE id = 1').get() as any;
            const state = config?.active ? "activé" : "désactivé";
            const botsCount = db.prepare('SELECT COUNT(*) as count FROM autogw_bots').get() as any;

            return message.channel.send(
                `**Auto Giveaway** → **${state}** (${botsCount.count} bots ciblés)\n` +
                `> \`${prefix}autogw start\` • \`stop\`\n` +
                `> \`${prefix}autogw add <ID>\` • \`remove <ID>\`\n` +
                `> \`${prefix}autogw list\``
            ).then(m => setTimeout(() => m.delete().catch(() => { }), 15000));
        }

        const sub = args[0].toLowerCase();

        if (sub === "start") {
            db.prepare('UPDATE autogw_config SET active = 1 WHERE id = 1').run();
            message.channel.send("**Auto Giveaway** activé !").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }

        else if (sub === "stop") {
            db.prepare('UPDATE autogw_config SET active = 0 WHERE id = 1').run();
            message.channel.send("**Auto Giveaway** désactivé.").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }

        else if (sub === "add") {
            const rawId = args[1];
            if (!rawId) return message.channel.send(`Usage : \`${prefix}autogw add <ID>\``).then(m => setTimeout(() => m.delete().catch(() => { }), 8000));

            const botId = rawId.replace(/[<@!>]/g, '');
            db.prepare('INSERT OR IGNORE INTO autogw_bots (bot_id) VALUES (?)').run(botId);
            message.channel.send(`Bot \`${botId}\` ajouté à la liste des cibles.`).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }

        else if (sub === "remove") {
            const rawId = args[1];
            if (!rawId) return message.channel.send(`Usage : \`${prefix}autogw remove <ID>\``).then(m => setTimeout(() => m.delete().catch(() => { }), 8000));

            const botId = rawId.replace(/[<@!>]/g, '');
            const res = db.prepare('DELETE FROM autogw_bots WHERE bot_id = ?').run(botId);

            if (res.changes === 0) return message.channel.send("Ce bot n'est pas dans la liste.").then(m => setTimeout(() => m.delete().catch(() => { }), 8000));
            message.channel.send(`Bot \`${botId}\` retiré de la liste.`).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }

        else if (sub === "list") {
            const bots = db.prepare('SELECT bot_id FROM autogw_bots').all() as any[];
            if (bots.length === 0) return message.channel.send("Aucun bot ciblé.").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));

            let response = "**Bots ciblés pour les giveaways :**\n";
            bots.forEach(b => {
                response += `> <@${b.bot_id}> (\`${b.bot_id}\`)\n`;
            });

            message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => { }), 30000));
        }
    }
};

export function getAutoGWData() {
    const config = db.prepare('SELECT active FROM autogw_config WHERE id = 1').get() as any;
    const bots = db.prepare('SELECT bot_id FROM autogw_bots').all() as { bot_id: string }[];
    return {
        active: !!config?.active,
        bots: bots.map(b => b.bot_id)
    };
}
