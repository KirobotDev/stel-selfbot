/**
 * @author xql.dev
 * @description Envoie le lien pour invité un bot
 * @version 2.9.3
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: 'botlink',
    description: "Lien du bot",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const botId = args[0] || client.user?.id;

        if (!botId) {
            return message.channel.send(`Veuillez utiliser la commande de cette manière : \`${prefix}botlink [id]\`.`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (!/^\d+$/.test(botId)) {
            return message.channel.send('ID de bot invalide. L\'ID doit contenir uniquement des chiffres.')
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        const botInviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&permissions=8&integration_type=0&scope=bot`;

        message.channel.send(`**Lien d'invitation du bot** :\n${botInviteLink}`);
    },
};
