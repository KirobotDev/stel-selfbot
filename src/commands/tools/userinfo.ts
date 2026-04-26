import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "userinfo",
    description: "Affiche les informations d'un utilisateur",
    aliases: ['ui'],
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        let user: any;
        const targetId = args[0] ? args[0].replace(/[<@!>]/g, '') : null;

        if (targetId) {
            user = client.users.cache.get(targetId) || await client.users.fetch(targetId).catch(() => null);
        }
        
        if (!user) {
            user = client.user;
        }

        await user.fetch().catch(() => false);

        const sharedGuilds = client.guilds.cache.filter((g: any) => g.members.cache.has(user.id)).size;
        
        let sharedGroups = 0;
        client.channels.cache.forEach((c: any) => {
            if ((c.type === 'GROUP_DM' || c.type === 3) && c.recipients && c.recipients.has(user.id)) {
                sharedGroups++;
            }
        });

        const createdDays = Math.floor((Date.now() - user.createdTimestamp) / 1000 / 60 / 60 / 24);
        const unixTime = Math.round(user.createdTimestamp / 1000);

        const avatarLink = user.avatar ? `[Lien avatar](${user.avatarURL({ dynamic: true, size: 4096 })})` : 'Aucune';
        const bannerLink = user.banner ? `[Lien bannière](${user.bannerURL({ dynamic: true, size: 4096 })})` : 'Aucune';
        const decorationLink = user.avatarDecorationURL ? `[Lien décoration](${user.avatarDecorationURL({ size: 4096 })})` : 'Aucune';
        const clanTag = user.clan ? user.clan.tag : "Non";
        const isBot = user.bot ? "Oui" : "Non";
        
        const display = user.displayName || user.globalName || user.username;

        const infoMessage = `> ***Informations sur \`${display}\`***\n` +
            `- \`Utilisateur\`・<@${user.id}> (\`${user.username}\` | \`${user.id}\`)\n` +
            `- \`Date de création\`・<t:${unixTime}:f> (<t:${unixTime}:R>)\n` +
            `- \`Jours depuis la création\`・${createdDays}\n` +
            `- \`Bot\`・${isBot}\n` +
            `- \`Serveurs en commun(s)\`・${sharedGuilds}\n` +
            `- \`Groupes en commun(s)\`・${sharedGroups}\n` +
            `- \`Clan\`・${clanTag}\n` +
            `- \`Avatar\`・${avatarLink}\n` +
            `- \`Bannière\`・${bannerLink}\n` +
            `- \`Décoration\`・${decorationLink}`;

        message.channel.send(infoMessage).then((m: Message) => setTimeout(() => m.delete().catch(() => {}), 20000));
    }
};
