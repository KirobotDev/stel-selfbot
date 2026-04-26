/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { db } from './antigroup';
import axios from 'axios';

export default {
    name: "grouplockpdp",
    description: "Verrouille la photo de profil d'un groupe",
    usage: "<url_image> <id> / list",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        db.exec(`CREATE TABLE IF NOT EXISTS group_pdp_locks (user_id TEXT NOT NULL, group_id TEXT NOT NULL, locked_url TEXT NOT NULL, PRIMARY KEY (user_id, group_id));`);

        const userId = client.user!.id;

        if (args[0]?.toLowerCase() === "list") {
            const locks = db.prepare('SELECT group_id, locked_url FROM group_pdp_locks WHERE user_id = ?').all(userId) as any[];

            let response = "**Verrous de PDP de groupes**\n\n";
            if (locks.length === 0) response += "> *Aucun verrou actif*\n";
            else locks.forEach(l => response += `> \`${l.group_id}\` : [Lien Image](${l.locked_url})\n`);

            return message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        const lockedUrl = args[0];
        const groupId = args[1];

        if (!lockedUrl || !groupId) {
            return message.channel.send(`Usage : \`${prefix}grouplockpdp <url_image> <id>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (!/^\d{17,20}$/.test(groupId)) {
            return message.channel.send(`***Veuillez fournir un ID de groupe valide (chiffres uniquement).***`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        try {
            const channel = await client.channels.fetch(groupId).catch(() => null);
            if (channel && ((channel as any).type === 'GROUP_DM' || (channel as any).type === 3)) {
                const response = await axios.get(lockedUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                await (channel as any).setIcon(buffer);
            }
        } catch (error) {
        }

        db.prepare('INSERT OR REPLACE INTO group_pdp_locks (user_id, group_id, locked_url) VALUES (?, ?, ?)').run(userId, groupId, lockedUrl);
        message.channel.send(`La PDP du groupe \`${groupId}\` est maintenant verrouillée.`).then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
    }
};
