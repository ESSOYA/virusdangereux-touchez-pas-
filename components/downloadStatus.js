import { downloadContentFromMessage } from 'baileys';
import fs from 'fs';

async function downloadStatus(sock, sender, quoted) {
    if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
        console.log('Aucun statut cité pour -download');
        await sock.sendMessage(sender, { text: 'Veuillez citer un statut (image ou vidéo) à télécharger.' });
        return;
    }
    try {
        const type = quoted.imageMessage ? 'image' : 'video';
        const stream = await downloadContentFromMessage(quoted.imageMessage || quoted.videoMessage, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        const fileName = `status_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
        fs.writeFileSync(fileName, buffer);
        await sock.sendMessage(sender, { document: buffer, mimetype: type === 'image' ? 'image/jpeg' : 'video/mp4', fileName });
    } catch (err) {
        console.error('Erreur lors du téléchargement du statut:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de télécharger le statut.' });
    }
}

export{ downloadStatus };