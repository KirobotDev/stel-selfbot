/**
 * @author xql.dev
 * @description restart tout le $B
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { isOwner } from './addowner';
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
    name: "restartsb",
    description: "Redémarre complètement le selfbot (processus)",
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

        await message.edit("***Redémarrage du selfbot en cours...***")
            .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));

        const channelId = message.channel.id;

        setTimeout(async () => {
            try {
                const globalAny = global as any;
                if (globalAny.restartClient) {
                    await globalAny.restartClient();
                    
                    const nextClient = globalAny.client;
                    const nextChannel = nextClient?.channels?.cache.get(channelId);
                    
                    if (nextChannel) {
                        await (nextChannel as any).send("***Tous les clients ont été redémarrés avec succès !***")
                            .then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
                    }
                } else {
                    await client.destroy();
                    await client.login((client as any).token);
                    const nextChannel = client.channels.cache.get(channelId);
                    if (nextChannel) {
                        await (nextChannel as any).send("***Relancé***")
                            .then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
                    }
                }
            } catch (e) {
                console.error("Erreur lors du redémarrage du client:", e);
                const nextClient = (global as any).client;
                const nextChannel = nextClient?.channels?.cache.get(channelId);
                if (nextChannel) {
                    await (nextChannel as any).send("***Erreur lors du redémarrage...***")
                        .then((m: any) => setTimeout(() => m.delete().catch(() => {}), 5000));
                }
            }
        }, 1000);
    }
};
