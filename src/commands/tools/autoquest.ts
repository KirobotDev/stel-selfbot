/**
 * @author xql.dev
 * @description Autoquest
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import axios from 'axios';
import { randomUUID } from 'crypto';

function getActiveQuests(client: any) {
    if (!client._autoquest) {
        client._autoquest = {
            activeQuests: new Map(),
        };
    }
    return client._autoquest.activeQuests;
}

const getDiscordHeaders = (token: string) => {
    const properties = {
        os: 'Windows',
        browser: 'Discord Client',
        release_channel: 'stable',
        client_version: '1.0.9215',
        os_version: '10.0.19045',
        os_arch: 'x64',
        app_arch: 'x64',
        system_locale: 'en-US',
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9215 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36',
        browser_version: '37.6.0',
        os_sdk_version: '19045',
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: 'focused',
    };

    return {
        'Authorization': token.replace(/^Bot /, ''),
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9215 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36',
        'accept-language': 'en-US',
        'origin': 'https://discord.com',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'referer': 'https://discord.com/channels/@me',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-debug-options': 'bugReporterEnabled',
        'x-discord-locale': 'en-US',
        'x-discord-timezone': 'Europe/Paris',
        'x-super-properties': Buffer.from(JSON.stringify(properties)).toString('base64'),
    };
};

export default {
    name: "autoquest",
    description: "Gérer l'auto-complétion des quêtes Discord",
    usage: "autoquest <start|stop|status>",
    category: "settings",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try {
            if (message.deletable) await message.delete().catch(() => {});

            if (!args[0]) {
                return message.channel.send(`Usage: \`${prefix}autoquest <start|stop|status>\``)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }

            const subCommand = args[0].toLowerCase();
            const userId = client.user?.id;
            const token = client.token;

            if (!userId || !token) {
                return message.channel.send('❌ Impossible d\'accéder aux informations du client.')
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
            }

            const cleanToken = token.replace(/^Bot /, '');
            const activeQuests = getActiveQuests(client);

            const axiosConfig = {
                headers: getDiscordHeaders(cleanToken)
            };

            switch (subCommand) {
                case 'start': {
                    if (activeQuests.has(userId)) {
                        return message.channel.send('L\'auto-quest est déjà en cours d\'exécution.').then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
                    }

                    const statusMsg = await message.channel.send('Démarrage de l\'auto-quest...');

                    try {
                        const questsResponse = await axios.get('https://discord.com/api/v10/quests/@me', axiosConfig);
                        const quests = questsResponse.data.quests || [];

                        const validQuests = quests.filter((quest: any) => {
                            const isExcluded = quest.id === '1412491570820812933';
                            const isCompleted = quest.user_status?.completed_at != null;
                            const expiresAt = new Date(quest.config.expires_at);
                            const isExpired = expiresAt.getTime() < Date.now();
                            return !isExcluded && !isCompleted && !isExpired;
                        });

                        if (validQuests.length === 0) {
                            return statusMsg.edit('Aucune quête valide disponible pour le moment.').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
                        }

                        await statusMsg.edit(`${validQuests.length} quête(s) trouvée(s). Démarrage de l'auto-complétion...`);

                        const questProgress = new Map();
                        validQuests.forEach((quest: any) => {
                            questProgress.set(quest.id, {
                                name: quest.config.messages.quest_name,
                                progress: 0,
                                total: 0,
                                status: 'En cours...'
                            });
                        });

                        const progressMessage = await message.channel.send('Initialisation de l\'auto-quest...');

                        activeQuests.set(userId, {
                            quests: validQuests,
                            message: progressMessage,
                            channel: message.channel,
                            questProgress: questProgress,
                            startTime: Date.now(),
                            lastMessageRecreate: null
                        });

                        const questPromises = validQuests.map((quest: any) => processQuest(client, quest, cleanToken, userId));

                        Promise.allSettled(questPromises).then(async () => {
                            const activeMap = getActiveQuests(client);
                            const active = activeMap.get(userId);
                            if (active) {
                                await updateProgressMessage(active);
                                try {
                                    if (active.message) await active.message.edit(`**Auto-quest terminé !**\n\nToutes les quêtes ont été complétées.`);
                                } catch {}
                                activeMap.delete(userId);
                            }
                        });

                        await updateProgressMessage(activeQuests.get(userId));
                    } catch (error: any) {
                        console.error('[AUTOQUEST] Erreur:', error);
                        statusMsg.edit(`Erreur: ${error.message}`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
                    }
                    break;
                }

                case 'stop': {
                    if (!activeQuests.has(userId)) return message.channel.send('Aucun processus actif.').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
                    const active = activeQuests.get(userId);
                    activeQuests.delete(userId);
                    if (active && active.message) active.message.edit('Auto-quest arrêté.').catch(() => {});
                    return message.channel.send('Auto-quest arrêté.').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
                }

                case 'status': {
                    const active = activeQuests.get(userId);
                    if (!active) return message.channel.send('Aucun processus actif.').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
                    await updateProgressMessage(active);
                    return message.channel.send('Statut mis à jour.').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
                }
            }
        } catch (error: any) {
            console.error('[AUTOQUEST] Erreur:', error);
        }
    }
};

async function updateProgressMessage(active: any) {
    if (!active) return;
    const progressLines: string[] = [];
    active.questProgress.forEach((progress: any) => {
        const percentage = progress.total > 0 ? Math.round((progress.progress / progress.total) * 100) : 0;
        const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        const icon = progress.status === 'Terminé' ? '✅' : '🔄';
        progressLines.push(`${icon} **${progress.name}**\n   ${progressBar} ${percentage}%\n   ${progress.progress}/${progress.total}s`);
    });

    const uptime = Math.floor((Date.now() - active.startTime) / 1000);
    const content = `📊 **Auto-Quest Status** (Uptime: ${uptime}s)\n\n${progressLines.join('\n\n')}`;

    try {
        if (active.message) {
            await active.message.edit(content).catch(async () => {
                const newMsg = await active.channel.send(content);
                active.message = newMsg;
            });
        }
    } catch {}
}

async function processQuest(client: any, quest: any, token: string, userId: string) {
    const questName = quest.config.messages.quest_name;
    const questId = quest.id;
    const headers = getDiscordHeaders(token);

    try {
        if (!quest.user_status?.enrolled_at) {
            await axios.post(`https://discord.com/api/v10/quests/${questId}/enroll`, { location: 11, is_targeted: false, metadata_raw: null }, { headers });
        }

        const taskConfig = quest.config.task_config;
        const taskTypes = ['WATCH_VIDEO', 'PLAY_ON_DESKTOP', 'STREAM_ON_DESKTOP', 'PLAY_ACTIVITY', 'WATCH_VIDEO_ON_MOBILE'];
        const taskName = taskTypes.find(type => taskConfig.tasks[type] != null);

        if (!taskName) return;
        const task = taskConfig.tasks[taskName];
        const secondsNeeded = task.target;

        const active = getActiveQuests(client).get(userId);
        if (active) active.questProgress.get(questId).total = secondsNeeded;

        if (taskName === 'WATCH_VIDEO' || taskName === 'WATCH_VIDEO_ON_MOBILE') {
            await handleVideoQuest(client, questId, secondsNeeded, token, userId);
        } else if (taskName === 'PLAY_ON_DESKTOP') {
            await handlePlayQuest(client, questId, quest.config.application.id, secondsNeeded, token, userId);
        }
    } catch (error: any) {
        console.error(`[AUTOQUEST] Erreur ${questName}:`, error.message);
    }
}

async function handleVideoQuest(client: any, questId: string, secondsNeeded: number, token: string, userId: string) {
    let secondsDone = 0;
    while (secondsDone < secondsNeeded) {
        const active = getActiveQuests(client).get(userId);
        if (!active) break;
        secondsDone = Math.min(secondsNeeded, secondsDone + Math.floor(Math.random() * 5) + 5);
        try {
            const res = await axios.post(`https://discord.com/api/v10/quests/${questId}/video-progress`, { timestamp: secondsDone + Math.random() }, { headers: getDiscordHeaders(token) });
            active.questProgress.get(questId).progress = secondsDone;
            if (res.data?.completed_at) {
                active.questProgress.get(questId).status = 'Terminé';
                break;
            }
        } catch {}
        await updateProgressMessage(active);
        await new Promise(r => setTimeout(r, 5000));
    }
}

async function handlePlayQuest(client: any, questId: string, appId: string, secondsNeeded: number, token: string, userId: string) {
    let completed = false;
    while (!completed) {
        const active = getActiveQuests(client).get(userId);
        if (!active) break;
        try {
            await axios.post(`https://discord.com/api/v10/quests/${questId}/heartbeat`, { application_id: appId, terminal: false }, { headers: getDiscordHeaders(token) });
            const res = await axios.get('https://discord.com/api/v10/quests/@me', { headers: getDiscordHeaders(token) });
            const quest = res.data.quests.find((q: any) => q.id === questId);
            if (quest?.user_status?.completed_at) {
                completed = true;
                active.questProgress.get(questId).status = 'Terminé';
                active.questProgress.get(questId).progress = secondsNeeded;
            } else {
                active.questProgress.get(questId).progress = quest?.user_status?.progress?.['PLAY_ON_DESKTOP']?.value || 0;
            }
        } catch {}
        await updateProgressMessage(active);
        await new Promise(r => setTimeout(r, 15000));
    }
}
