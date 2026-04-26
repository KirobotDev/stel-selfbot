/**
 * @author xql.dev
 * @description backup module
 * @see https://github.com/kirobotdev/stel-sb
 * @error https://github.com/kirobotdev/stel-sb/issue/11
 * @license MIT
 */


import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Client, Guild, Role, TextChannel, VoiceChannel, CategoryChannel, Collection } from 'safeness-mirore-sb';

const DB_PATH = join(process.cwd(), 'src', 'commands', 'backup', 'db_backup', 'backup.db');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    guild_id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
`);

interface SerializedData {
    guildId: string;
    name: string;
    icon: string | null;
    everyone: any;
    roles: any[];
    channels: any[];
    emojis: any[];
}

export class BackupModule {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async create(guildId: string, userId: string): Promise<string> {
        const headers = { Authorization: (this.client as any).token };
        
        try {
            const responses = await Promise.all([
                fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, { headers }),
                fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, { headers }),
                fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers }),
                fetch(`https://discord.com/api/v10/guilds/${guildId}/emojis`, { headers })
            ]);

            for (const res of responses) {
                if (!res.ok) throw new Error("Impossible d'accéder aux données du serveur.");
            }

            const [guildData, channelsData, rolesData, emojisData] = await Promise.all(responses.map(r => r.json())) as any[];

            const data = this.serializeFromRaw({
                guild: guildData,
                roles: rolesData,
                channels: channelsData,
                emojis: emojisData
            });

            const code = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            db.prepare('INSERT INTO backups (user_id, code, guild_id, data, created_at) VALUES (?,?,?,?,?)')
                .run(userId, code, guildId, JSON.stringify(data), Date.now());

            return code;
        } catch (e: any) {
            throw new Error(e.message || 'Erreur lors de la création de la backup.');
        }
    }

    getBackup(code: string, userId: string): SerializedData | null {
        const row = db.prepare('SELECT data FROM backups WHERE code = ? AND user_id = ?')
            .get(code.toUpperCase(), userId) as { data: string } | undefined;
        return row ? JSON.parse(row.data) : null;
    }

    list(userId: string) {
        return (db.prepare('SELECT code, guild_id, created_at FROM backups WHERE user_id = ? ORDER BY created_at DESC')
            .all(userId) as any[])
            .map((r, i) => ({ 
                num: i + 1, 
                code: r.code, 
                guild: r.guild_id, 
                date: new Date(r.created_at).toLocaleString('fr-FR') 
            }));
    }

    delete(userId: string, num: number) {
        const list = this.list(userId);
        const target = list[num - 1];
        if (!target) return false;
        db.prepare('DELETE FROM backups WHERE code = ? AND user_id = ?').run(target.code, userId);
        return true;
    }

    private serializeFromRaw({ guild, roles = [], channels = [], emojis = [] }: any): SerializedData {
        if (!guild) throw new Error('Impossible de sérialiser cette backup');

        const icon = guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=1024`
            : null;

        const data: SerializedData = {
            guildId: guild.id,
            name: guild.name || 'Server',
            icon,
            roles: [],
            channels: [],
            emojis: [],
            everyone: null
        };

        const everyoneRole = roles.find((r: any) => r.id === guild.id);
        if (everyoneRole) {
            data.everyone = {
                permissions: everyoneRole.permissions,
                color: everyoneRole.color,
                hoist: everyoneRole.hoist,
                mentionable: everyoneRole.mentionable
            };
        }

        data.roles = roles
            .filter((r: any) => r.id !== guild.id && !r.managed)
            .sort((a: any, b: any) => a.position - b.position)
            .map((r: any) => ({
                id: r.id,
                name: r.name,
                color: r.color,
                hoist: r.hoist,
                mentionable: r.mentionable,
                permissions: r.permissions,
                position: r.position
            }));

        data.channels = channels
            .filter((ch: any) => ![10, 11, 12].includes(ch.type)) 
            .sort((a: any, b: any) => a.position - b.position)
            .map((ch: any) => ({
                id: ch.id,
                type: ch.type,
                name: ch.name || 'unknown',
                position: typeof ch.position === 'number' ? ch.position : 999,
                topic: ch.topic ?? null,
                nsfw: !!ch.nsfw,
                bitrate: ch.bitrate ?? null,
                userLimit: ch.user_limit ?? null,
                rateLimitPerUser: ch.rate_limit_per_user ?? null,
                parent_id: ch.parent_id || null,
                overwrites: (ch.permission_overwrites || []).map((o: any) => ({
                    id: o.id,
                    type: o.type,
                    allow: o.allow || '0',
                    deny: o.deny || '0'
                }))
            }));

        data.emojis = emojis.map((e: any) => ({
            id: e.id,
            name: e.name,
            url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}?size=96`,
            animated: !!e.animated
        }));

        return data;
    }

    async restore(guild: Guild, backup: SerializedData) {
        const me = guild.members.me || await guild.members.fetch(this.client.user!.id).catch(() => null);
        const myHighestRole = me?.roles.highest.position || 0;

        for (const channel of guild.channels.cache.values()) {
            await channel.delete().catch(() => {});
        }

        for (const emoji of guild.emojis.cache.values()) {
            await emoji.delete().catch(() => {});
        }

        const rolesToDelete = guild.roles.cache
            .filter(role => !role.managed && role.id !== guild.id && role.position < myHighestRole)
            .sort((a, b) => b.position - a.position); 
        
        for (const role of rolesToDelete.values()) {
            await role.delete().catch(() => {});
        }

        const roleMap = new Map<string, string>();
        roleMap.set(backup.guildId, guild.id);

        const backupRoles = [...backup.roles].sort((a, b) => a.position - b.position);
        const roleDataForPosition: { role: Role, position: number }[] = [];

        for (const rData of backupRoles) {
            const created = await guild.roles.create({
                name: rData.name,
                color: rData.color ?? null,
                hoist: !!rData.hoist,
                permissions: this.safeBigInt(rData.permissions),
                mentionable: !!rData.mentionable
            }).catch(() => null);
            
            if (created) {
                roleMap.set(rData.id, created.id);
                roleDataForPosition.push({ role: created, position: rData.position });
            }
        }

        if (backup.everyone) {
            await guild.roles.everyone.edit({
                permissions: this.safeBigInt(backup.everyone.permissions)
            }).catch(() => {});
        }

        if (roleDataForPosition.length > 0) {
            const sortedPositions = roleDataForPosition
                .sort((a, b) => a.position - b.position)
                .map(rd => ({ 
                    role: rd.role.id, 
                    position: rd.position 
                }));
            
            await guild.roles.setPositions(sortedPositions).catch(() => {});
        }

        const channelMap = new Map<string, string>();
        const categories = backup.channels.filter(c => c.type === 4);
        for (const cat of categories) {
            const overwrites = this.mapPermissionOverwrites(cat.overwrites, roleMap, backup.guildId, guild.id);
            const created = await guild.channels.create(cat.name, {
                type: 'GUILD_CATEGORY',
                position: cat.position,
                permissionOverwrites: overwrites
            }).catch(() => null);
            if (created) channelMap.set(cat.id, created.id);
        }

        const otherChannels = backup.channels.filter(c => c.type !== 4);
        const createdChannels: { channel: any, position: number }[] = [];
        for (const ch of otherChannels) {
            const parentId = ch.parent_id ? channelMap.get(ch.parent_id) : null;
            const overwrites = this.mapPermissionOverwrites(ch.overwrites, roleMap, backup.guildId, guild.id);
            
            const payload: any = {
                type: this.resolveChannelType(ch.type),
                nsfw: !!ch.nsfw,
                parent: parentId || undefined,
                permissionOverwrites: overwrites
            };

            if (ch.topic) payload.topic = ch.topic;
            if (ch.bitrate) payload.bitrate = ch.bitrate;
            if (ch.userLimit) payload.userLimit = ch.userLimit;
            if (ch.rateLimitPerUser) payload.rateLimitPerUser = ch.rateLimitPerUser;

            const created = await guild.channels.create(ch.name, payload).catch(() => null);
            if (created) {
                channelMap.set(ch.id, created.id);
                createdChannels.push({ channel: created, position: ch.position });
            }
        }

        for (const chInfo of createdChannels) {
            await chInfo.channel.setPosition(chInfo.position).catch(() => {});
        }

        for (const emoji of backup.emojis) {
            const b64 = await this.toBase64(emoji.url);
            if (b64) await guild.emojis.create(b64, emoji.name).catch(() => {});
        }

        if (backup.icon) {
            const b64 = await this.toBase64(backup.icon);
            if (b64) await guild.setIcon(b64).catch(() => {});
        }

        if (backup.name) {
            await guild.setName(`${backup.name} (Copy)`).catch(() => {});
        }
    }

    private resolveChannelType(type: number): string {
        switch (type) {
            case 2: return 'GUILD_VOICE';
            case 5: return 'GUILD_NEWS';
            case 13: return 'GUILD_STAGE_VOICE';
            default: return 'GUILD_TEXT';
        }
    }

    private safeBigInt(value: any): bigint {
        try {
            return BigInt(value?.toString() || "0");
        } catch {
            return BigInt(0);
        }
    }

    private mapPermissionOverwrites(overwrites: any[] = [], roleMap: Map<string, string>, oldGuildId: string, newGuildId: string): any[] {
        const result: any[] = [];
        for (const o of overwrites) {
            const mappedId = o.type === 0 ? (roleMap.get(o.id) || (o.id === oldGuildId ? newGuildId : null)) : o.id;
            if (!mappedId) continue;
            result.push({
                id: mappedId,
                type: o.type === 0 ? 'role' : 'member',
                allow: this.safeBigInt(o.allow),
                deny: this.safeBigInt(o.deny)
            });
        }
        return result;
    }

    private async toBase64(url: string): Promise<string | null> {
        try {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = res.headers.get('content-type') || 'image/png';
            return `data:${contentType};base64,${buffer.toString('base64')}`;
        } catch {
            return null;
        }
    }
}
