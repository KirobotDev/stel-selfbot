/**
 * @author xql.dev
 * @version 1.9.3
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "purge",
    description: "Supprimer un nombre défini de messages dans le salon (tous les utilisateurs)",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete().catch(() => {}); } catch { }

        const loading = "⏳";
        
        let amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0) {
            return message.channel.send(`Veuillez spécifier un nombre valide de messages à purger. Exemple : \`${prefix}purge 10\``)
                .then(m => setTimeout(() => m.delete().catch(() => { }), 8000));
        }

        const status = await message.channel.send(`${loading} \`Suppression de ${amount} messages en cours...\` ${loading}`);

        let count = 0;

        try {
            const channel = message.channel;
            
            if (!channel || !(channel as any).messages) {
                return status.edit(`${loading} Salon inaccessible ${loading}`)
                    .then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            }

            let msgs: any;
            let lastMessageId: string | undefined = undefined;
            let toDelete = amount;

            do {
                const fetchLimit = toDelete > 100 ? 100 : toDelete + 1;
                const options: any = { limit: fetchLimit };
                if (lastMessageId) options.before = lastMessageId;

                msgs = await (channel as any).messages.fetch(options).catch(() => null);
                if (!msgs || msgs.size === 0) break;

                for (const msg of msgs.values()) {
                    lastMessageId = msg.id;
                    if (msg.id !== status.id) {
                        try {
                            if (msg.deletable || msg.author.id === client.user!.id) {
                                await msg.delete().catch(() => { });
                                count++;
                                toDelete--;
                                await new Promise(r => setTimeout(r, 1200)); // Limite de l'API (Selfbots)
                            }
                        } catch (e) {}
                    }
                    if (toDelete <= 0) break;
                }
            } while (msgs && msgs.size > 0 && toDelete > 0);

            await status.edit(`${loading} Purge terminée : **${count}** messages ont été supprimés ${loading}`)
                .then(m => setTimeout(() => m.delete().catch(() => { }), 15000));

        } catch (err) {
            console.error('Erreur [purge.ts] :', err);
            await status.edit("Erreur lors de la purge").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }
    }
};
