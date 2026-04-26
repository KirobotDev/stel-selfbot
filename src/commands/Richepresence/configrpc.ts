/**
 * @author xql.dev
 * @description Commande de configuration de rpc
 * @version 2.4.6
 * @see https://github.com/kirobotdev/stel-sb
 * @license MIT
 * @error https://github.com/kirobotdev/stel-sb/issue/16
 */

import { Message, Client } from 'safeness-mirore-sb';
import { Database, DBConfig } from '../../utils/database';
import { updatePresence } from '../../utils/presence';

export default {
    name: "configrpc",
    description: "Configurer votre RPC",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        const lang = (fr: string, en: string) => db.language === 'fr' ? fr : en;

        const isValidUrl = (url: string) => {
            try { new URL(url); return url.startsWith('http'); } catch { return false; }
        };

        const sanitize = (text: string) => text.trim().slice(0, 128);

        const sendAndDel = async (content: string) => {
            const m = await message.channel.send(content);
            setTimeout(() => m.delete().catch(() => {}), 10000);
        };

        if (!args[0]) {
            const help = `**${client.user?.username} RPC**:\n` +
                `> \`${prefix}configrpc name <text>\` - Name\n` +
                `> \`${prefix}configrpc details <text>\` - Details\n` +
                `> \`${prefix}configrpc state <text>\` - State\n` +
                `> \`${prefix}configrpc party <cur>/<max>\` - Party\n` +
                `> \`${prefix}configrpc type <PLAYING/WATCHING/STREAMING/LISTENING/COMPETING>\` - Type\n` +
                `> \`${prefix}configrpc largeimage <link> [text]\` - Large Image\n` +
                `> \`${prefix}configrpc smallimage <link> [text]\` - Small Image\n` +
                `> \`${prefix}configrpc platform <xbox/desktop/ps5>\` - Platform\n` +
                `> \`${prefix}configrpc button <link> <text>\` - Button 1\n` +
                `> \`${prefix}configrpc button2 <link> <text>\` - Button 2\n` +
                `> \`${prefix}configrpc twitch <link>\` - Twitch\n` +
                `> \`${prefix}configrpc time <val><d/h/m/s>\` - Time\n` +
                `> \`${prefix}configrpc appid <id>\` - Application ID (Requis pour images/boutons)\n` +
                `> \`${prefix}configrpc <element> delete\``;
            return sendAndDel(help);
        }

        const cmd = args[0].toLowerCase();
        const sub = args[1]?.toLowerCase();

        switch (cmd) {
            case 'name': db.rpctitle = sub === 'delete' ? '' : sanitize(args.slice(1).join(' ')); break;
            case 'details': db.rpcdetails = sub === 'delete' ? '' : sanitize(args.slice(1).join(' ')); break;
            case 'state': db.rpcstate = sub === 'delete' ? '' : sanitize(args.slice(1).join(' ')); break;
            case 'appid': db.appid = sub === 'delete' ? '' : args[1]; break;
            case 'type': db.rpctype = sub === 'delete' ? '' : args[1].toUpperCase(); break;
            case 'platform': db.rpcplatform = sub === 'delete' ? '' : args[1].toLowerCase(); break;
            case 'twitch': db.twitch = sub === 'delete' ? '' : args[1]; break;
            case 'party':
                if (sub === 'delete') { db.rpcminparty = 0; db.rpcmaxparty = 0; }
                else {
                    const p = args[1]?.split('/');
                    if (p?.length === 2) { db.rpcminparty = parseInt(p[0]); db.rpcmaxparty = parseInt(p[1]); }
                }
                break;
            case 'largeimage':
                if (sub === 'delete') { db.rpclargeimage = ''; db.rpclargeimagetext = ''; }
                else { db.rpclargeimage = args[1]; db.rpclargeimagetext = sanitize(args.slice(2).join(' ')); }
                break;
            case 'smallimage':
                if (sub === 'delete') { db.rpcsmallimage = ''; db.rpcsmallimagetext = ''; }
                else { db.rpcsmallimage = args[1]; db.rpcsmallimagetext = sanitize(args.slice(2).join(' ')); }
                break;
            case 'button':
                if (sub === 'delete') { db.buttonlink1 = ''; db.buttontext1 = ''; }
                else if (isValidUrl(args[1])) { db.buttonlink1 = args[1]; db.buttontext1 = sanitize(args.slice(2).join(' ')); }
                break;
            case 'button2':
                if (sub === 'delete') { db.buttonlink2 = ''; db.buttontext2 = ''; }
                else if (isValidUrl(args[1])) { db.buttonlink2 = args[1]; db.buttontext2 = sanitize(args.slice(2).join(' ')); }
                break;
            case 'time':
                if (sub === 'delete') { db.rpctime = null; }
                else {
                    const m = args[1]?.match(/^(\d+)([jhms])$/i);
                    if (m) {
                        const v = parseInt(m[1]);
                        const u = m[2].toLowerCase();
                        const d = new Date();
                        if (u === 'j') d.setDate(d.getDate() + v);
                        else if (u === 'h') d.setHours(d.getHours() + v);
                        else if (u === 'm') d.setMinutes(d.getMinutes() + v);
                        else if (u === 's') d.setSeconds(d.getSeconds() + v);
                        db.rpctime = d.getTime();
                    }
                }
                break;
            case 'on': db.rpconoff = true; break;
            case 'off': db.rpconoff = false; break;
        }

        if (cmd !== 'on' && cmd !== 'off') {
            db.rpconoff = true;
        }

        Database.save();
        await updatePresence(client, db);
        await sendAndDel(lang("RPC mis à jour.", "RPC updated."));
        message.delete().catch(() => {});
    }
};