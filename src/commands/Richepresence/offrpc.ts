/**
 * @author xql.dev
 * @version 2.4.6
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Message, Client } from 'safeness-mirore-sb';
import { Database, DBConfig } from '../../utils/database';
import { updatePresence } from '../../utils/presence';

export default {
    name: "offrpc",
    description: "Désactiver la rpc",
    run: async (client: Client, message: Message, args: string[], db: DBConfig, prefix: string) => {
        db.rpctitle = "";
        db.rpcdetails = "";
        db.rpcstate = "";
        db.rpclargeimage = "";
        db.rpcsmallimage = "";
        db.spotifyonoff = false;
        db.rpconoff = false;
        
        Database.save();

        await updatePresence(client, db);

        const responseMsg = db.language === 'fr' 
            ? "Toutes les RPC (Rich Presence & Spotify) ont été désactivées." 
            : "All RPCs (Rich Presence & Spotify) have been disabled.";
        const m = await message.channel.send(responseMsg);
        
        setTimeout(() => m.delete().catch(() => {}), 5000);
        message.delete().catch(() => {});
    }
};
