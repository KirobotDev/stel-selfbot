/**
 * @author xql.dev
 * @description Decode msg
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "decode",
    description: "Décode un message encodé à partir de son ID (ou d'un texte)",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }
        
        const input = args[0];
        if (!input) {
            return message.channel.send(`Usage : \`${prefix}decode <ID_MESSAGE_OU_TEXTE>\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
        }

        try {
            let targetContent = input;
            
            if (/^\d{17,20}$/.test(input)) {
                const targetMsg = await message.channel.messages.fetch(input).catch(() => null);
                if (targetMsg) {
                    targetContent = targetMsg.content;
                }
            }

            targetContent = targetContent.replace(/```/g, '').trim();

            const decoded = Buffer.from(targetContent, 'base64').toString('utf-8');
            
            message.channel.send(`> **Message décodé :**\n${decoded}`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        } catch (e) {
            message.channel.send("Impossible de trouver ou de décoder ce message.")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
    }
};
