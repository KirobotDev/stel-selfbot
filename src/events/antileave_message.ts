/**
 * @author xql.dev
 */

import { Client, Message } from 'safeness-mirore-sb';
import { getAntiLeaveData } from '../commands/tools/antileave';

export default {
    name: 'messageCreate',
    async execute(client: Client, message: Message) {
        const channelType = String(message.channel.type);
        const messageType = String(message.type);

        if ((channelType === '3' || channelType === 'GROUP_DM') && (messageType === '2' || messageType === 'RECIPIENT_REMOVE')) {
            const userId = client.user!.id;
            const data = getAntiLeaveData(userId);

            if (!data.active) return;

            const removedUser = (message.mentions.users as any).first() || (message as any).recipient || message.author;
            if (!removedUser) return;

            const isTarget = data.targets.some(t => t.group_id === message.channel.id && t.target_user_id === removedUser.id);

            if (isTarget) {
                try {
                    await (client as any).api.channels(message.channel.id).recipients(removedUser.id).put();
                } catch (error) {}
            }
        }
    }
};
