/**
 * @author xql.dev
 * @description Spotify controle in discord
 * @see https://github.com/kirobotdev/stel-sb
 * @version 9.5.3
 * @error https://github.com/kirobotdev/stel-sb/issue/2
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

async function getSpotifyToken(client: Client): Promise<string | null> {
    try {
        const res = await fetch("https://discord.com/api/v9/users/@me/connections", {
            headers: { Authorization: (client as any).token }
        });
        const connections = await res.json() as any[];
        const spotify = Array.isArray(connections)
            ? connections.find(c => c.type === "spotify" && c.access_token)
            : null;
        return spotify?.access_token || null;
    } catch {
        return null;
    }
}

export default {
    name: "spotify",
    description: "Contrôle Spotify via Discord",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        const token = await getSpotifyToken(client);
        if (!token) return message.channel.send("Spotify non lié à Discord").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));

        if (!args[0]) {
            return message.channel.send(
                `**Spotify Commands**\n> \`${prefix}spotify play\` → Reprendre la lecture\n> \`${prefix}spotify pause\` → Mettre en pause\n> \`${prefix}spotify skip\` → Titre suivant\n> \`${prefix}spotify back\` → Titre précédent\n> \`${prefix}spotify current\` → Titre actuel\n> \`${prefix}spotify playlist <nom/lien>\` → Lancer une playlist`
            ).then(m => setTimeout(() => m.delete().catch(() => { }), 20000));
        }

        const action = args[0].toLowerCase();

        if (["play", "pause", "skip", "next", "back", "previous"].includes(action)) {
            const endpoint = action === "play" ? "/play" : action === "pause" ? "/pause" : (action === "back" || action === "previous") ? "/previous" : "/next";
            const method = ["play", "pause"].includes(action) ? "PUT" : "POST";

            await fetch(`https://api.spotify.com/v1/me/player${endpoint}`, {
                method,
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            });

            const txt = action === "play" ? "Reprise" : action === "pause" ? "Pause" : (action === "skip" || action === "next") ? "Suivant" : "Précédent";
            message.channel.send(`**${txt}** !`).then(m => setTimeout(() => m.delete().catch(() => { }), 8000));
            return;
        }

        if (action === "current") {
            const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers: { Authorization: `Bearer ${token}` } });
            if (res.status === 204 || !res.ok) return message.channel.send("Rien en lecture actuellement.").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            
            const data = await res.json() as any;
            const track = data.item;
            if (!track) return message.channel.send("Impossible de récupérer le titre actuel.").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            
            const artists = track.artists.map((a: any) => a.name).join(", ");
            message.channel.send(`En cours : **${track.name}** — *${artists}*`).then(m => setTimeout(() => m.delete().catch(() => { }), 15000));
            return;
        }

        if (action === "playlist") {
            if (!args[1]) return message.channel.send("Veuillez donner un nom ou un lien de playlist.").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));

            let context_uri = "";
            const input = args.slice(1).join(" ");

            const linkMatch = input.match(/spotify:playlist:([a-zA-Z0-9]+)|open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/i);
            if (linkMatch) {
                const playlistId = linkMatch[1] || linkMatch[2];
                context_uri = `spotify:playlist:${playlistId}`;
            } else {
                const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json() as any;

                const found = data.items?.find((p: any) => p.name.toLowerCase().includes(input.toLowerCase()));
                if (!found) return message.channel.send("Playlist non trouvée dans votre bibliothèque.").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
                context_uri = found.uri;
            }

            const playRes = await fetch("https://api.spotify.com/v1/me/player/play", {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ context_uri })
            });

            if (playRes.ok || playRes.status === 204) {
                message.channel.send("Playlist lancée !").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            } else {
                message.channel.send("Erreur lors du lancement (vérifiez si Spotify est ouvert).").then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
            }
            return;
        }

        message.channel.send(`**Spotify** : \`${prefix}spotify\` <\`play\` • \`pause\` • \`skip\` • \`back\` • \`current\` • \`playlist\`>`)
            .then(m => setTimeout(() => m.delete().catch(() => { }), 15000));
    }
};
