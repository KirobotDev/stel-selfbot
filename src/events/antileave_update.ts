/**
 * @author xql.dev
 * @description Surveillance 
 */

import { Client } from 'safeness-mirore-sb';
import { getAntiLeaveData } from '../commands/tools/antileave';

export default {
    name: 'channelUpdate',
    async execute(client: Client, oldChannel: any, newChannel: any) {
        if (newChannel.type === 3 || String(newChannel.type) === '3' || newChannel.type === 'GROUP_DM') {
            const userId = client.user!.id;
            const data = getAntiLeaveData(userId);

            if (!data.active) return;

            const currentMemberIds = (newChannel.recipients as any).map((r: any) => r.id);
            if (!currentMemberIds.includes(userId)) currentMemberIds.push(userId);

            for (const target of data.targets) {
                if (target.group_id === newChannel.id) {
                    if (!currentMemberIds.includes(target.target_user_id)) {
                        try {
                            await (client as any).api.channels(newChannel.id).recipients(target.target_user_id).put();
                        } catch (error) {}
                    }
                }
            }
        }
    }
};
