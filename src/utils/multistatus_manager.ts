/**
 * @author xql.dev
 * @description manager status
 * @version 9.1.4
 * @license MIT
 * @see https://github.com/kirobotdev/stel-sb
 * @error "https://github.com/kirobotdev/stash/issues/5"
 */

import { Client } from 'safeness-mirore-sb';
import { MultiStatusDB, UserMultiConfig } from './multistatus_db';
import { Logger } from './logger';

const intervals = new Map<string, NodeJS.Timeout>();

export async function updateMultiStatus(client: Client, userId: string) {
    const config = MultiStatusDB.getConfig(userId);

    if (!config.isActive || config.statuses.length === 0) {
        stopMultiStatus(userId);
        return;
    }

    let index = config.currentIndex;
    if (index >= config.statuses.length) index = 0;

    const current = config.statuses[index];
    if (!current) return;

    try {
        await (client as any).settings.setCustomStatus({
            text: current.text || null,
            emoji: current.emoji || null,
            expires: null
        });
        
        const nextIndex = (index + 1) % config.statuses.length;
        MultiStatusDB.updateIndex(userId, nextIndex);
    } catch (err) {
        Logger.error(`[MultiStatus] Erreur update pour ${userId}:`, err);
        stopMultiStatus(userId);
    }
}

export function startMultiStatusRotation(client: Client, userId: string) {
    if (intervals.has(userId)) {
        clearInterval(intervals.get(userId)!);
    }

    updateMultiStatus(client, userId);
    const interval = setInterval(() => updateMultiStatus(client, userId), 30000);
    intervals.set(userId, interval);
}

export function stopMultiStatus(userId: string) {
    if (intervals.has(userId)) {
        clearInterval(intervals.get(userId)!);
        intervals.delete(userId);
    }
    MultiStatusDB.setActive(userId, false);
}

export async function initMultiStatus(client: Client) {
    if (!client.user) return;
    const config = MultiStatusDB.getConfig(client.user.id);
    if (config.isActive && config.statuses.length > 0) {
        startMultiStatusRotation(client, client.user.id);
    }
}
