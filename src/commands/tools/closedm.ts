/**
 * @author xql.dev
 * @description Ferme tous les messages privés (DMs)
 * @version 2.9.3
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "closedm",
    description: "Ferme tes dm",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try {
            const dmChannels = client.channels.cache.filter((channel: any) => 
                channel.type === "DM" || channel.type === 1
            );

            dmChannels.forEach((channel: any) => {
                channel.delete().catch(() => false);
            });

            await message.edit("dm close");
        } catch (error) {
            console.error("Erreur de [closedm.ts] :", error);
            await message.edit("Tout les dm sont fermer");
        }
    }
};
