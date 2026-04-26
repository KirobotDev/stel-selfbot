/**
 * @author xql.dev
 * @version 1.9.3
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "clear",
    description: "Clear tes messages dans le salon actuel ou via ID",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete().catch(() => {}); } catch { }

        const loading = "⏳";
        const targetId = args[0]?.replace(/[^0-9]/g, '') || message.channel.id;

        if (targetId.length < 17) {
            return message.channel.send("ID de salon invalide le sang")
                .then(m => setTimeout(() => m.delete().catch(() => { }), 8000));
        }

        const status = await message.channel.send(`${loading} \`Suppression de tes messages en cours...\` ${loading}`);

        let count = 0;

        try {
            const channel = client.channels.cache.get(targetId) || await client.channels.fetch(targetId).catch(() => null);
            
            if (!channel || !(channel as any).messages) {
                return status.edit(`${loading} Salon introuvable ou inaccessible ${loading}`)
                    .then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            }

            let msgs: any;
            let lastMessageId: string | undefined = undefined;

            do {
                const options: any = { limit: 100 };
                if (lastMessageId) options.before = lastMessageId;

                msgs = await (channel as any).messages.fetch(options).catch(() => null);
                if (!msgs || msgs.size === 0) break;

                for (const msg of msgs.values()) {
                    lastMessageId = msg.id;
                    if (msg.author.id === client.user!.id && msg.id !== status.id) {
                        try {
                            await msg.delete().catch(() => { });
                            count++;
                            await new Promise(r => setTimeout(r, 1200));
                        } catch (e) {}
                    }
                }
            } while (msgs && msgs.size === 100);

            await status.edit(`${loading} Clear terminé : **${count}** de tes messages ont été supprimés ${loading}`)
                .then(m => setTimeout(() => m.delete().catch(() => { }), 15000));

        } catch (err) {
            console.error('Erreur [clear.ts] :', err);
            await status.edit("Erreur lors du clear").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }
    }
};
