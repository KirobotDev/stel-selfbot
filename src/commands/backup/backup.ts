/**
 * @author xql.dev
 * @description Backup commands
 * @see https://github.com/kirobotdev/stel-sb
 * @error https://github.com/kirobotdev/stel-sb/issue/11
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { BackupModule } from './BackupModule';

export default {
    name: "backup",
    description: "Système de backup (clonage) de serveur",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch {}

        if (!(client as any).backupModule) {
            (client as any).backupModule = new BackupModule(client);
        }
        const bm: BackupModule = (client as any).backupModule;
        const userId = message.author.id;

        if (!args[0]) {
            return message.channel.send(`**Backup Commands**\n> \`${prefix}backup create <guild_id>\` → Créer une backup\n> \`${prefix}backup load <code>\` → Charger une backup\n> \`${prefix}backup list\` → Voir vos backups\n> \`${prefix}backup delete <numéro>\` → Supprimer une backup`)
                .then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
        }

        const cmd = args[0].toLowerCase();

        if (cmd === 'create' && args[1]) {
            const statusMsg = await message.channel.send('***Création de la backup en cours...***');
            try {
                const code = await bm.create(args[1], userId);
                statusMsg.edit(`Backup créée avec succès : **${code}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
            } catch (e: any) {
                statusMsg.edit(`Erreur : ${e.message}`).then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
            }
            return;
        }

        if (cmd === 'load' && args[1]) {
            const code = args[1].toUpperCase();
            const data = bm.getBackup(code, userId);
            
            if (!data) return message.channel.send('Code invalide ou vous n\'êtes pas le propriétaire.').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            if (!message.guild) return message.channel.send('Cette commande doit être exécutée dans un serveur.').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));

            const statusMsg = await message.channel.send('***Restauration en cours (Suppression + Création)...***');
            try {
                await bm.restore(message.guild, data);
            } catch (e: any) {
                statusMsg.edit(`Erreur lors de la restauration : ${e.message}`).catch(() => {});
            }
            return;
        }

        if (cmd === 'list') {
            const list = bm.list(userId);
            if (!list.length) return message.channel.send('Aucune backup trouvée.').then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
            
            const content = list.map(x => `${x.num}. **${x.code}** (\`${x.guild}\`) - ${x.date}`).join('\n');
            message.channel.send(`**Vos Backups**\n${content}`).then(m => setTimeout(() => m.delete().catch(() => {}), 60000));
            return;
        }

        if (cmd === 'delete' && args[1]) {
            const num = parseInt(args[1]);
            if (isNaN(num)) return message.channel.send('Veuillez entrer un numéro valide.').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            
            const success = bm.delete(userId, num);
            message.channel.send(success ? 'Backup supprimée.' : 'Numéro de backup invalide.').then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
            return;
        }

        message.channel.send(`**Backup** : \`${prefix}backup\` <\`create\` • \`load\` • \`list\` • \`delete\`>`)
            .then(m => setTimeout(() => m.delete().catch(() => {}), 15000));
    }
};
