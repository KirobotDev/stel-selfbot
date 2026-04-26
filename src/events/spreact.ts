/**
 * @author xql.dev
 * @description auto react spreact
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { getSpreactTargets } from '../commands/tools/spreact';

export default {
    name: 'messageCreate',
    async execute(client: Client, message: Message) {
        if (message.author.id === client.user?.id) return;

        const targets = getSpreactTargets();
        const target = targets.find(t => t.user_id === message.author.id);

        if (target) {
            try {
                await message.react(target.emoji);
            } catch (error) {
            }
        }
    }
};
