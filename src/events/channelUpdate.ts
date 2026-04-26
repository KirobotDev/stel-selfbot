/**
 * @author xql.dev
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, DMChannel } from 'safeness-mirore-sb';
import { getNameLock, getPDPLock } from '../commands/groups/antigroup';
import axios from 'axios';

export default {
    name: 'channelUpdate',
    /**
     * @param {Client} client
     * @param {any} oldChannel
     * @param {any} newChannel
    */
    execute: async (client: Client, oldChannel: any, newChannel: any) => {
        if ((newChannel.type as any) !== 'GROUP_DM' && (newChannel.type as any) !== 3) return;

        const lockedName = getNameLock(newChannel.id);
        if (lockedName && newChannel.name !== lockedName) {
            try {
                await newChannel.setName(lockedName);
            } catch (error) {}
        }

        const lockedUrl = getPDPLock(newChannel.id);
        if (lockedUrl) {
            if (oldChannel.icon !== newChannel.icon) {
                try {
                    const response = await axios.get(lockedUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'utf-8');
                    await newChannel.setIcon(buffer);
                } catch (error) {}
            }
        }
    }
};
