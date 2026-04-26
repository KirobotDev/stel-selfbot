/**
 * @author xql.dev
 * @description All the texts were done by chatgpt
 * @License MIT
 * @see https://github.com/kirobotdev/stel-sb
 * @error "https://github.com/kirobotdev/stash/issues/3"
 */

import { Database } from './database';

const translations: Record<string, Record<string, string>> = {
    fr: {
        "PING_LOADING": "Attend Frèro ca charge",
        "PING_RESULT": "Ping : `{ms}ms`",
        "LANG_SET": "La langue a été changée en Français.",
        "LANG_INVALID": "Langue invalide. Utilisez `fr` ou `en`.",
        "GEN_ACTIVATED": "**{module}** activé !",
        "GEN_DEACTIVATED": "**{module}** désactivé.",
        "GEN_USAGE": "Usage : `{prefix}{cmd} {usage}`",
        "GEN_LIST_EMPTY": "La liste **{module}** est vide.",

        "ANTIGROUP_HELP": "**AntiGroup** → **{status}**\n> Whitelist : `{wlCount}` cibles\n> Verrous : `{locksCount}` groupes\n\n**Commandes :**\n> `{prefix}antigroup on` / `off`\n> `{prefix}antigroup wl <ID/Mention>` / `unwl <ID/Mention>`\n> `{prefix}antigroup setmsg <texte>` / `stop setmsg`\n> `{prefix}antigroup lock <nombre> [ID_Groupe]` / `unlock [ID_Groupe]`\n> `{prefix}antigroup list`",
        "ANTIGROUP_WL_ADD": "Utilisateur `{id}` ajouté à la whitelist.",
        "ANTIGROUP_WL_REMOVE": "Utilisateur `{id}` retiré de la whitelist.",
        "ANTIGROUP_MSG_SET": "Message d'AntiGroup défini !",
        "ANTIGROUP_MSG_DELETE": "Message d'AntiGroup supprimé.",
        "ANTIGROUP_LOCK_SET": "Groupe `{id}` verrouillé à `{limit}` membres.",
        "ANTIGROUP_LOCK_REMOVE": "Verrouillage supprimé pour le groupe `{id}`.",
        "ANTIGROUP_LIST_TITLE": "**Configuration AntiGroup**\n\n**Whitelist :**\n",
        "ANTIGROUP_LIST_EMPTY_WL": "> *Aucun utilisateur*\n",
        "ANTIGROUP_LIST_EMPTY_LOCKS": "> *Aucun verrou*\n",

        "ANTILEAVE_HELP": "**AntiLeave** → **{state}** ({count} cibles)\n> `{prefix}antileave on` / `off`\n> `{prefix}antileave add <ID_Groupe> <ID_User>`\n> `{prefix}antileave remove <ID_Groupe> <ID_User>`\n> `{prefix}antileave list`",
        "ANTILEAVE_ADD_SUCCESS": "Surveillance activée pour <@{id}> dans le groupe `{groupId}`.",
        "ANTILEAVE_REMOVE_SUCCESS": "Surveillance retirée pour <@{id}> dans le groupe `{groupId}`.",
        "ANTILEAVE_NOT_FOUND": "Cible non trouvée dans la liste.",
        "ANTILEAVE_LIST_TITLE": "**Cibles AntiLeave :**\n",

        "SPREACT_HELP": "**Spreact Commands**\n> `{prefix}spreact start <ID/Mention> <Emoji>`\n> `{prefix}spreact stop <ID/Mention>`\n> `{prefix}spreact list`",
        "SPREACT_START_SUCCESS": "Réaction auto activée pour <@{id}> avec l'emoji {emoji}",
        "SPREACT_STOP_SUCCESS": "Réaction auto désactivée pour l'utilisateur `{id}`.",
        "SPREACT_NOT_FOUND": "Cet utilisateur n'est pas dans la liste des cibles.",
        "SPREACT_LIST_TITLE": "**Cibles Spreact actives :**\n",

        "ROTATE_HELP": "**Description Rotate** → **{state}** ({count}/10)\n> `{prefix}descriptionrotate <add|remove|list|start|stop>`",
        "ROTATE_NO_DESC": "Aucune description enregistrée.",
        "ROTATE_ALREADY_ON": "La rotation est déjà activée.",
        "ROTATE_ALREADY_OFF": "La rotation est déjà désactivée.",
        "ROTATE_LIMIT_REACHED": "Vous avez atteint la limite de 10 descriptions.",
        "ROTATE_ADD_SUCCESS": "Description ajoutée ({count}/10) !",
        "ROTATE_REMOVE_SUCCESS": "Description supprimée !",
        "ROTATE_INVALID_NUM": "Numéro de description invalide.",
        "ROTATE_LIST_TITLE": "**Vos Descriptions :**\n\n",
        "ROTATE_SUGGEST": "Commande inconnue. Vouliez-vous dire `{prefix}descriptionrotate {suggested}` ?",

        "BOTLINK_USAGE": "Veuillez utiliser la commande de cette manière : `{prefix}botlink [id]`.",
        "BOTLINK_INVALID_ID": "ID de bot invalide. L'ID doit contenir uniquement des chiffres.",
        "BOTLINK_TITLE": "**Lien d'invitation du bot** :",

        "RPC_UPDATED": "Le RPC a été mis à jour.",
        "RPC_ERROR": "Erreur lors de la mise à jour du RPC.",
        "RPC_HELP_TITLE": "**Configuration RPC**",
        "RPC_HELP": "**{username} RPC**:\n> `{prefix}configrpc name <text>` - Nom\n> `{prefix}configrpc details <text>` - Détails\n> `{prefix}configrpc state <text>` - État\n> `{prefix}configrpc party <cur>/<max>` - Groupe\n> `{prefix}configrpc type <PLAYING/WATCHING/...>` - Type\n> `{prefix}configrpc largeimage <link> [text]` - Image Large\n> `{prefix}configrpc smallimage <link> [text]` - Image Petite\n> `{prefix}configrpc platform <xbox/desktop/ps5>` - Plateforme\n> `{prefix}configrpc button <link> <text>` - Bouton 1\n> `{prefix}configrpc button2 <link> <text>` - Bouton 2\n> `{prefix}configrpc appid <id>` - Application ID\n> `{prefix}configrpc <element> delete`",
        "RPC_NAME_UPDATED": "Nom du RPC mis à jour.",
        "RPC_DETAILS_UPDATED": "Détails du RPC mis à jour.",
        "RPC_STATE_UPDATED": "État du RPC mis à jour.",

        "SPOTIFY_CONFIG_HELP": "**{username} Spotify**:\n> `{prefix}configspotify name <nom>` - Nom du morceau\n> `{prefix}configspotify artists <artistes>` - Artistes\n> `{prefix}configspotify album <nom>` - Album\n> `{prefix}configspotify largeimage <lien>` - Image large\n> `{prefix}configspotify smallimage <lien>` - Image petite\n> `{prefix}configspotify duration <secondes>` - Durée\n> `{prefix}configspotify on/off` - Activer/Désactiver",
        "SPOTIFY_HELP": "**Spotify Commands**\n> `{prefix}spotify play/pause` → Play/Pause\n> `{prefix}spotify skip/back` → Suivant/Précédent\n> `{prefix}spotify current` → Titre actuel\n> `{prefix}spotify playlist <nom/lien>` → Lancer une playlist",
        "SPOTIFY_NO_TOKEN": "Spotify non lié à Discord.",
        "SPOTIFY_NO_PLAYBACK": "Rien en lecture actuellement.",
        "SPOTIFY_CURRENT": "En cours : **{name}** — *{artists}*",
        "SPOTIFY_PLAYLIST_NOT_FOUND": "Playlist non trouvée dans votre bibliothèque.",
        "SPOTIFY_PLAYLIST_START": "Playlist lancée !",
        
        "MULTISTATUS_HELP": "__**{username} - MULTISTATUS**__\n> `{prefix}multistatus start/stop` → Activer/Désactiver\n> `{prefix}multistatus add [emoji] [texte]` → Ajouter\n> `{prefix}multistatus remove [index/all]` → Supprimer\n> `{prefix}multistatus list` → Liste",
        "MULTISTATUS_LIST_TITLE": "Liste des statuts personnalisés ({count}/{max}) :\n",
        "MULTISTATUS_NO_STATUS": "Aucun statut personnalisé trouvé.",
        "MULTISTATUS_LIMIT": "Vous avez atteint la limite maximale de {max} statuts.",

        "GITHUB_HELP": "Usage : `{prefix}github <pseudo>`",
        "GITHUB_LOADING": "***Recherche en cours sur GitHub...***",
        "GITHUB_NOT_FOUND": "***Aucun utilisateur GitHub trouvé pour `{username}`***",
        "CLEARDM_HELP": "Usage : `{prefix}cleardm` (tous) ou `{prefix}cleardm <ID>`",
        "AUTOQUEST_HELP": "Usage : `{prefix}autoquest <start|stop|status|addproxy|listproxy>`"
    },
    en: {
        "PING_LOADING": "Wait brother, it's loading",
        "PING_RESULT": "Ping: `{ms}ms`",
        "LANG_SET": "Language has been changed to English.",
        "LANG_INVALID": "Invalid language. Use `fr` or `en`.",
        "GEN_ACTIVATED": "**{module}** activated!",
        "GEN_DEACTIVATED": "**{module}** deactivated.",
        "GEN_USAGE": "Usage: `{prefix}{cmd} {usage}`",
        "GEN_LIST_EMPTY": "The **{module}** list is empty.",

        "ANTIGROUP_HELP": "**AntiGroup** → **{status}**\n> Whitelist: `{wlCount}` targets\n> Locks: `{locksCount}` groups\n\n**Commands:**\n> `{prefix}antigroup on` / `off`\n> `{prefix}antigroup wl <ID/Mention>` / `unwl <ID/Mention>`\n> `{prefix}antigroup setmsg <text>` / `stop setmsg`\n> `{prefix}antigroup lock <number> [Group_ID]` / `unlock [Group_ID]`\n> `{prefix}antigroup list`",
        "ANTIGROUP_WL_ADD": "User `{id}` added to whitelist.",
        "ANTIGROUP_WL_REMOVE": "User `{id}` removed from whitelist.",
        "ANTIGROUP_MSG_SET": "AntiGroup message set!",
        "ANTIGROUP_MSG_DELETE": "AntiGroup message deleted.",
        "ANTIGROUP_LOCK_SET": "Group `{id}` locked to `{limit}` members.",
        "ANTIGROUP_LOCK_REMOVE": "Lock removed for group `{id}`.",
        "ANTIGROUP_LIST_TITLE": "**AntiGroup Configuration**\n\n**Whitelist:**\n",
        "ANTIGROUP_LIST_EMPTY_WL": "> *No users*\n",
        "ANTIGROUP_LIST_EMPTY_LOCKS": "> *No locks*\n",

        "ANTILEAVE_HELP": "**AntiLeave** → **{state}** ({count} targets)\n> `{prefix}antileave on` / `off`\n> `{prefix}antileave add <Group_ID> <User_ID>`\n> `{prefix}antileave remove <Group_ID> <User_ID>`\n> `{prefix}antileave list`",
        "ANTILEAVE_ADD_SUCCESS": "Monitoring enabled for <@{id}> in group `{groupId}`.",
        "ANTILEAVE_REMOVE_SUCCESS": "Monitoring removed for <@{id}> in group `{groupId}`.",
        "ANTILEAVE_NOT_FOUND": "Target not found in the list.",
        "ANTILEAVE_LIST_TITLE": "**AntiLeave Targets:**\n",

        "SPREACT_HELP": "**Spreact Commands**\n> `{prefix}spreact start <ID/Mention> <Emoji>`\n> `{prefix}spreact stop <ID/Mention>`\n> `{prefix}spreact list`",
        "SPREACT_START_SUCCESS": "Auto-reaction enabled for <@{id}> with emoji {emoji}",
        "SPREACT_STOP_SUCCESS": "Auto-reaction disabled for user `{id}`.",
        "SPREACT_NOT_FOUND": "This user is not in the target list.",
        "SPREACT_LIST_TITLE": "**Active Spreact targets:**\n",

        "ROTATE_HELP": "**Description Rotate** → **{state}** ({count}/10)\n> `{prefix}descriptionrotate <add|remove|list|start|stop>`",
        "ROTATE_NO_DESC": "No descriptions saved.",
        "ROTATE_ALREADY_ON": "Rotation is already enabled.",
        "ROTATE_ALREADY_OFF": "Rotation is already disabled.",
        "ROTATE_LIMIT_REACHED": "You have reached the limit of 10 descriptions.",
        "ROTATE_ADD_SUCCESS": "Description added ({count}/10)!",
        "ROTATE_REMOVE_SUCCESS": "Description removed!",
        "ROTATE_INVALID_NUM": "Invalid description number.",
        "ROTATE_LIST_TITLE": "**Your Descriptions:**\n\n",
        "ROTATE_SUGGEST": "Unknown command. Did you mean `{prefix}descriptionrotate {suggested}` ?",

        "BOTLINK_USAGE": "Please use the command this way: `{prefix}botlink [id]`.",
        "BOTLINK_INVALID_ID": "Invalid bot ID. The ID must contain only numbers.",
        "BOTLINK_TITLE": "**Bot invitation link**:",

        "RPC_UPDATED": "RPC has been updated.",
        "RPC_ERROR": "Error updating RPC.",
        "RPC_HELP_TITLE": "**RPC Configuration**",
        "RPC_HELP": "**{username} RPC**:\n> `{prefix}configrpc name <text>` - Name\n> `{prefix}configrpc details <text>` - Details\n> `{prefix}configrpc state <text>` - State\n> `{prefix}configrpc party <cur>/<max>` - Party\n> `{prefix}configrpc type <PLAYING/WATCHING/...>` - Type\n> `{prefix}configrpc largeimage <link> [text]` - Large Image\n> `{prefix}configrpc smallimage <link> [text]` - Small Image\n> `{prefix}configrpc platform <xbox/desktop/ps5>` - Platform\n> `{prefix}configrpc button <link> <text>` - Button 1\n> `{prefix}configrpc button2 <link> <text>` - Button 2\n> `{prefix}configrpc appid <id>` - Application ID\n> `{prefix}configrpc <element> delete`",
        "RPC_NAME_UPDATED": "RPC name updated.",
        "RPC_DETAILS_UPDATED": "RPC details updated.",
        "RPC_STATE_UPDATED": "RPC state updated.",

        "SPOTIFY_CONFIG_HELP": "**{username} Spotify**:\n> `{prefix}configspotify name <name>` - Set track name\n> `{prefix}configspotify artists <artists>` - Set artists\n> `{prefix}configspotify album <name>` - Set album\n> `{prefix}configspotify largeimage <link>` - Large image\n> `{prefix}configspotify smallimage <link>` - Small image\n> `{prefix}configspotify duration <seconds>` - Duration\n> `{prefix}configspotify on/off` - Enable/Disable",
        "SPOTIFY_HELP": "**Spotify Commands**\n> `{prefix}spotify play/pause` → Play/Pause\n> `{prefix}spotify skip/back` → Next/Previous\n> `{prefix}spotify current` → Current track\n> `{prefix}spotify playlist <name/link>` → Launch playlist",
        "SPOTIFY_NO_TOKEN": "Spotify not linked to Discord.",
        "SPOTIFY_NO_PLAYBACK": "Nothing playing currently.",
        "SPOTIFY_CURRENT": "Now playing: **{name}** — *{artists}*",
        "SPOTIFY_PLAYLIST_NOT_FOUND": "Playlist not found in your library.",
        "SPOTIFY_PLAYLIST_START": "Playlist launched!",

        "MULTISTATUS_HELP": "__**{username} - MULTISTATUS**__\n> `{prefix}multistatus start/stop` → Start/Stop\n> `{prefix}multistatus add [emoji] [text]` → Add\n> `{prefix}multistatus remove [index/all]` → Remove\n> `{prefix}multistatus list` → List",
        "MULTISTATUS_LIST_TITLE": "Custom status list ({count}/{max}):\n",
        "MULTISTATUS_NO_STATUS": "No custom status found.",
        "MULTISTATUS_LIMIT": "You have reached the maximum limit of {max} statuses.",

        "GITHUB_HELP": "Usage: `{prefix}github <username>`",
        "GITHUB_LOADING": "***Searching on GitHub...***",
        "GITHUB_NOT_FOUND": "***No GitHub user found for `{username}`***",
        "CLEARDM_HELP": "Usage: `{prefix}cleardm` (all) or `{prefix}cleardm <ID>`",
        "AUTOQUEST_HELP": "Usage: `{prefix}autoquest <start|stop|status|addproxy|listproxy>`"
    },
};

export function t(key: string, args: Record<string, string | number> = {}): string {
    const db = Database.config;
    const lang = db.language || 'fr';
    let text = translations[lang]?.[key] || key;
    
    for (const [arg, value] of Object.entries(args)) {
        text = text.replace(new RegExp(`{${arg}}`, 'g'), value.toString());
    }
    
    return text;
}

