/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "find",
    description: "Cherche un utilisateur en vocal sur tous vos serveurs",
    usage: "<user>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const targetId = args[0] ? args[0].replace(/[<@!>]/g, '') : null;
        
        if (!targetId) {
            return message.edit(`***Usage : \`${prefix}find <@user/id>\`***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const user = message.mentions.users.first() || client.users.cache.get(targetId) || await client.users.fetch(targetId).catch(() => null);
        
        if (!user) {
            return message.edit(`***Aucun utilisateur trouvé pour \`${args[0]}\`***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const guildsWithUserInVoice = client.guilds.cache.filter(g => {
            const member = g.members.cache.get(user.id);
            return !!(member && member.voice && member.voice.channelId);
        });

        if (guildsWithUserInVoice.size === 0) {
            return message.edit(`***\`${user.globalName || user.username}\` n'est connecté en vocal dans aucun serveur.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        let response = `***\`${user.globalName || user.username}\` est connecté en vocal dans \`${guildsWithUserInVoice.size}\` serveur${guildsWithUserInVoice.size > 1 ? 's' : ''} :***\n`;
        
        guildsWithUserInVoice.forEach(g => {
            const member = g.members.cache.get(user.id);
            const channel = member?.voice?.channel;
            response += `- **${g.name}**・${channel ? channel.toString() : 'Salon inconnu'}\n`;
        });

        await message.edit(response);
    }
};
