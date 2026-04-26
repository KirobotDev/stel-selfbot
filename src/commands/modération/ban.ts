/**
 * @author xql.dev
 * @description Ban a user by ID
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Message, Client, Permissions } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: 'ban',
    description: 'Bannir un utilisateur par son ID',
    aliases: ['b'],
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        if (!message.guild) {
            return message.edit(`Cette commande doit être utilisée dans un serveur.`);
        }

        if (!message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR as any)) {
            return message.edit(`Vous n'avez pas la permission \`Administrateur\` pour bannir des membres.`);
        }

        const userId = args[0];
        if (!userId) {
            return message.edit(`Usage : \`${prefix}ban <ID>\``);
        }

        try {
            await message.guild.members.ban(userId);
            await message.edit(`L'utilisateur \`${userId}\` a été banni avec succès.`);
        } catch (error) {
            console.error(`Error banning user ${userId}:`, error);
            await message.edit(`Une erreur est survenue lors du bannissement de \`${userId}\`.`);
        }
    }
};