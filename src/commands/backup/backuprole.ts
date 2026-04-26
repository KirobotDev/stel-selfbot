/**
 * @author xql.dev
 * @description Systeme de backup de rôles
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message, Role } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'src', 'commands', 'backup', 'db_backup', 'backup.db');
const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS role_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    guild_id TEXT NOT NULL,
    role_data TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
`);

export default {
    name: "backuprole",
    description: "Système de backup de rôles (create/load/list/delete)",
    usage: "<create/load/list/delete> [extra]",
    dir: "backup",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch {}

        const cmd = args[0]?.toLowerCase();
        const userId = message.author.id;

        if (!cmd) {
            return message.channel.send(`**Backup Role Commands**\n> \`${prefix}backuprole create <guild_id>\` → Créer une backup de rôles\n> \`${prefix}backuprole load <code>\` → Charger une backup de rôles\n> \`${prefix}backuprole list\` → Voir vos backups de rôles\n> \`${prefix}backuprole delete <code/id>\` → Supprimer une backup`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        if (cmd === 'create' && args[1]) {
            const guildId = args[1];
            const statusMsg = await message.channel.send('***Récupération des rôles en cours...***');

            try {
                const guild = await client.guilds.fetch(guildId).catch(() => null);
                if (!guild) return statusMsg.edit('***Serveur introuvable ou inaccessible.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

                const roles = await guild.roles.fetch();
                const targetRoles = roles.filter(r => r.id !== guild.id && !r.managed);

                if (targetRoles.size === 0) return statusMsg.edit('***Ce serveur n\'a aucun rôle personnalisable.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

                const roleData = targetRoles.sort((a, b) => a.position - b.position).map(r => ({
                    name: r.name,
                    color: r.color,
                    hoist: r.hoist,
                    permissions: (r.permissions as any).bitfield?.toString() || r.permissions.toString(),
                    mentionable: r.mentionable,
                    position: r.position
                }));

                const code = 'RB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

                db.prepare('INSERT INTO role_backups (user_id, code, guild_id, role_data, created_at) VALUES (?, ?, ?, ?, ?)')
                    .run(userId, code, guildId, JSON.stringify(roleData), Date.now());

                statusMsg.edit(`***Backup de rôles créée avec succès !***\nCode : **${code}** (\`${targetRoles.size}\` rôles)`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
            } catch (error: any) {
                statusMsg.edit(`***Erreur : ${error.message}***`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }
            return;
        }

        if (cmd === 'load' && args[1]) {
            const code = args[1].toUpperCase();
            if (!message.guild) return message.channel.send('***Cette commande doit être utilisée dans un serveur.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

            const me = message.guild.members.me || await message.guild.members.fetch(client.user!.id).catch(() => null);
            if (!me?.permissions.has('MANAGE_ROLES' as any)) {
                return message.channel.send('***Le bot n\'a pas la permission de gérer les rôles ici.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            }

            const row = db.prepare('SELECT role_data FROM role_backups WHERE code = ? AND user_id = ?').get(code, userId) as { role_data: string } | undefined;
            if (!row) return message.channel.send('***Code invalide ou vous n\'en êtes pas le propriétaire.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

            const myHighestRole = me?.roles.highest.position || 0;

            const rolesToLoad: any[] = JSON.parse(row.role_data);
            const statusMsg = await message.channel.send(`***Nettoyage et préparation de \`${rolesToLoad.length}\` rôles...***`);

            const rolesToDelete = message.guild.roles.cache.filter(role => 
                !role.managed && 
                role.id !== message.guild!.id && 
                role.position < myHighestRole
            );

            for (const r of rolesToDelete.values()) {
                await r.delete().catch(() => {});
            }

            let loaded = 0;
            let failed = 0;

            rolesToLoad.sort((a: any, b: any) => b.position - a.position);

            for (const r of rolesToLoad) {
                try {
                    const perms = r.permissions && typeof r.permissions === 'string' && !r.permissions.includes('[object') 
                        ? BigInt(r.permissions) 
                        : BigInt(0);

                    await message.guild.roles.create({
                        name: r.name,
                        color: r.color ?? undefined,
                        hoist: !!r.hoist,
                        permissions: perms,
                        mentionable: !!r.mentionable,
                        reason: `Restoration backup ${code}`
                    });

                    loaded++;
                    await new Promise(r => setTimeout(r, 1000)); 
                } catch (e) {
                    failed++;
                }
            }

            statusMsg.edit(`***Backup chargée !***\n**${loaded}** rôles créés\n**${failed}** échecs`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
            return;
        }

        if (cmd === 'list') {
            const rows = db.prepare('SELECT code, guild_id, role_data, created_at FROM role_backups WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
            if (rows.length === 0) return message.channel.send('***Vous n\'avez aucune backup de rôles.***').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            let response = "**Vos Backups de Rôles**\n";
            rows.forEach((r, i) => {
                const count = JSON.parse(r.role_data).length;
                response += `${i + 1}. **${r.code}** (\`${r.guild_id}\`) - \`${count}\` rôles - ${new Date(r.created_at).toLocaleDateString()}\n`;
            });

            return message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 60000));
        }

        if (cmd === 'delete' && args[1]) {
            const target = args[1].toUpperCase();
            const result = db.prepare('DELETE FROM role_backups WHERE (code = ? OR id = ?) AND user_id = ?').run(target, target, userId);

            if (result.changes === 0) return message.channel.send('***Backup introuvable.***').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            
            return message.channel.send('***Backup de rôles supprimée.***').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }
    }
};
