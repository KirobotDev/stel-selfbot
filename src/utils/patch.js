/**
* @author xql.dev
* @param {string} Intents
* @error "https://github.com/kirobotdev/stash/issues/1"
* @license MIT
* @version 1.0.1
* @see https://github.com/kirobotdev/stel-sb
*/


try {
    const { Intents, SpotifyRPC, RichPresence } = require('safeness-mirore-sb');
    
    if (Intents && Intents.FLAGS) {
        Object.keys(Intents.FLAGS).forEach(key => {
            Intents.FLAGS[key.toUpperCase()] = Intents.FLAGS[key];
        });
    }

    if (SpotifyRPC && SpotifyRPC.prototype && RichPresence) {
        SpotifyRPC.prototype.toJSON = function() {
            return RichPresence.prototype.toJSON.call(this);
        };
    }
} catch (e) {
}
