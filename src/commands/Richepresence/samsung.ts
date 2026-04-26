/**
 * @author xql.dev
 * @description Joue à un RPC samsung
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

const games: Record<string, string> = {
    "clash-royale": "com.supercell.clashroyale",
    "clash-of-clans": "com.supercell.clashofclans",
    "brawl-stars": "com.supercell.brawlstars",
    "warzone": "com.activision.callofduty.warzone",
    "roblox": "com.roblox.client",
    "geometry-dash": "com.robtopx.geometryjumplite",
    "subway": "com.kiloo.subwaysurf",
    "candy-crush": "com.king.candycrushsaga",
    "piano-tiles": "com.youmusic.magictiles",
    "fnaf": "com.scottgames.fivenightsatfreddys",
    "minecraft": "com.mojang.minecraftpe",
    "genshin": "com.miHoYo.GenshinImpact",
    "stumble-guys": "com.kitkagames.fallbuddies",
    "honkai-star-rail": "com.HoYoverse.hkrpgoversea",
};

export default {
    name: "samsung",
    description: "Joue à un RPC Samsung",
    usage: "<jeu> <START/UPDATE/STOP>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const gameInput = args[0]?.toLowerCase();
        const actionInput = args[1]?.toUpperCase() as 'START' | 'UPDATE' | 'STOP';

        if (!gameInput || !games[gameInput]) {
            const gameList = Object.keys(games).map(g => `\`${g}\``).join(', ');
            return message.edit(`***Veuillez choisir un jeu valide :***\n${gameList}`);
        }

        if (!['START', 'UPDATE', 'STOP'].includes(actionInput)) {
            return message.edit(`***Veuillez choisir un type valide (\`START\`, \`UPDATE\`, ou \`STOP\`)***`);
        }

        try {
            const rpc = await client.user?.setSamsungActivity(games[gameInput], actionInput);
            
            if (rpc) {
                return message.edit(`***Votre RPC Samsung (\`${gameInput}\`) a été modifié avec succès !***`);
            } else {
                return message.edit("***Votre RPC Samsung n'a pas pu être modifié***");
            }
        } catch (error) {
            console.error(error);
            return message.edit("***Une erreur est survenue lors de la modification du RPC Samsung***");
        }
    }
};