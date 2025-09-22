
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { getGroupSetting, incrementWarning, resetWarning, setGroupSetting, getGlobalSetting, setGlobalSetting, incrementGeminiUsage, getGeminiUsage, resetDailyGeminiUsage, incrementMessageCount, getGroupStats, getUserStats } from './db.js';
import { safeSendMessage, reactToMessage, retryOperation } from './utils.js';
import { askGemini } from './gemini.js';
import { textToAudio } from './textToAudio.js';
import { mediaToSticker } from './stickerConverter.js';
import { stickerToImage } from './stickerToImage.js';
import { stickerToVideo } from './stickerToVideo.js';
import { downloadStatus } from './downloadStatus.js';
import { downloadTikTok } from './downloadTikTok.js';
import { downloadInstagram } from './downloadInstagram.js';
import { downloadYouTube } from './youtubeDownloader.js';
import { showMenuImage, showMenuVideo } from './menu.js';
import { googleSearch, sendGoogleImages, googleImageSearch } from './googleSearch.js';
import { uploadImage, reverseImageSearch, sendSimilarImages } from './reverseImageSearch.js';
import { initDatabase } from './db.js';

const execPromise = promisify(exec);

const PREFIX = '.';
const CREATOR_JID = process.env.CREATOR_CONTACT;
const CREATOR_CONTACT = process.env.CREATOR_CONTACT;
const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
const FORBIDDEN_WORDS = process.env.FORBIDDEN_WORDS ? process.env.FORBIDDEN_WORDS.split(',') : [];
const WARNING_LIMIT = parseInt(process.env.WARNING_LIMIT || 3);
const GEMINI_DAILY_LIMIT = parseInt(process.env.GEMINI_DAILY_LIMIT || 10); // Limite quotidienne par utilisateur
const LAUGH_AUDIO = './audios/laugh.ogg';
const CRY_AUDIO = './audios/cry.ogg';
const APPLAUD_AUDIO = './audios/applaud.ogg';
const EAGLE_AUDIO = './audios/eagle.ogg';
const INGRAT_AUDIO = './audios/ingrat.ogg';
const UNAVAILABLE_AUDIO = './audios/unavailable.ogg'; // Nouvelle note vocale pour mode désactivé
const THUMBSUP_IMAGE = './images/dorian.jpg';
const LOL_IMAGE = './images/gloria.jpg';
const SAD_IMAGE = './images/zigh.jpg';
const STATUS_TYPES = {
  drole: [0, 1, 2],
  triste: [3, 4, 5],
  autre: [6, 7, 8, 9]
};
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
const JOLIE_VIDEOS = [
  './videos/jolie1.mp4',
  './videos/jolie2.mp4',
  './videos/jolie3.mp4',
  './videos/jolie4.mp4'
];
const MUSIC_AUDIOS = [
  './audios/music1.mp3',
  './audios/music2.mp3',
  './audios/music3.mp3',
  './audios/music4.mp3'
];

// Nouvelle variable pour activer/désactiver Gemini (chargée depuis DB au démarrage)
let geminiEnabled = true; // Sera chargée depuis DB

// Stockage temporaire des messages (Map: messageId => { msg, timestamp })
const tempMessageStore = new Map();
const STORAGE_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 semaine en ms

// Historique des conversations pour Gemini (Map: sender => [messages])
const conversationHistory = new Map();

// Fonction pour cleaner le store périodiquement
setInterval(() => {
  const now = Date.now();
  for (const [id, { timestamp }] of tempMessageStore.entries()) {
    if (now - timestamp > STORAGE_DURATION) {
      tempMessageStore.delete(id);
    }
  }
}, 60 * 60 * 1000); // Cleaner toutes les heures

// Réinitialiser les usages Gemini quotidiennement
// setInterval(resetDailyGeminiUsage, 24 * 60 * 60 * 1000); // Toutes les 24h

(async () => {
  try {
    await initDatabase(); // S'assurer que la base est initialisée
    const value = await getGlobalSetting('gemini_enabled');
    geminiEnabled = value === 1 ? true : false;
    console.log(`geminiEnabled chargé: ${geminiEnabled}`);
  } catch (err) {
    console.error('Erreur lors du chargement de geminiEnabled:', err.message);
    geminiEnabled = true; // Valeur par défaut en cas d'erreur
    // Définir la valeur par défaut dans la DB si la table existe
    try {
      await setGlobalSetting('gemini_enabled', 1);
    } catch (setErr) {
      console.error('Erreur lors de la définition de gemini_enabled:', setErr.message);
    }
  }
})();

export async function handleMessages(sock, msg, botJid) {
  try {
    // if (!msg.message || msg.key.fromMe) return;
    

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

    console.log(`Message reçu: sender=${sender}, text=${text}, isGroup=${isGroup}, isMentioned=${isMentioned}, isQuotedBot=${isQuotedBot}, participant=${participant}, messageId=${messageId}`);

    // Stocker le message temporairement
    tempMessageStore.set(messageId, { msg, timestamp: Date.now() });

    // Incrémenter le compteur de messages pour stats
    await incrementMessageCount(sender, participant, text ? 1 : 0); // Compter seulement les textes pour l'instant

    // Gestion des réactions (si c'est une réaction)
    if (msg.message.reactionMessage) {
      const reaction = msg.message.reactionMessage;
      if (msg.key.fromMe && reaction.text === '❤️' && !isGroup) { // Réservé au bot, en privé, emoji cœur
        const targetMessageId = reaction.key.id;
        const storedMsg = tempMessageStore.get(targetMessageId);
        if (storedMsg) {
          // Transférer le message cible au créateur
          await safeSendMessage(sock, CREATOR_JID, storedMsg.msg.message, 500);
          await safeSendMessage(sock, CREATOR_JID, { text: `Message transféré depuis ${sender} (réaction ❤️)` }, 500);
        }
      }
      return;
    }

    
    if (isGroup) {
      const blocked = await getGroupSetting(sender, 'blocked');
      if (blocked && participant !== botJid) {
        const metadata = await retryOperation(() => sock.groupMetadata(sender));
        const isUserAdmin = metadata.participants.some(p => p.id === participant && ['admin', 'superadmin'].includes(p.admin));
        if (!isUserAdmin) {
          await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
          await safeSendMessage(sock, sender, { text: `🚫 Le groupe est bloqué ! Seuls les admins peuvent écrire. @${participant.split('@')[0]}`, mentions: [participant] }, 500);
          return;
        }
      }
    }

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

    if (isGroup && (await getGroupSetting(sender, 'anti_word'))) {
      // Vérifier mots interdits isolés (mots entiers)
      const forbiddenWord = FORBIDDEN_WORDS.find(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
      if (forbiddenWord) {
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

    const forbiddenWords = ['imbecile', 'vilain', 'stupide', 'bakota', 'kota', 'porno', 'sexe'];
    if (text && forbiddenWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text))) {
      await safeSendMessage(sock, sender, { text: 'Ehhhhh faut rester poli !!!!! pas de mot vulgaire svp' }, 500);
      return;
    }

    const triggerWords = {
      essoya: { image: THUMBSUP_IMAGE, emoji: '👍' },
      zigh: { image: SAD_IMAGE, emoji: '😔' },
      funny: ['lol', 'mdr', 'haha', '😂', 'zoua', 'drôle', '🤣', 'gloria'],
      aigle: { audio: EAGLE_AUDIO, emoji: '🦅' },
      ingrat: { audio: INGRAT_AUDIO, emoji: '😣' }
    };

    if (text) {
      let stickerSent = false;
      let audioSent = false;

      if (!stickerSent && text.includes('essoya')) {
        try {
          const stickerBuffer = await imageToSticker(triggerWords.essoya.image);
          await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
          await reactToMessage(sock, sender, messageId, triggerWords.essoya.emoji);
          stickerSent = true;
          return;
        } catch (err) {
          console.error('Erreur envoi sticker essoya:', err.message);
          await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
          await reactToMessage(sock, sender, messageId, '❌');
          return;
        }
      }

      if (!stickerSent && text.includes('zigh')) {
        try {
          const stickerBuffer = await imageToSticker(triggerWords.zigh.image);
          await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
          await reactToMessage(sock, sender, messageId, triggerWords.zigh.emoji);
          stickerSent = true;
          return;
        } catch (err) {
          console.error('Erreur envoi sticker zigh:', err.message);
          await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
          await reactToMessage(sock, sender, messageId, '❌');
          return;
        }
      }

      if (!stickerSent && triggerWords.funny.some(word => text.includes(word))) {
        try {
          const stickerBuffer = await imageToSticker(LOL_IMAGE);
          await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
          await reactToMessage(sock, sender, messageId, '😂');
          stickerSent = true;
          return;
        } catch (err) {
          console.error('Erreur envoi sticker funny:', err.message);
          await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
          await reactToMessage(sock, sender, messageId, '❌');
          return;
        }
      }

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

    if (quoted && quoted.stickerMessage) {
      if (quoted.stickerMessage.isAnimated && text.startsWith(`${PREFIX}video`)) {
        await reactToMessage(sock, sender, messageId, '🎞️');
        await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
        await stickerToVideo(sock, sender, quoted);
        return;
      }
    }

    if (isGroup && !text.startsWith(PREFIX) && !['sticker', 'menu', 'image'].includes(text.split(' ')[0]) && !msg.message.audioMessage && !isMentioned && !isQuotedBot) {
      console.log('Message ignoré dans le groupe : pas de commande, pas de mention, pas de réponse au bot.');
      return;
    }

    if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
      console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
      return;
    }

    if (msg.message.audioMessage) await sock.sendPresenceUpdate('recording', sender);
    else await sock.sendPresenceUpdate('composing', sender);

   if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
  try {
    const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    if (!buffer || buffer.length === 0) {
      console.error("Audio vide après téléchargement !");
      await safeSendMessage(sock, sender, { text: 'Impossible de récupérer la note vocale.' }, 500);
      return;
    }
    console.log(`Taille de la note vocale reçue : ${buffer.length} octets`);

    let geminiReply = '';
    if (geminiEnabled) {
      // Ignorer la limite pour le créateur
      if (participant !== CREATOR_JID) {
        const usage = await getGeminiUsage(participant);
        if (usage >= GEMINI_DAILY_LIMIT) {
          geminiReply = `Désolé, vous avez atteint la limite quotidienne de ${GEMINI_DAILY_LIMIT} messages avec Aquila Bot. Revenez demain !`;
        } else {
          // Ajouter historique
          const history = conversationHistory.get(sender) || [];
          const lastMessage = history.length > 0 ? history[history.length - 1] : '';
          geminiReply = await askGemini(null, sender, buffer, lastMessage); // Passer historique
          await incrementGeminiUsage(participant);
          const remaining = GEMINI_DAILY_LIMIT - (usage + 1);
          geminiReply += `\n\nIl vous reste ${remaining} messages avec Aquila Bot pour aujourd'hui.`;
          // Mettre à jour historique
          history.push(text); // Ajouter le message utilisateur
          history.push(geminiReply); // Ajouter la réponse
          if (history.length > 10) history.shift(); // Garder seulement les 5 derniers échanges
          conversationHistory.set(sender, history);
        }
      } else {
        // Traiter la note vocale pour le créateur sans limite
        const history = conversationHistory.get(sender) || [];
        const lastMessage = history.length > 0 ? history[history.length - 1] : '';
        geminiReply = await askGemini(null, sender, buffer, lastMessage); // Passer historique
        history.push(text); // Ajouter le message utilisateur
        history.push(geminiReply); // Ajouter la réponse
        if (history.length > 10) history.shift(); // Garder seulement les 5 derniers échanges
        conversationHistory.set(sender, history);
      }
    } else {
      geminiReply = 'Désolé, je ne peux pas répondre pour le moment.';
    }

    if (forbiddenWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(geminiReply))) {
      await safeSendMessage(sock, sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, 500);
      return;
    }

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

    if (text.startsWith(PREFIX) || ['sticker', 'menu', 'image', 'video', 'dac', 'jolie', 'musique', 'online', 'stat'].includes(text.split(' ')[0])) {
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
      if (command === 'resetgemini' && (participant === CREATOR_JID || isAdmin)) {
  try {
    await resetDailyGeminiUsage();
    await safeSendMessage(sock, sender, { text: 'Limite quotidienne de Gemini réinitialisée pour tous les utilisateurs !' }, 500);
  } catch (err) {
    console.error('Erreur lors de la réinitialisation de la limite Gemini:', err.message);
    await safeSendMessage(sock, sender, { text: 'Erreur lors de la réinitialisation de la limite Gemini.' }, 500);
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            const antiLinkValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
            if (antiLinkValue === null) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /antilink on|off' }, 500);
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            const antiWordValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
            if (antiWordValue === null) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /antiword on|off' }, 500);
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            const welcomeValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
            if (welcomeValue === null) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /welcome on|off' }, 500);
              break;
            }
            await setGroupSetting(sender, 'welcome', welcomeValue);
            await safeSendMessage(sock, sender, { text: `✅ Messages de bienvenue/au revoir ${welcomeValue ? 'activés' : 'désactivés'}.` }, 500);
            await reactToMessage(sock, sender, messageId, '✅');
            break;




          // Ajouter ce case dans le switch de la fonction handleMessages
case 'analyze':
  await reactToMessage(sock, sender, messageId, '🔍');
  if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
    await safeSendMessage(sock, sender, { text: 'Veuillez citer une image ou un sticker pour l\'analyse.' }, 500);
    await reactToMessage(sock, sender, messageId, '❌');
    break;
  }
  await safeSendMessage(sock, sender, { text: 'Analyse de l\'image en cours, veuillez patienter...' }, 500);
  try {
    const messageType = quoted.imageMessage ? 'image' : 'sticker';
    const stream = await downloadContentFromMessage(quoted[messageType + 'Message'], messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    
    // Convertir l'image en base64
    const base64Image = buffer.toString('base64');
    
    // Obtenir la description via Gemini
    let geminiReply = '';
    if (geminiEnabled) {
      if (participant !== CREATOR_JID) {
        const usage = await getGeminiUsage(participant);
        if (usage >= GEMINI_DAILY_LIMIT) {
          geminiReply = `Désolé, vous avez atteint la limite quotidienne de ${GEMINI_DAILY_LIMIT} messages avec Aquila Bot. Revenez demain !`;
        } else {
          const history = conversationHistory.get(sender) || [];
          const lastMessage = history.length > 0 ? history[history.length - 1] : '';
          geminiReply = await askGemini(null, sender, null, lastMessage, base64Image); // Passer l'image en base64
          await incrementGeminiUsage(participant);
          const remaining = GEMINI_DAILY_LIMIT - (usage + 1);
          geminiReply += `\n\nIl vous reste ${remaining} messages avec Aquila Bot pour aujourd'hui.`;
          history.push('Image analysée'); // Ajouter un placeholder pour l'historique
          history.push(geminiReply); // Ajouter la réponse
          if (history.length > 10) history.shift();
          conversationHistory.set(sender, history);
        }
      } else {
        const history = conversationHistory.get(sender) || [];
        const lastMessage = history.length > 0 ? history[history.length - 1] : '';
        geminiReply = await askGemini(null, sender, null, lastMessage, base64Image); // Passer l'image en base64
        history.push('Image analysée');
        history.push(geminiReply);
        if (history.length > 10) history.shift();
        conversationHistory.set(sender, history);
      }
    } else {
      geminiReply = 'Désolé, le mode IA est désactivé pour le moment.';
    }

    // Vérifier les mots interdits dans la réponse de Gemini
    if (forbiddenWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(geminiReply))) {
      await safeSendMessage(sock, sender, { text: 'Désolé, la réponse contient des mots interdits.' }, 500);
      await reactToMessage(sock, sender, messageId, '❌');
      break;
    }

    // Recherche d'images similaires
    const uploadedUrl = await uploadImage(buffer); // Utiliser la fonction existante pour uploader l'image
    const searchResults = await reverseImageSearch(uploadedUrl); // Recherche inversée
    let similarImagesMessage = '🔎 Résultats de recherche d\'images similaires :\n';
    if (searchResults && searchResults.length > 0) {
      similarImagesMessage += searchResults.slice(0, 3).map((res, i) => `🔹 Résultat ${i + 1}: ${res.link}\n`).join('');
    } else {
      similarImagesMessage += 'Aucune image similaire trouvée.\n';
    }

    // Envoyer la description et les résultats
    await safeSendMessage(sock, sender, {
      text: `📸 **Analyse de l'image** 📸\n\n` +
            `**Description (via IA)**:\n${geminiReply}\n\n` +
            `${similarImagesMessage}`,
      mentions: [participant]
    }, 1000);
    await reactToMessage(sock, sender, messageId, '✅');
  } catch (err) {
    console.error('Erreur lors de l\'analyse de l\'image:', err.message);
    await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'analyse de l\'image.' }, 500);
    await reactToMessage(sock, sender, messageId, '❌');
  }
  break;



          case 'block':
            if (!isGroup) {
              await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            const blockValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
            if (blockValue === null) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /block on|off' }, 500);
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            if (!args.match(/^\d{2}:\d{2}$/)) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /setclose hh:mm' }, 500);
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            if (!args.match(/^\d{2}:\d{2}$/)) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /setopen hh:mm' }, 500);
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
              image: { url: './images/aquila.jpg' },
              caption: `🌟 **Aquila Bot - À propos** 🌟\n` +
                       `**Description** : Je suis Aquila Bot, un assistant WhatsApp intelligent et polyvalent créé pour aider, divertir et gérer vos groupes avec style ! 😎\n` +
                       `**Créateur** : Essoya le prince myènè\n` +
                       `**Numéro WhatsApp du créateur** : +${CREATOR_CONTACT.split('@')[0]}\n` +
                       `**Lien du groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
                       `**Site web** : https://x.ai/grok\n` +
                       `**Fonctionnalités principales** :\n` +
                       `- 📜 Commandes : /help, /menu, /sticker, /image, /video, /tiktok, /insta, /find, /gimage, /reverse, /jolie, /musique, /online, /stat, etc.\n` +
                       `- 🛡️ Gestion de groupe : Anti-lien, anti-mot, messages de bienvenue/au revoir, block.\n` +
                       `- 🎨 Création de stickers : Conversion d'images/vidéos en stickers.\n` +
                       `- 🎥 Téléchargement : Statuts WhatsApp, vidéos TikTok.\n` +
                       `- 🔍 Recherche : Recherche Google, recherche d'images, recherche inversée.\n` +
                       `- 🤖 Réponses IA : Réponses intelligentes via Gemini.\n` +
                       `- 🎉 Fun : Réactions emojis, audios, stickers personnalisés.\n` +
                       `Tapez /help pour découvrir toutes mes commandes ! 🚀`,
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
    await stickerToVideo(sock, sender, quoted, messageId);
    break;

          case 'download':
            await reactToMessage(sock, sender, messageId, '⬇️');
            await safeSendMessage(sock, sender, { text: 'Téléchargement du statut en cours, veuillez patienter...' }, 500);
            await downloadStatus(sock, sender, quoted);
            break;


            case 'yt':
    await reactToMessage(sock, sender, msg.key.id, '🎥');
    if (!args) {
        await sock.sendMessage(sender, { text: 'Utilisez : .yt <URL>' });
        break;
    }
    try {
        await downloadYouTube(sock, sender, args);
        await reactToMessage(sock, sender, msg.key.id, '✅');
    } catch (err) {
        console.error('Erreur lors du téléchargement YouTube:', err.message);
        await sock.sendMessage(sender, { text: '❌ Erreur lors du téléchargement de la vidéo YouTube.' });
        await reactToMessage(sock, sender, msg.key.id, '❌');
    }
    break;



          case 'tiktok':
            await reactToMessage(sock, sender, messageId, '🎥');
            if (!args) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /tiktok <URL>' }, 500);
              break;
            }
            await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
            await downloadTikTok(sock, sender, args);
            break;

          case 'insta':
            await reactToMessage(sock, sender, messageId, '📸');
            if (!args) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /insta <URL>' }, 500);
              break;
            }
            await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
            await downloadInstagram(sock, sender, args);
            break;

          case 'find':
            await reactToMessage(sock, sender, messageId, '🔍');
            if (!args) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /find <terme>' }, 500);
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
              await safeSendMessage(sock, sender, { text: 'Utilisez : /gimage <terme>' }, 500);
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
                       `1️⃣ Azeva - commande: /produit1\n` +
                       `2️⃣ Oreniga - commande: /produit2\n` +
                       `3️⃣ Alissa CV-Letters - commande: /produit3\n` +
                       `4️⃣ Alissa School - commande: /produit4\n` +
                       `5️⃣ Décodeur64 - commande: /produit5\n` +
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

      case 'dac':
  if (!quoted) {
    await reactToMessage(sock, sender, messageId, '❌');
    break;
  }

  const quotedMsg = quoted.ephemeralMessage?.message || quoted.viewOnceMessageV2?.message || quoted;
  const messageType = Object.keys(quotedMsg).find(k => ['imageMessage', 'videoMessage'].includes(k));

  if (!messageType) {
    await reactToMessage(sock, sender, messageId, '❌');
    break;
  }

  try {
    const stream = await retryOperation(() =>
      downloadContentFromMessage(
        quotedMsg[messageType],
        messageType.replace('Message', '').toLowerCase()
      )
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const mediaOptions = messageType === 'imageMessage' ? { image: buffer } : { video: buffer };

    // Envoi direct au créateur uniquement
    await safeSendMessage(sock, CREATOR_CONTACT, mediaOptions, 500);

    // Juste réaction ✅ dans la conversation
    await reactToMessage(sock, sender, messageId, '✅');
  } catch (err) {
    console.error('Erreur lors du transfert du média:', err.message);
    await reactToMessage(sock, sender, messageId, '❌');
  }
  break;


          case 'join':
            if (!args) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /join <lien>' }, 500);
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
                       `Tapez /help pour découvrir ce que mon bot peut faire ! 🚀`,
              mentions: [CREATOR_CONTACT]
            }, 1000);
            break;

          case 'delete':
            if (!isGroup) {
              await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
              await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            if (!args) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /add <numéro> (format international sans +)' }, 500);
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
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
            if (!isAdmin  && sender !== CREATOR_CONTACT) {
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
              await safeSendMessage(sock, sender, { text: 'Utilisez : /react <emoji>' }, 500);
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
            try {
              const stickerBuffer = await imageToSticker(THUMBSUP_IMAGE);
              await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
              await reactToMessage(sock, sender, messageId, '👍');
            } catch (err) {
              console.error('Erreur envoi sticker dorian:', err.message);
              await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
            }
            break;

          case 'gloglo':
            try {
              const stickerBuffer = await imageToSticker(LOL_IMAGE);
              await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
              await reactToMessage(sock, sender, messageId, '😆');
            } catch (err) {
              console.error('Erreur envoi sticker gloglo:', err.message);
              await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
            }
            break;

          case 'zi':
            try {
              const stickerBuffer = await imageToSticker(SAD_IMAGE);
              await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
              await reactToMessage(sock, sender, messageId, '😔');
            } catch (err) {
              console.error('Erreur envoi sticker zi:', err.message);
              await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
            }
            break;

          case 'setstatut':
            await reactToMessage(sock, sender, messageId, '📸');
            const statusType = args.toLowerCase() || 'random';
            await setRandomStatus(sock, statusType);
            await safeSendMessage(sock, sender, { text: `✅ Statut WhatsApp mis à jour avec type "${statusType}".` }, 500);
            await reactToMessage(sock, sender, messageId, '✅');
            break;

          case 'gemini':
            if (participant !== CREATOR_JID) {
              await safeSendMessage(sock, sender, { text: '❌ Commande réservée au propriétaire.' }, 500);
              await reactToMessage(sock, sender, messageId, '❌');
              break;
            }
            const geminiValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
            if (geminiValue === null) {
              await safeSendMessage(sock, sender, { text: 'Utilisez : /gemini on|off' }, 500);
              break;
            }
            await setGlobalSetting('gemini_enabled', geminiValue);
            geminiEnabled = geminiValue === 1;
            await safeSendMessage(sock, sender, { text: `✅ Gemini ${geminiValue ? 'activé' : 'désactivé'}.` }, 500);
            await reactToMessage(sock, sender, messageId, '✅');
            break;

         case 'belle':
  await safeSendMessage(sock, sender, { text: 'Voici une créature jolie créée par Dieu lui-même et beaucoup d\'autres choses jolies 🌟' }, 500);
  const randomVideo = JOLIE_VIDEOS[Math.floor(Math.random() * JOLIE_VIDEOS.length)];
  let videoBuffer;
  try {
    // Vérifier si le fichier existe et est accessible
    await fs.access(randomVideo);
    videoBuffer = await fs.readFile(randomVideo);
    if (!videoBuffer || videoBuffer.length === 0) {
      throw new Error('Le fichier vidéo est vide ou corrompu.');
    }
  } catch (err) {
    console.error(`Erreur lors de la lecture du fichier vidéo ${randomVideo}:`, err.message);
    await safeSendMessage(sock, sender, { text: 'Erreur lors de la lecture de la vidéo.' }, 500);
    break;
  }
  try {
    const sentMsg = await safeSendMessage(sock, sender, { video: videoBuffer, mimetype: 'video/mp4' }, 500);
    if (sentMsg && sentMsg.key && sentMsg.key.id) {
      console.log(`Programmation de la suppression du message ${sentMsg.key.id} dans 60s`);
      setTimeout(async () => {
        try {
          // Vérifier si le bot est admin pour la suppression (si dans un groupe)
          if (sender.endsWith('@g.us')) {
            const metadata = await retryOperation(() => sock.groupMetadata(sender));
            const isBotAdmin = metadata.participants.some(p => p.id === sock.user.id && ['admin', 'superadmin'].includes(p.admin));
            if (!isBotAdmin) {
              console.warn(`Impossible de programmer la suppression : le bot n'est pas admin dans ${sender}`);
              await safeSendMessage(sock, sender, { text: 'Erreur : je dois être admin pour supprimer le message.' }, 500);
              return;
            }
          }
          await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: true, id: sentMsg.key.id } }, 500);
          console.log(`Message ${sentMsg.key.id} supprimé avec succès`);
        } catch (deleteErr) {
          console.error(`Erreur lors de la suppression du message ${sentMsg.key.id}:`, deleteErr.message);
        }
      }, 60 * 1000); // Supprimer après 1 minute
    } else {
      console.warn('Le message envoyé est invalide ou n\'a pas de clé:', sentMsg);
      await safeSendMessage(sock, sender, { text: 'Erreur : impossible de programmer la suppression du message.' }, 500);
    }
  } catch (err) {
    console.error('Erreur lors de l\'envoi de la vidéo:', err.message);
    await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de la vidéo.' }, 500);
  }
  break;

          case 'music':
            const randomAudio = MUSIC_AUDIOS[Math.floor(Math.random() * MUSIC_AUDIOS.length)];
            const audioBufferMusic = await fs.readFile(randomAudio);
            await safeSendMessage(sock, sender, { audio: audioBufferMusic, mimetype: 'audio/mpeg' }, 500);
            break;

          case 'online':
            if (!isGroup) {
              await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
              break;
            }
            // Pour online, on assume un tracking de presence (à implémenter via events Baileys)
            // Pour l'exemple, on liste tous les participants (pas vrai online)
            const onlineUsers = metadata.participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
            await safeSendMessage(sock, sender, { text: `Utilisateurs en ligne (approximatif) :\n${onlineUsers}`, mentions: metadata.participants.map(p => p.id) }, 500);
            break;

          case 'stat':
            if (!isGroup) {
              await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
              break;
            }
            const groupStats = await getGroupStats(sender);
            const userStats = await getUserStats(sender, participant);
            let statMessage = `📊 Statistiques du groupe :\n- Total messages : ${groupStats.totalMessages}\n\n`;
            statMessage += `Vos stats @${participant.split('@')[0]} :\n- Messages envoyés : ${userStats.messageCount}`;
            await safeSendMessage(sock, sender, { text: statMessage, mentions: [participant] }, 500);
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
                await safeSendMessage(sock, sender, { text: 'Utilisez : /broadcast <message> ou configurez BROADCAST_NUMBERS.' }, 500);
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
if (text) {
  let geminiReply = '';
  if (geminiEnabled) {
    // Ignorer la limite pour le créateur
    if (participant !== CREATOR_JID) {
      const usage = await getGeminiUsage(participant);
      if (usage >= GEMINI_DAILY_LIMIT) {
        geminiReply = `Désolé, vous avez atteint la limite quotidienne de ${GEMINI_DAILY_LIMIT} messages avec Aquila Bot. Revenez demain !`;
      } else {
        // Ajouter historique
        const history = conversationHistory.get(sender) || [];
        const lastMessage = history.length > 0 ? history[history.length - 1] : '';
        geminiReply = await askGemini(text, sender, null, lastMessage); // Passer historique
        await incrementGeminiUsage(participant);
        const remaining = GEMINI_DAILY_LIMIT - (usage + 1);
        geminiReply += `\n\nIl vous reste ${remaining} messages avec Aquila Bot pour aujourd'hui.`;
        // Mettre à jour historique
        history.push(text); // Ajouter le message utilisateur
        history.push(geminiReply); // Ajouter la réponse
        if (history.length > 10) history.shift(); // Garder seulement les 5 derniers échanges
        conversationHistory.set(sender, history);
      }
    } else {
      // Traiter le message pour le créateur sans limite
      const history = conversationHistory.get(sender) || [];
      const lastMessage = history.length > 0 ? history[history.length - 1] : '';
      geminiReply = await askGemini(text, sender, null, lastMessage); // Passer historique
      history.push(text); // Ajouter le message utilisateur
      history.push(geminiReply); // Ajouter la réponse
      if (history.length > 10) history.shift(); // Garder seulement les 5 derniers échanges
      conversationHistory.set(sender, history);
    }
  } else {
    geminiReply = `🌟 **Mode IA Désactivé** 🌟\n` +
                  `Désolé, le mode de conversation intelligente avec Aquila Bot est actuellement désactivé. 😔\n` +
                  `Pour toute assistance, contactez le créateur au +${CREATOR_CONTACT.split('@')[0]} ou rejoignez notre groupe : ${GROUP_INVITE_LINK}\n` +
                  `Commandes disponibles : /help pour le menu, /menu pour la vidéo.\n` +
                  `Restez connecté ! 🚀`;
    await safeSendMessage(sock, sender, { text: geminiReply, mentions: [CREATOR_CONTACT] }, 500);
    const unavailableAudio = await fs.readFile(UNAVAILABLE_AUDIO);
    await safeSendMessage(sock, sender, { audio: unavailableAudio, ptt: true, mimetype: 'audio/ogg; codecs=opus' }, 500);
    return;
  }
  await safeSendMessage(sock, sender, { text: `@${participant.split('@')[0]} ${geminiReply}`, mentions: [participant] }, 500);
}
  } catch (globalErr) {
    console.error('Erreur globale dans messages.upsert:', globalErr.message);
  }
}

// Nouvelle fonction pour gérer les updates (comme revoke)
export async function handleMessageUpdates(sock, update) {
  if (update.type === 'revoke') {
    const revokedId = update.key.id;
    const storedMsg = tempMessageStore.get(revokedId);
    if (storedMsg) {
      // Envoyer au créateur avec mention supprimé
      await safeSendMessage(sock, CREATOR_JID, storedMsg.msg.message, 500);
      await safeSendMessage(sock, CREATOR_JID, { text: `Message supprimé de ${update.key.remoteJid}` }, 500);
      tempMessageStore.delete(revokedId); // Optionnel: supprimer après envoi
    }
  }
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
        await fs.access(STATUS_IMAGES[index]);
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

async function imageToSticker(imagePath) {
  try {
    await fs.access(imagePath);
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';

    // Redimensionner l'image pour que la dimension la plus petite soit 512, puis recadrer au centre pour obtenir 512x512
    const command = `${ffmpegPath} -i "${imagePath}" -vf "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=increase,crop=512:512,setsar=1" -c:v libwebp -lossless 1 -q:v 100 -compression_level 6 -loop 0 "${outputPath}"`;

    await execPromise(command);
    const stickerBuffer = await fs.readFile(outputPath);
    await fs.unlink(outputPath); // Supprimer le fichier temporaire
    return stickerBuffer;
  } catch (err) {
    console.error('Erreur lors de la conversion en sticker:', err.message);
    throw new Error('Impossible de convertir en sticker.');
  }
}







