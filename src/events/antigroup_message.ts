/**
 * @author xql.dev
 */

import { Client, Message } from 'safeness-mirore-sb';
import { getAntiGroupConfig } from '../commands/groups/antigroup';

export default {
    name: 'messageCreate',
    async execute(client: Client, message: Message) {
        const channelType = String(message.channel.type);
        const messageType = String(message.type);

        if ((channelType === '3' || channelType === 'GROUP_DM') && (messageType === '1' || messageType === 'RECIPIENT_ADD')) {
            const userId = client.user!.id;
            
            if (message.author.id === userId) return;

            const config = getAntiGroupConfig(userId);

            if ((message.channel as any).ownerId !== userId) return;

            const lock = config.locks.find(l => l.group_id === message.channel.id);
            if (!lock) return;

            const totalPeople = (message.channel as any).recipients.size + 1;

            if (totalPeople > lock.member_limit) {
                const addedUser = (message.mentions.users as any).first() || (message as any).recipient;
                
                if (addedUser) {
                    if (addedUser.id === userId) return;
                    if (config.whitelist.includes(addedUser.id)) return;

                    try {
                        await (client as any).api.channels(message.channel.id).recipients(addedUser.id).delete();
                    } catch (e) {}
                }
            }
        }
    }
};
