/**
 * @author xql.dev
 * @description Rotate de la bio
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_PATH = join(process.cwd(), 'db', 'rotate', 'descriptionrotate.db');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
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

const intervals = new Map<string, NodeJS.Timeout>();

async function setBioSafe(client: Client, text: string) {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch('https://discord.com/api/v9/users/@me/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': (client as any).token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bio: text })
            });
            if (res.ok) return true;
        } catch (err: any) {
            if (i === 2) console.error("Échec bio après 3 essais:", err.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    return false;
}

export function initRotation(client: Client) {
    const userId = client.user!.id;
    const status = db.prepare('SELECT active FROM rotate_status WHERE user_id = ?').get(userId) as any;
    
    if (status?.active) {
        startRotation(client);
    }
}

function startRotation(client: Client) {
    const userId = client.user!.id;
    if (intervals.has(userId)) clearInterval(intervals.get(userId)!);

    const interval = setInterval(async () => {
        const status = db.prepare('SELECT current_index, active FROM rotate_status WHERE user_id = ?').get(userId) as any;
        if (!status || !status.active) {
            clearInterval(interval);
            intervals.delete(userId);
            return;
        }

        const items = db.prepare('SELECT content FROM rotate_items WHERE user_id = ?').all(userId) as any[];
        if (!items.length) {
            clearInterval(interval);
            intervals.delete(userId);
            db.prepare('UPDATE rotate_status SET active = 0 WHERE user_id = ?').run(userId);
            return;
        }

        const nextIndex = status.current_index % items.length;
        const text = items[nextIndex].content;
        
        const success = await setBioSafe(client, text);
        if (success) {
            db.prepare('UPDATE rotate_status SET current_index = ? WHERE user_id = ?')
                .run((nextIndex + 1) % items.length, userId);
        }
    }, 30000);

    intervals.set(userId, interval);
}

export default {
    name: "descriptionrotate",
    description: "Fait tourner vos descriptions de profil automatiquement",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const userId = client.user!.id;
        const subcommands = ["add", "remove", "list", "start", "stop"];
        const synonyms: { [key: string]: string } = {
            "on": "start",
            "off": "stop",
            "delete": "remove",
            "del": "remove",
            "show": "list",
            "listing": "list"
        };

        db.prepare('INSERT OR IGNORE INTO rotate_status (user_id, active, current_index) VALUES (?, 0, 0)').run(userId);

        if (!args[0]) {
            const status = db.prepare('SELECT active FROM rotate_status WHERE user_id = ?').get(userId) as any;
            const itemsCount = db.prepare('SELECT COUNT(*) as count FROM rotate_items WHERE user_id = ?').get(userId) as any;
            const state = status?.active ? "activé" : "désactivé";
            return message.channel.send(`**Description Rotate** → **${state}** (${itemsCount.count}/10)\n> \`${prefix}descriptionrotate <add|remove|list|start|stop>\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
        }

        let sub = args[0].toLowerCase();

        if (!subcommands.includes(sub)) {
            if (synonyms[sub]) {
                const suggested = synonyms[sub];
                return message.channel.send(`Commande inconnue. Vouliez-vous dire \`${prefix}descriptionrotate ${suggested}\` ?`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            const closest = subcommands.find(s => s.startsWith(sub.slice(0, 1)) || sub.startsWith(s.slice(0, 1)));
            if (closest) {
                return message.channel.send(`Commande inconnue. Vouliez-vous dire \`${prefix}descriptionrotate ${closest}\` ?`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            return message.channel.send(`**Description Rotate** : \`${prefix}descriptionrotate\` <\`add\` • \`remove\` • \`list\` • \`start\` • \`stop\`>`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (sub === "start") {
            const itemsCount = db.prepare('SELECT COUNT(*) as count FROM rotate_items WHERE user_id = ?').get(userId) as any;
            if (itemsCount.count === 0) return message.channel.send("Aucune description enregistrée.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            const status = db.prepare('SELECT active FROM rotate_status WHERE user_id = ?').get(userId) as any;
            if (status?.active) return message.channel.send("La rotation est déjà activée.").then(m => setTimeout(() => m.delete().catch(() => {}), 8000));

            db.prepare('UPDATE rotate_status SET active = 1 WHERE user_id = ?').run(userId);
            startRotation(client);
            message.channel.send("Rotation activée (30s) !").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "stop") {
            const status = db.prepare('SELECT active FROM rotate_status WHERE user_id = ?').get(userId) as any;
            if (!status?.active) return message.channel.send("La rotation est déjà désactivée.").then(m => setTimeout(() => m.delete().catch(() => {}), 8000));

            db.prepare('UPDATE rotate_status SET active = 0 WHERE user_id = ?').run(userId);
            if (intervals.has(userId)) {
                clearInterval(intervals.get(userId)!);
                intervals.delete(userId);
            }
            message.channel.send("Rotation désactivée.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "add") {
            const text = args.slice(1).join(" ");
            if (!text) return message.channel.send(`Usage : \`${prefix}descriptionrotate add <texte>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            if (text.length > 190) return message.channel.send("Le texte est trop long (max 190 caractères).").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            const countRes = db.prepare('SELECT COUNT(*) as count FROM rotate_items WHERE user_id = ?').get(userId) as any;
            if (countRes.count >= 10) return message.channel.send("Vous avez atteint la limite de 10 descriptions.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            db.prepare('INSERT INTO rotate_items (user_id, content) VALUES (?, ?)').run(userId, text);
            message.channel.send(`Description ajoutée (${countRes.count + 1}/10) !`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        else if (sub === "list") {
            const items = db.prepare('SELECT id, content FROM rotate_items WHERE user_id = ?').all(userId) as any[];
            if (items.length === 0) return message.channel.send("Aucune description enregistrée.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            let listMsg = "**Vos Descriptions :**\n\n";
            items.forEach((item, i) => {
                listMsg += `${i + 1}. \`${item.content.replace(/`/g, '\\`')}\`\n`;
            });

            message.channel.send(listMsg).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        else if (sub === "remove") {
            const num = parseInt(args[1]);
            if (!args[1] || isNaN(num)) return message.channel.send(`Usage : \`${prefix}descriptionrotate remove <numéro>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            const items = db.prepare('SELECT id FROM rotate_items WHERE user_id = ?').all(userId) as any[];
            const target = items[num - 1];
            if (!target) return message.channel.send("Numéro de description invalide.").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            db.prepare('DELETE FROM rotate_items WHERE id = ?').run(target.id);
            db.prepare('UPDATE rotate_status SET current_index = 0 WHERE user_id = ?').run(userId);
            
            message.channel.send("Description supprimée !").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }
    }
};
