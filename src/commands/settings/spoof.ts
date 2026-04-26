/**
 * @author xql.dev
 * @description Spoofing
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig, Database } from '../../utils/database';

const platforms: Record<string, { os: string, browser: string }> = {
    "web": { os: "Other", browser: "Discord Web" },
    "mobile": { os: "Android", browser: "Discord Android" },
    "desktop": { os: "Linux", browser: "Discord Client" },
    "ps5": { os: "Linux", browser: "Discord Embedded" },
    "xbox": { os: "Windows", browser: "Discord Embedded" }
};

export default {
    name: "spoof",
    description: "Modifie la plateforme du bot",
    usage: "<web/mobile/desktop/ps5/xbox>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const choice = args[0]?.toLowerCase();

        if (!choice || !platforms[choice]) {
            const list = Object.keys(platforms).map(p => `- \`${p}\``).join('\n');
            return message.edit(`> ***Veuillez choisir une plateforme valide***\n${list}`);
        }

        Database.set('platform' as any, choice);

        await message.edit(`***Plateforme modifiée pour \`${choice}\` !***\n> *Le client Discord redémarre...*`);
        
        setTimeout(async () => {
            try {
                const globalAny = global as any;
                if (globalAny.restartClient) await globalAny.restartClient();
                else {
                    await client.destroy();
                    await client.login((client as any).token);
                }
            } catch (e) {
                console.error("Erreur lors du redémarrage du client:", e);
            }
        }, 2000);
    }
};
