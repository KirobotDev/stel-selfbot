/**
 * @author xql.dev
 * @description Gère l'auto-join au gw
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { getAutoGWData } from '../commands/tools/autogw';

async function handleAutoGW(client: Client, message: Message) {
    if (message.author.id === client.user?.id) return;

    const data = getAutoGWData();
    if (!data.active) return;

    if (data.bots.includes(message.author.id)) {
        const giveawayEmoji = "🎉"; 
        if (message.content?.includes(giveawayEmoji) || message.embeds?.some(e => e.description?.includes(giveawayEmoji) || e.title?.includes(giveawayEmoji))) {
            try { await message.react(giveawayEmoji); } catch {}
        }

        const components = (message as any).components;
        if (components && components.length > 0) {
            for (const row of components) {
                for (const component of row.components) {
                    if (component.type === 'BUTTON' || component.type === 2) {
                        const label = component.label?.toLowerCase() || "";
                        const emojiName = component.emoji?.name || "";
                        
                        if (label.includes("participer") || label.includes("join") || label.includes("enter") || emojiName.includes("🎉")) {
                            try {
                                await message.clickButton(component.customId || component.id);
                            } catch (e) {}
                        }
                    }
                }
            }
        }
    }
}

export default {
    name: 'messageUpdate',
    async execute(client: Client, oldMessage: Message, newMessage: Message) {
        await handleAutoGW(client, newMessage);
    }
};
