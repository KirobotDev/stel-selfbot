/**
 * @author xql.dev
 * @description bugvocal utilise changement de regions discord 
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.3.9
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

const regions = ["brazil", "hongkong", "india", "japan", "rotterdam"];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    name: "bugvc",
    description: "bugvc un groupe ou un DM",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch {}

        const channel: any = message.mentions.channels.first() || client.channels.cache.get(args[0]) || message.channel;

        if (!["DM", "GROUP_DM", "GUILD_VOICE", "GUILD_STAGE_VOICE"].includes(channel.type)) {
            return message.channel.send("***Veuillez entrer l'ID d'un salon DM, Groupe ou Vocal de serveur***").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (["GUILD_VOICE", "GUILD_STAGE_VOICE"].includes(channel.type)) {
            if (!channel.permissionsFor(client.user?.id).has("MANAGE_CHANNELS")) {
                return message.channel.send("***Tu n'as pas la permission d'utiliser cette commande ici, il te faut la permission MANAGE_CHANNELS***").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }
        }

        const statusMsg = await message.channel.send(`***bugvc de ${channel} en cours...***`);
        
        for (let i = 0; i < regions.length; i++) {
            try {
                if (["DM", "GROUP_DM"].includes(channel.type)) {
                    await (client as any).api.channels(channel.id).call.patch({ data: { region: regions[i] } });
                } else {
                    await (client as any).api.channels(channel.id).patch({ data: { rtc_region: regions[i] } });
                }
                await sleep(2000);
            } catch {
            }
        }

        statusMsg.edit(`***bugvc de ${channel} terminé***`).then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
    }
};
