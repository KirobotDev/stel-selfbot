/**
 * @author xql.dev
 * @description lock wl
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { addWhitelist } from './voicelock';

export default {
    name: "voicelockwl",
    description: "Ajoute un utilisateur à la whitelist d'un salon verrouillé",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const channelId = args[0];
        const rawUserId = args[1];

        if (!channelId || !rawUserId) {
            return message.channel.send(`Usage : \`${prefix}voicelockwl <ID_VOCAL> <ID_USER/Mention>\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
        }

        const userId = rawUserId.replace(/[<@!>]/g, '');

        addWhitelist(channelId, userId);

        message.channel.send(`L'utilisateur <@${userId}> (\`${userId}\`) a été ajouté à la whitelist du vocal \`${channelId}\`.`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
    }
};
