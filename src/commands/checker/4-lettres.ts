/**
 * @author xql.dev
 * @description PSD 4 lettre
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';

function generateRandomLetters(): string {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}

async function checkNickname(token: string, username: string): Promise<boolean> {
    const r: any = await fetch("https://discord.com/api/v9/users/@me/pomelo-attempt", {
        headers: {
            'accept': "*/*",
            'authorization': token,
            'content-type': "application/json"
        },
        body: JSON.stringify({ username }),
        method: "POST"
    }).then(res => res.json()).catch(() => false);

    if (!r || r?.taken === true) return false;
    if (r?.retry_after) {
        await new Promise(resolve => setTimeout(resolve, r.retry_after * 1000));
        return false;
    }
    return r?.taken === false;
}

export default {
    name: "psd4",
    description: "PSD 4 lettre",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig) => {
        let i = 0;
        const tested: string[] = [];

        await message.edit("***Jrecherche le pseudo 4 lettre uhq frèro ;)***");

        let username = '';
        let available = false;

        while (!available) {
            username = generateRandomLetters();
            if (tested.includes(username)) continue;
            available = await checkNickname((client as any).token, username);
            tested.push(username);
            i++;
        }

        const result = `***Après \`${i}\` tentatives, le pseudo \`${username}\` est disponible !***`;

        if ((message as any).editable) {
            await message.edit(result);
        } else {
            await message.channel.send(result);
        }
    }
};
