/**
 * @author xql.dev
 * @description Commande de configuration de spotify rpc
 * @version 2.4.6
 * @see https://github.com/kirobotdev/stel-sb
 * @license MIT
 * @error https://github.com/kirobotdev/stel-sb/issue/16
 */

import { Message, Client } from 'safeness-mirore-sb';
import { Database, DBConfig } from '../../utils/database';
import { updatePresence } from '../../utils/presence';

export default {
    name: "configspotify",
    description: "Configurer votre présence Spotify",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        const lang = (fr: string, en: string) => db.language === 'fr' ? fr : en;
        const sendAndDel = async (content: string) => {
            const m = await message.channel.send(content);
            setTimeout(() => m.delete().catch(() => {}), 10000);
        };

        if (!args[0]) {
            const helpMessageContent = `**${client.user?.username} Spotify**:\n\n` +
                `> \`${prefix}configspotify name <nom>\` - Définit le nom du morceau\n` +
                `> \`${prefix}configspotify artists <artistes>\` - Définit les artistes\n` +
                `> \`${prefix}configspotify album <nom>\` - Définit l'album\n` +
                `> \`${prefix}configspotify largeimage <lien>\` - Image large (cover album)\n` +
                `> \`${prefix}configspotify smallimage <lien>\` - Image petite (logo)\n` +
                `> \`${prefix}configspotify songid <id>\` - ID du morceau\n` +
                `> \`${prefix}configspotify albumid <id>\` - ID de l'album\n` +
                `> \`${prefix}configspotify artistids <id1,id2,...>\` - IDs des artistes\n` +
                `> \`${prefix}configspotify duration <secondes>\` - Durée du morceau\n` +
                `> \`${prefix}configspotify on/off\` - Active ou désactive SpotifyRPC\n\n` +
                `Pour supprimer un élément: \`${prefix}configspotify <élément> delete\``;

            return sendAndDel(helpMessageContent);
        }

        const sanitizeText = (text: string) => text.trim().slice(0, 128);
        const isValidUrl = (url: string) => {
            try { new URL(url); return url.startsWith('http'); } catch { return false; }
        };
        const isValidImage = (img: string) => img.startsWith('mp:') || isValidUrl(img) || img === 'spotify:default';

        const cmd = args[0].toLowerCase();
        const sub = args[1]?.toLowerCase();
        let updated = false;

        switch (cmd) {
            case "name":
                db.spotifysongname = sub === "delete" ? "" : sanitizeText(args.slice(1).join(" "));
                updated = true;
                break;
            case "artists":
                db.spotifyartists = sub === "delete" ? "" : sanitizeText(args.slice(1).join(" "));
                updated = true;
                break;
            case "album":
                db.spotifyalbum = sub === "delete" ? "" : sanitizeText(args.slice(1).join(" "));
                updated = true;
                break;
            case "largeimage":
                if (sub === "delete") {
                    db.spotifylargeimage = "";
                } else if (!args[1] || !isValidImage(args[1])) {
                    return sendAndDel(db.language === 'fr' ? "Lien d'image invalide." : "Invalid image link.");
                } else {
                    db.spotifylargeimage = args[1];
                }
                updated = true;
                break;
            case "smallimage":
                if (sub === "delete") {
                    db.spotifysmallimage = "";
                } else if (!args[1] || !isValidImage(args[1])) {
                    return sendAndDel(db.language === 'fr' ? "Lien d'image invalide." : "Invalid image link.");
                } else {
                    db.spotifysmallimage = args[1];
                }
                updated = true;
                break;
            case "songid":
                db.spotifysongid = sub === "delete" ? "" : args[1];
                updated = true;
                break;
            case "albumid":
                db.spotifyalbumid = sub === "delete" ? "" : args[1];
                updated = true;
                break;
            case "artistids":
                db.spotifyartistids = sub === "delete" ? [] : args[1].split(",");
                updated = true;
                break;
            case "duration":
                if (sub === "delete") {
                    db.spotifyendtimestamp = null;
                } else if (isNaN(parseInt(args[1])) || parseInt(args[1]) <= 0) {
                    return sendAndDel(db.language === 'fr' ? "Durée invalide." : "Invalid duration.");
                } else {
                    db.spotifyendtimestamp = parseInt(args[1]) * 1000;
                }
                updated = true;
                break;
            case "on":
                db.spotifyonoff = true;
                updated = true;
                break;
            case "off":
                db.spotifyonoff = false;
                updated = true;
                break;
            default:
                return sendAndDel(db.language === 'fr' ? "Commande inconnue." : "Unknown command.");
        }

        if (updated) {
            Database.save();
            await updatePresence(client, db);
            await sendAndDel(db.language === 'fr' ? "SpotifyRPC mis à jour." : "SpotifyRPC updated.");
        }
        message.delete().catch(() => {});
    }
};