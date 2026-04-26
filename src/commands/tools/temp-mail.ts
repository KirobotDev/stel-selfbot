/**
 * @author xqldev
 * @description TempMail using Mail.tm API 
 * @license MIT
 * @version 10.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { randomBytes } from 'crypto';

let currentEmail: string | null = null;
let currentToken: string | null = null;

async function generateMail() {
    try {
        const domRes = await fetch('https://api.mail.tm/domains');
        const domData = await domRes.json() as any;
        const domain = domData['hydra:member']?.[0]?.domain;
        if (!domain) return null;

        const login = randomBytes(5).toString('hex');
        const password = randomBytes(8).toString('hex');
        const email = `${login}@${domain}`;

        const accRes = await fetch('https://api.mail.tm/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });

        if (accRes.status !== 201) return null;

        const tokRes = await fetch('https://api.mail.tm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password })
        });

        const tokData = await tokRes.json() as any;
        if (!tokData.token) return null;

        currentEmail = email;
        currentToken = tokData.token;
        return email;
    } catch (e) {
        console.error("[TempMail] Error generating mail:", e);
    }
    return null;
}

async function getInbox() {
    if (!currentToken) return [];
    try {
        const res = await fetch('https://api.mail.tm/messages', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const data = await res.json() as any;
        return data['hydra:member'] || [];
    } catch (e) {
        console.error("[TempMail] Error getting inbox:", e);
        return [];
    }
}

async function getMessage(mailId: string) {
    if (!currentToken) return "Erreur session.";
    try {
        const res = await fetch(`https://api.mail.tm/messages/${mailId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const data = await res.json() as any;
        return data.text || data.intro || "Contenu vide.";
    } catch (e) {
        console.error("[TempMail] Error fetching message:", e);
        return "Impossible de lire le message.";
    }
}

export default {
    name: "tempmail",
    description: "Générer un mail temporaire et lire les messages",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch {}

        if (!args[0]) {
            return message.channel.send(`
**TempMail Commands**
> \`${prefix}tempmail gen\` → Génère un mail temporaire
> \`${prefix}tempmail list\` → Affiche les messages reçus
> \`${prefix}tempmail open <numéro>\` → Ouvre un message
            `.trim()).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        const cmd = args[0].toLowerCase();

        if (cmd === "gen" || cmd === "generate") {
            const mail = await generateMail();
            if (!mail) return message.channel.send("Erreur génération (API saturée ou bloquée)").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            message.channel.send(`Mail généré : \`${mail}\``).then(m => setTimeout(() => m.delete().catch(() => {}), 60000));
            return;
        }

        if (cmd === "inbox" || cmd === "msgbox" || cmd === "list") {
            if (!currentEmail || !currentToken) return message.channel.send(`Aucun mail actif → \`${prefix}tempmail gen\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            const messages = await getInbox();
            if (messages.length === 0) {
                return message.channel.send(`Inbox vide\n\`${currentEmail}\``).then(m => setTimeout(() => m.delete().catch(() => {}), 20000));
            }

            const list = messages.map((msg: any, i: number) => `${i+1}. **${msg.from.address}** — ${msg.subject || "Sans objet"}`).join("\n");

            message.channel.send(`Inbox (${messages.length})\n\`${currentEmail}\`\n${list}`).then(m => setTimeout(() => m.delete().catch(() => {}), 50000));
            return;
        }

        if (cmd === "open" || cmd === "read") {
            if (!currentEmail || !currentToken) return message.channel.send("Aucun mail actif").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            if (!args[1] || isNaN(parseInt(args[1]))) return message.channel.send(`\`${prefix}tempmail open <numéro>\``).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            const messages = await getInbox();
            const index = parseInt(args[1]) - 1;
            if (index < 0 || index >= messages.length) return message.channel.send("Numéro invalide").then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            const msg = messages[index];
            const body = await getMessage(msg.id);

            const text = body.length > 1900 ? body.substring(0, 1900) + "..." : body;

            message.channel.send(`**De :** ${msg.from.address}\n**Sujet :** ${msg.subject || "Aucun"}\n\`\`\`\n${text}\n\`\`\``)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 70000));
            return;
        }

        message.channel.send(`**TempMail** : \`${prefix}tempmail\` <\`gen\` • \`list\` • \`open <num>\`>`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
    }
};
