/**
 * @author xql.dev
 * @description Protection contre les grp
 */

import { Client } from 'safeness-mirore-sb';
import { getAntiGroupConfig } from '../commands/groups/antigroup';

export default {
    name: 'channelCreate',
    async execute(client: Client, channel: any) {
        if (channel.type === 3 || String(channel.type) === '3' || channel.type === 'GROUP_DM') {
            const userId = client.user!.id;
            const config = getAntiGroupConfig(userId);

            if (!config.enabled) return;
            if (channel.ownerId === userId) return;
            if (config.whitelist.includes(channel.ownerId)) return;

            try {
                if (config.message) {
                    try { await channel.send(config.message); } catch {}
                }
                await (client as any).api.channels(channel.id).delete({ query: { silent: true } });
            } catch (error) {}
        }
    }
};
