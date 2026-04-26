/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "nukegroup",
    description: "Quitte tous les groupes DM silencieusement",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const groupDMs = client.channels.cache.filter(c => (c.type as any) === 'GROUP_DM' || (c as any).type === 3);

        if (groupDMs.size === 0) {
            return message.channel.send(`***Aucun groupe trouvé sur ce compte.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        let leftCount = 0;
        
        for (const [id, channel] of groupDMs) {
            try {
                await (client as any).api.channels(channel.id).delete({ query: { silent: true } });
                leftCount++;
                await new Promise(r => setTimeout(r, 500));
            } catch (error) {
            }
        }

        const report = `***Succès : \`${leftCount}\` groupes quittés silencieusement.***`;
        if (message.channel) {
            message.channel.send(report)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000))
                .catch(() => {});
        }
    }
};
