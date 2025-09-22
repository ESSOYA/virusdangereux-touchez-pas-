// async function shareCreatorContact(sock, sender) {
//     try {
//         const vcard = `BEGIN:VCARD
// VERSION:3.0
// FN:Essoya le prince myènè
// TEL;TYPE=CELL:+241 06 81 35 42
// END:VCARD`;
//         await sock.sendMessage(sender, {
//             contacts: {
//                 displayName: 'Essoya le prince myènè',
//                 contacts: [{ vcard }]
//             }
//         });
//     } catch (err) {
//         console.error('Erreur lors du partage du contact:', err.message);
//         await sock.sendMessage(sender, { text: 'Erreur lors du partage du contact.' });
//     }
// }

// export{ shareCreatorContact };




async function shareCreatorContact(sock, sender) {
  try {
    const creatorNumber = '24106813542'; // Extrait de CREATOR_CONTACT
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Essongue;Yann Chéri;;;
FN:Essongue Yann Chéri
NICKNAME:Essoya le prince myènè
TEL;TYPE=CELL;waid=${creatorNumber}:+${creatorNumber}
END:VCARD`;
    await sock.sendMessage(sender, {
      contacts: {
        displayName: 'Essongue Yann Chéri',
        contacts: [{ vcard }]
      }
    });
  } catch (err) {
    console.error('Erreur lors du partage du contact:', err.message);
    await sock.sendMessage(sender, { text: 'Erreur lors du partage du contact.' });
  }
}

export{ shareCreatorContact };