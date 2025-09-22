// import fs from 'fs/promises';
// import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
// import pino from 'pino';

// // Function to wait for a delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // Main function to send WhatsApp status
// async function sendWhatsAppStatus(imagePath) {
//     let sock; // Declare sock outside try block
//     try {
//         // Check if the image file exists
//         await fs.access(imagePath);
//         console.log(`Image found: ${imagePath}`);

//         // Check image size
//         const stats = await fs.stat(imagePath);
//         if (stats.size > 5 * 1024 * 1024) {
//             throw new Error('Image is too large (max 5 MB).');
//         }
//         console.log(`Image size: ${stats.size} bytes`);

//         // Set up Baileys connection
//         const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
//         sock = makeWASocket({
//             logger: pino({ level: 'debug' }), // Enable debug logging
//             auth: state,
//         });

//         // Register creds.update event listener
//         sock.ev.on('creds.update', saveCreds);

//         // Wait for connection to establish
//         await new Promise((resolve, reject) => {
//             sock.ev.on('connection.update', async (update) => {
//                 const { connection, lastDisconnect } = update;
//                 if (connection === 'open') {
//                     console.log('WhatsApp connection established!');
//                     resolve();
//                 } else if (connection === 'close') {
//                     const reason = lastDisconnect?.error?.message || 'Unknown reason';
//                     console.error('Connection closed:', reason);
//                     reject(new Error(`Connection closed: ${reason}`));
//                 }
//             });
//         });

//         // Read the image
//         const imageBuffer = await fs.readFile(imagePath);
//         console.log(`Image read, buffer size: ${imageBuffer.length} bytes`);

//         // Send the image as a status
//         const sendResult = await sock.sendMessage(sock.user.id, {
//             image: imageBuffer,
//             status: true,
//         });
//         console.log('Status send result:', JSON.stringify(sendResult, null, 2));

//         // Wait longer to ensure the status is processed
//         console.log('Waiting 10 seconds for WhatsApp to process the status...');
//         await delay(10000); // Increased to 10 seconds

//         console.log(`WhatsApp status sent with image: ${imagePath}`);
//     } catch (err) {
//         console.error('Error sending status:', err.message);
//         throw err;
//     } finally {
//         // Close the connection if sock is defined
//         if (sock) {
//             try {
//                 await sock.end();
//                 console.log('Connection closed properly');
//             } catch (closeErr) {
//                 console.error('Error closing connection:', closeErr.message);
//             }
//         }
//     }
// }

// // Example usage
// const imagePath = './images/status1.jpg'; // Verify this path is correct
// sendWhatsAppStatus(imagePath).catch((err) => {
//     console.error('Failed to send status:', err.message);
// });







import fs from 'fs/promises';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';

// Fonction pour attendre un délai
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fonction principale pour envoyer un statut WhatsApp
async function sendWhatsAppStatus(imagePath) {
    let sock;
    try {
        // Vérifier si le fichier image existe
        await fs.access(imagePath);
        console.log(`Image trouvée : ${imagePath}`);

        // Vérifier la taille de l'image
        const stats = await fs.stat(imagePath);
        if (stats.size > 5 * 1024 * 1024) {
            throw new Error('L\'image est trop volumineuse (max 5 Mo).');
        }
        console.log(`Taille de l'image : ${stats.size} octets`);

        // Configurer la connexion Baileys
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
        sock = makeWASocket({
            logger: pino({ level: 'debug' }),
            auth: state,
        });

        // Enregistrer l'écouteur pour la mise à jour des identifiants
        sock.ev.on('creds.update', saveCreds);

        // Ajouter des écouteurs pour les messages et leurs mises à jour
        sock.ev.on('messages.upsert', ({ messages }) => {
            console.log('Messages reçus:', JSON.stringify(messages, null, 2));
        });
        sock.ev.on('messages.update', (updates) => {
            console.log('Mises à jour des messages:', JSON.stringify(updates, null, 2));
        });

        // Attendre que la connexion soit établie
        await new Promise((resolve, reject) => {
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                if (connection === 'open') {
                    console.log('Connexion WhatsApp établie !');
                    resolve();
                } else if (connection === 'close') {
                    const reason = lastDisconnect?.error?.message || DisconnectReason[lastDisconnect?.error?.reason] || 'Raison inconnue';
                    console.error('Connexion fermée:', reason);
                    reject(new Error(`Connexion fermée: ${reason}`));
                }
            });
        });

        // Lire l'image
        const imageBuffer = await fs.readFile(imagePath);
        console.log(`Image lue, taille du buffer : ${imageBuffer.length} octets`);

        // Envoyer l'image comme statut
        const sendResult = await sock.sendMessage(sock.user.id, {
            image: imageBuffer,
            status: true,
        });
        console.log('Résultat de l\'envoi du statut:', JSON.stringify(sendResult, null, 2));

        // Attendre plus longtemps pour s'assurer que le statut est traité
        console.log('Attente de 20 secondes pour que WhatsApp traite le statut...');
        await delay(20000);

        console.log(`Statut WhatsApp envoyé avec l'image : ${imagePath}`);
    } catch (err) {
        console.error('Erreur lors de l\'envoi du statut:', err.message);
        throw err;
    } finally {
        // Fermer la connexion si sock est défini
        if (sock) {
            try {
                await sock.end();
                console.log('Connexion fermée proprement');
            } catch (closeErr) {
                console.error('Erreur lors de la fermeture de la connexion:', closeErr.message);
            }
        }
    }
}

// Exemple d'utilisation
const imagePath = './images/status1.jpg'; // Vérifiez que ce chemin est correct
sendWhatsAppStatus(imagePath).catch((err) => {
    console.error('Échec de l\'envoi du statut:', err.message);
});