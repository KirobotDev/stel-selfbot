/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import axios from 'axios';

export default {
    name: "ipinfo",
    description: "Affiche l'information d'une IP",
    usage: "<ip>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        if (!args[0]) {
            return message.edit('***Veuillez entrer une IP valide***')
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        try {
            const response = await axios.get(`http://ip-api.com/json/${args[0]}`);
            const json = response.data;

            if (json.status !== "success") {
                return message.edit(`***L'IP \`${args[0]}\` est invalide***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
            }

            const responseMsg = `> ***Informations sur l'IP \`${args[0]}\`***\n` +
                `- \`Ville\`・${json.city ?? '?'}\n` +
                `- \`Région\`・${json.regionName ?? '?'}\n` +
                `- \`Pays\`・${json.country ?? '?'} ${json.countryCode ? `(\`${json.countryCode}\`)` : ''}\n` +
                `- \`Code Postal\`・${json.zip ?? '?'}\n` +
                `- \`Coordonnées\`・${json.lat && json.lon ? `[\`Google Maps\`](<https://www.google.com/maps/place/${json.lat},${json.lon}>)` : '?'}\n` +
                `- \`Organisation\`・${json.org ?? ''}\n` +
                `- \`Fuseau Horaire\`・${json.timezone ?? '?'}`;

            await message.edit(responseMsg);
        } catch (error) {
            await message.edit(`***Erreur lors de la récupération des informations de l'IP.***`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
    }
};
