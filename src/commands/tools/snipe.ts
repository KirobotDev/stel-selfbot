import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "snipe",
    description: "Affiche le dernier message supprimé dans le salon actuel",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: any, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        try {
            const msg = client.snipes?.get(message.channel.id);
            if (!msg) {
                return await message.channel.send("Aucun message récent enregistré dans ce salon.")
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            }

            const unixTime = Math.floor(msg.date / 1000);
            
            await message.channel.send(`\`Stel-$B\` Snipe \n` +
                `> **Auteur:** ${msg.author}\n` +
                `> **Message:** ${msg.content}\n` +
                `> **Image:** ${msg.image || "Aucune"}\n` +
                `> **Date:** <t:${unixTime}:R>`
            );
        } catch (e: any) {
            console.error("Erreur commande snipe:", e);
        }
    }
};
