/**
 * @author xql.dev
 * @description lock 
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_PATH = join(process.cwd(), 'db', 'voice', 'voicelock.sqlite');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
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

export default {
    name: "voicelock",
    description: "Verrouille un salon vocal à un certain nombre d'utilisateurs",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        if (args[0] === 'off') {
            const channelId = args[1] || message.member?.voice.channel?.id;
            if (!channelId) {
                return message.channel.send(`Usage : \`${prefix}voicelock off <ID_VOCAL>\` (ou sois dans le vocal)`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
            }
            db.prepare('DELETE FROM locks WHERE channel_id = ?').run(channelId);
            return message.channel.send(`Le salon vocal \`${channelId}\` n'est plus verrouillé.`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
        }

        const channelId = args[0];
        const maxUsersStr = args[1];

        if (!channelId || !maxUsersStr || isNaN(parseInt(maxUsersStr))) {
            return message.channel.send(`Usage : \`${prefix}voicelock <ID_VOCAL> <NB_MAX>\` (ou \`${prefix}voicelock off\`)`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
        }

        const maxUsers = parseInt(maxUsersStr);

        let channel;
        try {
            channel = message.guild?.channels.cache.get(channelId) || await message.guild?.channels.fetch(channelId);
        } catch {}

        if (!channel || ![2, 13, 'GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes((channel as any).type)) {
            return message.channel.send("Salon vocal introuvable ou invalide.")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        db.prepare('INSERT OR REPLACE INTO locks (channel_id, max_users) VALUES (?, ?)').run(channelId, maxUsers);

        message.channel.send(`Le salon vocal \`${channel.name}\` est maintenant verrouillé à **${maxUsers}** personnes max.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
    }
};

export function getVoiceLock(channelId: string): number | null {
    const res = db.prepare('SELECT max_users FROM locks WHERE channel_id = ?').get(channelId) as any;
    return res ? res.max_users : null;
}

export function isWhitelisted(channelId: string, userId: string): boolean {
    const res = db.prepare('SELECT 1 FROM whitelist WHERE channel_id = ? AND user_id = ?').get(channelId, userId);
    return !!res;
}

export function addWhitelist(channelId: string, userId: string) {
    db.prepare('INSERT OR IGNORE INTO whitelist (channel_id, user_id) VALUES (?, ?)').run(channelId, userId);
}

export function removeWhitelist(channelId: string, userId: string) {
    db.prepare('DELETE FROM whitelist WHERE channel_id = ? AND user_id = ?').run(channelId, userId);
}
