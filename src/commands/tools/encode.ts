/**
 * @author xql.dev
 * @description Encode msg
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "encode",
    description: "Encode un message en Base64",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }
        
        const text = args.join(" ");
        if (!text) {
            return message.channel.send("Tu dois spécifier un message à encoder.")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const encoded = Buffer.from(text).toString('base64');
        message.channel.send(`\`\`\`\n${encoded}\n\`\`\``);
    }
};
