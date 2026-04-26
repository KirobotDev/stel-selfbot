/**
 * @author xql.dev
 * @see https://github.com/kirobotdev/stel-sb
 * @version 1.1.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { TokenUtils } from '../../utils/tokens';

export default {
    name: "botchecktkn",
    description: "Vérifie si un token de bot est valide",
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
        if (!token) return message.channel.send(`***Usage: \`${prefix}botchecktkn <token>\`***`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

        const tokenType = await TokenUtils.detectTokenType(token);

        if (tokenType === 'user') {
            return message.channel.send(`> ***Bot Token Checker***\n- \`Status\`・Erreur \n- \`Info\`・C'est un token **Utilisateur**, utilise \`${prefix}usertkncheck\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        if (tokenType === 'invalid') {
            return message.channel.send(`> ***Bot Token Checker***\n- \`Token\`・||${token.substring(0, 10)}...||\n- \`Status\`・Invalide`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        const botInfo = await TokenUtils.checkBotToken(token);
        if (!botInfo) return;

        message.channel.send(`> ***Bot Token Checker***\n- \`Token\`・Valide\n- \`Nom\`・\`${botInfo.username}#${botInfo.discriminator}\`\n- \`ID\`・\`${botInfo.id}\``)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
    }
};
