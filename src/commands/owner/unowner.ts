import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

const DB_PATH = join(process.cwd(), 'db', 'owner', 'owner.sqlite');
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.exec(`
CREATE TABLE IF NOT EXISTS owners (
    user_id TEXT PRIMARY KEY
);
`);

export default {
    name: "unowner",
    description: "Retire un utilisateur de la liste des owners (Réservé au propriétaire défini dans config)",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }
        
        let isConfigOwner = false;
        try {
            const configPath = join(process.cwd(), 'config.json');
            const config = JSON.parse(readFileSync(configPath, 'utf8'));
            if (config.owner && config.owner === message.author.id) {
                isConfigOwner = true;
            }
            if (!config.owner && client.user?.id === message.author.id) {
                isConfigOwner = true;
            }
        } catch (e) {
            if (client.user?.id === message.author.id) {
                isConfigOwner = true;
            }
        }

        if (!isConfigOwner) {
            return message.channel.send("Tu n'es pas le \`owner\` principal configuré dans \`config.json\`.").then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        const rawId = args[0];
        if (!rawId) return message.channel.send(`Usage : \`${prefix}unowner <ID / Mention>\``).then(m => setTimeout(() => m.delete().catch(() => { }), 8000));

        const targetId = rawId.replace(/[<@!>]/g, '');
        
        const res = db.prepare('DELETE FROM owners WHERE user_id = ?').run(targetId);
        if (res.changes === 0) return message.channel.send(`L'utilisateur \`${targetId}\` n'est pas dans la liste des owners.`).then(m => setTimeout(() => m.delete().catch(() => { }), 8000));

        message.channel.send(`L'utilisateur <@${targetId}> (\`${targetId}\`) a été retiré des owners avec succès.`).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
    }
};
