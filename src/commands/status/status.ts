/**
 * @author xql.dev
 * @description Modifie statut 
 * @version 1.0.2
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message, PresenceStatusData } from 'safeness-mirore-sb';
import { DBConfig, Database } from '../../utils/database';

const statusList = ['online', 'idle', 'dnd', 'invisible'];

export default {
    name: "status",
    description: "Modifie votre statut Discord",
    usage: "<online/idle/dnd/invisible>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const choice = args[0]?.toLowerCase() as PresenceStatusData;

        if (!choice || !statusList.includes(choice)) {
            const helpMsg = ` __**${client.user?.username || 'Client'} - STATUS**__ \n` +
                            `> \`${prefix}status <choix>\` → **Modifie votre statut**\n\n` +
                            `**Options disponibles :**\n` +
                            statusList.map(s => `- \`${s}\``).join('\n');
            
            return message.edit(helpMsg)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
        }
        
        try {
            await fetch("https://discord.com/api/v9/users/@me/settings", {
                method: "PATCH",
                headers: {
                    "Authorization": (client as any).token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: choice })
            });
        } catch (e) {
            client.user?.setStatus(choice);
        }
        
        Database.set('status' as any, choice);

        await message.edit(`***Votre nouveau statut est désormais \`${choice}\`***`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
};
