/**
 * @author xql.dev
 * @description Multistatus commands link ../../utils/multistatus_db.ts & ../../utils/multistatus_manager.ts
 * @version 2.4.6
 * @see https://github.com/kirobotdev/stel-sb
 * @error "https://github.com/kirobotdev/stel-sb/issue/10"
 */

import { Message, Client } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { MultiStatusDB } from '../../utils/multistatus_db';
import { startMultiStatusRotation, stopMultiStatus } from '../../utils/multistatus_manager';
const emojiRegex = require('emoji-regex');

const MAX_STATUSES = 10;

export default {
    name: "multistatus",
    description: "Configurer plusieurs statuts personnalisés",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        const userId = client.user!.id;
        const deleteAfterDelay = async (msg: Message, delay = 10000) => {
            setTimeout(() => msg.delete().catch(() => { }), delay);
        };

        const helpMessage = ` __**${client.user?.username} - MULTISTATUS**__ 
> \`${prefix}multistatus start\` → **Démarre la rotation des statuts**
> \`${prefix}multistatus stop\` → **Arrête la rotation des statuts**
> \`${prefix}multistatus add [emoji] [texte]\` → **Ajoute un statut**
> \`${prefix}multistatus remove [index]\` → **Supprime un statut**
> \`${prefix}multistatus remove all\` → **Supprime tous statuts**
> \`${prefix}multistatus list\` → **Liste tous les statuts**`;

        if (!args[0]) {
            const sent = await message.channel.send(helpMessage);
            await deleteAfterDelay(sent, 60000);
            return message.delete().catch(() => {});
        }

        const userdb = MultiStatusDB.getConfig(userId);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case "start": {
                if (userdb.statuses.length === 0) {
                    const msg = await message.channel.send("Aucun statut personnalisé à afficher. Ajoutez-en d'abord avec `" + prefix + "multistatus add`.");
                    await deleteAfterDelay(msg);
                    break;
                }
                MultiStatusDB.setActive(userId, true);
                startMultiStatusRotation(client, userId);
                const startMsg = await message.channel.send("Rotation des statuts personnalisés démarrée ! (toutes les 30 secondes)");
                await deleteAfterDelay(startMsg);
                break;
            }

            case "stop": {
                stopMultiStatus(userId);
                await (client as any).settings.setCustomStatus({ text: null });
                const stopMsg = await message.channel.send("Rotation des statuts personnalisés arrêtée !");
                await deleteAfterDelay(stopMsg);
                break;
            }

            case "add": {
                if (userdb.statuses.length >= MAX_STATUSES) {
                    const msg = await message.channel.send(`Vous avez atteint la limite maximale de ${MAX_STATUSES} statuts.`);
                    await deleteAfterDelay(msg);
                    break;
                }

                const firstArg = args[1];
                let text = args.slice(2).join(' ');
                let finalEmoji: any = null;

                if (firstArg) {
                    const regex = emojiRegex();
                    const isUnicodeEmoji = regex.test(firstArg);
                    const isCustomEmoji = /^<a?:.+?:\d+>$/.test(firstArg);
                    const isIdOnly = /^\d+$/.test(firstArg);

                    if (isUnicodeEmoji) {
                        finalEmoji = firstArg;
                    } else if (isCustomEmoji) {
                        const match = firstArg.match(/<(a?):(.+?):(\d+)>/);
                        if (match) {
                            finalEmoji = {
                                id: match[3],
                                name: match[2],
                                animated: Boolean(match[1])
                            };
                        }
                    } else if (isIdOnly) {
                        const resolvedEmoji = (client as any).emojis.cache.get(firstArg);
                        if (resolvedEmoji) {
                            finalEmoji = { id: resolvedEmoji.id, name: resolvedEmoji.name };
                        } else {
                            finalEmoji = firstArg;
                        }
                    } else {
                        text = args.slice(1).join(' ');
                    }
                } else {
                    text = args.slice(1).join(' ');
                }

                if (!text && !finalEmoji) {
                    const msg = await message.channel.send("Vous devez fournir au moins un emoji ou un texte.");
                    await deleteAfterDelay(msg);
                    break;
                }

                MultiStatusDB.addStatus(userId, text, finalEmoji);
                
                let emojiDisplay = "Aucun";
                if (finalEmoji) {
                    if (typeof finalEmoji === 'object') {
                        emojiDisplay = `${finalEmoji.name} (ID: ${finalEmoji.id})`;
                    } else {
                        emojiDisplay = finalEmoji;
                    }
                }

                const addMsg = await message.channel.send(`Statut ajouté !\nEmoji: **${emojiDisplay}**\nTexte: **${text}**`);
                await deleteAfterDelay(addMsg);
                break;
            }

            case "remove": {
                if (args[1] === "all") {
                    MultiStatusDB.clearStatuses(userId);
                    stopMultiStatus(userId);
                    await (client as any).settings.setCustomStatus({ text: null });
                    const allMsg = await message.channel.send("Tous les statuts ont été supprimés et la rotation a été arrêtée.");
                    await deleteAfterDelay(allMsg);
                    return message.delete().catch(() => {});
                }

                const index = parseInt(args[1]) - 1;
                if (isNaN(index) || index < 0 || index >= userdb.statuses.length) {
                    const msg = await message.channel.send(`Index invalide. Veuillez fournir un nombre entre 1 et ${userdb.statuses.length}.`);
                    await deleteAfterDelay(msg);
                    break;
                }

                MultiStatusDB.removeStatus(userId, index);
                const remMsg = await message.channel.send("Statut personnalisé supprimé !");
                await deleteAfterDelay(remMsg);
                break;
            }

            case "list": {
                if (userdb.statuses.length === 0) {
                    const msg = await message.channel.send("Aucun statut personnalisé trouvé.");
                    await deleteAfterDelay(msg);
                    break;
                }

                const statusList = userdb.statuses
                    .map((status, index) => {
                        let emojiDisplay = "";
                        if (status.emoji) {
                            if (typeof status.emoji === 'object') {
                                emojiDisplay = `<${status.emoji.animated ? 'a' : ''}:${status.emoji.name}:${status.emoji.id}>`;
                            } else {
                                emojiDisplay = status.emoji as string;
                            }
                        }
                        return `**${index + 1}** → ${emojiDisplay} ${status.text || ''}`;
                    })
                    .join('\n');

                const listMsg = await message.channel.send(`Liste des statuts personnalisés (${userdb.statuses.length}/${MAX_STATUSES}) :\n${statusList}`);
                await deleteAfterDelay(listMsg, 30000);
                break;
            }

            default:
                const invalidMsg = await message.channel.send("Commande invalide. Utilisez `" + prefix + "multistatus` pour voir la liste des commandes.");
                await deleteAfterDelay(invalidMsg);
        }

        message.delete().catch(() => {});
    }
};
