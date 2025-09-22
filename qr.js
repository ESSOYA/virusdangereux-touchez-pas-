// const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('baileys');
// const pino = require('pino');
// const QRCode = require('qrcode');
// const fs = require('fs');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';

// async function scanQR() {
//   console.log('Démarrage du processus de scan du QR code...');

//   // Initialiser l'état d'authentification
//   const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//   const { version } = await fetchLatestBaileysVersion();

//   // Créer une instance de connexion WhatsApp
//   const sock = makeWASocket({
//     logger: pino({ level: 'silent' }),
//     auth: state,
//     version,
//     browser: ['Aquila Bot QR Scanner', 'Chrome', '1.0.0']
//   });

//   // Événement pour sauvegarder les informations d'authentification
//   sock.ev.on('creds.update', async () => {
//     await saveCreds();
//     console.log('Informations d\'authentification sauvegardées dans', SESSION_DIR);
//   });

//   // Gestion de la connexion et du QR code
//   sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
//     if (qr) {
//       console.log('Nouveau QR code généré. Scannez avec WhatsApp :');
//       try {
//         const qrUrl = await QRCode.toString(qr, { type: 'terminal' });
//         console.log(qrUrl);
//       } catch (err) {
//         console.error('Erreur lors de la génération du QR code:', err.message);
//       }
//     }

//     if (connection === 'close') {
//       const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//       console.log('Connexion fermée:', reason);
//       if (reason === DisconnectReason.loggedOut) {
//         console.log('Déconnecté (logged out). Supprimez le dossier auth_info et relancez.');
//         fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//         console.log(`Dossier ${SESSION_DIR} supprimé. Relancez pour générer un nouveau QR code.`);
//         process.exit(1);
//       } else {
//         console.log('Tentative de reconnexion dans 5 secondes...');
//         setTimeout(scanQR, 5000);
//       }
//     } else if (connection === 'open') {
//       console.log('Connecté à WhatsApp avec succès !');
//       console.log('Session enregistrée dans', SESSION_DIR);
//       await sock.sendMessage('24106813542@s.whatsapp.net', { text: 'Session QR scannée et connectée avec succès !' });
//       process.exit(0); // Terminer le script après une connexion réussie
//     }
//   });

//   return sock;
// }

// // Lancer le processus de scan
// scanQR().catch(err => {
//   console.error('Erreur lors du scan du QR code:', err.message);
//   process.exit(1);
// });








// const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('baileys');
// const pino = require('pino');
// const QRCode = require('qrcode');
// const fs = require('fs');
// require('dotenv').config();

// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_JID = '24106813542@s.whatsapp.net';

// async function scanQR() {
//   console.log('Démarrage du processus de scan du QR code...');

//   // Initialiser l'état d'authentification
//   const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//   const { version } = await fetchLatestBaileysVersion();

//   // Créer une instance de connexion WhatsApp
//   const sock = makeWASocket({
//     logger: pino({ level: 'silent' }),
//     auth: state,
//     version,
//     browser: ['Aquila Bot', 'Chrome', '1.0.0']
//   });

//   // Événement pour sauvegarder les informations d'authentification
//   sock.ev.on('creds.update', async () => {
//     await saveCreds();
//     console.log('Informations d\'authentification sauvegardées dans', SESSION_DIR);
//   });

//   // Gestion de la connexion et du QR code
//   sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
//     if (qr) {
//       console.log('Nouveau QR code généré. Scannez avec WhatsApp :');
//       try {
//         const qrUrl = await QRCode.toString(qr, { type: 'terminal' });
//         console.log(qrUrl);
//       } catch (err) {
//         console.error('Erreur lors de la génération du QR code:', err.message);
//       }
//     }

//     if (connection === 'close') {
//       const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//       console.log('Connexion fermée:', reason);
//       if (reason === DisconnectReason.loggedOut) {
//         console.log('Déconnecté (logged out). Supprimez le dossier auth_info et relancez.');
//         fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//         console.log(`Dossier ${SESSION_DIR} supprimé. Relancez pour générer un nouveau QR code.`);
//         process.exit(1);
//       } else {
//         console.log('Tentative de reconnexion dans 5 secondes...');
//         setTimeout(scanQR, 5000);
//       }
//     } else if (connection === 'open') {
//       console.log('Connecté à WhatsApp avec succès !');
//       console.log('Session enregistrée dans', SESSION_DIR);

//       // Obtenir le numéro de l'utilisateur connecté
//       const userJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net' || null;
      
//       // Message de confirmation
//       const confirmationMessage = 'Session QR scannée et connectée avec succès ! 🚀';

//       try {
//         // Envoyer le message au créateur
//         await sock.sendMessage(CREATOR_JID, { text: confirmationMessage });
//         console.log(`Message de confirmation envoyé au créateur: ${CREATOR_JID}`);
//       } catch (err) {
//         console.error(`Erreur lors de l'envoi du message au créateur (${CREATOR_JID}):`, err.message);
//       }

//       // Envoyer le message à l'utilisateur connecté (si disponible)
//       if (userJid) {
//         try {
//           await sock.sendMessage(userJid, { text: confirmationMessage });
//           console.log(`Message de confirmation envoyé à l'utilisateur: ${userJid}`);
//         } catch (err) {
//           console.error(`Erreur lors de l'envoi du message à l'utilisateur (${userJid}):`, err.message);
//         }
//       } else {
//         console.warn('Numéro de l\'utilisateur non disponible. Message non envoyé à l\'utilisateur.');
//       }

//       process.exit(0); // Terminer le script après une connexion réussie
//     }
//   });

//   return sock;
// }

// // Lancer le processus de scan
// scanQR().catch(err => {
//   console.error('Erreur lors du scan du QR code:', err.message);
//   process.exit(1);
// });






import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
const CREATOR_JID = '24106813542@s.whatsapp.net';
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
const CREATOR_IMAGE = './images/aquila.jpg';

async function scanQR() {
  console.log('Démarrage du processus de scan du QR code...');

  // Initialiser l'état d'authentification
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  // Créer une instance de connexion WhatsApp
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    version,
    browser: ['Aquila Bot QR Scanner', 'Chrome', '1.0.0']
  });

  // Événement pour sauvegarder les informations d'authentification
  sock.ev.on('creds.update', async () => {
    await saveCreds();
    console.log('Informations d\'authentification sauvegardées dans', SESSION_DIR);
  });

  // Gestion de la connexion et du QR code
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('Nouveau QR code généré. Scannez avec WhatsApp :');
      try {
        const qrUrl = await QRCode.toString(qr, { type: 'terminal' });
        console.log(qrUrl);
      } catch (err) {
        console.error('Erreur lors de la génération du QR code:', err.message);
      }
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
      console.log('Connexion fermée:', reason);
      if (reason === DisconnectReason.loggedOut) {
        console.log('Déconnecté (logged out). Supprimez le dossier auth_info et relancez.');
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        console.log(`Dossier ${SESSION_DIR} supprimé. Relancez pour générer un nouveau QR code.`);
        process.exit(1);
      } else {
        console.log('Tentative de reconnexion dans 5 secondes...');
        setTimeout(scanQR, 5000);
      }
    } else if (connection === 'open') {
      console.log('Connecté à WhatsApp avec succès !');
      console.log('Session enregistrée dans', SESSION_DIR);

      // Obtenir le numéro de l'utilisateur connecté
      const userJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net' || null;

      // Message de confirmation avec lien du groupe et contact du créateur
      const confirmationMessage = `🌟 Session QR scannée et connectée avec succès ! 🚀\n\n` +
                                 `📢 **Rejoignez notre groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
                                 `📞 **Contact du créateur** : https://wa.me/${CREATOR_JID.split('@')[0]}`;

      // Vérifier si l'image du créateur existe
      let imageOptions = {};
      try {
        if (fs.existsSync(CREATOR_IMAGE)) {
          imageOptions = { image: { url: CREATOR_IMAGE } };
        } else {
          console.warn(`Image du créateur (${CREATOR_IMAGE}) non trouvée. Envoi du message sans image.`);
        }
      } catch (err) {
        console.error(`Erreur lors de la vérification de l'image du créateur:`, err.message);
      }

      // Envoyer le message au créateur
      try {
        await sock.sendMessage(CREATOR_JID, {
          ...imageOptions,
          caption: confirmationMessage,
          mentions: [CREATOR_JID]
        });
        console.log(`Message de confirmation envoyé au créateur: ${CREATOR_JID}`);
      } catch (err) {
        console.error(`Erreur lors de l'envoi du message au créateur (${CREATOR_JID}):`, err.message);
      }

      // Envoyer le message à l'utilisateur connecté (si disponible)
      if (userJid) {
        try {
          await sock.sendMessage(userJid, {
            ...imageOptions,
            caption: confirmationMessage,
            mentions: [CREATOR_JID]
          });
          console.log(`Message de confirmation envoyé à l'utilisateur: ${userJid}`);
        } catch (err) {
          console.error(`Erreur lors de l'envoi du message à l'utilisateur (${userJid}):`, err.message);
        }
      } else {
        console.warn('Numéro de l\'utilisateur non disponible. Message non envoyé à l\'utilisateur.');
      }

      process.exit(0); // Terminer le script après une connexion réussie
    }
  });

  return sock;
}

// Lancer le processus de scan
scanQR().catch(err => {
  console.error('Erreur lors du scan du QR code:', err.message);
  process.exit(1);
});