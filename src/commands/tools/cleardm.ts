/**
 * @author xql.dev
 * @description Clear tes msg dans le dm que tu veux ou dans tous tes dm
 * @version 7.1.4
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "cleardm",
    description: "Clear tes dm",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete().catch(() => {}); } catch { }

        const loading = "⏳";
        const targetId = args[0]?.replace(/[^0-9]/g, '');

        if (targetId && targetId.length < 17) {
            return message.channel.send("ID invalide le sang")
                .then(m => setTimeout(() => m.delete().catch(() => { }), 8000));
        }

        const status = await message.channel.send(targetId
            ? `${loading} \`Suppression en cours du dm...\` ${loading}`
            : `${loading} \`Suppression de tout les dm en cours...\` ${loading}`
        );

        let count = 0;

        try {
            if (targetId) {
                const user = await client.users.fetch(targetId).catch(() => null);
                if (!user) {
                    return status.edit(`${loading} utilisateur introuvable ${loading}`).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
                }

                const dm = await user.createDM().catch(() => null);
                if (!dm) {
                    return status.edit(`${loading} impossible d'ouvrir le dm (bloqué ou existe pas) ${loading}`).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
                }

                let msgs: any;
                do {
                    msgs = await dm.messages.fetch({ limit: 100 }).catch(() => null);
                    if (!msgs || msgs.size === 0) break;

                    for (const msg of msgs.values()) {
                        if (msg.author.id === client.user!.id && msg.id !== status.id) {
                            await msg.delete().catch(() => { });
                            count++;
                            await new Promise(r => setTimeout(r, 1200));
                        }
                    }
                } while (msgs && msgs.size === 100);

                await dm.delete().catch(() => { });
                await status.edit(`${loading} dm avec \`${targetId}\` clear (**${count}** messages supprimé) et close ${loading}`).then(m => setTimeout(() => m.delete().catch(() => { }), 15000));

            } else {
                const dms = client.channels.cache.filter((c: any) => c.type === 'DM' || c.type === 1);
                
                for (const [, dmChannel] of dms) {
                    let msgs: any;
                    do {
                        msgs = await (dmChannel as any).messages.fetch({ limit: 100 }).catch(() => null);
                        if (!msgs || msgs.size === 0) break;

                        for (const msg of msgs.values()) {
                            if (msg.author.id === client.user!.id && msg.id !== status.id) {
                                await msg.delete().catch(() => { });
                                count++;
                                await new Promise(r => setTimeout(r, 1200));
                            }
                        }
                    } while (msgs && msgs.size === 100);

                    await (dmChannel as any).delete().catch(() => { });
                }
                await status.edit(`${loading} Tous les dm clear (**${count}** messages supprimé) et close ${loading}`).then(m => setTimeout(() => m.delete().catch(() => { }), 15000));
            }
        } catch (err) {
            console.error('Erreur [Cleardm.ts] :', err);
            await status.edit("Erreur du clear").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
        }
    }
};
