/**
 * @author xql.dev
 * @description Systeme de backup d'emojis
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message, Permissions } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join } from 'path';
import axios from 'axios';

const DB_PATH = join(process.cwd(), 'src', 'commands', 'backup', 'db_backup', 'backup.db');
const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS emoji_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    guild_id TEXT NOT NULL,
    emoji_data TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
`);

export default {
    name: "backupemoji",
    description: "Système de backup d'emojis (create/load/list/delete)",
    usage: "<create/load/list/delete> [extra]",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch {}

        const cmd = args[0]?.toLowerCase();
        const userId = message.author.id;

        if (!cmd) {
            return message.channel.send(`**Backup Emoji Commands**\n> \`${prefix}backupemoji create <guild_id>\` → Créer une backup d'emojis\n> \`${prefix}backupemoji load <code>\` → Charger une backup d'emojis\n> \`${prefix}backupemoji list\` → Voir vos backups d'emojis\n> \`${prefix}backupemoji delete <code/id>\` → Supprimer une backup`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        if (cmd === 'create' && args[1]) {
            const guildId = args[1];
            const statusMsg = await message.channel.send('***Récupération des emojis en cours...***');

            try {
                const guild = await client.guilds.fetch(guildId).catch(() => null);
                if (!guild) return statusMsg.edit('***Serveur introuvable ou inaccessible.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

                const emojis = await guild.emojis.fetch();
                if (emojis.size === 0) return statusMsg.edit('***Ce serveur n\'a aucun emoji.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

                const emojiData = emojis.map(e => ({
                    name: e.name,
                    url: e.url,
                    animated: e.animated
                }));

                const code = 'EB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

                db.prepare('INSERT INTO emoji_backups (user_id, code, guild_id, emoji_data, created_at) VALUES (?, ?, ?, ?, ?)')
                    .run(userId, code, guildId, JSON.stringify(emojiData), Date.now());

                statusMsg.edit(`***Backup d'emojis créée avec succès !***\nCode : **${code}** (\`${emojis.size}\` emojis)` )
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
            } catch (error: any) {
                statusMsg.edit(`***Erreur : ${error.message}***`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }
            return;
        }

        if (cmd === 'load' && args[1]) {
            const code = args[1].toUpperCase();
            if (!message.guild) return message.channel.send('***Cette commande doit être utilisée dans un serveur.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

            const member = message.guild.members.cache.get(userId) || await message.guild.members.fetch(userId).catch(() => null);
            if (!member?.permissions.has('MANAGE_EMOJIS_AND_STICKERS' as any)) {
                return message.channel.send('***Vous n\'avez pas la permission de gérer les emojis sur ce serveur.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            }

            const row = db.prepare('SELECT emoji_data FROM emoji_backups WHERE code = ? AND user_id = ?').get(code, userId) as { emoji_data: string } | undefined;
            if (!row) return message.channel.send('***Code invalide ou vous n\'en êtes pas le propriétaire.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

            const emojisToLoad: any[] = JSON.parse(row.emoji_data);
            const statusMsg = await message.channel.send(`***Chargement de \`${emojisToLoad.length}\` emojis en cours...***`);

            let loaded = 0;
            let failed = 0;

            for (const emoji of emojisToLoad) {
                try {
                    const response = await axios.get(emoji.url, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);
                    await message.guild.emojis.create(buffer, emoji.name);
                    loaded++;
                    await new Promise(r => setTimeout(r, 1000)); 
                } catch (e) {
                    failed++;
                }
            }

            statusMsg.edit(`***Backup chargée !***\n**${loaded}** emojis créés\n**${failed}** échecs`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
            return;
        }

        if (cmd === 'list') {
            const rows = db.prepare('SELECT code, guild_id, emoji_data, created_at FROM emoji_backups WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
            if (rows.length === 0) return message.channel.send('***Vous n\'avez aucune backup d\'emojis.***').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            let response = "**Vos Backups d'Emojis**\n";
            rows.forEach((r, i) => {
                const count = JSON.parse(r.emoji_data).length;
                response += `${i + 1}. **${r.code}** (\`${r.guild_id}\`) - \`${count}\` emojis - ${new Date(r.created_at).toLocaleDateString()}\n`;
            });

            return message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 60000));
        }

        if (cmd === 'delete' && args[1]) {
            const target = args[1].toUpperCase();
            const result = db.prepare('DELETE FROM emoji_backups WHERE (code = ? OR id = ?) AND user_id = ?').run(target, target, userId);

            if (result.changes === 0) return message.channel.send('***Backup introuvable.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            
            return message.channel.send('***Backup d\'emojis supprimée.***').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }
    }
};
