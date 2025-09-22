import axios from 'axios';
import { safeSendMessage, retryOperation } from './utils.js';
import { getGroupSetting } from './db.js';

const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
const DEFAULT_PROFILE_IMAGE = './images/default_profile.jpg';

export async function handleGroupParticipantsUpdate(sock, id, participants, action) {
  try {
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
    console.error(`Erreur lors de la gestion des mises à jour des participants dans le groupe ${id}:`, err.message);
    await safeSendMessage(sock, id, {
      text: `❌ Une erreur est survenue lors de la gestion des participants. Veuillez réessayer plus tard.`,
      mentions: [CREATOR_CONTACT]
    }, 1000);
  }
}