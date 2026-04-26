/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { db } from './antigroup';

export default {
    name: "grouplockname",
    description: "Verrouille le nom d'un groupe",
    usage: "<nom> <id> / list",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        db.exec(`CREATE TABLE IF NOT EXISTS group_name_locks (user_id TEXT NOT NULL, group_id TEXT NOT NULL, locked_name TEXT NOT NULL, PRIMARY KEY (user_id, group_id));`);

        const userId = client.user!.id;

        if (args[0]?.toLowerCase() === "list") {
            const locks = db.prepare('SELECT group_id, locked_name FROM group_name_locks WHERE user_id = ?').all(userId) as any[];

            let response = "**Verrous de noms de groupes**\n\n";
            if (locks.length === 0) response += "> *Aucun verrou actif*\n";
            else locks.forEach(l => response += `> \`${l.group_id}\` : **${l.locked_name}**\n`);

            return message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        const lockedName = args[0];
        const groupId = args[1];

        if (!lockedName || !groupId) {
            return message.channel.send(`Usage : \`${prefix}grouplockname <nom> <id>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (!/^\d{17,20}$/.test(groupId)) {
            return message.channel.send(`***Veuillez fournir un ID de groupe valide (chiffres uniquement).***`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        try {
            const channel = await client.channels.fetch(groupId).catch(() => null);
            if (channel && ((channel.type as any) === 'GROUP_DM' || (channel.type as any) === 3)) {
                await (channel as any).setName(lockedName);
            }
        } catch {}

        db.prepare('INSERT OR REPLACE INTO group_name_locks (user_id, group_id, locked_name) VALUES (?, ?, ?)').run(userId, groupId, lockedName);
        message.channel.send(`Le nom du groupe \`${groupId}\` est maintenant verrouillé sur : **${lockedName}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
    }
};
