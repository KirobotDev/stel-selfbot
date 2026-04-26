/**
 * @author xql.dev
 * @description Spam messages
 * @see https://github.com/kirobotdev/stel-sb
 * @version 1.1.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

if (!(global as any).activeSpams) {
    (global as any).activeSpams = new Set<string>();
}

export default {
    name: "spam",
    description: "Envoie un nombre défini de messages",
    aliases: ["stopspam"],
    usage: "<nombre> <message> / +stopspam",
    dir: "Utils",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     * @param {DBConfig} dbConf
     * @param {string} prefix
    */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const commandName = message.content.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();

        if (commandName === "stopspam" || (commandName === "spam" && args[0]?.toLowerCase() === "stop")) {
            if (!(global as any).activeSpams.has(message.channel.id)) {
                return message.edit(`***Aucun spam en cours dans ce salon.***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            (global as any).activeSpams.delete(message.channel.id);
            return message.edit(`***Le spam a été arrêté.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }

        const count = parseInt(args[0]);
        const spamMessage = args.slice(1).join(" ");

        if (isNaN(count) || count <= 0) {
            return message.edit(`***Usage: \`${prefix}spam <nombre> <message>\`***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        if (!spamMessage) {
            return message.edit(`***Veuillez spécifier un message à spammer.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        if ((global as any).activeSpams.has(message.channel.id)) {
            return message.edit(`***Un spam est déjà en cours dans ce salon. Utilisez \`${prefix}stopspam\` pour l'arrêter.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        await message.delete().catch(() => {});

        (global as any).activeSpams.add(message.channel.id);

        for (let i = 0; i < count; i++) {
            if (!(global as any).activeSpams.has(message.channel.id)) break;

            await message.channel.send(spamMessage).catch(() => {
                (global as any).activeSpams.delete(message.channel.id);
            });

            await new Promise(r => setTimeout(r, 1000));
        }

        (global as any).activeSpams.delete(message.channel.id);
    }
};
