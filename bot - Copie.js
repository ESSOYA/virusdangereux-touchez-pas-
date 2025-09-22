


// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const QRCode = require('qrcode');
// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const cron = require('node-cron');
// const sqlite3 = require('sqlite3').verbose();
// const { Sticker } = require('wa-sticker-formatter');
// const { askGemini } = require('./components/gemini');
// const { textToAudio } = require('./components/textToAudio');
// const { mediaToSticker } = require('./components/stickerConverter');
// const { stickerToImage } = require('./components/stickerToImage');
// const { stickerToVideo } = require('./components/stickerToVideo');
// const { downloadStatus } = require('./components/downloadStatus');
// const { downloadTikTok } = require('./components/downloadTikTok');
// const { downloadInstagram } = require('./components/downloadInstagram');
// const { googleSearch, googleImageSearch, sendGoogleImages } = require('./components/googleSearch');
// const { showMenuImage, showMenuVideo } = require('./components/menu');
// const { uploadImage, reverseImageSearch } = require('./components/reverseImageSearch');

// const CREATOR_JID = '24106813542@s.whatsapp.net';
// const LAUGH_AUDIO = './audios/laugh.ogg';
// const CRY_AUDIO = './audios/cry.ogg';
// const APPLAUD_AUDIO = './audios/applaud.ogg';
// const EAGLE_AUDIO = './audios/eagle.ogg';
// const INGRAT_AUDIO = './audios/ingrat.ogg';
// const THUMBSUP_IMAGE = './images/dorian.jpg';
// const LOL_IMAGE = './images/gloria.jpg';
// const SAD_IMAGE = './images/zigh.jpg';
// const DEFAULT_PROFILE_IMAGE = './images/default_profile.jpg';
// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
// const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
// const PREFIX = '.';
// const messageCache = new Map();
// const CACHE_TIMEOUT = 15000;

// // Status images array (10 types)
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

// // Random phrases for image proposals
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

// // Status types for commands
// const STATUS_TYPES = {
//   drole: [0, 1, 2],
//   triste: [3, 4, 5],
//   autre: [6, 7, 8, 9]
// };

// // Constants for sticker metadata
// const STICKER_PACK = 'AquilaBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// // Variables from .env
// const ENABLE_WELCOME_GOODBYE = process.env.ENABLE_WELCOME_GOODBYE === 'yes';
// const WARNING_LIMIT = parseInt(process.env.WARNING_LIMIT || 3);
// const FORBIDDEN_WORDS = process.env.FORBIDDEN_WORDS ? process.env.FORBIDDEN_WORDS.split(',') : [];

// // SQLite Database for warnings and settings
// const db = new sqlite3.Database('./warnings.db', (err) => {
//   if (err) {
//     console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
//   } else {
//     console.log('Base de données ouverte avec succès.');
//   }
// });

// // Créer les tables et ajouter les colonnes nécessaires
// db.run(`CREATE TABLE IF NOT EXISTS warnings (groupId TEXT, userId TEXT, count INTEGER, PRIMARY KEY (groupId, userId))`);
// db.run(`CREATE TABLE IF NOT EXISTS group_settings (groupId TEXT PRIMARY KEY, anti_link INTEGER DEFAULT 0, anti_word INTEGER DEFAULT 0, welcome INTEGER DEFAULT 0, blocked INTEGER DEFAULT 0, close_time TEXT DEFAULT '22:00', open_time TEXT DEFAULT '09:00')`);
// db.run(`ALTER TABLE group_settings ADD COLUMN blocked INTEGER DEFAULT 0`, (err) => {
//   if (err && !err.message.includes('duplicate column name')) {
//     console.error('Erreur lors de l\'ajout de la colonne blocked:', err.message);
//   } else {
//     console.log('Colonne blocked ajoutée ou déjà présente.');
//   }
// });
// db.run(`ALTER TABLE group_settings ADD COLUMN close_time TEXT DEFAULT '22:00'`, (err) => {
//   if (err && !err.message.includes('duplicate column name')) {
//     console.error('Erreur lors de l\'ajout de la colonne close_time:', err.message);
//   } else {
//     console.log('Colonne close_time ajoutée ou déjà présente.');
//   }
// });
// db.run(`ALTER TABLE group_settings ADD COLUMN open_time TEXT DEFAULT '09:00'`, (err) => {
//   if (err && !err.message.includes('duplicate column name')) {
//     console.error('Erreur lors de l\'ajout de la colonne open_time:', err.message);
//   } else {
//     console.log('Colonne open_time ajoutée ou déjà présente.');
//   }
// });

// async function getWarningCount(groupId, userId) {
//   return new Promise((resolve, reject) => {
//     db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
//       if (err) reject(err);
//       resolve(row ? row.count : 0);
//     });
//   });
// }

// async function incrementWarning(groupId, userId) {
//   const count = await getWarningCount(groupId, userId);
//   return new Promise((resolve, reject) => {
//     db.run(`INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`, [groupId, userId, count + 1], (err) => {
//       if (err) reject(err);
//       resolve(count + 1);
//     });
//   });
// }

// async function resetWarning(groupId, userId) {
//   return new Promise((resolve, reject) => {
//     db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
//       if (err) reject(err);
//       resolve();
//     });
//   });
// }

// async function getGroupSetting(groupId, setting) {
//   return new Promise((resolve, reject) => {
//     db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
//       if (err) reject(err);
//       resolve(row ? row[setting] : (setting === 'close_time' ? '22:00' : setting === 'open_time' ? '09:00' : 0));
//     });
//   });
// }

// async function setGroupSetting(groupId, setting, value) {
//   return new Promise((resolve, reject) => {
//     db.run(
//       `INSERT OR REPLACE INTO group_settings (groupId, ${setting}) VALUES (?, ?)`,
//       [groupId, value],
//       (err) => {
//         if (err) reject(err);
//         else resolve();
//       }
//     );
//   });
// }

// async function convertToSticker(imagePath) {
//   try {
//     await fs.access(imagePath); // Vérifier si le fichier existe
//     const sticker = new Sticker(imagePath, {
//       pack: STICKER_PACK,
//       author: STICKER_AUTHOR,
//       type: 'full',
//       categories: ['🤩', '🎉'],
//       id: `sticker_${Date.now()}`,
//       quality: 100,
//       background: 'transparent'
//     });
//     return await sticker.toBuffer();
//   } catch (err) {
//     console.error('Erreur lors de la conversion en sticker:', err.message);
//     throw new Error('Impossible de convertir en sticker.');
//   }
// }

// async function reactToMessage(sock, jid, messageId, emoji = '✨') {
//   if (!messageId) return;
//   try {
//     await sock.sendMessage(jid, { react: { text: emoji, key: { id: messageId, remoteJid: jid, fromMe: false } } });
//   } catch (err) {
//     console.error('Erreur lors de la réaction au message :', err.message);
//   }
// }

// async function setupCronJobs(sock) {
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
//           await sock.sendMessage(jid, { text: message });
//           console.log(`Message envoyé à ${jid}`);
//         }
//       } catch (err) {
//         console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//       }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour envoyer des messages périodiques.');
//   }

//   // Cron job for sending random images to creator every 10 minutes
//   cron.schedule('*/10 * * * *', async () => {
//     try {
//       const validImages = [];
//       for (const imagePath of STATUS_IMAGES) {
//         try {
//           await fs.access(imagePath); // Vérifier si l'image existe
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
//       await sock.sendMessage(CREATOR_JID, { image: imageBuffer, caption: randomPhrase });
//       console.log(`Image envoyée au créateur : ${randomImagePath}`);
//     } catch (err) {
//       console.error('Erreur lors de l\'envoi de l\'image au créateur:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour envoyer des images aléatoires au créateur toutes les 10 minutes.');

//   // Cron job for auto close/open groups every minute
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
//           await sock.sendMessage(groupId, { text: '🚫 Groupe fermé automatiquement à ' + closeTime + '. Seuls les admins peuvent écrire.' });
//           console.log(`Groupe ${groupId} fermé à ${closeTime}`);
//         } else if (currentTime === openTime && blocked === 1) {
//           await setGroupSetting(groupId, 'blocked', 0);
//           await sock.sendMessage(groupId, { text: '✅ Groupe ouvert automatiquement à ' + openTime + '. Tout le monde peut écrire.' });
//           console.log(`Groupe ${groupId} ouvert à ${openTime}`);
//         }
//       }
//     } catch (err) {
//       console.error('Erreur dans le cron de fermeture/ouverture automatique:', err.message);
//     }
//   }, { scheduled: true, timezone: 'Africa/Lagos' });
//   console.log('Cron job configuré pour fermeture/ouverture automatique des groupes.');
// }

// async function setupCreatorCheck(sock, botJid) {
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

// async function setRandomStatus(sock, type = 'random') {
//   try {
//     let indices;
//     if (type === 'drole') {
//       indices = STATUS_TYPES.drole;
//     } else if (type === 'triste') {
//       indices = STATUS_TYPES.triste;
//     } else if (type === 'autre') {
//       indices = STATUS_TYPES.autre;
//     } else {
//       indices = STATUS_IMAGES.map((_, i) => i);
//     }
//     const validImages = [];
//     for (const index of indices) {
//       try {
//         await fs.access(STATUS_IMAGES[index]); // Vérifier si l'image existe
//         validImages.push(STATUS_IMAGES[index]);
//       } catch (err) {
//         console.warn(`Image de statut introuvable : ${STATUS_IMAGES[index]}`);
//       }
//     }
//     if (validImages.length === 0) {
//       throw new Error('Aucune image de statut valide trouvée pour le type demandé.');
//     }
//     const randomImagePath = validImages[Math.floor(Math.random() * validImages.length)];
//     const imageBuffer = await fs.readFile(randomImagePath);
//     await sock.sendMessage(sock.user.id, { image: imageBuffer, status: true });
//     console.log(`Statut WhatsApp mis à jour avec ${randomImagePath} pour type ${type}`);
//   } catch (err) {
//     console.error('Erreur lors de la mise à jour du statut:', err.message);
//     throw err;
//   }
// }

// async function fetchStatuses(sock) {
//   try {
//     // Note : Baileys ne supporte pas directement getStatus. Implémentation alternative.
//     // Placeholder : simuler la récupération des statuts (à ajuster selon la version de Baileys)
//     console.warn('La récupération des statuts WhatsApp n\'est pas directement supportée par Baileys.');
//     return { message: 'Fonctionnalité de récupération des statuts non disponible pour le moment.' };
//   } catch (err) {
//     console.error('Erreur lors de la récupération des statuts:', err.message);
//     return { error: 'Impossible de récupérer les statuts. Veuillez réessayer plus tard.' };
//   }
// }

// async function retryOperation(operation, maxRetries = 3, delay = 1000) {
//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       return await operation();
//     } catch (err) {
//       console.error(`Tentative ${i + 1} échouée:`, err.message);
//       if (i === maxRetries - 1) throw err;
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
// }

// async function safeSendMessage(sock, jid, content, delayAfter = 0) {
//   try {
//     await sock.sendMessage(jid, content);
//     if (delayAfter > 0) {
//       await new Promise(resolve => setTimeout(resolve, delayAfter));
//     }
//   } catch (err) {
//     console.error('Erreur lors de l\'envoi du message:', err.message);
//     if (err.output && err.output.statusCode === 429) {
//       console.log('Rate limit atteint, attente de 5 secondes...');
//       await new Promise(resolve => setTimeout(resolve, 5000));
//       try {
//         await sock.sendMessage(jid, content);
//       } catch (retryErr) {
//         console.error('Échec du retry après rate limit:', retryErr.message);
//       }
//     }
//   }
// }

// async function startBot() {
//   const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//   const { version } = await fetchLatestBaileysVersion();
//   const sock = makeWASocket({
//     logger: pino({ level: 'silent' }),
//     auth: state,
//     version,
//     browser: ['Aquila Bot', 'safari', '1.0.0']
//   });

//   sock.ev.on('creds.update', saveCreds);
//   setupCronJobs(sock);
//   const botJid = sock.user.id.replace(/:\d+/, '');
//   setupCreatorCheck(sock, botJid);

//   sock.ev.on('messages.upsert', async ({ messages, type }) => {
//     try {
//       if (type !== 'notify') return;
//       const msg = messages[0];
//       if (!msg.message || msg.key.fromMe) return;

//     const sender = msg.key.remoteJid;
//     const messageId = msg.key.id;
//     const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
//     const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//     const isGroup = sender.endsWith('@g.us');
//     const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//     const isMentioned = mentioned.includes(botJid);
//     const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//     const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//     const isAudioQuotedBot = contextInfo?.participant === botJid;
//     const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;
//     const participant = msg.key.participant || sender;
//     const timestamp = msg.messageTimestamp || Date.now();

//     console.log(`Message reçu: sender=${sender}, text=${text}, isGroup=${isGroup}, isMentioned=${isMentioned}, isQuotedBot=${isQuotedBot}, participant=${participant}, messageId=${messageId}, timestamp=${timestamp}`);

//       // Vérification si le groupe est bloqué et l'utilisateur n'est pas admin
//       if (isGroup) {
//         const blocked = await getGroupSetting(sender, 'blocked');
//         if (blocked && participant !== botJid) {
//           try {
//             const metadata = await sock.groupMetadata(sender);
//             const isUserAdmin = metadata.participants.some(p => p.id === participant && ['admin', 'superadmin'].includes(p.admin));
//             if (!isUserAdmin) {
//               await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
//               await safeSendMessage(sock, sender, { text: `🚫 Le groupe est bloqué ! Seuls les admins peuvent écrire. @${participant.split('@')[0]}`, mentions: [participant] }, 500);
//               return;
//             }
//           } catch (err) {
//             console.error('Erreur vérification block:', err.message);
//           }
//         }
//       }

//       // Détection des liens
//       const linkRegex = /https?:\/\/\S+/;
//       if (isGroup && text.match(linkRegex)) {
//         const link = text.match(linkRegex)[0];
//         const antiLink = await getGroupSetting(sender, 'anti_link');

//         if (!antiLink) {
//           if (link.includes('tiktok.com')) {
//             await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
//             await downloadTikTok(sock, sender, link);
//           } else if (link.includes('instagram.com')) {
//             await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
//             await downloadInstagram(sock, sender, link);
//           }
//         }

//         if (antiLink) {
//           await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
//           const warningCount = await incrementWarning(sender, participant);
//           await safeSendMessage(sock, sender, { text: `⚠️ Lien détecté et supprimé : ${link} ! Avertissement ${warningCount}/${WARNING_LIMIT} pour @${participant.split('@')[0]}.`, mentions: [participant] }, 1000);
//           if (warningCount >= WARNING_LIMIT) {
//             try {
//               await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//               await safeSendMessage(sock, sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour envoi de liens.`, mentions: [participant] }, 1000);
//             } catch (kickErr) {
//               console.error('Erreur lors du kick:', kickErr.message);
//             }
//             await resetWarning(sender, participant);
//           }
//           return;
//         }
//       }

//       // Anti-mot avec mention et suppression automatique
//       if (isGroup && (await getGroupSetting(sender, 'anti_word'))) {
//         if (FORBIDDEN_WORDS.some(word => text.includes(word))) {
//           const forbiddenWord = FORBIDDEN_WORDS.find(word => text.includes(word));
//           await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
//           const warningCount = await incrementWarning(sender, participant);
//           await safeSendMessage(sock, sender, { text: `⚠️ Mot interdit détecté et supprimé : "${forbiddenWord}" ! Avertissement ${warningCount}/${WARNING_LIMIT} pour @${participant.split('@')[0]}.`, mentions: [participant] }, 1000);
//           if (warningCount >= WARNING_LIMIT) {
//             try {
//               await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//               await safeSendMessage(sock, sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour mots interdits.`, mentions: [participant] }, 1000);
//             } catch (kickErr) {
//               console.error('Erreur lors du kick:', kickErr.message);
//             }
//             await resetWarning(sender, participant);
//           }
//           return;
//         }
//       }

//       // Filtrage des mots interdits
//       const forbiddenWords = ['imbecile', 'vilain', 'stupide', 'bakota', 'kota', 'porno', 'sexe'];
//       if (text && forbiddenWords.some(word => text.includes(word))) {
//         await safeSendMessage(sock, sender, { text: 'Ehhhhh faut rester poli !!!!! pas de mot vulgaire svp' }, 500);
//         return;
//       }

//       // Mots déclencheurs pour stickers et audios
//       const triggerWords = {
//         essoya: { sticker: THUMBSUP_IMAGE, emoji: '👍' },
//         zigh: { sticker: SAD_IMAGE, emoji: '😔' },
//         funny: ['lol', 'mdr', 'haha', '😂', 'zoua', 'drôle', '🤣', 'gloria'],
//         aigle: { audio: EAGLE_AUDIO, emoji: '🦅' },
//         ingrat: { audio: INGRAT_AUDIO, emoji: '😣' }
//       };

//       if (text) {
//         let stickerSent = false;
//         let audioSent = false;

//         if (!stickerSent && text.includes('maboul')) {
//           try {
//             const stickerBuffer = await convertToSticker(triggerWords.essoya.sticker);
//             await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//             await reactToMessage(sock, sender, messageId, triggerWords.essoya.emoji);
//             stickerSent = true;
//             return;
//           } catch (err) {
//             console.error('Erreur envoi sticker essoya:', err.message);
//             await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//             await reactToMessage(sock, sender, messageId, '❌');
//             return;
//           }
//         }
//         if (!stickerSent && text.includes('zigh')) {
//           try {
//             const stickerBuffer = await convertToSticker(triggerWords.zigh.sticker);
//             await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//             await reactToMessage(sock, sender, messageId, triggerWords.zigh.emoji);
//             stickerSent = true;
//             return;
//           } catch (err) {
//             console.error('Erreur envoi sticker zigh:', err.message);
//             await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//             await reactToMessage(sock, sender, messageId, '❌');
//             return;
//           }
//         }
//         if (!stickerSent && triggerWords.funny.some(word => text.includes(word))) {
//           try {
//             const stickerBuffer = await convertToSticker(LOL_IMAGE);
//             await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//             await reactToMessage(sock, sender, messageId, '🤣');
//             stickerSent = true;
//             return;
//           } catch (err) {
//             console.error('Erreur envoi sticker funny:', err.message);
//             await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//             await reactToMessage(sock, sender, messageId, '❌');
//             return;
//           }
//         }
//         if (!audioSent && text.includes('aigle')) {
//           try {
//             const audioBuffer = await fs.readFile(triggerWords.aigle.audio);
//             await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//             await reactToMessage(sock, sender, messageId, triggerWords.aigle.emoji);
//             audioSent = true;
//             return;
//           } catch (err) {
//             console.error('Erreur envoi audio aigle:', err.message);
//             await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//             await reactToMessage(sock, sender, messageId, '❌');
//             return;
//           }
//         }
//         if (!audioSent && text.includes('ingrat')) {
//           try {
//             const audioBuffer = await fs.readFile(triggerWords.ingrat.audio);
//             await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//             await reactToMessage(sock, sender, messageId, triggerWords.ingrat.emoji);
//             audioSent = true;
//             return;
//           } catch (err) {
//             console.error('Erreur envoi audio ingrat:', err.message);
//             await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//             await reactToMessage(sock, sender, messageId, '❌');
//             return;
//           }
//         }
//       }

//       // Gestion des stickers animés
//       if (quoted && quoted.stickerMessage) {
//         if (quoted.stickerMessage.isAnimated && text.startsWith(`${PREFIX}video`)) {
//           await reactToMessage(sock, sender, messageId, '🎞️');
//           await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
//           await stickerToVideo(sock, sender, quoted);
//           return;
//         }
//       }

//       // Ignorer les messages non pertinents dans les groupes
//       if (isGroup && !text.startsWith(PREFIX) && !['sticker', 'menu', 'image', 'video', 'reverse'].includes(text.split(' ')[0]) && !msg.message.audioMessage && !isMentioned && !isQuotedBot) {
//         console.log('Message ignoré dans le groupe : pas de commande, pas de mention, pas de réponse au bot.');
//         return;
//       }

//       if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
//         console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
//         return;
//       }

//       if (msg.message.audioMessage) await sock.sendPresenceUpdate('recording', sender);
//       else await sock.sendPresenceUpdate('composing', sender);

//       // Gestion des notes vocales
//       if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//         try {
//           // await safeSendMessage(sock, sender, { text: 'Traitement de votre note vocale en cours, veuillez patienter...' }, 500);
//           const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//           let buffer = Buffer.from([]);
//           for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//           const geminiReply = await askGemini(null, sender, buffer);
//           if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//             await safeSendMessage(sock, sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, 500);
//             return;
//           }
//           const audioBuffer = await textToAudio(geminiReply);
//           if (audioBuffer) await safeSendMessage(sock, sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' }, 500);
//           else await safeSendMessage(sock, sender, { text: geminiReply }, 500);
//         } catch (err) {
//           console.error('Erreur lors du traitement de la note vocale:', err.message);
//           await safeSendMessage(sock, sender, { text: 'Erreur lors du traitement de la note vocale.' }, 500);
//         }
//         return;
//       }

//       // Traitement des commandes
//       if (text.startsWith(PREFIX) || ['sticker', 'menu', 'image', 'video', 'reverse'].includes(text.split(' ')[0])) {
//         console.log(`Exécution de la commande dans ${isGroup ? 'groupe' : 'discussion privée'}: ${text}`);
//         const commandText = text.startsWith(PREFIX) ? text.slice(PREFIX.length).trim() : text.trim();
//         const parts = commandText.split(' ');
//         const command = parts[0].toLowerCase();
//         const args = parts.slice(1).join(' ');
//         let metadata, isAdmin = false, isBotAdmin = false;

//         if (isGroup) {
//           try {
//             metadata = await retryOperation(() => sock.groupMetadata(sender));
//             const adminParticipant = metadata.participants.find(p => p.id === participant);
//             isAdmin = adminParticipant && (adminParticipant.admin === 'admin' || adminParticipant.admin === 'superadmin');
//             const botParticipant = metadata.participants.find(p => p.id === botJid);
//             isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
//           } catch (err) {
//             console.error('Erreur récupération métadonnées groupe:', err.message);
//             await safeSendMessage(sock, sender, { text: 'Erreur lors de la récupération des métadonnées du groupe.' }, 500);
//             return;
//           }
//         }

//         const products = [
//           { id: 1, title: "Azeva", description: "Azeva est une plateforme pour apprendre, créer des classes, suivre des résultats, basée sur l'IA elle révolutionne l'apprentissage et la gestion du temps", image: "./images/Azeva.jpg", link: "https://azeva-frontend.vercel.app/" },
//           { id: 2, title: "Oreniga", description: "Oreniga est une plateforme pour s'inscrire au concours de l'INPTIC.", image: "./images/oreniga.jpg", link: "https://aningo.alwaysdata.net" },
//           { id: 3, title: "Alissa CV-Letters", description: "Alissa CV-Letters est un outil pour générer des lettres grâce à l'IA et avoir votre propre CV.", image: "./images/cv.jpg", link: "https://alissa-cv.vercel.app/" },
//           { id: 4, title: "Alissa School", description: "Alissa School est une plateforme pour les lycées et collèges pour aider les élèves à apprendre, grâce à l'intelligence artificielle ils pourront apprendre en fonction de leur niveau.", image: "./images/School.jpg", link: "https://school-front-chi.vercel.app/" },
//           { id: 5, title: "Décodeur64", description: "Décodeur64 est un outil pour encoder et décoder du texte et des fichiers en base64", image: "./images/decode.jpg", link: "https://decodeur.vercel.app/" }
//         ];

//         await retryOperation(async () => {
//           switch (command) {
//             case 'antilink':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const antiLinkValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//               if (antiLinkValue === null) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .antilink on|off' }, 500);
//                 break;
//               }
//               await setGroupSetting(sender, 'anti_link', antiLinkValue);
//               await safeSendMessage(sock, sender, { text: `✅ Anti-lien ${antiLinkValue ? 'activé' : 'désactivé'}.` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'antiword':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const antiWordValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//               if (antiWordValue === null) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .antiword on|off' }, 500);
//                 break;
//               }
//               await setGroupSetting(sender, 'anti_word', antiWordValue);
//               await safeSendMessage(sock, sender, { text: `✅ Anti-mot ${antiWordValue ? 'activé' : 'désactivé'}.` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'welcome':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const welcomeValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//               if (welcomeValue === null) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .welcome on|off' }, 500);
//                 break;
//               }
//               await setGroupSetting(sender, 'welcome', welcomeValue);
//               await safeSendMessage(sock, sender, { text: `✅ Messages de bienvenue/au revoir ${welcomeValue ? 'activés' : 'désactivés'}.` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'block':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const blockValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//               if (blockValue === null) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .block on|off' }, 500);
//                 break;
//               }
//               await setGroupSetting(sender, 'blocked', blockValue);
//               await safeSendMessage(sock, sender, { text: `✅ Groupe ${blockValue ? 'bloqué' : 'débloqué'} ! Seuls les admins peuvent écrire.` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'setclose':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!args.match(/^\d{2}:\d{2}$/)) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .setclose hh:mm' }, 500);
//                 break;
//               }
//               await setGroupSetting(sender, 'close_time', args);
//               await safeSendMessage(sock, sender, { text: `✅ Heure de fermeture automatique définie à ${args}.` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'setopen':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!args.match(/^\d{2}:\d{2}$/)) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .setopen hh:mm' }, 500);
//                 break;
//               }
//               await setGroupSetting(sender, 'open_time', args);
//               await safeSendMessage(sock, sender, { text: `✅ Heure d'ouverture automatique définie à ${args}.` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'help':
//               await reactToMessage(sock, sender, messageId, '📖');
//               await showMenuImage(sock, sender);
//               break;

//             case 'menu':
//               await reactToMessage(sock, sender, messageId, '🎬');
//               await safeSendMessage(sock, sender, { text: 'Affichage du menu vidéo en cours, veuillez patienter...' }, 500);
//               await showMenuVideo(sock, sender);
//               break;

//             case 'info':
//               await reactToMessage(sock, sender, messageId, 'ℹ️');
//               await safeSendMessage(sock, sender, {
//                 image: { url: './images/menu.jpg' },
//                 caption: `🌟 **Aquila Bot - À propos** 🌟\n` +
//                          `**Description** : Je suis Aquila Bot, un assistant WhatsApp intelligent et polyvalent créé pour aider, divertir et gérer vos groupes avec style ! 😎\n` +
//                          `**Créateur** : Essoya le prince myènè\n` +
//                          `**Numéro WhatsApp du créateur** : +${CREATOR_CONTACT.split('@')[0]}\n` +
//                          `**Lien du groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
//                          `**Site web** : https://x.ai/grok\n` +
//                          `**Fonctionnalités principales** :\n` +
//                          `- 📜 Commandes : .help, .menu, .sticker, .image, .video, .tiktok, .insta, .find, .gimage, .reverse, etc.\n` +
//                          `- 🛡️ Gestion de groupe : Anti-lien, anti-mot, messages de bienvenue/au revoir, block.\n` +
//                          `- 🎨 Création de stickers : Conversion d'images/vidéos en stickers.\n` +
//                          `- 🎥 Téléchargement : Statuts WhatsApp, vidéos TikTok, Instagram.\n` +
//                          `- 🔍 Recherche : Recherche Google, recherche d'images, recherche inversée.\n` +
//                          `- 🤖 Réponses IA : Réponses intelligentes via Gemini.\n` +
//                          `- 🎉 Fun : Réactions emojis, audios, stickers personnalisés.\n` +
//                          `Tapez .help pour découvrir toutes mes commandes ! 🚀`,
//                 mentions: [CREATOR_CONTACT]
//               }, 1000);
//               try {
//                 const audioBuffer = await fs.readFile('./audios/info.mp3');
//                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/mpeg' }, 500);
//               } catch (err) {
//                 console.error('Erreur envoi audio info:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio de présentation.' }, 500);
//               }
//               break;

//             case 'sticker':
//               await reactToMessage(sock, sender, messageId, '✨');
//               await safeSendMessage(sock, sender, { text: 'Création de votre sticker en cours, veuillez patienter...' }, 500);
//               await mediaToSticker(sock, sender, quoted);
//               break;

//             case 'image':
//               await reactToMessage(sock, sender, messageId, '🖼️');
//               await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en image en cours, veuillez patienter...' }, 500);
//               await stickerToImage(sock, sender, quoted);
//               break;

//             case 'video':
//               await reactToMessage(sock, sender, messageId, '🎞️');
//               await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
//               await stickerToVideo(sock, sender, quoted);
//               break;

//             case 'download':
//               await reactToMessage(sock, sender, messageId, '⬇️');
//               await safeSendMessage(sock, sender, { text: 'Téléchargement du statut en cours, veuillez patienter...' }, 500);
//               await downloadStatus(sock, sender, quoted);
//               break;

//             case 'tiktok':
//               await reactToMessage(sock, sender, messageId, '🎥');
//               if (!args) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .tiktok <URL>' }, 500);
//                 break;
//               }
//               await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
//               await downloadTikTok(sock, sender, args);
//               break;

//             case 'insta':
//               await reactToMessage(sock, sender, messageId, '📸');
//               if (!args) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .insta <URL>' }, 500);
//                 break;
//               }
//               await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
//               await downloadInstagram(sock, sender, args);
//               break;

//             // case 'find':
//             //   await reactToMessage(sock, sender, messageId, '🔍');
//             //   if (!args) {
//             //     await safeSendMessage(sock, sender, { text: 'Utilisez : .find <terme>' }, 500);
//             //     break;
//             //   }
//             //   await safeSendMessage(sock, sender, { text: 'Recherche Google en cours, veuillez patienter...' }, 500);
//             //   const searchResult = await googleSearch(args);
//             //   await safeSendMessage(sock, sender, { text: searchResult }, 500);
//             //   break;

//             // case 'gimage':
//             //   await reactToMessage(sock, sender, messageId, '🖼️');
//             //   if (!args) {
//             //     await safeSendMessage(sock, sender, { text: 'Utilisez : .gimage <terme>' }, 500);
//             //     break;
//             //   }
//             //   await safeSendMessage(sock, sender, { text: 'Recherche d\'image Google en cours, veuillez patienter...' }, 500);
//             //   try {
//             //     const imageUrl = await googleImageSearch(args);
//             //     if (!imageUrl) {
//             //       await safeSendMessage(sock, sender, { text: 'Aucune image trouvée.' }, 500);
//             //       break;
//             //     }
//             //     const response = await axios.get(imageUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//             //     const imageBuffer = Buffer.from(response.data);
//             //     await safeSendMessage(sock, sender, { image: imageBuffer }, 500);
//             //   } catch (err) {
//             //     console.error('Erreur téléchargement image :', err.message);
//             //     await safeSendMessage(sock, sender, { text: 'Erreur lors du téléchargement de l\'image.' }, 500);
//             //   }
//             //   break;



// case 'find':
//     await reactToMessage(sock, sender, messageId, '🔍');
//     if (!args) {
//         await safeSendMessage(sock, sender, { text: 'Utilisez : .find <terme>' }, 500);
//         break;
//     }
//     await safeSendMessage(sock, sender, { text: 'Recherche Google en cours...' }, 500);

//     const searchResults = await googleSearch(args, 5);
//     if (!searchResults.length) {
//         await safeSendMessage(sock, sender, { text: 'Aucun résultat trouvé.' }, 500);
//     } else {
//         let message = '';
//         searchResults.forEach((res, i) => {
//             message += `🔹 Résultat ${i + 1}:\n${res.title}\n${res.snippet}\nSource: ${res.link}\n\n`;
//         });
//         await safeSendMessage(sock, sender, { text: message.trim() }, 500);
//     }
//     break;

// case 'gimage':
//     await reactToMessage(sock, sender, messageId, '🖼️');
//     if (!args) {
//         await safeSendMessage(sock, sender, { text: 'Utilisez : .gimage <terme>' }, 500);
//         break;
//     }
//     await safeSendMessage(sock, sender, { text: 'Recherche d\'images Google en cours...' }, 500);

//     const images = await googleImageSearch(args, 5);
//     if (!images.length) {
//         await safeSendMessage(sock, sender, { text: 'Aucune image trouvée.' }, 500);
//         break;
//     }

//     await sendGoogleImages(sock, sender, images);
//     break;

//             case 'reverse':
//               await reactToMessage(sock, sender, messageId, '🔎');
//               if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
//                 await safeSendMessage(sock, sender, { text: 'Veuillez citer une image ou un sticker pour la recherche inversée.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               await safeSendMessage(sock, sender, { text: 'Recherche inversée en cours, veuillez patienter...' }, 500);
//               try {
//                 const messageType = quoted.imageMessage ? 'image' : 'sticker';
//                 const stream = await downloadContentFromMessage(quoted[messageType + 'Message'], messageType);
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                 const uploadedUrl = await uploadImage(buffer);
//                 const searchResults = await reverseImageSearch(uploadedUrl);
//                 await safeSendMessage(sock, sender, { text: `Résultats de la recherche inversée :\n${searchResults}` }, 500);
//                 await reactToMessage(sock, sender, messageId, '✅');
//               } catch (err) {
//                 console.error('Erreur lors de la recherche inversée:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de la recherche inversée.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               }
//               break;

//             case 'catalogue':
//               await safeSendMessage(sock, sender, {
//                 image: { url: './images/catalogue.jpg' },
//                 caption: `🛍️ Catalogue Aquila Bot 🌟\n` +
//                          `Voici quelques produits que tu peux consulter :\n` +
//                          `1️⃣ Azeva - commande: .produit1\n` +
//                          `2️⃣ Oreniga - commande: .produit2\n` +
//                          `3️⃣ Alissa CV-Letters - commande: .produit3\n` +
//                          `4️⃣ Alissa School - commande: .produit4\n` +
//                          `5️⃣ Décodeur64 - commande: .produit5\n` +
//                          `Tape la commande correspondant au produit pour voir les détails 😎💬`
//               }, 1000);
//               break;

//             case 'produit1':
//             case 'produit2':
//             case 'produit3':
//             case 'produit4':
//             case 'produit5':
//               const prodId = parseInt(command.replace('produit', ''));
//               const prod = products.find(p => p.id === prodId);
//               if (prod) {
//                 await safeSendMessage(sock, sender, { image: { url: prod.image }, caption: `🛒 ${prod.title} 🌟\n${prod.description}\n🔗 Lien: ${prod.link}` }, 1000);
//               }
//               break;

//             case 'send':
//               if (!quoted) {
//                 await safeSendMessage(sock, sender, { text: 'Veuillez citer une image ou une vidéo à transférer.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               await safeSendMessage(sock, sender, { text: 'Transfert du média en cours, veuillez patienter...' }, 500);
//               const targetNumber = args ? `${args.split(' ')[0]}@s.whatsapp.net` : null;
//               let quotedMessage = quoted;
//               let messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//               if (!messageType && (quotedMessage.ephemeralMessage || quotedMessage.viewOnceMessageV2)) {
//                 const innerMessage = quotedMessage.ephemeralMessage?.message || quotedMessage.viewOnceMessageV2?.message;
//                 if (innerMessage) {
//                   quotedMessage = innerMessage;
//                   messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                 }
//               }
//               if (!messageType) {
//                 await safeSendMessage(sock, sender, { text: 'Le message cité n\'est ni une image ni une vidéo.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               try {
//                 const stream = await retryOperation(() => downloadContentFromMessage(quotedMessage[messageType], messageType.replace('Message', '').toLowerCase()));
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                 const mediaOptions = messageType === 'imageMessage' ? { image: buffer } : { video: buffer };
//                 await safeSendMessage(sock, CREATOR_CONTACT, mediaOptions, 500);
//                 if (targetNumber) {
//                   await safeSendMessage(sock, targetNumber, mediaOptions, 500);
//                 }
//                 await safeSendMessage(sock, sender, {
//                   [messageType === 'imageMessage' ? 'image' : 'video']: buffer,
//                   caption: `✅ Voici le média transféré${targetNumber ? ` à ${targetNumber}` : ''}.`
//                 }, 1000);
//                 await reactToMessage(sock, sender, messageId, '✅');
//               } catch (err) {
//                 console.error('Erreur lors du transfert du média:', err.message);
//                 await safeSendMessage(sock, sender, { text: '❌ Impossible de transférer le média.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               }
//               break;

//             case 'join':
//               if (!args) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .join <lien>' }, 500);
//                 break;
//               }
//               try {
//                 const inviteCodeMatch = args.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
//                 if (!inviteCodeMatch) {
//                   await safeSendMessage(sock, sender, { text: 'Lien invalide. Vérifiez le lien d\'invitation.' }, 500);
//                   break;
//                 }
//                 const inviteCode = inviteCodeMatch[1];
//                 await sock.groupAcceptInvite(inviteCode);
//                 await safeSendMessage(sock, sender, { text: '✅ Groupe rejoint avec succès !' }, 500);
//               } catch (err) {
//                 console.error('Erreur jointure groupe:', err.message);
//                 await safeSendMessage(sock, sender, { text: '❌ Impossible de rejoindre le groupe. Le lien peut être invalide ou expiré.' }, 500);
//               }
//               break;

//             case 'creator':
//               await reactToMessage(sock, sender, messageId, '🧑‍💻');
//               await safeSendMessage(sock, sender, {
//                 image: { url: './images/creator.jpg' },
//                 caption: `🌟 **À propos du Créateur** 🌟\n` +
//                          `**Nom** : Essongue Yann Chéri\n` +
//                          `**Alias** : Essoya le prince myènè\n` +
//                          `**Description** : Étudiant à l'INPTIC, je suis développeur et passionné de cybersécurité et réseaux. J'ai créé Aquila Bot pour rendre vos conversations plus fun et vos groupes mieux gérés ! 😎\n` +
//                          `**Contact** : Écrivez-moi sur WhatsApp : https://wa.me/${CREATOR_CONTACT.split('@')[0]}\n` +
//                          `Tapez .help pour découvrir ce que mon bot peut faire ! 🚀`,
//                 mentions: [CREATOR_CONTACT]
//               }, 1000);
//               break;

//             case 'delete':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!quoted) {
//                 await safeSendMessage(sock, sender, { text: 'Veuillez citer un message à supprimer.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const deleteContextInfo = msg.message.extendedTextMessage?.contextInfo;
//               const deleteQuotedKey = deleteContextInfo?.stanzaId;
//               const deleteQuotedParticipant = deleteContextInfo?.participant;
//               if (!deleteQuotedKey || !deleteQuotedParticipant) {
//                 await safeSendMessage(sock, sender, { text: 'Impossible de supprimer : le message cité n\'a pas les informations nécessaires.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               try {
//                 await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: deleteQuotedKey, participant: deleteQuotedParticipant } }, 500);
//                 await safeSendMessage(sock, sender, { text: '✅ Message supprimé pour tous.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '✅');
//               } catch (err) {
//                 console.error('Erreur lors de la suppression du message:', err.message);
//                 await safeSendMessage(sock, sender, { text: '❌ Impossible de supprimer le message. Je dois être admin.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               }
//               break;

//             case 'promote':
//             case 'demote':
//             case 'kick':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const actionContextInfo = msg.message.extendedTextMessage?.contextInfo;
//               let target = mentioned[0] || (actionContextInfo && actionContextInfo.participant);
//               if (!target) {
//                 await safeSendMessage(sock, sender, { text: 'Veuillez mentionner ou citer l\'utilisateur.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (command === 'kick' && target === botJid && participant !== CREATOR_JID) {
//                 await safeSendMessage(sock, sender, { text: '❌ Vous ne pouvez pas me kicker ! Seul le créateur peut le faire.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               try {
//                 const action = command === 'promote' ? 'promote' : command === 'demote' ? 'demote' : 'remove';
//                 await sock.groupParticipantsUpdate(sender, [target], action);
//                 await safeSendMessage(sock, sender, { text: `✅ Utilisateur ${action === 'remove' ? 'retiré' : action === 'promote' ? 'promu admin' : 'rétrogradé'}.` }, 500);
//                 await reactToMessage(sock, sender, messageId, '✅');
//               } catch (err) {
//                 console.error(`Erreur lors de ${command}:`, err.message);
//                 await safeSendMessage(sock, sender, { text: `❌ Impossible d'exécuter ${command}. Je dois être admin.` }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               }
//               break;

//             case 'add':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!args) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .add <numéro> (format international sans +)' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const number = args.replace(/\D/g, '') + '@s.whatsapp.net';
//               try {
//                 await sock.groupParticipantsUpdate(sender, [number], 'add');
//                 await safeSendMessage(sock, sender, { text: `✅ Membre ${args} ajouté.` }, 500);
//                 await reactToMessage(sock, sender, messageId, '✅');
//               } catch (err) {
//                 console.error('Erreur lors de l\'ajout:', err.message);
//                 await safeSendMessage(sock, sender, { text: '❌ Impossible d\'ajouter le membre.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               }
//               break;

//             case 'tagall':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const participants = metadata.participants.map(p => p.id);
//               await safeSendMessage(sock, sender, { text: args || '🔔 Tag all !', mentions: participants }, 1000);
//               await reactToMessage(sock, sender, messageId, '🔔');
//               break;

//             case 'hidetag':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const participantsHide = metadata.participants.map(p => p.id);
//               await safeSendMessage(sock, sender, { text: args || '🔕 Message du propriétaire', mentions: participantsHide }, 1000);
//               await reactToMessage(sock, sender, messageId, '🔕');
//               break;

//             case 'kickall':
//               if (!isGroup) {
//                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (participant !== CREATOR_JID) {
//                 await safeSendMessage(sock, sender, { text: 'Seul le propriétaire peut utiliser cette commande.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (!isBotAdmin) {
//                 await safeSendMessage(sock, sender, { text: 'Je dois être admin pour effectuer cette action.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               const nonAdmins = metadata.participants.filter(p => !p.admin && p.id !== botJid).map(p => p.id);
//               if (nonAdmins.length > 0) {
//                 try {
//                   await sock.groupParticipantsUpdate(sender, nonAdmins, 'remove');
//                   await safeSendMessage(sock, sender, { text: '✅ Tous les non-admins ont été retirés.' }, 500);
//                   await reactToMessage(sock, sender, messageId, '✅');
//                 } catch (err) {
//                   console.error('Erreur lors du kickall:', err.message);
//                   await safeSendMessage(sock, sender, { text: '❌ Erreur lors du retrait des membres.' }, 500);
//                   await reactToMessage(sock, sender, messageId, '❌');
//                 }
//               } else {
//                 await safeSendMessage(sock, sender, { text: 'Aucun non-admin à retirer.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               }
//               break;

//             case 'alive':
//               await reactToMessage(sock, sender, messageId, '✅');
//               await safeSendMessage(sock, sender, {
//                 image: { url: './images/alive.jpg' },
//                 caption: `🌟 Salut ! Aquila Bot est en ligne 🤖💬, prêt à répondre à tes questions et à t'amuser 😎💥. Ton assistant fidèle et un peu sarcastique 😏🖤 est prêt à agir ! 🚀`
//               }, 1000);
//               break;

//             case 'react':
//               if (!args) {
//                 await safeSendMessage(sock, sender, { text: 'Utilisez : .react <emoji>' }, 500);
//                 break;
//               }
//               await reactToMessage(sock, sender, messageId, args);
//               break;

//             case 'laugh':
//               try {
//                 const audioBuffer = await fs.readFile(LAUGH_AUDIO);
//                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                 await reactToMessage(sock, sender, messageId, '😂');
//               } catch (err) {
//                 console.error('Erreur envoi audio laugh:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//               }
//               break;

//             case 'cry':
//               try {
//                 const audioBuffer = await fs.readFile(CRY_AUDIO);
//                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                 await reactToMessage(sock, sender, messageId, '😢');
//               } catch (err) {
//                 console.error('Erreur envoi audio cry:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//               }
//               break;

//             case 'applaud':
//               try {
//                 const audioBuffer = await fs.readFile(APPLAUD_AUDIO);
//                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                 await reactToMessage(sock, sender, messageId, '👏');
//               } catch (err) {
//                 console.error('Erreur envoi audio applaud:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//               }
//               break;

//             case 'dorian':
//               try {
//                 const stickerBuffer = await convertToSticker(THUMBSUP_IMAGE);
//                 await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                 await reactToMessage(sock, sender, messageId, '👍');
//               } catch (err) {
//                 console.error('Erreur envoi sticker thumbsup:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//               }
//               break;

//             case 'gloglo':
//               try {
//                 const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                 await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                 await reactToMessage(sock, sender, messageId, '😆');
//               } catch (err) {
//                 console.error('Erreur envoi sticker lol:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//               }
//               break;

//             case 'zi':
//               try {
//                 const stickerBuffer = await convertToSticker(SAD_IMAGE);
//                 await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                 await reactToMessage(sock, sender, messageId, '😔');
//               } catch (err) {
//                 console.error('Erreur envoi sticker sad:', err.message);
//                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//               }
//               break;

//             case 'statut':
//               await reactToMessage(sock, sender, messageId, '📸');
//               await safeSendMessage(sock, sender, { text: 'Récupération des statuts WhatsApp en cours, veuillez patienter...' }, 500);
//               const statuses = await fetchStatuses(sock);
//               if (statuses.error) {
//                 await safeSendMessage(sock, sender, { text: statuses.error }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//               } else if (statuses.message) {
//                 await safeSendMessage(sock, sender, { text: statuses.message }, 500);
//                 await reactToMessage(sock, sender, messageId, 'ℹ️');
//               } else {
//                 let statusText = '📸 **Statuts WhatsApp disponibles** 📸\n\n';
//                 for (const [index, status] of statuses.entries()) {
//                   const statusContent = status.text || status.caption || 'Média sans texte';
//                   const statusOwner = status.jid ? status.jid.split('@')[0] : 'Inconnu';
//                   statusText += `${index + 1}. De : @${statusOwner}\nContenu : ${statusContent}\n\n`;
//                 }
//                 await safeSendMessage(sock, sender, { text: statusText, mentions: statuses.map(s => s.jid).filter(jid => jid) }, 1000);
//                 await reactToMessage(sock, sender, messageId, '✅');
//               }
//               break;

//             case 'setstatut':
//               await reactToMessage(sock, sender, messageId, '📸');
//               const statusType = args.toLowerCase() || 'random';
//               await setRandomStatus(sock, statusType);
//               await safeSendMessage(sock, sender, { text: `✅ Statut WhatsApp mis à jour avec type "${statusType}".` }, 500);
//               await reactToMessage(sock, sender, messageId, '✅');
//               break;

//             case 'restart':
//             case 'update':
//             case 'broadcast':
//               if (participant !== CREATOR_JID) {
//                 await safeSendMessage(sock, sender, { text: '❌ Commande réservée au propriétaire.' }, 500);
//                 await reactToMessage(sock, sender, messageId, '❌');
//                 break;
//               }
//               if (command === 'restart') {
//                 await safeSendMessage(sock, sender, { text: 'Redémarrage en cours...' }, 500);
//                 process.exit(0);
//               } else if (command === 'update') {
//                 await safeSendMessage(sock, sender, { text: 'Mise à jour en cours...' }, 500);
//               } else if (command === 'broadcast') {
//                 const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//                 if (!args && numbers.length === 0) {
//                   await safeSendMessage(sock, sender, { text: 'Utilisez : .broadcast <message> ou configurez BROADCAST_NUMBERS.' }, 500);
//                   break;
//                 }
//                 const broadcastMessage = args || process.env.BROADCAST_MESSAGE || 'Message de broadcast par défaut.';
//                 for (const number of numbers) {
//                   const jid = number.trim() + '@s.whatsapp.net';
//                   await safeSendMessage(sock, jid, { text: broadcastMessage }, 2000);
//                 }
//                 await safeSendMessage(sock, sender, { text: 'Broadcast envoyé !' }, 500);
//               }
//               await reactToMessage(sock, sender, messageId, '🔒');
//               break;

//             default:
//               await reactToMessage(sock, sender, messageId, '❓');
//               await safeSendMessage(sock, sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` }, 500);
//           }
//         });
//         return;
//       }

//       // Réponse IA pour les messages non-commandes
//       if (text) {
//         const geminiReply = await askGemini(text, sender);
//         await safeSendMessage(sock, sender, { text: `@${participant.split('@')[0]} ${geminiReply}`, mentions: [participant] }, 500);
//       }
//     } catch (globalErr) {
//       console.error('Erreur globale dans messages.upsert:', globalErr.message);
//     }
//   });

//   sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
//     try {
//       console.log(`Événement group-participants.update: group=${id}, action=${action}, participants=${JSON.stringify(participants)}`);
//       const welcomeEnabled = await getGroupSetting(id, 'welcome');
//       if (!welcomeEnabled) return;
//       const metadata = await retryOperation(() => sock.groupMetadata(id));
//       const totalMembers = metadata.participants.length;
//       const totalAdmins = metadata.participants.filter(p => p.admin).length;
//       for (const participant of participants) {
//         let imageOptions = {};
//         try {
//           const profilePicUrl = await sock.profilePictureUrl(participant, 'image');
//           const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//           imageOptions = { image: Buffer.from(response.data) };
//         } catch (err) {
//           console.error(`Erreur lors de la récupération de la photo de profil pour ${participant}:`, err.message);
//           imageOptions = { image: { url: DEFAULT_PROFILE_IMAGE } };
//         }
//         if (action === 'add') {
//           await safeSendMessage(sock, id, {
//             ...imageOptions,
//             caption: `🎉 Bienvenue @${participant.split('@')[0]} dans le groupe ! 😎\n` +
//                      `Amuse-toi et tape .help pour découvrir mes commandes !\n` +
//                      `📊 Nombre total de membres : ${totalMembers}\n` +
//                      `👑 Nombre d'admins : ${totalAdmins}`,
//             mentions: [participant]
//           }, 1000);
//           console.log(`Message de bienvenue envoyé à ${participant} dans le groupe ${id}`);
//         } else if (action === 'remove') {
//           await safeSendMessage(sock, id, {
//             ...imageOptions,
//             caption: `👋 @${participant.split('@')[0]} a quitté le groupe. À bientôt peut-être ! 😢\n` +
//                      `📊 Nombre total de membres : ${totalMembers}\n` +
//                      `👑 Nombre d'admins : ${totalAdmins}`,
//             mentions: [participant]
//           }, 1000);
//           console.log(`Message d'au revoir envoyé pour ${participant} dans le groupe ${id}`);
//         }
//       }
//     } catch (err) {
//       console.error(`Erreur lors de l'envoi du message ${action === 'add' ? 'de bienvenue' : 'd\'au revoir'}:`, err.message);
//     }
//   });

//   sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
//     if (qr) {
//       console.log('QR code généré. Scannez avec WhatsApp :');
//       QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
//     }
//     if (connection === 'close') {
//       const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//       console.log('Déconnecté:', reason);
//       if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
//       else console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
//     } else if (connection === 'open') {
//       console.log('Connecté à WhatsApp!');
//       await safeSendMessage(sock, CREATOR_CONTACT, { text: 'Mon créateur, je suis en ligne 🙂‍↔️🥺🥹🥺' }, 500);
//       setInterval(async () => {
//         try {
//           await safeSendMessage(sock, CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' }, 500);
//         } catch (err) {
//           console.error('Erreur message périodique:', err.message);
//         }
//       }, 600000);
//     }
//   });

//   return sock;
// }

// exportstartBot;












import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } from 'baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os'; // Ajouté
import { exec } from 'child_process'; // Ajouté
import cron from 'node-cron';
import sqlite3 from 'sqlite3';
import { askGemini } from './components/gemini.js';
import { textToAudio } from './components/textToAudio.js';
import { mediaToSticker } from './components/stickerConverter.js';
import { stickerToImage } from './components/stickerToImage.js';
import { stickerToVideo } from './components/stickerToVideo.js';
import { downloadStatus } from './components/downloadStatus.js';
import { downloadTikTok } from './components/downloadTikTok.js';
import { downloadInstagram } from './components/downloadInstagram.js';
import { googleSearch, googleImageSearch, sendGoogleImages } from './components/googleSearch.js';
import { showMenuImage, showMenuVideo } from './components/menu.js';
import { uploadImage, reverseImageSearch } from './components/reverseImageSearch.js';
const CREATOR_JID = '24106813542@s.whatsapp.net';
const LAUGH_AUDIO = './audios/laugh.ogg';
const CRY_AUDIO = './audios/cry.ogg';
const APPLAUD_AUDIO = './audios/applaud.ogg';
const EAGLE_AUDIO = './audios/eagle.ogg';
const INGRAT_AUDIO = './audios/ingrat.ogg';
const THUMBSUP_IMAGE = './images/dorian.jpg';
const LOL_IMAGE = './images/gloria.jpg';
const SAD_IMAGE = './images/zigh.jpg';
const DEFAULT_PROFILE_IMAGE = './images/default_profile.jpg';
const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
const PREFIX = '.';
const messageCache = new Map();
const CACHE_TIMEOUT = 15000;

// Status images array (10 types)
const STATUS_IMAGES = [
  './images/status1.jpg',
  './images/status2.jpg',
  './images/status3.jpg',
  './images/status4.jpg',
  './images/status5.jpg',
  './images/status6.jpg',
  './images/status7.jpg',
  './images/status8.jpg',
  './images/status9.jpg',
  './images/status10.jpg'
];

// Random phrases for image proposals
const IMAGE_PROPOSALS = [
  "Voici une image intéressante pour vous !",
  "Que pensez-vous de cette photo ?",
  "Proposition d'image aléatoire :",
  "Une belle image à partager ?",
  "Regardez celle-ci !",
  "Image du moment :",
  "Une suggestion visuelle :",
  "Ça pourrait vous plaire :",
  "Image aléatoire pour égayer votre journée !",
  "Voici une proposition d'image :"
];

// Status types for commands
const STATUS_TYPES = {
  drole: [0, 1, 2],
  triste: [3, 4, 5],
  autre: [6, 7, 8, 9]
};

// Constants for sticker metadata
const STICKER_PACK = 'AquilaBot';
const STICKER_AUTHOR = 'LE PRINCE MYENE';

// Variables from .env
const ENABLE_WELCOME_GOODBYE = process.env.ENABLE_WELCOME_GOODBYE === 'yes';
const WARNING_LIMIT = parseInt(process.env.WARNING_LIMIT || 3);
const FORBIDDEN_WORDS = process.env.FORBIDDEN_WORDS ? process.env.FORBIDDEN_WORDS.split(',') : [];

// SQLite Database for warnings and settings
const db = new sqlite3.Database('./warnings.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Base de données ouverte avec succès.');
  }
});

// Créer les tables et ajouter les colonnes nécessaires
db.run(`CREATE TABLE IF NOT EXISTS warnings (groupId TEXT, userId TEXT, count INTEGER, PRIMARY KEY (groupId, userId))`);
db.run(`CREATE TABLE IF NOT EXISTS group_settings (groupId TEXT PRIMARY KEY, anti_link INTEGER DEFAULT 0, anti_word INTEGER DEFAULT 0, welcome INTEGER DEFAULT 0, blocked INTEGER DEFAULT 0, close_time TEXT DEFAULT '22:00', open_time TEXT DEFAULT '09:00')`);
db.run(`ALTER TABLE group_settings ADD COLUMN blocked INTEGER DEFAULT 0`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erreur lors de l\'ajout de la colonne blocked:', err.message);
  } else {
    console.log('Colonne blocked ajoutée ou déjà présente.');
  }
});
db.run(`ALTER TABLE group_settings ADD COLUMN close_time TEXT DEFAULT '22:00'`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erreur lors de l\'ajout de la colonne close_time:', err.message);
  } else {
    console.log('Colonne close_time ajoutée ou déjà présente.');
  }
});
db.run(`ALTER TABLE group_settings ADD COLUMN open_time TEXT DEFAULT '09:00'`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Erreur lors de l\'ajout de la colonne open_time:', err.message);
  } else {
    console.log('Colonne open_time ajoutée ou déjà présente.');
  }
});

async function getWarningCount(groupId, userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
      if (err) reject(err);
      resolve(row ? row.count : 0);
    });
  });
}

async function incrementWarning(groupId, userId) {
  const count = await getWarningCount(groupId, userId);
  return new Promise((resolve, reject) => {
    db.run(`INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`, [groupId, userId, count + 1], (err) => {
      if (err) reject(err);
      resolve(count + 1);
    });
  });
}

async function resetWarning(groupId, userId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

async function getGroupSetting(groupId, setting) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
      if (err) reject(err);
      resolve(row ? row[setting] : (setting === 'close_time' ? '22:00' : setting === 'open_time' ? '09:00' : 0));
    });
  });
}

async function setGroupSetting(groupId, setting, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO group_settings (groupId, ${setting}) VALUES (?, ?)`,
      [groupId, value],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}
async function convertToSticker(imagePath) {
  try {
    await fs.access(imagePath); // Vérifier si le fichier existe
    const sticker = new Sticker(imagePath, {
      pack: STICKER_PACK,
      author: STICKER_AUTHOR,
      type: 'full',
      categories: ['🤩', '🎉'],
      id: `sticker_${Date.now()}`,
      quality: 100,
      background: 'transparent'
    });
    return await sticker.toBuffer();
  } catch (err) {
    console.error('Erreur lors de la conversion en sticker:', err.message);
    throw new Error('Impossible de convertir en sticker.');
  }
}


async function imageToSticker(imagePath, sock, sender, messageId, emoji) {
  try {
    await fs.access(imagePath); // Vérifier si le fichier existe
    const outputPath = path.join(os.tmpdir(), `output_${Date.now()}.webp`);

    // Convertir l'image en sticker avec ffmpeg
    await new Promise((resolve, reject) => {
      const cmd = `ffmpeg -i ${imagePath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0" -y -vcodec libwebp ${outputPath}`;
      exec(cmd, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    const stickerBuffer = await fs.readFile(outputPath);
    await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
    await reactToMessage(sock, sender, messageId, emoji);

    // Nettoyer le fichier temporaire
    if (await fs.access(outputPath).then(() => true).catch(() => false)) {
      await fs.unlink(outputPath);
    }
  } catch (err) {
    console.error('Erreur lors de la conversion en sticker:', err.message);
    await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
    await reactToMessage(sock, sender, messageId, '❌');
  }
}

async function reactToMessage(sock, jid, messageId, emoji = '✨') {
  if (!messageId) return;
  try {
    await sock.sendMessage(jid, { react: { text: emoji, key: { id: messageId, remoteJid: jid, fromMe: false } } });
  } catch (err) {
    console.error('Erreur lors de la réaction au message :', err.message);
  }
}

async function setupCronJobs(sock) {
  const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
  const message = process.env.BROADCAST_MESSAGE || 'Bonjour ! Ceci est un message périodique du bot Aquila.';
  const schedule = process.env.BROADCAST_SCHEDULE || '0 0 * * *';
  if (numbers.length === 0) {
    console.log('Aucun numéro configuré pour le broadcast.');
  } else {
    cron.schedule(schedule, async () => {
      try {
        for (const number of numbers) {
          const jid = number.trim() + '@s.whatsapp.net';
          await sock.sendMessage(jid, { text: message });
          console.log(`Message envoyé à ${jid}`);
        }
      } catch (err) {
        console.error('Erreur lors de l\'envoi du message périodique:', err.message);
      }
    }, { scheduled: true, timezone: 'Africa/Lagos' });
    console.log('Cron job configuré pour envoyer des messages périodiques.');
  }

  // Cron job for sending random images to creator every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const validImages = [];
      for (const imagePath of STATUS_IMAGES) {
        try {
          await fs.access(imagePath); // Vérifier si l'image existe
          validImages.push(imagePath);
        } catch (err) {
          console.warn(`Image introuvable : ${imagePath}`);
        }
      }
      if (validImages.length === 0) {
        console.error('Aucune image valide trouvée.');
        return;
      }
      const randomImagePath = validImages[Math.floor(Math.random() * validImages.length)];
      const imageBuffer = await fs.readFile(randomImagePath);
      const randomPhrase = IMAGE_PROPOSALS[Math.floor(Math.random() * IMAGE_PROPOSALS.length)];
      await sock.sendMessage(CREATOR_JID, { image: imageBuffer, caption: randomPhrase });
      console.log(`Image envoyée au créateur : ${randomImagePath}`);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'image au créateur:', err.message);
    }
  }, { scheduled: true, timezone: 'Africa/Lagos' });
  console.log('Cron job configuré pour envoyer des images aléatoires au créateur toutes les 10 minutes.');

  // Cron job for auto close/open groups every minute
  cron.schedule('* * * * *', async () => {
    try {
      const groups = await sock.groupFetchAllParticipating();
      const currentTime = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
      for (const [groupId] of Object.entries(groups)) {
        const closeTime = await getGroupSetting(groupId, 'close_time');
        const openTime = await getGroupSetting(groupId, 'open_time');
        const blocked = await getGroupSetting(groupId, 'blocked');
        if (currentTime === closeTime && blocked === 0) {
          await setGroupSetting(groupId, 'blocked', 1);
          await sock.sendMessage(groupId, { text: '🚫 Groupe fermé automatiquement à ' + closeTime + '. Seuls les admins peuvent écrire.' });
          console.log(`Groupe ${groupId} fermé à ${closeTime}`);
        } else if (currentTime === openTime && blocked === 1) {
          await setGroupSetting(groupId, 'blocked', 0);
          await sock.sendMessage(groupId, { text: '✅ Groupe ouvert automatiquement à ' + openTime + '. Tout le monde peut écrire.' });
          console.log(`Groupe ${groupId} ouvert à ${openTime}`);
        }
      }
    } catch (err) {
      console.error('Erreur dans le cron de fermeture/ouverture automatique:', err.message);
    }
  }, { scheduled: true, timezone: 'Africa/Lagos' });
  console.log('Cron job configuré pour fermeture/ouverture automatique des groupes.');
}

async function setupCreatorCheck(sock, botJid) {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const groups = await sock.groupFetchAllParticipating();
      for (const [groupId, metadata] of Object.entries(groups)) {
        const botParticipant = metadata.participants.find(p => p.id === botJid);
        if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) continue;

        const creatorInGroup = metadata.participants.some(p => p.id === CREATOR_JID);
        if (!creatorInGroup) {
          try {
            await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'add');
            console.log(`Créateur ajouté au groupe ${groupId}`);
          } catch (err) {
            console.error(`Échec de l'ajout du créateur au groupe ${groupId}:`, err.message);
          }
        }

        const creatorParticipant = metadata.participants.find(p => p.id === CREATOR_JID);
        if (creatorParticipant && !['admin', 'superadmin'].includes(creatorParticipant.admin)) {
          try {
            await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'promote');
            console.log(`Créateur promu admin dans le groupe ${groupId}`);
          } catch (err) {
            console.error(`Échec de la promotion du créateur dans le groupe ${groupId}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error('Erreur dans le cron de vérification du créateur:', err.message);
    }
  }, { scheduled: true, timezone: 'Africa/Lagos' });
  console.log('Cron job configuré pour vérifier et promouvoir le créateur.');
}

async function setRandomStatus(sock, type = 'random') {
  try {
    let indices;
    if (type === 'drole') {
      indices = STATUS_TYPES.drole;
    } else if (type === 'triste') {
      indices = STATUS_TYPES.triste;
    } else if (type === 'autre') {
      indices = STATUS_TYPES.autre;
    } else {
      indices = STATUS_IMAGES.map((_, i) => i);
    }
    const validImages = [];
    for (const index of indices) {
      try {
        await fs.access(STATUS_IMAGES[index]); // Vérifier si l'image existe
        validImages.push(STATUS_IMAGES[index]);
      } catch (err) {
        console.warn(`Image de statut introuvable : ${STATUS_IMAGES[index]}`);
      }
    }
    if (validImages.length === 0) {
      throw new Error('Aucune image de statut valide trouvée pour le type demandé.');
    }
    const randomImagePath = validImages[Math.floor(Math.random() * validImages.length)];
    const imageBuffer = await fs.readFile(randomImagePath);
    await sock.sendMessage(sock.user.id, { image: imageBuffer, status: true });
    console.log(`Statut WhatsApp mis à jour avec ${randomImagePath} pour type ${type}`);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut:', err.message);
    throw err;
  }
}

async function fetchStatuses(sock) {
  try {
    // Note : Baileys ne supporte pas directement getStatus. Implémentation alternative.
    // Placeholder : simuler la récupération des statuts (à ajuster selon la version de Baileys)
    console.warn('La récupération des statuts WhatsApp n\'est pas directement supportée par Baileys.');
    return { message: 'Fonctionnalité de récupération des statuts non disponible pour le moment.' };
  } catch (err) {
    console.error('Erreur lors de la récupération des statuts:', err.message);
    return { error: 'Impossible de récupérer les statuts. Veuillez réessayer plus tard.' };
  }
}

async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      console.error(`Tentative ${i + 1} échouée:`, err.message);
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function safeSendMessage(sock, jid, content, delayAfter = 0) {
  try {
    await sock.sendMessage(jid, content);
    if (delayAfter > 0) {
      await new Promise(resolve => setTimeout(resolve, delayAfter));
    }
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err.message);
    if (err.output && err.output.statusCode === 429) {
      console.log('Rate limit atteint, attente de 5 secondes...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        await sock.sendMessage(jid, content);
      } catch (retryErr) {
        console.error('Échec du retry après rate limit:', retryErr.message);
      }
    }
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    version,
    browser: ['Aquila Bot', 'safari', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);
  setupCronJobs(sock);
  const botJid = sock.user.id.replace(/:\d+/, '');
  setupCreatorCheck(sock, botJid);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
      if (type !== 'notify') return;
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const messageId = msg.key.id;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const isGroup = sender.endsWith('@g.us');
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const isMentioned = mentioned.includes(botJid);
    const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
    const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
    const isAudioQuotedBot = contextInfo?.participant === botJid;
    const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;
    const participant = msg.key.participant || sender;
    const timestamp = msg.messageTimestamp || Date.now();

    console.log(`Message reçu: sender=${sender}, text=${text}, isGroup=${isGroup}, isMentioned=${isMentioned}, isQuotedBot=${isQuotedBot}, participant=${participant}, messageId=${messageId}, timestamp=${timestamp}`);

      // Vérification si le groupe est bloqué et l'utilisateur n'est pas admin
      if (isGroup) {
        const blocked = await getGroupSetting(sender, 'blocked');
        if (blocked && participant !== botJid) {
          try {
            const metadata = await sock.groupMetadata(sender);
            const isUserAdmin = metadata.participants.some(p => p.id === participant && ['admin', 'superadmin'].includes(p.admin));
            if (!isUserAdmin) {
              await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
              await safeSendMessage(sock, sender, { text: `🚫 Le groupe est bloqué ! Seuls les admins peuvent écrire. @${participant.split('@')[0]}`, mentions: [participant] }, 500);
              return;
            }
          } catch (err) {
            console.error('Erreur vérification block:', err.message);
          }
        }
      }

      // Détection des liens
      const linkRegex = /https?:\/\/\S+/;
      if (isGroup && text.match(linkRegex)) {
        const link = text.match(linkRegex)[0];
        const antiLink = await getGroupSetting(sender, 'anti_link');

        if (!antiLink) {
          if (link.includes('tiktok.com')) {
            await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
            await downloadTikTok(sock, sender, link);
          } else if (link.includes('instagram.com')) {
            await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
            await downloadInstagram(sock, sender, link);
          }
        }

        if (antiLink) {
          await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
          const warningCount = await incrementWarning(sender, participant);
          await safeSendMessage(sock, sender, { text: `⚠️ Lien détecté et supprimé : ${link} ! Avertissement ${warningCount}/${WARNING_LIMIT} pour @${participant.split('@')[0]}.`, mentions: [participant] }, 1000);
          if (warningCount >= WARNING_LIMIT) {
            try {
              await sock.groupParticipantsUpdate(sender, [participant], 'remove');
              await safeSendMessage(sock, sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour envoi de liens.`, mentions: [participant] }, 1000);
            } catch (kickErr) {
              console.error('Erreur lors du kick:', kickErr.message);
            }
            await resetWarning(sender, participant);
          }
          return;
        }
      }

      // Anti-mot avec mention et suppression automatique
      if (isGroup && (await getGroupSetting(sender, 'anti_word'))) {
        if (FORBIDDEN_WORDS.some(word => text.includes(word))) {
          const forbiddenWord = FORBIDDEN_WORDS.find(word => text.includes(word));
          await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
          const warningCount = await incrementWarning(sender, participant);
          await safeSendMessage(sock, sender, { text: `⚠️ Mot interdit détecté et supprimé : "${forbiddenWord}" ! Avertissement ${warningCount}/${WARNING_LIMIT} pour @${participant.split('@')[0]}.`, mentions: [participant] }, 1000);
          if (warningCount >= WARNING_LIMIT) {
            try {
              await sock.groupParticipantsUpdate(sender, [participant], 'remove');
              await safeSendMessage(sock, sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour mots interdits.`, mentions: [participant] }, 1000);
            } catch (kickErr) {
              console.error('Erreur lors du kick:', kickErr.message);
            }
            await resetWarning(sender, participant);
          }
          return;
        }
      }

      // Filtrage des mots interdits
      const forbiddenWords = ['imbecile', 'vilain', 'stupide', 'bakota', 'kota', 'porno', 'sexe'];
      if (text && forbiddenWords.some(word => text.includes(word))) {
        await safeSendMessage(sock, sender, { text: 'Ehhhhh faut rester poli !!!!! pas de mot vulgaire svp' }, 500);
        return;
      }

      // Mots déclencheurs pour stickers et audios
      const triggerWords = {
        essoya: { sticker: THUMBSUP_IMAGE, emoji: '👍' },
        zigh: { sticker: SAD_IMAGE, emoji: '😔' },
        funny: ['lol', 'mdr', 'haha', '😂', 'zoua', 'drôle', '🤣', 'gloria'],
        aigle: { audio: EAGLE_AUDIO, emoji: '🦅' },
        ingrat: { audio: INGRAT_AUDIO, emoji: '😣' }
      };

      if (text) {
        let stickerSent = false;
        let audioSent = false;

        stickerSent
        if (!audioSent && text.includes('aigle')) {
          try {
            const audioBuffer = await fs.readFile(triggerWords.aigle.audio);
            await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
            await reactToMessage(sock, sender, messageId, triggerWords.aigle.emoji);
            audioSent = true;
            return;
          } catch (err) {
            console.error('Erreur envoi audio aigle:', err.message);
            await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
            await reactToMessage(sock, sender, messageId, '❌');
            return;
          }
        }
        if (!audioSent && text.includes('ingrat')) {
          try {
            const audioBuffer = await fs.readFile(triggerWords.ingrat.audio);
            await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
            await reactToMessage(sock, sender, messageId, triggerWords.ingrat.emoji);
            audioSent = true;
            return;
          } catch (err) {
            console.error('Erreur envoi audio ingrat:', err.message);
            await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
            await reactToMessage(sock, sender, messageId, '❌');
            return;
          }
        }
      }

      // Gestion des stickers animés
      if (quoted && quoted.stickerMessage) {
        if (quoted.stickerMessage.isAnimated && text.startsWith(`${PREFIX}video`)) {
          await reactToMessage(sock, sender, messageId, '🎞️');
          await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
          await stickerToVideo(sock, sender, quoted);
          return;
        }
      }

      // Ignorer les messages non pertinents dans les groupes
      if (isGroup && !text.startsWith(PREFIX) && !['sticker', 'menu', 'image', 'video', 'reverse'].includes(text.split(' ')[0]) && !msg.message.audioMessage && !isMentioned && !isQuotedBot) {
        console.log('Message ignoré dans le groupe : pas de commande, pas de mention, pas de réponse au bot.');
        return;
      }

      if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
        console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
        return;
      }

      if (msg.message.audioMessage) await sock.sendPresenceUpdate('recording', sender);
      else await sock.sendPresenceUpdate('composing', sender);

     // Gestion des notes vocales
if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
  try {
    // await safeSendMessage(sock, sender, { text: 'Traitement de votre note vocale en cours, veuillez patienter...' }, 500);

    // Télécharger le flux audio depuis WhatsApp
    const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    // Vérification du buffer
    if (!buffer || buffer.length === 0) {
      console.error("Audio vide après téléchargement !");
      await safeSendMessage(sock, sender, { text: 'Impossible de récupérer la note vocale.' }, 500);
      return;
    }
    console.log(`Taille de la note vocale reçue : ${buffer.length} octets`);

    // Appel à Gemini
    const geminiReply = await askGemini(null, sender, buffer);

    // Vérification des mots interdits
    if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
      await safeSendMessage(sock, sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, 500);
      return;
    }

    // Conversion en audio pour l’utilisateur
    const audioBuffer = await textToAudio(geminiReply);

    if (audioBuffer && audioBuffer.length > 0) {
      await safeSendMessage(sock, sender, { 
        audio: audioBuffer, 
        ptt: true, 
        mimetype: 'audio/ogg; codecs=opus' 
      }, 500);
    } else {
      console.warn("Erreur lors de la conversion en audio, envoi du texte à la place.");
      await safeSendMessage(sock, sender, { text: geminiReply }, 500);
    }

  } catch (err) {
    console.error('Erreur lors du traitement de la note vocale :', err);
    await safeSendMessage(sock, sender, { text: 'Erreur lors du traitement de la note vocale.' }, 500);
  }

  return;
}


      // Traitement des commandes
      if (text.startsWith(PREFIX) || ['sticker', 'menu', 'image', 'video', 'reverse'].includes(text.split(' ')[0])) {
        console.log(`Exécution de la commande dans ${isGroup ? 'groupe' : 'discussion privée'}: ${text}`);
        const commandText = text.startsWith(PREFIX) ? text.slice(PREFIX.length).trim() : text.trim();
        const parts = commandText.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');
        let metadata, isAdmin = false, isBotAdmin = false;

        if (isGroup) {
          try {
            metadata = await retryOperation(() => sock.groupMetadata(sender));
            const adminParticipant = metadata.participants.find(p => p.id === participant);
            isAdmin = adminParticipant && (adminParticipant.admin === 'admin' || adminParticipant.admin === 'superadmin');
            const botParticipant = metadata.participants.find(p => p.id === botJid);
            isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
          } catch (err) {
            console.error('Erreur récupération métadonnées groupe:', err.message);
            await safeSendMessage(sock, sender, { text: 'Erreur lors de la récupération des métadonnées du groupe.' }, 500);
            return;
          }
        }

        const products = [
          { id: 1, title: "Azeva", description: "Azeva est une plateforme pour apprendre, créer des classes, suivre des résultats, basée sur l'IA elle révolutionne l'apprentissage et la gestion du temps", image: "./images/Azeva.jpg", link: "https://azeva-frontend.vercel.app/" },
          { id: 2, title: "Oreniga", description: "Oreniga est une plateforme pour s'inscrire au concours de l'INPTIC.", image: "./images/oreniga.jpg", link: "https://aningo.alwaysdata.net" },
          { id: 3, title: "Alissa CV-Letters", description: "Alissa CV-Letters est un outil pour générer des lettres grâce à l'IA et avoir votre propre CV.", image: "./images/cv.jpg", link: "https://alissa-cv.vercel.app/" },
          { id: 4, title: "Alissa School", description: "Alissa School est une plateforme pour les lycées et collèges pour aider les élèves à apprendre, grâce à l'intelligence artificielle ils pourront apprendre en fonction de leur niveau.", image: "./images/School.jpg", link: "https://school-front-chi.vercel.app/" },
          { id: 5, title: "Décodeur64", description: "Décodeur64 est un outil pour encoder et décoder du texte et des fichiers en base64", image: "./images/decode.jpg", link: "https://decodeur.vercel.app/" }
        ];

        await retryOperation(async () => {
          switch (command) {
            case 'antilink':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const antiLinkValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
              if (antiLinkValue === null) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .antilink on|off' }, 500);
                break;
              }
              await setGroupSetting(sender, 'anti_link', antiLinkValue);
              await safeSendMessage(sock, sender, { text: `✅ Anti-lien ${antiLinkValue ? 'activé' : 'désactivé'}.` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'antiword':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const antiWordValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
              if (antiWordValue === null) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .antiword on|off' }, 500);
                break;
              }
              await setGroupSetting(sender, 'anti_word', antiWordValue);
              await safeSendMessage(sock, sender, { text: `✅ Anti-mot ${antiWordValue ? 'activé' : 'désactivé'}.` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'welcome':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const welcomeValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
              if (welcomeValue === null) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .welcome on|off' }, 500);
                break;
              }
              await setGroupSetting(sender, 'welcome', welcomeValue);
              await safeSendMessage(sock, sender, { text: `✅ Messages de bienvenue/au revoir ${welcomeValue ? 'activés' : 'désactivés'}.` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'block':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const blockValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
              if (blockValue === null) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .block on|off' }, 500);
                break;
              }
              await setGroupSetting(sender, 'blocked', blockValue);
              await safeSendMessage(sock, sender, { text: `✅ Groupe ${blockValue ? 'bloqué' : 'débloqué'} ! Seuls les admins peuvent écrire.` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'setclose':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!args.match(/^\d{2}:\d{2}$/)) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .setclose hh:mm' }, 500);
                break;
              }
              await setGroupSetting(sender, 'close_time', args);
              await safeSendMessage(sock, sender, { text: `✅ Heure de fermeture automatique définie à ${args}.` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'setopen':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!args.match(/^\d{2}:\d{2}$/)) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .setopen hh:mm' }, 500);
                break;
              }
              await setGroupSetting(sender, 'open_time', args);
              await safeSendMessage(sock, sender, { text: `✅ Heure d'ouverture automatique définie à ${args}.` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'help':
              await reactToMessage(sock, sender, messageId, '📖');
              await showMenuImage(sock, sender);
              break;

            case 'menu':
              await reactToMessage(sock, sender, messageId, '🎬');
              await safeSendMessage(sock, sender, { text: 'Affichage du menu vidéo en cours, veuillez patienter...' }, 500);
              await showMenuVideo(sock, sender);
              break;

            case 'info':
              await reactToMessage(sock, sender, messageId, 'ℹ️');
              await safeSendMessage(sock, sender, {
                image: { url: './images/menu.jpg' },
                caption: `🌟 **Aquila Bot - À propos** 🌟\n` +
                         `**Description** : Je suis Aquila Bot, un assistant WhatsApp intelligent et polyvalent créé pour aider, divertir et gérer vos groupes avec style ! 😎\n` +
                         `**Créateur** : Essoya le prince myènè\n` +
                         `**Numéro WhatsApp du créateur** : +${CREATOR_CONTACT.split('@')[0]}\n` +
                         `**Lien du groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
                         `**Site web** : https://x.ai/grok\n` +
                         `**Fonctionnalités principales** :\n` +
                         `- 📜 Commandes : .help, .menu, .sticker, .image, .video, .tiktok, .insta, .find, .gimage, .reverse, etc.\n` +
                         `- 🛡️ Gestion de groupe : Anti-lien, anti-mot, messages de bienvenue/au revoir, block.\n` +
                         `- 🎨 Création de stickers : Conversion d'images/vidéos en stickers.\n` +
                         `- 🎥 Téléchargement : Statuts WhatsApp, vidéos TikTok, Instagram.\n` +
                         `- 🔍 Recherche : Recherche Google, recherche d'images, recherche inversée.\n` +
                         `- 🤖 Réponses IA : Réponses intelligentes via Gemini.\n` +
                         `- 🎉 Fun : Réactions emojis, audios, stickers personnalisés.\n` +
                         `Tapez .help pour découvrir toutes mes commandes ! 🚀`,
                mentions: [CREATOR_CONTACT]
              }, 1000);
              try {
                const audioBuffer = await fs.readFile('./audios/info.mp3');
                await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/mpeg' }, 500);
              } catch (err) {
                console.error('Erreur envoi audio info:', err.message);
                await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio de présentation.' }, 500);
              }
              break;

            case 'sticker':
              await reactToMessage(sock, sender, messageId, '✨');
              await safeSendMessage(sock, sender, { text: 'Création de votre sticker en cours, veuillez patienter...' }, 500);
              await mediaToSticker(sock, sender, quoted);
              break;

            case 'image':
              await reactToMessage(sock, sender, messageId, '🖼️');
              await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en image en cours, veuillez patienter...' }, 500);
              await stickerToImage(sock, sender, quoted);
              break;

            case 'video':
              await reactToMessage(sock, sender, messageId, '🎞️');
              await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
              await stickerToVideo(sock, sender, quoted);
              break;

            case 'download':
              await reactToMessage(sock, sender, messageId, '⬇️');
              await safeSendMessage(sock, sender, { text: 'Téléchargement du statut en cours, veuillez patienter...' }, 500);
              await downloadStatus(sock, sender, quoted);
              break;

            case 'tiktok':
              await reactToMessage(sock, sender, messageId, '🎥');
              if (!args) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .tiktok <URL>' }, 500);
                break;
              }
              await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
              await downloadTikTok(sock, sender, args);
              break;

            case 'insta':
              await reactToMessage(sock, sender, messageId, '📸');
              if (!args) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .insta <URL>' }, 500);
                break;
              }
              await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
              await downloadInstagram(sock, sender, args);
              break;

            // case 'find':
            //   await reactToMessage(sock, sender, messageId, '🔍');
            //   if (!args) {
            //     await safeSendMessage(sock, sender, { text: 'Utilisez : .find <terme>' }, 500);
            //     break;
            //   }
            //   await safeSendMessage(sock, sender, { text: 'Recherche Google en cours, veuillez patienter...' }, 500);
            //   const searchResult = await googleSearch(args);
            //   await safeSendMessage(sock, sender, { text: searchResult }, 500);
            //   break;

            // case 'gimage':
            //   await reactToMessage(sock, sender, messageId, '🖼️');
            //   if (!args) {
            //     await safeSendMessage(sock, sender, { text: 'Utilisez : .gimage <terme>' }, 500);
            //     break;
            //   }
            //   await safeSendMessage(sock, sender, { text: 'Recherche d\'image Google en cours, veuillez patienter...' }, 500);
            //   try {
            //     const imageUrl = await googleImageSearch(args);
            //     if (!imageUrl) {
            //       await safeSendMessage(sock, sender, { text: 'Aucune image trouvée.' }, 500);
            //       break;
            //     }
            //     const response = await axios.get(imageUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
            //     const imageBuffer = Buffer.from(response.data);
            //     await safeSendMessage(sock, sender, { image: imageBuffer }, 500);
            //   } catch (err) {
            //     console.error('Erreur téléchargement image :', err.message);
            //     await safeSendMessage(sock, sender, { text: 'Erreur lors du téléchargement de l\'image.' }, 500);
            //   }
            //   break;



case 'find':
    await reactToMessage(sock, sender, messageId, '🔍');
    if (!args) {
        await safeSendMessage(sock, sender, { text: 'Utilisez : .find <terme>' }, 500);
        break;
    }
    await safeSendMessage(sock, sender, { text: 'Recherche Google en cours...' }, 500);

    const searchResults = await googleSearch(args, 5);
    if (!searchResults.length) {
        await safeSendMessage(sock, sender, { text: 'Aucun résultat trouvé.' }, 500);
    } else {
        let message = '';
        searchResults.forEach((res, i) => {
            message += `🔹 Résultat ${i + 1}:\n${res.title}\n${res.snippet}\nSource: ${res.link}\n\n`;
        });
        await safeSendMessage(sock, sender, { text: message.trim() }, 500);
    }
    break;

case 'gimage':
    await reactToMessage(sock, sender, messageId, '🖼️');
    if (!args) {
        await safeSendMessage(sock, sender, { text: 'Utilisez : .gimage <terme>' }, 500);
        break;
    }
    await safeSendMessage(sock, sender, { text: 'Recherche d\'images Google en cours...' }, 500);

    const images = await googleImageSearch(args, 5);
    if (!images.length) {
        await safeSendMessage(sock, sender, { text: 'Aucune image trouvée.' }, 500);
        break;
    }

    await sendGoogleImages(sock, sender, images);
    break;

            case 'reverse':
              await reactToMessage(sock, sender, messageId, '🔎');
              if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
                await safeSendMessage(sock, sender, { text: 'Veuillez citer une image ou un sticker pour la recherche inversée.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              await safeSendMessage(sock, sender, { text: 'Recherche inversée en cours, veuillez patienter...' }, 500);
              try {
                const messageType = quoted.imageMessage ? 'image' : 'sticker';
                const stream = await downloadContentFromMessage(quoted[messageType + 'Message'], messageType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                const uploadedUrl = await uploadImage(buffer);
                const searchResults = await reverseImageSearch(uploadedUrl);
                await safeSendMessage(sock, sender, { text: `Résultats de la recherche inversée :\n${searchResults}` }, 500);
                await reactToMessage(sock, sender, messageId, '✅');
              } catch (err) {
                console.error('Erreur lors de la recherche inversée:', err.message);
                await safeSendMessage(sock, sender, { text: 'Erreur lors de la recherche inversée.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              }
              break;

            case 'catalogue':
              await safeSendMessage(sock, sender, {
                image: { url: './images/catalogue.jpg' },
                caption: `🛍️ Catalogue Aquila Bot 🌟\n` +
                         `Voici quelques produits que tu peux consulter :\n` +
                         `1️⃣ Azeva - commande: .produit1\n` +
                         `2️⃣ Oreniga - commande: .produit2\n` +
                         `3️⃣ Alissa CV-Letters - commande: .produit3\n` +
                         `4️⃣ Alissa School - commande: .produit4\n` +
                         `5️⃣ Décodeur64 - commande: .produit5\n` +
                         `Tape la commande correspondant au produit pour voir les détails 😎💬`
              }, 1000);
              break;

            case 'produit1':
            case 'produit2':
            case 'produit3':
            case 'produit4':
            case 'produit5':
              const prodId = parseInt(command.replace('produit', ''));
              const prod = products.find(p => p.id === prodId);
              if (prod) {
                await safeSendMessage(sock, sender, { image: { url: prod.image }, caption: `🛒 ${prod.title} 🌟\n${prod.description}\n🔗 Lien: ${prod.link}` }, 1000);
              }
              break;

            case 'send':
              if (!quoted) {
                await safeSendMessage(sock, sender, { text: 'Veuillez citer une image ou une vidéo à transférer.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              await safeSendMessage(sock, sender, { text: 'Transfert du média en cours, veuillez patienter...' }, 500);
              const targetNumber = args ? `${args.split(' ')[0]}@s.whatsapp.net` : null;
              let quotedMessage = quoted;
              let messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
              if (!messageType && (quotedMessage.ephemeralMessage || quotedMessage.viewOnceMessageV2)) {
                const innerMessage = quotedMessage.ephemeralMessage?.message || quotedMessage.viewOnceMessageV2?.message;
                if (innerMessage) {
                  quotedMessage = innerMessage;
                  messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
                }
              }
              if (!messageType) {
                await safeSendMessage(sock, sender, { text: 'Le message cité n\'est ni une image ni une vidéo.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              try {
                const stream = await retryOperation(() => downloadContentFromMessage(quotedMessage[messageType], messageType.replace('Message', '').toLowerCase()));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                const mediaOptions = messageType === 'imageMessage' ? { image: buffer } : { video: buffer };
                await safeSendMessage(sock, CREATOR_CONTACT, mediaOptions, 500);
                if (targetNumber) {
                  await safeSendMessage(sock, targetNumber, mediaOptions, 500);
                }
                await safeSendMessage(sock, sender, {
                  [messageType === 'imageMessage' ? 'image' : 'video']: buffer,
                  caption: `✅ Voici le média transféré${targetNumber ? ` à ${targetNumber}` : ''}.`
                }, 1000);
                await reactToMessage(sock, sender, messageId, '✅');
              } catch (err) {
                console.error('Erreur lors du transfert du média:', err.message);
                await safeSendMessage(sock, sender, { text: '❌ Impossible de transférer le média.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              }
              break;

            case 'join':
              if (!args) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .join <lien>' }, 500);
                break;
              }
              try {
                const inviteCodeMatch = args.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
                if (!inviteCodeMatch) {
                  await safeSendMessage(sock, sender, { text: 'Lien invalide. Vérifiez le lien d\'invitation.' }, 500);
                  break;
                }
                const inviteCode = inviteCodeMatch[1];
                await sock.groupAcceptInvite(inviteCode);
                await safeSendMessage(sock, sender, { text: '✅ Groupe rejoint avec succès !' }, 500);
              } catch (err) {
                console.error('Erreur jointure groupe:', err.message);
                await safeSendMessage(sock, sender, { text: '❌ Impossible de rejoindre le groupe. Le lien peut être invalide ou expiré.' }, 500);
              }
              break;

            case 'creator':
              await reactToMessage(sock, sender, messageId, '🧑‍💻');
              await safeSendMessage(sock, sender, {
                image: { url: './images/creator.jpg' },
                caption: `🌟 **À propos du Créateur** 🌟\n` +
                         `**Nom** : Essongue Yann Chéri\n` +
                         `**Alias** : Essoya le prince myènè\n` +
                         `**Description** : Étudiant à l'INPTIC, je suis développeur et passionné de cybersécurité et réseaux. J'ai créé Aquila Bot pour rendre vos conversations plus fun et vos groupes mieux gérés ! 😎\n` +
                         `**Contact** : Écrivez-moi sur WhatsApp : https://wa.me/${CREATOR_CONTACT.split('@')[0]}\n` +
                         `Tapez .help pour découvrir ce que mon bot peut faire ! 🚀`,
                mentions: [CREATOR_CONTACT]
              }, 1000);
              break;

            case 'delete':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!quoted) {
                await safeSendMessage(sock, sender, { text: 'Veuillez citer un message à supprimer.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const deleteContextInfo = msg.message.extendedTextMessage?.contextInfo;
              const deleteQuotedKey = deleteContextInfo?.stanzaId;
              const deleteQuotedParticipant = deleteContextInfo?.participant;
              if (!deleteQuotedKey || !deleteQuotedParticipant) {
                await safeSendMessage(sock, sender, { text: 'Impossible de supprimer : le message cité n\'a pas les informations nécessaires.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              try {
                await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: deleteQuotedKey, participant: deleteQuotedParticipant } }, 500);
                await safeSendMessage(sock, sender, { text: '✅ Message supprimé pour tous.' }, 500);
                await reactToMessage(sock, sender, messageId, '✅');
              } catch (err) {
                console.error('Erreur lors de la suppression du message:', err.message);
                await safeSendMessage(sock, sender, { text: '❌ Impossible de supprimer le message. Je dois être admin.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              }
              break;

            case 'promote':
            case 'demote':
            case 'kick':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const actionContextInfo = msg.message.extendedTextMessage?.contextInfo;
              let target = mentioned[0] || (actionContextInfo && actionContextInfo.participant);
              if (!target) {
                await safeSendMessage(sock, sender, { text: 'Veuillez mentionner ou citer l\'utilisateur.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (command === 'kick' && target === botJid && participant !== CREATOR_JID) {
                await safeSendMessage(sock, sender, { text: '❌ Vous ne pouvez pas me kicker ! Seul le créateur peut le faire.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              try {
                const action = command === 'promote' ? 'promote' : command === 'demote' ? 'demote' : 'remove';
                await sock.groupParticipantsUpdate(sender, [target], action);
                await safeSendMessage(sock, sender, { text: `✅ Utilisateur ${action === 'remove' ? 'retiré' : action === 'promote' ? 'promu admin' : 'rétrogradé'}.` }, 500);
                await reactToMessage(sock, sender, messageId, '✅');
              } catch (err) {
                console.error(`Erreur lors de ${command}:`, err.message);
                await safeSendMessage(sock, sender, { text: `❌ Impossible d'exécuter ${command}. Je dois être admin.` }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              }
              break;

            case 'add':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!args) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .add <numéro> (format international sans +)' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const number = args.replace(/\D/g, '') + '@s.whatsapp.net';
              try {
                await sock.groupParticipantsUpdate(sender, [number], 'add');
                await safeSendMessage(sock, sender, { text: `✅ Membre ${args} ajouté.` }, 500);
                await reactToMessage(sock, sender, messageId, '✅');
              } catch (err) {
                console.error('Erreur lors de l\'ajout:', err.message);
                await safeSendMessage(sock, sender, { text: '❌ Impossible d\'ajouter le membre.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              }
              break;

            case 'tagall':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const participants = metadata.participants.map(p => p.id);
              await safeSendMessage(sock, sender, { text: args || '🔔 Tag all !', mentions: participants }, 1000);
              await reactToMessage(sock, sender, messageId, '🔔');
              break;

            case 'hidetag':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isAdmin) {
                await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const participantsHide = metadata.participants.map(p => p.id);
              await safeSendMessage(sock, sender, { text: args || '🔕 Message du propriétaire', mentions: participantsHide }, 1000);
              await reactToMessage(sock, sender, messageId, '🔕');
              break;

            case 'kickall':
              if (!isGroup) {
                await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (participant !== CREATOR_JID) {
                await safeSendMessage(sock, sender, { text: 'Seul le propriétaire peut utiliser cette commande.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (!isBotAdmin) {
                await safeSendMessage(sock, sender, { text: 'Je dois être admin pour effectuer cette action.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              const nonAdmins = metadata.participants.filter(p => !p.admin && p.id !== botJid).map(p => p.id);
              if (nonAdmins.length > 0) {
                try {
                  await sock.groupParticipantsUpdate(sender, nonAdmins, 'remove');
                  await safeSendMessage(sock, sender, { text: '✅ Tous les non-admins ont été retirés.' }, 500);
                  await reactToMessage(sock, sender, messageId, '✅');
                } catch (err) {
                  console.error('Erreur lors du kickall:', err.message);
                  await safeSendMessage(sock, sender, { text: '❌ Erreur lors du retrait des membres.' }, 500);
                  await reactToMessage(sock, sender, messageId, '❌');
                }
              } else {
                await safeSendMessage(sock, sender, { text: 'Aucun non-admin à retirer.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              }
              break;

            case 'alive':
              await reactToMessage(sock, sender, messageId, '✅');
              await safeSendMessage(sock, sender, {
                image: { url: './images/alive.jpg' },
                caption: `🌟 Salut ! Aquila Bot est en ligne 🤖💬, prêt à répondre à tes questions et à t'amuser 😎💥. Ton assistant fidèle et un peu sarcastique 😏🖤 est prêt à agir ! 🚀`
              }, 1000);
              break;

            case 'react':
              if (!args) {
                await safeSendMessage(sock, sender, { text: 'Utilisez : .react <emoji>' }, 500);
                break;
              }
              await reactToMessage(sock, sender, messageId, args);
              break;

            case 'laugh':
              try {
                const audioBuffer = await fs.readFile(LAUGH_AUDIO);
                await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
                await reactToMessage(sock, sender, messageId, '😂');
              } catch (err) {
                console.error('Erreur envoi audio laugh:', err.message);
                await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
              }
              break;

            case 'cry':
              try {
                const audioBuffer = await fs.readFile(CRY_AUDIO);
                await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
                await reactToMessage(sock, sender, messageId, '😢');
              } catch (err) {
                console.error('Erreur envoi audio cry:', err.message);
                await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
              }
              break;

            case 'applaud':
              try {
                const audioBuffer = await fs.readFile(APPLAUD_AUDIO);
                await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
                await reactToMessage(sock, sender, messageId, '👏');
              } catch (err) {
                console.error('Erreur envoi audio applaud:', err.message);
                await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
              }
              break;

           case 'dorian':
  await imageToSticker(THUMBSUP_IMAGE, sock, sender, messageId, '👍');
  break;

case 'gloglo':
  await imageToSticker(LOL_IMAGE, sock, sender, messageId, '😆');
  break;

case 'zi':
  await imageToSticker(SAD_IMAGE, sock, sender, messageId, '😔');
  break;

            case 'statut':
              await reactToMessage(sock, sender, messageId, '📸');
              await safeSendMessage(sock, sender, { text: 'Récupération des statuts WhatsApp en cours, veuillez patienter...' }, 500);
              const statuses = await fetchStatuses(sock);
              if (statuses.error) {
                await safeSendMessage(sock, sender, { text: statuses.error }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
              } else if (statuses.message) {
                await safeSendMessage(sock, sender, { text: statuses.message }, 500);
                await reactToMessage(sock, sender, messageId, 'ℹ️');
              } else {
                let statusText = '📸 **Statuts WhatsApp disponibles** 📸\n\n';
                for (const [index, status] of statuses.entries()) {
                  const statusContent = status.text || status.caption || 'Média sans texte';
                  const statusOwner = status.jid ? status.jid.split('@')[0] : 'Inconnu';
                  statusText += `${index + 1}. De : @${statusOwner}\nContenu : ${statusContent}\n\n`;
                }
                await safeSendMessage(sock, sender, { text: statusText, mentions: statuses.map(s => s.jid).filter(jid => jid) }, 1000);
                await reactToMessage(sock, sender, messageId, '✅');
              }
              break;

            case 'setstatut':
              await reactToMessage(sock, sender, messageId, '📸');
              const statusType = args.toLowerCase() || 'random';
              await setRandomStatus(sock, statusType);
              await safeSendMessage(sock, sender, { text: `✅ Statut WhatsApp mis à jour avec type "${statusType}".` }, 500);
              await reactToMessage(sock, sender, messageId, '✅');
              break;

            case 'restart':
            case 'update':
            case 'broadcast':
              if (participant !== CREATOR_JID) {
                await safeSendMessage(sock, sender, { text: '❌ Commande réservée au propriétaire.' }, 500);
                await reactToMessage(sock, sender, messageId, '❌');
                break;
              }
              if (command === 'restart') {
                await safeSendMessage(sock, sender, { text: 'Redémarrage en cours...' }, 500);
                process.exit(0);
              } else if (command === 'update') {
                await safeSendMessage(sock, sender, { text: 'Mise à jour en cours...' }, 500);
              } else if (command === 'broadcast') {
                const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
                if (!args && numbers.length === 0) {
                  await safeSendMessage(sock, sender, { text: 'Utilisez : .broadcast <message> ou configurez BROADCAST_NUMBERS.' }, 500);
                  break;
                }
                const broadcastMessage = args || process.env.BROADCAST_MESSAGE || 'Message de broadcast par défaut.';
                for (const number of numbers) {
                  const jid = number.trim() + '@s.whatsapp.net';
                  await safeSendMessage(sock, jid, { text: broadcastMessage }, 2000);
                }
                await safeSendMessage(sock, sender, { text: 'Broadcast envoyé !' }, 500);
              }
              await reactToMessage(sock, sender, messageId, '🔒');
              break;

            default:
              await reactToMessage(sock, sender, messageId, '❓');
              await safeSendMessage(sock, sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` }, 500);
          }
        });
        return;
      }

      // Réponse IA pour les messages non-commandes
      if (text) {
        const geminiReply = await askGemini(text, sender);
        await safeSendMessage(sock, sender, { text: `@${participant.split('@')[0]} ${geminiReply}`, mentions: [participant] }, 500);
      }
    } catch (globalErr) {
      console.error('Erreur globale dans messages.upsert:', globalErr.message);
    }
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      console.log(`Événement group-participants.update: group=${id}, action=${action}, participants=${JSON.stringify(participants)}`);
      const welcomeEnabled = await getGroupSetting(id, 'welcome');
      if (!welcomeEnabled) return;
      const metadata = await retryOperation(() => sock.groupMetadata(id));
      const totalMembers = metadata.participants.length;
      const totalAdmins = metadata.participants.filter(p => p.admin).length;
      for (const participant of participants) {
        let imageOptions = {};
        try {
          const profilePicUrl = await sock.profilePictureUrl(participant, 'image');
          const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
          imageOptions = { image: Buffer.from(response.data) };
        } catch (err) {
          console.error(`Erreur lors de la récupération de la photo de profil pour ${participant}:`, err.message);
          imageOptions = { image: { url: DEFAULT_PROFILE_IMAGE } };
        }
        if (action === 'add') {
          await safeSendMessage(sock, id, {
            ...imageOptions,
            caption: `🎉 Bienvenue @${participant.split('@')[0]} dans le groupe ! 😎\n` +
                     `Amuse-toi et tape .help pour découvrir mes commandes !\n` +
                     `📊 Nombre total de membres : ${totalMembers}\n` +
                     `👑 Nombre d'admins : ${totalAdmins}`,
            mentions: [participant]
          }, 1000);
          console.log(`Message de bienvenue envoyé à ${participant} dans le groupe ${id}`);
        } else if (action === 'remove') {
          await safeSendMessage(sock, id, {
            ...imageOptions,
            caption: `👋 @${participant.split('@')[0]} a quitté le groupe. À bientôt peut-être ! 😢\n` +
                     `📊 Nombre total de membres : ${totalMembers}\n` +
                     `👑 Nombre d'admins : ${totalAdmins}`,
            mentions: [participant]
          }, 1000);
          console.log(`Message d'au revoir envoyé pour ${participant} dans le groupe ${id}`);
        }
      }
    } catch (err) {
      console.error(`Erreur lors de l'envoi du message ${action === 'add' ? 'de bienvenue' : 'd\'au revoir'}:`, err.message);
    }
  });

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('QR code généré. Scannez avec WhatsApp :');
      QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
      console.log('Déconnecté:', reason);
      if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
      else console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
    } else if (connection === 'open') {
      console.log('Connecté à WhatsApp!');
      await safeSendMessage(sock, CREATOR_CONTACT, { text: 'Mon créateur, je suis en ligne 🙂‍↔️🥺🥹🥺' }, 500);
      setInterval(async () => {
        try {
          await safeSendMessage(sock, CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' }, 500);
        } catch (err) {
          console.error('Erreur message périodique:', err.message);
        }
      }, 600000);
    }
  });

  return sock;
}

export default startBot;
