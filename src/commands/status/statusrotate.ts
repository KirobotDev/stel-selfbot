/**
 * @author xql.dev
 * @description rotate status
 * @version 1.0.0
 * @see https://github.com/kirobotdev/stel-sb
 */

import { Client, Message } from 'safeness-mirore-sb';
import { DBConfig } from '../../utils/database';
import { startStatusRotation, stopStatusRotation, isRotating } from '../../utils/status_rotation_manager';

export default {
    name: "statusrotate",
    description: "Rotate status",
    usage: "<start/stop>",
    run: async (client: Client, message: Message, args: string[], dbConf: DBConfig, prefix: string) => {
        const action = args[0]?.toLowerCase();

        if (!action || !['start', 'stop'].includes(action)) {
            const status = isRotating() ? "activé" : "désactivé";
            return message.edit(`***La rotation du statut est actuellement ${status}***\n> \`${prefix}statusrotate start\` → Pour l'activer\n> \`${prefix}statusrotate stop\` → Pour la désactiver`);
        }

        if (action === 'start') {
            if (isRotating()) return message.edit("***La rotation du statut est déjà activé.***");
            startStatusRotation(client);
            return message.edit("***La rotation du statut a été activée.***\n*(Rotation toutes les 10 secondes : Online → Idle → DND → Invisible)*");
        }

        if (action === 'stop') {
            if (!isRotating()) return message.edit("***La rotation du statut est déjà désactivée.***");
            stopStatusRotation();
            return message.edit("***La rotation du statut a été désactivée.***");
        }
    }
};
