/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "nukedm",
    description: "Ferme tous les messages privés (DMs)",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const dmChannels = client.channels.cache.filter(c => (c.type as any) === 'DM' || (c as any).type === 1);

        if (dmChannels.size === 0) {
            return message.channel.send(`***Aucun DM trouvé sur ce compte.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        let closedCount = 0;
        
        for (const [id, channel] of dmChannels) {
            try {
                await (channel as any).delete();
                closedCount++;
                await new Promise(r => setTimeout(r, 300));
            } catch (error) {
            }
        }

        const report = `***Succès : \`${closedCount}\` DMs fermés.***`;
        if (message.channel) {
            message.channel.send(report)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000))
                .catch(() => {});
        }
    }
};
