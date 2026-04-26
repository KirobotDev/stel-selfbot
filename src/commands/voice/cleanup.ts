/**
 * @author xql.dev
 * @description kick all
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "cleanup",
    description: "Déconnecte tous les membres en vocal",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const channelId = args[0] || (message.mentions.channels.first()?.id);

        if (!channelId) {
            return message.channel.send(`***Aucun salon vocal de trouvé pour \`${args[0] ?? 'rien'}\`***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        let channel;
        try {
            channel = message.guild?.channels.cache.get(channelId) || await message.guild?.channels.fetch(channelId);
        } catch { }

        if (!channel) {
            return message.channel.send(`***Aucun salon vocal de trouvé pour \`${args[0] ?? 'rien'}\`***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const types = [2, 13, 'GUILD_VOICE', 'GUILD_STAGE_VOICE'];
        if (!types.includes((channel as any).type)) {
            return message.channel.send(`***Le salon \`${channel.name}\` n'est pas un salon vocal/conférence***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const members = (channel as any).members;
        
        if (!members || members.size === 0) {
            return message.channel.send(`***Personne n'est dans le salon vocal \`${channel.name}\`***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        message.channel.send(`***Je suis en train de déconnecter \`${members.size}\` membres du salon \`${channel.name}\`***`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

        members.forEach((m: any) => {
            m.voice.disconnect().catch(() => {});
        });
    }
};
