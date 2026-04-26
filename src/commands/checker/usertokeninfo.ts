/**
 * @author xql.dev
 * @see https://github.com/kirobotdev/stel-sb
 * @version 1.1.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { TokenUtils } from '../../utils/tokens';

export default {
    name: "usertokeninfo",
    description: "Affiche les informations exhaustives d'un token d'utilisateur",
    usage: "<token>",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     * @param {DBConfig} dbConf
     * @param {string} prefix
    */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const token = args[0];
        if (!token) return message.channel.send(`***Usage: \`${prefix}usertokeninfo <token>\`***`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

        const tokenType = await TokenUtils.detectTokenType(token);

        if (tokenType === 'bot') {
            return message.channel.send(`> ***User Token Info***\n- \`Status\`・Erreur\n- \`Info\`・C'est un token **Bot**, utilise \`${prefix}bottkninfo\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (tokenType === 'invalid') {
            return message.channel.send(`> ***User Token Info***\n- \`Token\`・||${token.substring(0, 10)}...||\n- \`Status\`・Invalide`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        const details = await TokenUtils.getUserDetails(token);
        if (!details) return;

        const { user, billing, connections } = details;

        const nitroTypes: Record<number, string> = {
            0: "Aucun",
            1: "Nitro Classic",
            2: "Nitro",
            3: "Nitro Basic"
        };

        const billingLines = billing.length > 0 
            ? billing.map(b => `- \`${b.brand || 'Inconnu'}\` (**${b.last_4 || '****'}**) - ${b.email || 'Pas de mail'}`).join('\n')
            : "Aucun moyen de paiement";

        const connectionLines = connections.length > 0
            ? connections.map(c => `\`${c.type}\` (${c.name})`).join(', ')
            : "Aucune connexion";

        const infoMessage = `> ***User Token Information - ${user.username}#${user.discriminator}***
- \`ID\`・\`${user.id}\`
- \`Email\`・\`${user.email || 'Non renseigné'}\`
- \`Téléphone\`・\`${user.phone || 'Non renseigné'}\`
- \`Nitro\`・\`${nitroTypes[user.premium_type] || 'Inconnu'}\`
- \`2FA\`・\`${user.mfa_enabled ? 'Activé' : 'Désactivé'}\`
- \`Vérifié\`・\`${user.verified ? 'Oui' : 'Non'}\`

__**Moyens de Paiement**__
${billingLines}

__**Connexions**__
${connectionLines}

- \`Avatar URL\`・${user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'Aucun'}`;

        message.channel.send(infoMessage)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
    }
};
