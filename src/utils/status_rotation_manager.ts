/**
 * @author xql.dev
 * @description rotate status
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, PresenceStatusData } from 'safeness-mirore-sb';
import { Database } from './database';

const statuses: PresenceStatusData[] = ['online', 'idle', 'dnd', 'invisible'];
let interval: NodeJS.Timeout | null = null;
let currentIndex = 0;

export async function rotateStatus(client: Client) {
    const status = statuses[currentIndex];
    
    try {
        await fetch("https://discord.com/api/v9/users/@me/settings", {
            method: "PATCH",
            headers: {
                "Authorization": (client as any).token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: status })
        });
    } catch (e) {
        client.user?.setStatus(status);
    }

    currentIndex = (currentIndex + 1) % statuses.length;
}

export function startStatusRotation(client: Client) {
    if (interval) clearInterval(interval);
    
    interval = setInterval(() => rotateStatus(client), 10000);
    rotateStatus(client);
}

export function stopStatusRotation() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

export function isRotating() {
    return interval !== null;
}
