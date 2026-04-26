/**
 * @author xql.dev
 * @description ready selfbot
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client } from 'safeness-mirore-sb';
import { Logger } from '../utils/logger';
import { updatePresence } from '../utils/presence';
import { Database } from '../utils/database';


export default {
    name: 'ready',
    once: true,
    async execute(client: Client) {
        Logger.success(`${client.user?.tag} est prêt !`);
        
        const db = Database.config;
        await updatePresence(client, db);

        try {
            const { initMultiStatus } = require('../utils/multistatus_manager');
            await initMultiStatus(client);
        } catch (e) {
            Logger.error("Failed to initialize multi-status:", e);
        }

        try {
            const { initRotation } = require('../commands/tools/descriptionrotate');
            initRotation(client);
        } catch (e) {
            Logger.error("Failed to initialize bio rotation:", e);
        }

        client.on('raw', async (packet) => {
            if (packet.t === 'CHANNEL_UPDATE') {
                const data = packet.d;
                if (data.type === 3) { 
                    try {
                        const { getAntiLeaveData } = require('../commands/tools/antileave');
                        const config = getAntiLeaveData(client.user!.id);
                        if (!config.active) return;
                        
                        const targets = config.targets.filter((t: any) => t.group_id === data.id);
                        if (targets.length === 0) return;

                        const recipients = (data.recipients || []).map((r: any) => r.id);
                        if (!data.recipients) return; 

                        for (const target of targets) {
                            if (!recipients.includes(target.target_user_id)) {
                                await (client as any).api.channels(data.id).recipients(target.target_user_id).put();
                            }
                        }
                    } catch {}
                }
            }
        });
  
        const globalAny = global as any;
        if (!globalAny.sbIntervals) globalAny.sbIntervals = new Map<string, NodeJS.Timeout>();
        const intervals = globalAny.sbIntervals;

        let lastHardCheck = 0;
   
        if (intervals.has('antileave')) clearInterval(intervals.get('antileave'));
        const antiLeaveInt = setInterval(async () => {
            try {
                const { getAntiLeaveData } = require('../commands/tools/antileave');
                const data = getAntiLeaveData(client.user!.id);
                if (!data || !data.active || data.targets.length === 0) return;

                const now = Date.now();
                const doHardCheck = now - lastHardCheck > 1000; 
                if (doHardCheck) lastHardCheck = now;

                for (const target of data.targets) {
                    try {
                        let isMissing = false;
                        
                        if (doHardCheck) {
                            const rawChannel = await (client as any).api.channels(target.group_id).get();
                            const recipients = rawChannel.recipients || [];
                            const recipientIds = recipients.map((r: any) => r.id);
                            if (!recipientIds.includes(target.target_user_id)) {
                                isMissing = true;
                            }
                        } else {
                            const channel = client.channels.cache.get(target.group_id);
                            if (channel && (channel as any).type === 3) {
                                const recipients = (channel as any).recipients;
                                if (recipients && !recipients.has(target.target_user_id)) {
                                    isMissing = true;
                                }
                            }
                        }

                        if (isMissing) {
                            await (client as any).api.channels(target.group_id).recipients(target.target_user_id).put();
                        }
                    } catch {}
                }
            } catch {}
        }, 500);
        intervals.set('antileave', antiLeaveInt);

        if (intervals.has('snipe_cleaner')) clearInterval(intervals.get('snipe_cleaner'));
        const snipeInt = setInterval(() => {
            if ((client as any).snipes) {
                (client as any).snipes.clear();
                Logger.info("[Snipe] Cache nettoyé (30min all)");
            }
        }, 30 * 60 * 1000);
        intervals.set('snipe_cleaner', snipeInt);

        client.on('raw', async (packet) => {
            if (packet.t === 'VOICE_STATE_UPDATE') {
                const data = packet.d;
                if (data.channel_id) {
                    try {
                        const { getVoiceLock, isWhitelisted } = require('../commands/voice/voicelock');
                        const maxUsers = getVoiceLock(data.channel_id);
                        
                        if (maxUsers === null) return;

                        if (isWhitelisted(data.channel_id, data.user_id)) return;

                        const channel = client.channels.cache.get(data.channel_id);
                        if (!channel || !(channel as any).members) return;

                        const currentMembersCount = (channel as any).members.size;

                        if (currentMembersCount > maxUsers) {
                            const guild = client.guilds.cache.get(data.guild_id);
                            if (guild) {
                                const memberToKick = guild.members.cache.get(data.user_id) || await guild.members.fetch(data.user_id).catch(() => null);
                                if (memberToKick) {
                                    await memberToKick.voice.disconnect().catch(() => {});
                                    const channelName = (channel as any).name || 'Inconnu';
                                    Logger.info(`[VoiceLock] Kick de ${memberToKick.user.tag} du salon ${channelName} (Limite atteinte: ${maxUsers})`);
                                }
                            }
                        }

                    } catch (e) {
                         Logger.error("Erreur dans le système VoiceLock: " + e);
                    }
                }
            }
        });
    }
};
