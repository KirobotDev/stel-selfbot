import { Client, Message } from 'safeness-mirore-sb';

export default {
    name: 'messageDelete',
    execute: async (client: any, message: Message) => {
        if (!message || !message.author) return;

        if (message.author.id === client.user?.id) return;

        if (!client.snipes) client.snipes = new Map();
        
        client.snipes.set(message.channel.id, {
            content: message.content || "*Aucun contenu*",
            author: message.author.tag || "Inconnu",
            avatar: message.author.displayAvatarURL() || null,
            date: message.createdTimestamp || Date.now(),
            image: message.attachments.first()?.url || null,
        });
    }
};
