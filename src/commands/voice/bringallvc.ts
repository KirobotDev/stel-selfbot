/**
 * @author xql.dev
 * @description moov all
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */
import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "bringallvc",
    description: "Déplace tous les utilisateurs d'un vocal vers un autre",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const sourceId = args[0];
        const targetId = args[1];

        if (!sourceId || !targetId) {
            return message.channel.send(`Usage : \`${prefix}bringallvc <ID_VOCAL_DEPART> <ID_VOCAL_ARRIVEE>\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
        }

        const sourceChannel = client.channels.cache.get(sourceId);
        const targetChannel = client.channels.cache.get(targetId);

        if (!sourceChannel || (sourceChannel as any).type !== 2) {
            return message.channel.send("Impossible de trouver le salon vocal de départ.")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        if (!targetChannel || (targetChannel as any).type !== 2) {
            return message.channel.send("Impossible de trouver le salon vocal d'arrivée.")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const membersInSource = (sourceChannel as any).members;

        if (!membersInSource || membersInSource.size === 0) {
            return message.channel.send("Personne n'est dans le salon vocal de départ.")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        let movedCount = 0;
        let failedCount = 0;

        for (const [memberId, member] of membersInSource) {
            try {
                await member.voice.setChannel(targetId);
                movedCount++;
            } catch (error) {
                failedCount++;
            }
        }

        let responseText = `**${movedCount}** personnes déplacées avec succès`;
        if (failedCount > 0) responseText += `\nÉchec pour **${failedCount}** personnes (Vérifie tes permissions)`;

        message.channel.send(responseText)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
};
