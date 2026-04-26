/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { db } from './antigroup';

export default {
    name: "groupunlockname",
    description: "Déverrouille le nom d'un groupe",
    usage: "<id>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        db.exec(`CREATE TABLE IF NOT EXISTS group_name_locks (user_id TEXT NOT NULL, group_id TEXT NOT NULL, locked_name TEXT NOT NULL, PRIMARY KEY (user_id, group_id));`);

        const userId = client.user!.id;
        const groupId = args[0];

        if (!groupId) {
            return message.channel.send(`Usage : \`${prefix}groupunlockname <ID_Groupe>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        const result = db.prepare('DELETE FROM group_name_locks WHERE user_id = ? AND group_id = ?').run(userId, groupId);
        
        if (result.changes === 0) {
            return message.channel.send(`***Aucun verrou trouvé pour le groupe \`${groupId}\`.***`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        message.channel.send(`Le nom du groupe \`${groupId}\` a été déverrouillé.`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};
