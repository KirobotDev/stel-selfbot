/**
 * @author xql.dev
 * @description Suit l'activité d'un utilisateur
 * @see https://github.com/kirobotdev/stel-sb
 * @version 1.0.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { TrackerDB } from '../../utils/tracker';

export default {
    name: "ustracker",
    description: "Suit l'activité d'un utilisateur (connexions, statuts, etc.)",
    usage: "[add/del/list/info/activities] [user]",

    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     * @param {DBConfig} dbConf
     * @param {string} prefix
    */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        let user = message.mentions.users.first();
        if (!user && args[1]) {
            user = client.users.cache.get(args[1]) || await client.users.fetch(args[1]).catch(() => undefined) as any;
        }

        const command = args[0]?.toLowerCase();

        switch (command) {
            case 'add': {
                if (!user || !args[1]) return message.channel.send(`***Aucun utilisateur trouvé pour \`${args[1] ?? 'rien'}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                
                const success = TrackerDB.startTracking(user.id, user.username);
                if (!success) {
                    return message.channel.send(`***\`${user.displayName || user.username}\` est déjà suivi***`)
                        .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                }
                
                message.channel.send(`***Suivi activé pour \`${user.displayName || user.username}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                break;
            }

            case 'del': {
                if (!user || !args[1]) return message.channel.send(`***Aucun utilisateur trouvé pour \`${args[1] ?? 'rien'}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                
                const success = TrackerDB.stopTracking(user.id);
                if (!success) {
                    return message.channel.send(`***\`${user.displayName || user.username}\` n'était pas suivi***`)
                        .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                }
                
                message.channel.send(`***Suivi désactivé pour \`${user.displayName || user.username}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                break;
            }

            case 'list': {
                const trackedUsers = TrackerDB.getAllTracteds();
                if (trackedUsers.length === 0) {
                    return message.channel.send("***Aucun utilisateur suivi***");
                }
                
                const lines = trackedUsers.map(u => {
                    const trackedUser: any = client.users.cache.get(u.userId);
                    const status = trackedUser?.presence?.status || 'offline';
                    const activity = trackedUser?.presence?.activities?.[0]?.name || 'Aucune';
                    return `- \`${u.username}\`・${status} (${activity})`;
                });
                
                const title = `> ***Utilisateurs suivis (${trackedUsers.length}):***\n`;
                await sendChunkedMessage(message.channel, title, lines);
                break;
            }

            case 'info': {
                if (!user || !args[1]) return message.channel.send(`***Aucun utilisateur trouvé pour \`${args[1] ?? 'rien'}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                
                const tracked = TrackerDB.getTrackedUser(user.id);
                if (!tracked) {
                    return message.channel.send(`***\`${user.displayName || user.username}\` n'est pas suivi***`)
                        .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                }
                
                const anyUser = user as any;
                const currentStatus = anyUser.presence?.status || 'offline';
                const currentActivity = anyUser.presence?.activities?.[0]?.name || 'Aucune';

                const sortedConnections = [...tracked.connections].sort((a, b) => a.timestamp - b.timestamp);
                const lastSeen = sortedConnections.length > 0 ? 
                    new Date(sortedConnections[sortedConnections.length - 1].timestamp).toLocaleString('fr-FR') : 
                    'Jamais vu/Inconnu';
                
                const totalConnections = tracked.connections.length;
                const statusChanges = tracked.statusChanges.length;
                const uniqueActivities = [...new Set(tracked.activities.map(a => a.name))].length;
                
                message.channel.send(`> ***Informations de suivi - ${user.displayName || user.username}***\n` +
                    `- \`Statut actuel\`・${currentStatus}\n` +
                    `- \`Activité actuelle\`・${currentActivity}\n` +
                    `- \`Dernière connexion\`・${lastSeen}\n` +
                    `- \`Total connexions\`・${totalConnections}\n` +
                    `- \`Changements de statut\`・${statusChanges}\n` +
                    `- \`Activités différentes\`・${uniqueActivities}\n` +
                    `- \`Suivi depuis\`・<t:${Math.floor(tracked.addedAt / 1000)}:f>`);
                break;
            }

            case 'activities': {
                if (!user || !args[1]) return message.channel.send(`***Aucun utilisateur trouvé pour \`${args[1] ?? 'rien'}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                
                const tracked = TrackerDB.getTrackedUser(user.id);
                if (!tracked) {
                    return message.channel.send(`***\`${user.displayName || user.username}\` n'est pas suivi***`)
                        .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
                }
                
                if (tracked.activities.length === 0) {
                    return message.channel.send(`> ***Activités de ${user.displayName || user.username}***\nAucune activité enregistrée.`);
                }
                
                const recentActivities = [...tracked.activities]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 50)
                    .map(a => `- \`${a.name}\`・<t:${Math.floor(a.timestamp / 1000)}:R>`);
                
                const title = `> ***Activités récentes - ${user.displayName || user.username}***\n`;
                await sendChunkedMessage(message.channel, title, recentActivities);
                break;
            }

            default:
                message.channel.send(`> ***User Tracker - Commandes disponibles:***\n` +
                    `- \`${prefix}ustracker add <utilisateur>\`・Suivre un utilisateur\n` +
                    `- \`${prefix}ustracker del <utilisateur>\`・Arrêter le suivi\n` +
                    `- \`${prefix}ustracker list\`・Liste des utilisateurs suivis\n` +
                    `- \`${prefix}ustracker info <utilisateur>\`・Informations détaillées\n` +
                    `- \`${prefix}ustracker activities <utilisateur>\`・Activités récentes`);
        }
    }
};

async function sendChunkedMessage(channel: any, title: string, lines: string[]) {
    let currentMessage = title;
    const maxLen = 1950; 
    let toSend = [];

    for (const line of lines) {
        if (currentMessage.length + line.length + 1 > maxLen) {
            toSend.push(currentMessage);
            currentMessage = line + '\n';
        } else {
            currentMessage += line + '\n';
        }
    }
    
    if (currentMessage.trim().length > 0) {
        toSend.push(currentMessage);
    }

    for (const msgContent of toSend) {
        await channel.send(msgContent);
        await new Promise(r => setTimeout(r, 1000));
    }
}
