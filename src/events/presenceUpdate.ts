import { Client } from "safeness-mirore-sb";
import { TrackerDB } from "../utils/tracker";

export const execute = async (client: Client, oldPresence: any, newPresence: any) => {
    if (!newPresence || !newPresence.userId) return;

    const tracked = TrackerDB.getTrackedUser(newPresence.userId);
    if (!tracked) return; 

    const oldStatus = oldPresence?.status || 'offline';
    const newStatus = newPresence?.status || 'offline';
    
    if (oldStatus !== newStatus) {
        TrackerDB.addStatusChange(newPresence.userId, oldStatus, newStatus);
        
        if (newStatus === 'offline' || newStatus === 'invisible') {
            TrackerDB.addConnection(newPresence.userId, 'offline');
        } else if (oldStatus === 'offline' || oldStatus === 'invisible') {
            TrackerDB.addConnection(newPresence.userId, 'online');
        }
    }

    const oldActivitiesStr = oldPresence?.activities ? JSON.stringify(oldPresence.activities) : '[]';
    const newActivitiesStr = newPresence?.activities ? JSON.stringify(newPresence.activities) : '[]';

    if (oldActivitiesStr !== newActivitiesStr) {
        const newActivities = newPresence?.activities || [];
        
        for (const activity of newActivities) {
            const existed = oldPresence?.activities?.find((a: any) => a.name === activity.name);
            
            if (!existed && activity.name) {
                TrackerDB.addActivity(newPresence.userId, activity.name, activity.type);
            }
        }
    }
};

export const name = 'presenceUpdate';
