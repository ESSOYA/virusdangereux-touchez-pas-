import { downloadContentFromMessage } from 'baileys';

async function stickerToImage(sock, sender, quoted) {
    if (!quoted || !quoted.stickerMessage) {
        console.log('Aucun sticker cité pour -image');
        await sock.sendMessage(sender, { text: 'Veuillez citer un sticker valide pour le convertir en image.' });
        return;
    }
    try {
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(sender, { image: buffer });
    } catch (err) {
        console.error('Erreur lors de la conversion en image:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en image.' });
    }
}

export{ stickerToImage };