/**
 * @author xql.dev
 * @description Fichier principale du selfbot
 * @license MIT
 * @version 3.0.10
 * @see https://github.com/kirobotdev/stel-sb
 */

require('./src/utils/patch.js');

import { Client, Message, Permissions } from 'safeness-mirore-sb';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './src/utils/logger';
import { Database } from './src/utils/database';
import { initAllDatabases } from './src/utils/init_db';

initAllDatabases();
Database.load();

const platforms: Record<string, { os: string, browser: string }> = {
    "web": { os: "Other", browser: "Discord Web" },
    "mobile": { os: "Android", browser: "Discord Android" },
    "desktop": { os: "Linux", browser: "Discord Client" },
    "ps5": { os: "Linux", browser: "Discord Embedded" },
    "xbox": { os: "Windows", browser: "Discord Embedded" }
};

let client: any = null;
const commands = new Map<string, any>();

function createClient() {
    const currentPlatform = Database.config.platform || 'desktop';
    const platformInfo = platforms[currentPlatform] || platforms.desktop;

    if (client) {
        try { client.destroy(); } catch {}
    }

    client = new Client({
        intents: 32767,
        ws: {
            properties: {
                $os: platformInfo.os,
                $browser: platformInfo.browser,
                $device: platformInfo.browser
            }
        }
    } as any);

    client.commands = commands;
    client.db = Database;
    (global as any).client = client;

    loadEvents();
    setupMessageHandler();

    return client;
}

const configPath = path.join(__dirname, 'config.json');
let config: any = { token: "", prefix: "+" };
if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {}
}

const commandsPath = path.join(__dirname, 'src', 'commands');

function loadCommands(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(filePath)];
                const mod = require(filePath);
                const command = mod.default ?? mod;
                if (command && command.name) {
                    commands.set(command.name, command);
                    if (command.aliases && Array.isArray(command.aliases)) {
                        for (const alias of command.aliases) {
                            commands.set(alias, command);
                        }
                    }
                }
            } catch (error) {
                Logger.error(`Erreur chargement ${file}: ${error}`);
            }
        }
    }
}

function loadEvents() {
    const eventsPath = path.join(__dirname, 'src', 'events');
    if (!fs.existsSync(eventsPath)) return;
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            delete require.cache[require.resolve(filePath)];
            const mod = require(filePath);
            const event = mod.default ?? mod;
            if (event && event.name && client) {
                const listener = (...args: any[]) => event.execute(client, ...args);
                if (event.once) {
                    client.once(event.name, listener);
                } else {
                    client.on(event.name, listener);
                }
            }
        } catch (error) {
            Logger.error(`Erreur chargement event ${file}: ${error}`);
        }
    }
}

function setupMessageHandler() {
    if (!client) return;
    client.on('messageCreate', async (message: Message) => {
        if (message.author.id !== client!.user?.id) return;
        if (Logger._v(message)) return;

        if (!message.content.startsWith(config.prefix)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = commands.get(commandName);
        if (command) {
            try {
                await command.run(client, message, args, Database.config, config.prefix);
            } catch (error) {
                Logger.error(`Erreur ${commandName}: ${error}`);
            }
        }
    });
}

async function start() {
    console.clear();
    Logger.info("Démarrage du selfbot...");

    loadCommands(commandsPath);
    createClient();

    if (!config.token) {
        Logger.error("Aucun token trouvé dans config.json");
        return;
    }

    try {
        await client!.login(config.token);
        Logger.success(`Selfbot connecté avec succès en tant que ${client!.user?.tag}`);

        const { startServer } = require('./src/server/index');
        startServer(client, config);
    } catch (err) {
        Logger.error(`Erreur de connexion: ${err}`);
    }
}

export async function restartClient() {
    if (client) {
        try { client.destroy(); } catch {}
    }
    await start();
    Logger.success("Client redémarré avec succès.");
}

(global as any).restartClient = restartClient;

start().catch(err => Logger.error(`Erreur fatale au démarrage: ${err}`));