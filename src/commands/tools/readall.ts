/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "readall",
    description: "Marque toutes les notifications comme lues",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete().catch(() => {}); } catch { }

        const lang = (fr: string, en: string) => db.language === 'fr' ? fr : en;
        const loading = "⏳";
        
        const status = await message.channel.send(`${loading} \`${lang("Marquage de toutes les notifications comme lues (Optimisé)...", "Marking all notifications as read (Optimized)...")}\` ${loading}`);

        const token = (client as any).token;
        let count = 0;
        let errorCount = 0;

        try {
            const fetchWithRetry = async (url: string, options: any) => {
                let res = await fetch(url, options).catch(e => {
                    console.error(`[ReadAll] Fetch error for ${url}:`, e);
                    return { ok: false, status: 0, statusText: e.message } as any;
                });
                if (res.status === 429) {
                    const retryAfter = parseFloat(res.headers.get('Retry-After') || '5') * 1000;
                    console.warn(`[ReadAll] Rate limited. Retrying in ${retryAfter}ms...`);
                    await new Promise(r => setTimeout(r, retryAfter + 500));
                    res = await fetch(url, options);
                }
                return res;
            };

            const allUnreadChannels: any[] = [];
            
            client.guilds.cache.forEach((guild: any) => {
                guild.channels.cache.forEach((channel: any) => {
                    if ((channel.type === 'GUILD_TEXT' || channel.type === 0 || channel.type === 'GUILD_NEWS' || channel.type === 5 || channel.type === 'GUILD_PUBLIC_THREAD' || channel.type === 11) && channel.lastMessageId) {
                        allUnreadChannels.push(channel);
                    }
                });
            });

            const dmChannels = client.channels.cache.filter((c: any) => 
                (c.type === 'DM' || c.type === 1 || c.type === 'GROUP_DM' || c.type === 3) && (c as any).lastMessageId
            );
            dmChannels.forEach((c: any) => allUnreadChannels.push(c));

            console.log(`[ReadAll] Found ${allUnreadChannels.length} total channels to process.`);

            if (allUnreadChannels.length === 0) {
                return status.edit(lang("Aucune notification à marquer comme lue.", "No notifications to mark as read."))
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            for (const channel of allUnreadChannels) {
                try {
                    const res = await fetchWithRetry(`https://discord.com/api/v9/channels/${channel.id}/messages/${channel.lastMessageId}/ack`, {
                        method: 'POST',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ token: null }) 
                    });
                    if (res.ok) count++; else errorCount++;
                } catch { errorCount++; }
                await new Promise(r => setTimeout(r, 150)); 
            }

            const successMsg = lang(
                `Terminé : **${count}** lues (**${errorCount}** ignorés/échecs).`,
                `Done: **${count}** read (**${errorCount}** ignored/failed).`
            );

            await status.edit(successMsg).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));


        } catch (err) {
            console.error('Erreur [readall.ts] :', err);
            await status.edit(lang("Erreur lors du marquage des notifications.", "Error while marking notifications as read."))
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
    }
};
