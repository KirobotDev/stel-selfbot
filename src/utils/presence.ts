/**
 * @author xql.dev
 * @description Precense Spotify
 * @License MIT
 * @version 2.1.9
 * @see https://github.com/kirobotdev/stel-sb
 * @error "https://github.com/kirobotdev/stash/issues/4"
 */

import { Client } from 'safeness-mirore-sb';
const { RichPresence, CustomStatus, SpotifyRPC } = require('safeness-mirore-sb');
import { DBConfig } from './database';
import { Logger } from './logger';

export async function updatePresence(client: Client, db: DBConfig) {
    try {
        if (!client.user) return;

        const currentActivities = (client.user as any).presence.activities || [];
        const customActivity = currentActivities.find((a: any) => a.type === 'CUSTOM' || a.type === 4);
        
        const activities: any[] = [];

        if (db.spotifyonoff) {
            const spotify = new SpotifyRPC(client)
                .setAssetsLargeImage(db.spotifylargeimage || "spotify:default")
                .setAssetsSmallImage(db.spotifysmallimage || "spotify:default");

            if (db.spotifyalbum) spotify.setAssetsLargeText(db.spotifyalbum);
            if (db.spotifyartists) spotify.setState(db.spotifyartists);
            if (db.spotifysongname) spotify.setDetails(db.spotifysongname);

            if (db.spotifyendtimestamp) {
                spotify.setStartTimestamp(Date.now());
                spotify.setEndTimestamp(Date.now() + db.spotifyendtimestamp);
            }

            const trackId = db.spotifysongid || "4cOdK9PwtM3976v9STIvqc"; 
            spotify.setSongId(trackId);
            
            if (db.spotifyalbumid) spotify.setAlbumId(db.spotifyalbumid);
            if (db.spotifyartistids && db.spotifyartistids.length > 0) {
                spotify.setArtistIds(...db.spotifyartistids);
            }

            const spotifyData = spotify.toJSON();
            spotifyData.id = "spotify:1";
            spotifyData.flags = 48; 
            
            const sessionId = (client as any).sessionId || ((client as any).ws?.shards?.first()?.sessionId);
            if (sessionId) spotifyData.session_id = sessionId;
            
            spotifyData.party = { id: `spotify:${client.user.id}` };
            
            activities.push(spotifyData);
        }

        if (db.rpconoff) {
            const appId = (db.appid && /^[0-9]{17,19}$/.test(db.appid)) ? db.appid : "1256330960572223594";
            const rpc = new RichPresence(client)
                .setApplicationId(appId)
                .setName((typeof db.rpctitle === 'string' ? db.rpctitle.trim() : '') || "Mirore SB");

            if (db.rpcdetails && db.rpcdetails.trim()) rpc.setDetails(db.rpcdetails.trim());
            if (db.rpcstate && db.rpcstate.trim()) rpc.setState(db.rpcstate.trim());
            
            if (typeof db.rpcminparty === 'number' && typeof db.rpcmaxparty === 'number' && db.rpcmaxparty > 0) {
                rpc.setParty({
                    current: db.rpcminparty,
                    max: db.rpcmaxparty,
                    id: `party-${client.user.id}`
                });
            }

            if (db.rpctime) rpc.setStartTimestamp(db.rpctime);
            if (db.rpclargeimage) {
                rpc.setAssetsLargeImage(db.rpclargeimage);
                if (db.rpclargeimagetext) rpc.setAssetsLargeText(db.rpclargeimagetext);
            }
            if (db.rpcsmallimage) {
                rpc.setAssetsSmallImage(db.rpcsmallimage);
                if (db.rpcsmallimagetext) rpc.setAssetsSmallText(db.rpcsmallimagetext);
            }

            if (db.buttontext1 && db.buttonlink1) rpc.addButton(db.buttontext1, db.buttonlink1);
            if (db.buttontext2 && db.buttonlink2) rpc.addButton(db.buttontext2, db.buttonlink2);

            const types: any = { 'PLAYING': 0, 'STREAMING': 1, 'LISTENING': 2, 'WATCHING': 3, 'COMPETING': 5 };
            if (db.rpctype && types[db.rpctype] !== undefined) rpc.setType(types[db.rpctype]);
            if (db.twitch && db.rpctype === 'STREAMING') rpc.setURL(db.twitch);
            if (db.rpcplatform) rpc.setPlatform(db.rpcplatform as any);

            if (appId && (db.rpclargeimage?.startsWith('http') || db.rpcsmallimage?.startsWith('http'))) {
                 try {
                    const external = await RichPresence.getExternal(
                        client, 
                        appId, 
                        db.rpclargeimage?.startsWith('http') ? db.rpclargeimage : '', 
                        db.rpcsmallimage?.startsWith('http') ? db.rpcsmallimage : ''
                    );
                    if (external && external.length > 0) {
                        if (db.rpclargeimage?.startsWith('http')) rpc.setAssetsLargeImage(external[0].external_asset_path);
                        if (db.rpcsmallimage?.startsWith('http')) rpc.setAssetsSmallImage(external.length > 1 ? external[1].external_asset_path : external[0].external_asset_path);
                    }
                } catch (e) {}
            }

            activities.push(rpc.toJSON());
        }

        if (customActivity) {
            activities.push({
                name: "Custom Status",
                type: 4,
                state: customActivity.state || "",
                emoji: customActivity.emoji || undefined
            });
        } else {
            try {
                const { MultiStatusDB } = require('./multistatus_db');
                const config = MultiStatusDB.getConfig(client.user.id);
                if (config.isActive && config.statuses.length > 0) {
                    const status = config.statuses[config.currentIndex];
                    if (status) {
                        activities.push({
                            name: "Custom Status",
                            type: 4,
                            state: status.text || "",
                            emoji: status.emoji || undefined
                        });
                    }
                }
            } catch (e) {}
        }


        (client.user as any).setPresence({
            activities,
            status: (client.user as any).presence.status || 'online',
            afk: false
        });

    } catch (e) {
        Logger.error("Presence Update Error:", e);
    }
}
