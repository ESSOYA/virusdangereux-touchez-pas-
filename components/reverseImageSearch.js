// import FormData from 'form-data';
// import axios from 'axios';

// // Upload image sur telegra.ph et retourner l'URL
// async function uploadImage(buffer) {
//     try {
//         const form = new FormData();
//         form.append('file', buffer, { filename: 'image.jpg' });

//         const res = await axios.post('https://telegra.ph/upload', form, {
//             headers: form.getHeaders()
//         });

//         if (res.data && res.data[0] && res.data[0].src) {
//             return 'https://telegra.ph' + res.data[0].src;
//         } else {
//             throw new Error('Erreur upload image');
//         }
//     } catch (err) {
//         console.error('uploadImage error:', err.message);
//         return null;
//     }
// }

// // Fonction de recherche inversée simple (exemple fictif)
// async function reverseImageSearch(imageUrl, maxResults = 3) {
//     // Ici tu peux mettre ton code de recherche inversée (Google API, Bing API, etc.)
//     // Pour tester, on retourne juste l'image elle-même
//     return {
//         text: 'Résultats de la recherche inversée',
//         images: [imageUrl]
//     };
// }

// export{ uploadImage, reverseImageSearch };










import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data'; // Ajoutez si nécessaire pour uploadImage

/**
 * Upload d'une image pour obtenir une URL publique
 * @param {Buffer} imageBuffer - Buffer de l'image
 * @returns {Promise<string>} - URL de l'image uploadée
 */
async function uploadImage(imageBuffer) {
    try {
        const formData = new FormData();
        formData.append('image', imageBuffer, 'image.jpg');
        const res = await axios.post('https://example.com/upload', formData, {
            headers: formData.getHeaders()
        });
        return res.data.url;
    } catch (err) {
        console.error('Erreur lors de l\'upload de l\'image :', err.message);
        return null;
    }
}

/**
 * Recherche d'images similaires à partir d'une image donnée
 * @param {Buffer} imageBuffer - Buffer de l'image à analyser
 * @returns {Promise<Array>} - Liste des résultats (images similaires)
 */
async function reverseImageSearch(imageBuffer) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
        console.error('Erreur : GOOGLE_API_KEY ou GOOGLE_CX manquant !');
        return [];
    }

    try {
        // Uploader l'image pour obtenir une URL publique
        const imageUrl = await uploadImage(imageBuffer);
        if (!imageUrl) {
            console.error('Erreur : Échec de l\'upload de l\'image.');
            return [];
        }

        // Construire une requête de recherche inversée avec l'URL de l'image
        const query = `site:* "${imageUrl}"`; // Recherche l'URL exacte ou similaire
        const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: apiKey,
                cx: cx,
                searchType: 'image',
                q: query,
                hl: 'fr',
                num: 5 // Limiter à 5 résultats pour éviter les abus
            }
        });

        if (res.data.items?.length) {
            return res.data.items.map(item => ({
                title: item.title || 'Image similaire',
                snippet: item.snippet || 'Aucune description disponible',
                pageLink: item.image?.contextLink || '',
                imageLink: item.link
            }));
        }

        return [];
    } catch (err) {
        if (err.response?.status === 403) {
            console.error('Erreur 403 : Vérifiez votre clé API, CX ou quota.');
        } else {
            console.error('Erreur lors de la recherche inversée d\'images :', err.message);
        }
        return [];
    }
}

/**
 * Envoi des images similaires sur WhatsApp
 * @param {Object} sock - Instance du socket WhatsApp
 * @param {string} sender - JID du destinataire
 * @param {Array} images - Liste des images similaires
 */
async function sendSimilarImages(sock, sender, images) {
    if (!images.length) {
        await sock.sendMessage(sender, { text: 'Aucune image similaire trouvée.' });
        return;
    }

    for (const img of images) {
        try {
            const response = await axios.get(img.imageLink, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const buffer = Buffer.from(response.data);

            const caption = `🔹 ${img.title}\n${img.snippet}\nLien page : ${img.pageLink}`;

            await sock.sendMessage(sender, { image: buffer, caption });
        } catch (err) {
            console.error('Erreur lors du téléchargement de l\'image similaire :', err.message);
        }
    }
}

export { uploadImage, reverseImageSearch, sendSimilarImages };
