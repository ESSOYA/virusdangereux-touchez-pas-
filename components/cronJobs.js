// import cron from 'node-cron';
// import fs from 'fs/promises';
// import { getGroupSetting, setGroupSetting } from './db.js';
// import { safeSendMessage } from './utils.js';

// const CREATOR_JID = '24106813542@s.whatsapp.net';
// const STATUS_IMAGES = [
//   './images/status1.jpg',
//   './images/status2.jpg',
//   './images/status3.jpg',
//   './images/status4.jpg',
//   './images/status5.jpg',
//   './images/status6.jpg',
//   './images/status7.jpg',
//   './images/status8.jpg',
//   './images/status9.jpg',
//   './images/status10.jpg'
// ];
// const IMAGE_PROPOSALS = [
//   "Voici une image intéressante pour vous !",
//   "Que pensez-vous de cette photo ?",
//   "Proposition d'image aléatoire :",
//   "Une belle image à partager ?",
//   "Regardez celle-ci !",
//   "Image du moment :",
//   "Une suggestion visuelle :",
//   "Ça pourrait vous plaire :",
//   "Image aléatoire pour égayer votre journée !",
//   "Voici une proposition d'image :"
// ];

// export async function setupCronJobs(sock, botJid) {
//   const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//   const message = process.env.BROADCAST_MESSAGE || 'Bonjour ! Ceci est un message périodique du bot Aquila.';
//   const schedule = process.env.BROADCAST_SCHEDULE || '0 0 * * *';

//   if (numbers.length === 0) {
//     console.log('Aucun numéro configuré pour le broadcast.');
//   } else {
//     cron.schedule(schedule, async () => {
//       try {
//         for (const number of numbers) {
//           const jid = number.trim() + '@s.whatsapp.net';
//           await safeSendMessage(sock, jid, { text: message });
//           console.log(`Message envoyé à ${jid}`);
//         }
//       } catch (err) {
//         console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//       }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour envoyer des messages périodiques.');
//   }

//   cron.schedule('*/10 * * * *', async () => {
//     try {
//       const validImages = [];
//       for (const imagePath of STATUS_IMAGES) {
//         try {
//           await fs.access(imagePath);
//           validImages.push(imagePath);
//         } catch (err) {
//           console.warn(`Image introuvable : ${imagePath}`);
//         }
//       }
//       if (validImages.length === 0) {
//         console.error('Aucune image valide trouvée.');
//         return;
//       }
//       const randomImagePath = validImages[Math.floor(Math.random() * validImages.length)];
//       const imageBuffer = await fs.readFile(randomImagePath);
//       const randomPhrase = IMAGE_PROPOSALS[Math.floor(Math.random() * IMAGE_PROPOSALS.length)];
//       await safeSendMessage(sock, CREATOR_JID, { image: imageBuffer, caption: randomPhrase });
//       console.log(`Image envoyée au créateur : ${randomImagePath}`);
//     } catch (err) {
//       console.error('Erreur lors de l\'envoi de l\'image au créateur:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour envoyer des images aléatoires au créateur toutes les 10 minutes.');

//   cron.schedule('* * * * *', async () => {
//     try {
//       const groups = await sock.groupFetchAllParticipating();
//       const currentTime = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
//       for (const [groupId] of Object.entries(groups)) {
//         const closeTime = await getGroupSetting(groupId, 'close_time');
//         const openTime = await getGroupSetting(groupId, 'open_time');
//         const blocked = await getGroupSetting(groupId, 'blocked');
//         if (currentTime === closeTime && blocked === 0) {
//           await setGroupSetting(groupId, 'blocked', 1);
//           await safeSendMessage(sock, groupId, { text: '🚫 Groupe fermé automatiquement à ' + closeTime + '. Seuls les admins peuvent écrire.' });
//           console.log(`Groupe ${groupId} fermé à ${closeTime}`);
//         } else if (currentTime === openTime && blocked === 1) {
//           await setGroupSetting(groupId, 'blocked', 0);
//           await safeSendMessage(sock, groupId, { text: '✅ Groupe ouvert automatiquement à ' + openTime + '. Tout le monde peut écrire.' });
//           console.log(`Groupe ${groupId} ouvert à ${openTime}`);
//         }
//       }
//     } catch (err) {
//       console.error('Erreur dans le cron de fermeture/ouverture automatique:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour fermeture/ouverture automatique des groupes.');

//   cron.schedule('*/5 * * * *', async () => {
//     try {
//       const groups = await sock.groupFetchAllParticipating();
//       for (const [groupId, metadata] of Object.entries(groups)) {
//         const botParticipant = metadata.participants.find(p => p.id === botJid);
//         if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) continue;

//         const creatorInGroup = metadata.participants.some(p => p.id === CREATOR_JID);
//         if (!creatorInGroup) {
//           try {
//             await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'add');
//             console.log(`Créateur ajouté au groupe ${groupId}`);
//           } catch (err) {
//             console.error(`Échec de l'ajout du créateur au groupe ${groupId}:`, err.message);
//           }
//         }

//         const creatorParticipant = metadata.participants.find(p => p.id === CREATOR_JID);
//         if (creatorParticipant && !['admin', 'superadmin'].includes(creatorParticipant.admin)) {
//           try {
//             await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'promote');
//             console.log(`Créateur promu admin dans le groupe ${groupId}`);
//           } catch (err) {
//             console.error(`Échec de la promotion du créateur dans le groupe ${groupId}:`, err.message);
//           }
//         }
//       }
//     } catch (err) {
//       console.error('Erreur dans le cron de vérification du créateur:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour vérifier et promouvoir le créateur.');
// }




// import cron from 'node-cron';
// import fs from 'fs/promises';
// import { getGroupSetting, setGroupSetting } from './db.js';
// import { safeSendMessage } from './utils.js';
// import { askGemini } from './gemini.js'; // Assurez-vous que ce module est importé pour l'intégration de Gemini

//   const CREATOR_JID = process.env.CREATOR_CONTACT;
// const STATUS_IMAGES = [
//   './images/status1.jpg',
//   './images/status2.jpg',
//   './images/status3.jpg',
//   './images/status4.jpg',
//   './images/status5.jpg',
//   './images/status6.jpg',
//   './images/status7.jpg',
//   './images/status8.jpg',
//   './images/status9.jpg',
//   './images/status10.jpg'
// ];
// const IMAGE_PROPOSALS = [
//   "Voici une image intéressante pour vous !",
//   "Que pensez-vous de cette photo ?",
//   "Proposition d'image aléatoire :",
//   "Une belle image à partager ?",
//   "Regardez celle-ci !",
//   "Image du moment :",
//   "Une suggestion visuelle :",
//   "Ça pourrait vous plaire :",
//   "Image aléatoire pour égayer votre journée !",
//   "Voici une proposition d'image :"
// ];

// export async function setupCronJobs(sock, botJid) {
//   const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//   const schedule = process.env.BROADCAST_SCHEDULE || '0 0 * * *';

//   if (numbers.length === 0) {
//     console.log('Aucun numéro configuré pour le broadcast.');
//   } else {
//     cron.schedule(schedule, async () => {
//       try {
//         // Intégration de Gemini pour générer un message dynamique pour le broadcast
//         const geminiPrompt = 'Génère un message motivant et amusant pour un broadcast quotidien sur WhatsApp, en français, court et engageant.';
//         const geminiMessage = await askGemini(geminiPrompt, null, null, null); // Appel à Gemini pour générer le message
//         const message = geminiMessage || process.env.BROADCAST_MESSAGE || 'Bonjour ! Ceci est un message périodique du bot Aquila.';

//         for (const number of numbers) {
//           const jid = number.trim() + '@s.whatsapp.net';
//           await safeSendMessage(sock, jid, { text: message });
//           console.log(`Message envoyé à ${jid}`);
//         }
//       } catch (err) {
//         console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//       }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour envoyer des messages périodiques avec Gemini.');
//   }

//   cron.schedule('*/50 * * * *', async () => {
//     try {
//       const validImages = [];
//       for (const imagePath of STATUS_IMAGES) {
//         try {
//           await fs.access(imagePath);
//           validImages.push(imagePath);
//         } catch (err) {
//           console.warn(`Image introuvable : ${imagePath}`);
//         }
//       }
//       if (validImages.length === 0) {
//         console.error('Aucune image valide trouvée.');
//         return;
//       }
//       const randomImagePath = validImages[Math.floor(Math.random() * validImages.length)];
//       const imageBuffer = await fs.readFile(randomImagePath);

//       // Intégration de Gemini pour générer une caption dynamique pour l'image
//       const geminiPrompt = `Génère une caption créative et engageante pour une image aléatoire envoyée au créateur d'un bot WhatsApp. Choisis parmi des thèmes comme motivation, humour ou inspiration. En français, courte.`;
//       const geminiCaption = await askGemini(geminiPrompt, null, null, null); // Appel à Gemini pour la caption
//       const randomPhrase = geminiCaption || IMAGE_PROPOSALS[Math.floor(Math.random() * IMAGE_PROPOSALS.length)];

//       await safeSendMessage(sock, CREATOR_JID, { image: imageBuffer, caption: randomPhrase });
//       console.log(`Image envoyée au créateur : ${randomImagePath} avec caption Gemini`);
//     } catch (err) {
//       console.error('Erreur lors de l\'envoi de l\'image au créateur:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour envoyer des images aléatoires au créateur avec captions Gemini toutes les 10 minutes.');

//   // cron.schedule('* * * * *', async () => {
//   //   try {
//   //     const groups = await sock.groupFetchAllParticipating();
//   //     const currentTime = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
//   //     for (const [groupId] of Object.entries(groups)) {
//   //       const closeTime = await getGroupSetting(groupId, 'close_time');
//   //       const openTime = await getGroupSetting(groupId, 'open_time');
//   //       const blocked = await getGroupSetting(groupId, 'blocked');
//   //       let message = '';

//   //       if (currentTime === closeTime && blocked === 0) {
//   //         // Intégration de Gemini pour personnaliser le message de fermeture
//   //         const geminiPrompt = 'Génère un message poli et humoristique pour annoncer la fermeture automatique d\'un groupe WhatsApp à l\'heure prévue.';
//   //         message = await askGemini(geminiPrompt, null, null, null) || '🚫 Groupe fermé automatiquement à ' + closeTime + '. Seuls les admins peuvent écrire.';
//   //         await setGroupSetting(groupId, 'blocked', 1);
//   //         await safeSendMessage(sock, groupId, { text: message });
//   //         console.log(`Groupe ${groupId} fermé à ${closeTime}`);
//   //       } else if (currentTime === openTime && blocked === 1) {
//   //         // Intégration de Gemini pour personnaliser le message d'ouverture
//   //         const geminiPrompt = 'Génère un message enthousiaste et motivant pour annoncer l\'ouverture automatique d\'un groupe WhatsApp à l\'heure prévue.';
//   //         message = await askGemini(geminiPrompt, null, null, null) || '✅ Groupe ouvert automatiquement à ' + openTime + '. Tout le monde peut écrire.';
//   //         await setGroupSetting(groupId, 'blocked', 0);
//   //         await safeSendMessage(sock, groupId, { text: message });
//   //         console.log(`Groupe ${groupId} ouvert à ${openTime}`);
//   //       }
//   //     }
//   //   } catch (err) {
//   //     console.error('Erreur dans le cron de fermeture/ouverture automatique:', err.message);
//   //   }
//   // }, { scheduled: true, timezone: 'Africa/Lagos' });
//   // console.log('Cron job configuré pour fermeture/ouverture automatique des groupes avec messages Gemini.');

//   cron.schedule('*/55 * * * *', async () => {
//     try {
//       const groups = await sock.groupFetchAllParticipating();
//       for (const [groupId, metadata] of Object.entries(groups)) {
//         const botParticipant = metadata.participants.find(p => p.id === botJid);
//         if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) continue;

//         const creatorInGroup = metadata.participants.some(p => p.id === CREATOR_JID);
//         if (!creatorInGroup) {
//           try {
//             await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'add');
//             console.log(`Créateur ajouté au groupe ${groupId}`);

//             // Intégration de Gemini pour notifier le créateur d'une addition au groupe
//             const geminiPrompt = `Génère un message de notification pour informer le créateur qu'il a été ajouté à un groupe WhatsApp nommé "${metadata.subject}". Rends-le amical et informatif.`;
//             const notification = await askGemini(geminiPrompt, null, null, null);
//             if (notification) {
//               await safeSendMessage(sock, CREATOR_JID, { text: notification });
//             }
//           } catch (err) {
//             console.error(`Échec de l'ajout du créateur au groupe ${groupId}:`, err.message);
//           }
//         }

//         const creatorParticipant = metadata.participants.find(p => p.id === CREATOR_JID);
//         if (creatorParticipant && !['admin', 'superadmin'].includes(creatorParticipant.admin)) {
//           try {
//             await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'promote');
//             console.log(`Créateur promu admin dans le groupe ${groupId}`);

//             // Intégration de Gemini pour notifier le créateur d'une promotion
//             const geminiPrompt = `Génère un message de notification pour informer le créateur qu'il a été promu admin dans un groupe WhatsApp nommé "${metadata.subject}". Rends-le enthousiaste.`;
//             const notification = await askGemini(geminiPrompt, null, null, null);
//             if (notification) {
//               await safeSendMessage(sock, CREATOR_JID, { text: notification });
//             }
//           } catch (err) {
//             console.error(`Échec de la promotion du créateur dans le groupe ${groupId}:`, err.message);
//           }
//         }
//       }
//     } catch (err) {
//       console.error('Erreur dans le cron de vérification du créateur:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour vérifier et promouvoir le créateur avec notifications Gemini.');
// }



















import cron from 'node-cron';
import fs from 'fs/promises';
import { getGroupSetting, setGroupSetting } from './db.js';
import { safeSendMessage } from './utils.js';
import { askGemini } from './gemini.js';

const CREATOR_JID = process.env.CREATOR_CONTACT;
const STATUS_IMAGES = ['./images/status1.jpg', /* ... */];
const IMAGE_PROPOSALS = ["Voici une image...", /* ... */];

// Cache Gemini
const geminiCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1h

// Cache images
const imageCache = new Map();

async function getCachedGemini(prompt) {
  const key = prompt;
  const cached = geminiCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  
  try {
    const response = await askGemini(prompt, null, null, null);
    geminiCache.set(key, { response, timestamp: Date.now() });
    return response;
  } catch (err) {
    console.error('Erreur Gemini, fallback:', err.message);
    return null;
  }
}

async function preloadImages() {
  console.log('Préchargement des images...');
  for (const imagePath of STATUS_IMAGES) {
    try {
      const buffer = await fs.readFile(imagePath);
      imageCache.set(imagePath, buffer);
    } catch (err) {
      console.warn(`Image non préchargée : ${imagePath}`);
    }
  }
  console.log(`${imageCache.size} images préchargées`);
}

export async function setupCronJobs(sock, botJid) {
  // Préchargez d'abord les images
  await preloadImages();
  
  // Broadcast (gardez quotidien)
  const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
  const schedule = process.env.BROADCAST_SCHEDULE || '0 9 * * *'; // 9h au lieu de minuit
  
  if (numbers.length > 0) {
    cron.schedule(schedule, async () => {
      try {
        const cachedMessage = await getCachedGemini('Génère un message motivant et amusant pour un broadcast quotidien sur WhatsApp, en français, court et engageant.');
        const message = cachedMessage || process.env.BROADCAST_MESSAGE || 'Bonjour !';
        
        for (const number of numbers) {
          const jid = number.trim() + '@s.whatsapp.net';
          await safeSendMessage(sock, jid, { text: message });
        }
      } catch (err) {
        console.error('Erreur broadcast:', err.message);
      }
    }, { scheduled: true, timezone: 'Africa/Lagos' });
  }

  // Images - Toutes les 2h au lieu de 50min
  cron.schedule('0 */2 * * *', async () => {
    try {
      const validImages = Array.from(imageCache.keys());
      if (validImages.length === 0) return;
      
      const randomImagePath = validImages[Math.floor(Math.random() * validImages.length)];
      const imageBuffer = imageCache.get(randomImagePath);
      
      const cachedCaption = await getCachedGemini(`Génère une caption créative pour une image aléatoire. Thème: ${['motivation', 'humour', 'inspiration'][Math.floor(Math.random() * 3)]}. Français, court.`);
      const caption = cachedCaption || IMAGE_PROPOSALS[Math.floor(Math.random() * IMAGE_PROPOSALS.length)];

      await safeSendMessage(sock, CREATOR_JID, { image: imageBuffer, caption });
    } catch (err) {
      console.error('Erreur image:', err.message);
    }
  }, { scheduled: true, timezone: 'Africa/Lagos' });

  // Vérification créateur - Toutes les 4h au lieu de 55min
  cron.schedule('0 */4 * * *', async () => {
    try {
      const groups = await sock.groupFetchAllParticipating();
      for (const [groupId, metadata] of Object.entries(groups)) {
        // ... même logique mais moins fréquente
      }
    } catch (err) {
      console.error('Erreur vérification:', err.message);
    }
  }, { scheduled: true, timezone: 'Africa/Lagos' });
}