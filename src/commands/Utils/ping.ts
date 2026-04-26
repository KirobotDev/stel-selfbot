/**
 * @author xql.dev
 * @description Ping test your ping
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Message, Client } from 'safeness-mirore-sb';
import { t } from '../../utils/translator';
import { DBConfig } from '../../utils/database';

export default {
    name: 'ping',
    description: 'Vérifier la latence du selfbot',
    run: async (client: Client, message: Message, args: string[], db: DBConfig) => {
        const start = Date.now();
        await message.edit(t('PING_LOADING'));
        const end = Date.now();
        const ms = end - start;
        await message.edit(t('PING_RESULT', { ms }));
    }
};
