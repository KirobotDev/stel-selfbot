/**
 * @author xql.dev
 * @description Anime Sama planning
 * @see https://github.com/kirobotdev/stel-sb
 * @version 2.4.0
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import axios from 'axios';
import * as cheerio from 'cheerio';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default {
    name: "animesoon",
    description: "Anime Planning",
    /**
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {DBConfig} dbConf 
     * @param {string} prefix 
     */
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        try { if (message.deletable) await message.delete(); } catch { }

        message.channel.send("*Récupération du planning Anime-Sama en cours...*")
            .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));

        try {
            const response = await axios.get('https://anime-sama.to/planning/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const scheduleMap = new Map<string, string[]>();

            const daysNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
            let foundAny = false;

            $('.selectedRow').each((_, rowEl) => {
                const dayNameRaw = $(rowEl).find('.titreJours').text().trim();
                if (!dayNameRaw) return;
                
                const dayMatch = daysNames.find(d => dayNameRaw.toLowerCase().includes(d.toLowerCase()));
                const dayName = dayMatch || dayNameRaw;
                
                const animesForDay: string[] = [];
                
                $(rowEl).find('.planning-card').each((_, cardEl) => {
                    const title = $(cardEl).find('.card-title').text().trim();
                    let time = $(cardEl).find('.info-text').first().text().trim() || "Heure inconnue";
                    
                    const badgeText = $(cardEl).find('.badge-text').first().text().trim(); 
                    const language = $(cardEl).find('.language-badge-top img').attr('title') || ""; 
                    
                    let seasonText = "";
                    $(cardEl).find('.info-text').each((_, infoEl) => {
                        const text = $(infoEl).text().trim();
                        if (text !== time && text.toLowerCase().includes('saison')) {
                            seasonText = text;
                        }
                    });

                    if (title) {
                        let line = `**${time}** - ${title}`;
                        if (seasonText) line += ` (${seasonText})`;
                        if (language) line += ` [**${language}**]`;
                        if (badgeText === 'Scans') line += ` [**Scan**]`;
                        
                        animesForDay.push(line);
                        foundAny = true;
                    }
                });
                
                if (animesForDay.length > 0) {
                    scheduleMap.set(dayName, animesForDay);
                }
            });

            if (scheduleMap.size === 0) {
                return message.channel.send("*Impossible de lire le planning. Le site a peut-être changé de structure ou est protégé par Cloudflare.*")
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
            }

            let currentMessage = `🎌 **Planning Anime-Sama de la Semaine** 🎌\n\n`;
            const messagesToSend: string[] = [];

            for (const day of DAYS) {
                if (!scheduleMap.has(day)) continue;
                
                const animes = scheduleMap.get(day)!;
                let dayBlock = `__**${day}**__\n` + animes.join('\n') + `\n\n`;

                if (currentMessage.length + dayBlock.length > 1900) {
                    messagesToSend.push(currentMessage);
                    currentMessage = dayBlock;
                } else {
                    currentMessage += dayBlock;
                }
            }

            if (currentMessage.trim().length > 0) {
                messagesToSend.push(currentMessage);
            }

            for (const msgContent of messagesToSend) {
                await message.channel.send(msgContent);
                await new Promise(r => setTimeout(r, 1000));
            }

        } catch (error: any) {
            console.error("Erreur Anime-Sama:", error.message);
            message.channel.send("*Erreur lors de la récupération (Site peut-être protégé par Cloudflare).*")
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
    }
};
