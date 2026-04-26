/**
 * @author xql.dev
 * @description Commande de changement de langue
 * @version 2.4.6
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Message, Client } from 'safeness-mirore-sb';
import { Database, DBConfig } from '../../utils/database';
import { t } from '../../utils/translator';

export default {
    name: 'lang',
    description: 'Changer la langue du selfbot',
    run: async (client: Client, message: Message, args: string[], db: DBConfig) => {
        const lang = args[0]?.toLowerCase();

        if (lang === 'fr' || lang === 'en') {
            db.language = lang as 'fr' | 'en';
            Database.save();
            await message.edit(t('LANG_SET')).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        } else {
            await message.edit(t('LANG_INVALID')).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }
    }
};
