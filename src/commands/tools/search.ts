/**
 * @author xql.dev
 * @description Recherche une commande par son nom
 * @version 9.4.1
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "search",
    description: "Recherche une commande parmi les commandes chargées",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        if (!args[0]) {
            return message.channel.send(`**Recherche** : \`${prefix}search <nom_du_module>\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        const query = args[0].toLowerCase();
        const commandsMap: Map<string, any> = (client as any).commands;

        if (!commandsMap) return message.channel.send("Erreur : Impossible d'accéder à la liste des commandes.");

        const allCommandNames = Array.from(commandsMap.keys());
        
        const exact = allCommandNames.find(c => c === query);
        const similar = allCommandNames.filter(c => c !== query && (c.startsWith(query) || c.includes(query) || query.includes(c)));

        if (!exact && similar.length === 0) {
            return message.channel.send(`Aucune commande trouvée pour : **${query}**`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        let response = `**Résultats de recherche pour** : \`${query}\`\n\n`;

        if (exact) {
            const cmd = commandsMap.get(exact);
            response += `**Exact match** : \`${prefix}${exact}\` - ${cmd.description || 'Pas de description'}\n`;
        }

        if (similar.length > 0) {
            if (exact) response += `\n**Similaires** :\n`;
            similar.forEach(name => {
                const cmd = commandsMap.get(name);
                response += `> \`${prefix}${name}\` - ${cmd.description || 'Pas de description'}\n`;
            });
        }

        message.channel.send(response).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
    }
};
