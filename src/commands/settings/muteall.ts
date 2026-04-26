/**
 * @author xql.dev
 * @description Mute tous vos serveurs 
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "muteall",
    description: "Mute tous vos serveurs",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const isOff = args[0]?.toLowerCase() === 'off';
        const action = isOff ? 'Unmute' : 'Mute';
        
        await message.edit(`***${action} de \`${client.guilds.cache.size}\` serveurs en cours...***`);

        let count = 0;
        for (const guild of client.guilds.cache.values()) {
            try {
                await fetch(`https://discord.com/api/v9/users/@me/guilds/${guild.id}/settings`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': (client as any).token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        muted: !isOff,
                        suppress_roles: !isOff,
                        suppress_everyone: !isOff
                    })
                });
                count++;
            } catch (error) {
                console.error(`Erreur lors du ${action.toLowerCase()} du serveur ${guild.id}:`, error);
            }

            await new Promise(r => setTimeout(r, 2000));
        }

        await message.edit(`***\`${count}\` serveurs ont été ${isOff ? 'unmutés' : 'mutés'} avec succès !***`);
    }
};
