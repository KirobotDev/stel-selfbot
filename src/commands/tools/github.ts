/**
 * @author xql.dev
 * @description Recup les info d'un github
 * @version 2.9.3
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

export default {
    name: "github",
    description: "Recup les info d'un github via leur commit",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        if (!args[0]) {
            return message.channel.send("***Veuillez indiquer un pseudo GitHub.***")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        const username = args[0].toLowerCase();
        const loadingMsg = await message.channel.send("***Recherche en cours sur GitHub...***");

        let userData: any;
        try {
            const userResp = await fetch(`https://api.github.com/users/${username}`);
            if (!userResp.ok) {
                return loadingMsg.edit(`***Aucun utilisateur GitHub trouvé pour \`${username}\`***`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }
            userData = await userResp.json();
        } catch {
            return loadingMsg.edit("***Erreur API GitHub (rate limit ou down).***")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
        }

        let commitEmail = "Non renseigné";
        let repoName = "Aucun repo trouvé";
        let commitMessage = "Aucun commit trouvé";

        if (userData.public_repos > 0) {
            try {
                const reposResp = await fetch(userData.repos_url + "?sort=updated&per_page=50");
                const repos = await reposResp.json() as any[];

                for (const repo of repos) {
                    await new Promise(r => setTimeout(r, 300));

                    const commitsResp = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`);
                    if (commitsResp.ok) {
                        const commits = await commitsResp.json() as any[];
                        if (commits.length > 0 && commits[0].commit?.author?.email) {
                            const commit = commits[0].commit;
                            commitEmail = commit.author.email;
                            repoName = repo.name;
                            commitMessage = commit.message.split("\n")[0];
                            break;
                        }
                    }
                }
            } catch (err) {
                console.error("[GitHub] Error fetching commits:", err);
            }
        }

        const createdAt = Math.floor(new Date(userData.created_at).getTime() / 1000);
        const updatedAt = Math.floor(new Date(userData.updated_at).getTime() / 1000);

        const finalText = 
            `> ***Informations GitHub de \`${userData.login}\`***\n\n` +
            `- **Pseudo** ・ ${userData.login}\n` +
            `- **Nom complet** ・ ${userData.name || "Non renseigné"}\n` +
            `- **ID** ・ ${userData.id}\n` +
            `- **Bio** ・ ${userData.bio || "Aucune"}\n` +
            `- **Repos publics** ・ ${userData.public_repos}\n` +
            `- **Followers** ・ ${userData.followers}\n` +
            `- **Following** ・ ${userData.following}\n` +
            `- **Localisation** ・ ${userData.location || "Inconnue"}\n` +
            `- **Twitter** ・ ${userData.twitter_username ? "@" + userData.twitter_username : "Aucun"}\n` +
            `- **Compte créé** ・ <t:${createdAt}:R>\n` +
            `- **Dernière MAJ** ・ <t:${updatedAt}:R>\n\n` +
            `**Dernier commit trouvé**\n` +
            `- **Repo** ・ ${repoName}\n` +
            `- **Email du commit** ・ \`${commitEmail}\`\n` +
            `- **Message** ・ ${commitMessage}`;

        loadingMsg.edit(finalText).catch(err => {
            if (err.code === 503) {
                message.channel.send("***Discord me bloque temporairement (503). Réessaie dans 30 secondes.***")
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
            }
        });
    }
};
