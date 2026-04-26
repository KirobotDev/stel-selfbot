/**
 * @author xql.dev
 * @description Affiche uptime du sb
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { isOwner } from './addowner';
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
    name: "uptime",
    description: "Affiche le temps d'activité du selfbot",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        let hasPermission = false;
        
        if (isOwner(message.author.id)) hasPermission = true;

        try {
            const configPath = join(process.cwd(), 'config.json');
            const config = JSON.parse(readFileSync(configPath, 'utf8'));
            if (config.owner === message.author.id) hasPermission = true;
            if (!config.owner && client.user?.id === message.author.id) hasPermission = true;
        } catch {
            if (client.user?.id === message.author.id) hasPermission = true;
        }

        if (!hasPermission) {
            return message.edit("***Tu n'as pas la permission d'utiliser cette commande.***")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const totalSeconds = (client.uptime || 0) / 1000;
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const seconds = Math.floor(totalSeconds % 60);

        let uptimeStr = "";
        if (days > 0) uptimeStr += `${days}j `;
        if (hours > 0) uptimeStr += `${hours}h `;
        if (minutes > 0) uptimeStr += `${minutes}m `;
        uptimeStr += `${seconds}s`;

        await message.edit(`***Le selfbot est en ligne depuis : \`${uptimeStr}\`***`);
    }
};
