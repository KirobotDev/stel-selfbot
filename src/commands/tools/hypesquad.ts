/**
 * @author xql.dev
 * @description Permet de changer de house HypeSquad ou de voir tous les badges disponibles
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "hypesquad",
    description: "Affiche tous les badges HypeSquad ou change de house",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        if (!args[0]) {
            return message.channel.send(
                `***Voici tous les badges HypeSquad disponibles :***\n\n` +
                `**HypeSquad Bravery**\n` +
                `**HypeSquad Brilliance**\n` +
                `**HypeSquad Balance**\n\n` +
                `Pour en obtenir un : \`${prefix}hypesquad bravery\` / \`brilliance\` / \`balance\`\n` +
                `Pour quitter : \`${prefix}hypesquad leave\``
            ).then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 15000));
        }

        const choice = args[0].toLowerCase();

        const houses: { [key: string]: 1 | 2 | 3 | 0 } = {
            bravery: 1,
            brilliance: 2,
            balance: 3,
            leave: 0
        };

        if (!houses.hasOwnProperty(choice)) {
            return message.channel.send(
                `***House invalide !***\n` +
                `Choix possibles : \`bravery\`, \`brilliance\`, \`balance\`, \`leave\``
            ).then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 8000));
        }

        try {
            await client.user?.setHypeSquad(houses[choice]);

            if (choice === "leave") {
                message.channel.send("***Tu as quitté HypeSquad avec succès !***")
                    .then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 10000));
            } else {
                const houseName = choice.charAt(0).toUpperCase() + choice.slice(1);
                message.channel.send(`***Tu as maintenant le badge HypeSquad ${houseName} !***`)
                    .then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 10000));
            }
        } catch (error) {
            console.error(error);
            message.channel.send("***Erreur lors du changement de badge HypeSquad. Réessaie plus tard.***")
                .then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 8000));
        }
    }
};
