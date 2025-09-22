
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

async function downloadTikTok(sock, sender, url) {
    try {
        // Envoyer un message pour indiquer que le téléchargement commence
        await sock.sendMessage(sender, { text: '📥 Téléchargement de la vidéo TikTok en cours, veuillez patienter...' });

        // Effectuer la requête POST vers l'API tikwm.com
        const response = await axios.post('https://tikwm.com/api/', {
            url: url
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Vérifier si la réponse est valide
        const data = response.data;
        if (!data || !data.data) {
            throw new Error('Réponse API invalide : aucune donnée reçue.');
        }

        // Récupérer les informations de la vidéo
        const videoData = data.data;
        const videoUrl = videoData.hdplay || videoData.play || videoData.wmplay;
        if (!videoUrl) {
            throw new Error('Aucune URL de vidéo disponible dans la réponse.');
        }

        // Formater les informations pour la légende
        const formatDuration = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };

        const caption = `🎥 **Vidéo TikTok téléchargée avec succès !** 🎉\n` +
                       `👤 **Auteur** : ${videoData.author?.nickname || 'Inconnu'} (@${videoData.author?.unique_id || 'N/A'})\n` +
                       `📝 **Description** : ${videoData.title || 'Aucune description'}\n` +
                       `⏱️ **Durée** : ${videoData.duration ? formatDuration(videoData.duration) : 'N/A'}\n` +
                       `👀 **Vues** : ${videoData.play_count?.toLocaleString() || 'N/A'}\n` +
                       `❤️ **Likes** : ${videoData.digg_count?.toLocaleString() || 'N/A'}\n` +
                       `💬 **Commentaires** : ${videoData.comment_count?.toLocaleString() || 'N/A'}\n` +
                       `🔄 **Partages** : ${videoData.share_count?.toLocaleString() || 'N/A'}\n` +
                       `🎵 **Musique** : ${videoData.music_info?.title || 'Aucune musique'} (par ${videoData.music_info?.author || 'N/A'})\n` +
                       `🔗 **Lien original** : ${url}`;

        // Télécharger la vidéo
        const videoResponse = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Créer un fichier temporaire pour la vidéo
        const tempDir = './temp';
        await fs.mkdir(tempDir, { recursive: true });
        const tempFilePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);
        await fs.writeFile(tempFilePath, videoResponse.data);

        // Vérifier la taille du fichier (WhatsApp limite à ~16 Mo pour les vidéos)
        const stats = await fs.stat(tempFilePath);
        if (stats.size > 16 * 1024 * 1024) {
            await fs.unlink(tempFilePath);
            throw new Error('La vidéo est trop volumineuse pour WhatsApp (>16 Mo).');
        }

        // Envoyer la vidéo avec les informations dans la légende
        await sock.sendMessage(sender, {
            video: { url: tempFilePath },
            mimetype: 'video/mp4',
            caption: caption
        });

        // Envoyer l'avatar de l'auteur si disponible
        if (videoData.author?.avatar) {
            try {
                const avatarResponse = await axios.get(videoData.author.avatar, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                await sock.sendMessage(sender, {
                    image: Buffer.from(avatarResponse.data),
                    caption: `🖼️ Photo de profil de @${videoData.author.unique_id || 'N/A'}`
                });
            } catch (err) {
                console.error('Erreur lors du téléchargement de l\'avatar:', err.message);
                await sock.sendMessage(sender, { text: '⚠️ Impossible de télécharger la photo de profil de l\'auteur.' });
            }
        }

        // Nettoyer le fichier temporaire
        await fs.unlink(tempFilePath);

        // Ajouter une réaction de confirmation
        await sock.sendMessage(sender, { react: { text: '✅', key: { id: sender, remoteJid: sender, fromMe: false } } });
    } catch (err) {
        console.error('Erreur lors du téléchargement TikTok:', err.message);
        await sock.sendMessage(sender, { text: `❌ Erreur lors du téléchargement de la vidéo TikTok : ${err.message}` });
        await sock.sendMessage(sender, { react: { text: '❌', key: { id: sender, remoteJid: sender, fromMe: false } } });
    }
}

export{ downloadTikTok };









