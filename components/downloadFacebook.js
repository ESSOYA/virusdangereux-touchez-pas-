import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function downloadFacebook(sock, sender, url) {
    try {
        // Exemple avec une API fictive pour Facebook (remplacez par une API réelle, e.g., fb-downloader)
        const apiUrl = `https://api.facebook-downloader.com/download?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(response.data);

        const tempPath = path.join(os.tmpdir(), `facebook_${Date.now()}.mp4`);
        await fs.writeFile(tempPath, videoBuffer);

        await sock.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: '📹 Vidéo Facebook téléchargée !'
        });

        await fs.unlink(tempPath);
    } catch (err) {
        console.error('Erreur lors du téléchargement Facebook:', err.message);
        await sock.sendMessage(sender, { text: `❌ Impossible de télécharger la vidéo Facebook : ${err.message}` });
    }
}

export{ downloadFacebook };