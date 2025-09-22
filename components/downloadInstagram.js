// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const os = require('os');

// async function downloadInstagram(sock, sender, url) {
//     try {
//         // Exemple avec une API fictive pour Instagram (remplacez par une API réelle, e.g., instagram-downloader)
//         const apiUrl = `https://api.instagram-downloader.com/download?url=${encodeURIComponent(url)}`;
//         const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
//         const videoBuffer = Buffer.from(response.data);

//         const tempPath = path.join(os.tmpdir(), `instagram_${Date.now()}.mp4`);
//         await fs.writeFile(tempPath, videoBuffer);

//         await sock.sendMessage(sender, {
//             video: videoBuffer,
//             mimetype: 'video/mp4',
//             caption: '📸 Vidéo Instagram téléchargée !'
//         });

//         await fs.unlink(tempPath);
//     } catch (err) {
//         console.error('Erreur lors du téléchargement Instagram:', err.message);
//         await sock.sendMessage(sender, { text: `❌ Impossible de télécharger la vidéo Instagram : ${err.message}` });
//     }
// }

// export{ downloadInstagram };















import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function downloadInstagram(sock, sender, url) {
    try {
        // Use SaveFrom.net or a similar service's endpoint
        const apiUrl = 'https://savefrom.net/api/convert-url'; // Hypothetical endpoint; replace with actual SaveFrom or alternative
        const response = await axios.post(apiUrl, {
            url: url, // Instagram URL (e.g., https://www.instagram.com/reel/doaolyjcp7n/)
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
                'Origin': 'https://savefrom.net',
                'Referer': 'https://savefrom.net/'
            }
        });

        // Assuming the API returns a JSON object with a download URL
        const downloadUrl = response.data.url || response.data.download_url; // Adjust based on actual API response
        if (!downloadUrl) {
            throw new Error('No download URL found in API response');
        }

        // Download the video from the provided URL
        const videoResponse = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const videoBuffer = Buffer.from(videoResponse.data);

        // Save temporarily to disk
        const tempPath = path.join(os.tmpdir(), `instagram_${Date.now()}.mp4`);
        await fs.writeFile(tempPath, videoBuffer);

        // Send the video via WhatsApp
        await sock.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: '📸 Vidéo Instagram téléchargée !'
        });

        // Clean up the temporary file
        await fs.unlink(tempPath);
    } catch (err) {
        console.error('Erreur lors du téléchargement Instagram:', err.message);
        await sock.sendMessage(sender, {
            text: `❌ Impossible de télécharger la vidéo Instagram : ${err.message}`
        });
    }
}

export { downloadInstagram };