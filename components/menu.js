


// import fs from 'fs';

// export const CREATOR_CONTACT = 'https://wa.me/+24166813542';
// export const GROUP_INVITE = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5?mode=ems_copy_t';
// export const PREFIX = '/';
// export const MENU_IMAGE_PATH = './images/menu.jpg';
// export const MENU_VIDEO_PATH = './videos/senku1.mp4';
// export const CREATOR_JID = '24166813542@s.whatsapp.net';

// function generateMenuText(isOwner = false) {
//   let menu = `
// ╭─── *🌌 AQUILA BOT 🌟* ───╮
// │ *Créé par* : Essongue Yann Chéri  
// │ *Alias* : Essoya le prince myènè  
// │ 
// ╰───────────────────╯

// *📞 Contact* : ${CREATOR_CONTACT}  
// *👥 Groupe officiel* : ${GROUP_INVITE}

// ╭─── *⚙️ Commandes Générales* ───╮
// │ *${PREFIX}help*     📜 Afficher ce menu
// │ *${PREFIX}menu*     🎥 Menu animé (GIF)
// │ *${PREFIX}info*     ℹ️ Infos sur le bot
// │ *${PREFIX}alive*    ✅ Vérifier le statut
// │ *${PREFIX}creator*  🧑‍💻 Contact du créateur
// ╰───────────────────╯

// ╭─── *🖼️ Multimédia* ───╮
// │ *${PREFIX}sticker*   🎨 Image/vidéo → sticker
// │ *${PREFIX}image*     🖼️ Sticker → image
// │ *${PREFIX}video*     🎞️ Sticker animé → vidéo
// │ *${PREFIX}download*  ⬇️ Télécharger un statut
// │ *${PREFIX}yt <url>*  📹 Télécharger vidéo YouTube
// │ *${PREFIX}gimage <req>* 🔎 Rechercher image Google
// │ *${PREFIX}reverse*   🔍 Recherche inversée d'image
// ╰───────────────────╯

// ╭─── *🔍 Recherche* ───╮
// │ *${PREFIX}find <req>* 🔎 Rechercher sur Google
// ╰───────────────────╯

// ╭─── *🛍️ Catalogue* ───╮
// │ *${PREFIX}catalogue*  🛒 Voir tous les produits
// │ *${PREFIX}produit1*   📚 Azeva
// │ *${PREFIX}produit2*   📝 Oreniga
// │ *${PREFIX}produit3*   ✍️ Alissa CV-Letters
// │ *${PREFIX}produit4*   🏫 Alissa School
// │ *${PREFIX}produit5*   🔐 Décodeur64
// ╰───────────────────╯

// ╭─── *😄 Réactions Fun* ───╮
// │ *${PREFIX}react <emoji>* 😊 Réagir (ex: .react 👍)
// │ *${PREFIX}laugh*    😂 Audio rire
// │ *${PREFIX}cry*      😢 Audio pleurs
// │ *${PREFIX}applaud*  👏 Audio applaudissements
// │ *${PREFIX}dorian*   👍 Sticker pouce
// │ *${PREFIX}gloglo*   😆 Sticker rire
// │ *${PREFIX}zi*       😔 Sticker triste
// ╰───────────────────╯

// ╭─── *👥 Gestion Groupe (Admins)* ───╮
// │ *${PREFIX}join <lien>*      🤝 Rejoindre un groupe
// │ *${PREFIX}promote @user*    ⬆️ Promouvoir membre
// │ *${PREFIX}demote @user*     ⬇️ Rétrograder admin
// │ *${PREFIX}kick @user*       🚪 Retirer membre
// │ *${PREFIX}add <numéro>*     ➕ Ajouter membre
// │ *${PREFIX}tagall [msg]*     🔔 Mentionner tous
// │ *${PREFIX}hidetag [msg]*    🔕 Mention discrète
// │ *${PREFIX}kickall*          🧹 Retirer non-admins
// │ *${PREFIX}on*         🛡️ Activer protections
// │ *${PREFIX}off*      🔓 Désactiver protections
// ╰───────────────────╯

// ╭─── *🤖 Mode IA* ───╮
// │ Posez une question ou envoyez une note vocale pour une réponse intelligente ! 💬
// ╰───────────────────╯
// `;

//   if (isOwner) {
//     menu += `
// ╭─── *🔒 Commandes Propriétaire* ───╮
// │ *${PREFIX}restart*    🔄 Redémarrer le bot
// │ *${PREFIX}update*     📡 Mettre à jour
// │ *${PREFIX}broadcast*  📢 Message à tous
// ╰───────────────────╯
// `;
//   }

//   menu += `
// ╭───────────────────╮
// │ *🚀 Amusez-vous avec Aquila Bot !* 😎
// ╰───────────────────╯
//   `;
//   return menu;
// }

// async function showMenuImage(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);

//   // Define reply buttons (limited to 3)
//   const buttons = [
//     {
//       buttonId: `${PREFIX}general`,
//       buttonText: { displayText: '⚙️ Commandes Générales' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}multimedia`,
//       buttonText: { displayText: '🖼️ Multimédia' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}catalogue`,
//       buttonText: { displayText: '🛍️ Catalogue' },
//       type: 1,
//     },
//   ];

//   try {
//     const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//     await sock.sendMessage(sender, {
//       image: imageBuffer,
//       caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Amusez-vous avec Aquila Bot ! 😎',
//       buttons: buttons,
//       headerType: 4,
//     });
//   } catch (err) {
//     console.error('Erreur chargement image menu :', err.message);
//     await sock.sendMessage(sender, {
//       text: `${menuText}\n⚠️ Image du menu non chargée.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Amusez-vous avec Aquila Bot ! 😎',
//       buttons: buttons,
//       headerType: 1,
//     });
//   }
// }

// async function showMenuVideo(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);

//   // Define reply buttons (limited to 3)
//   const buttons = [
//     {
//       buttonId: `${PREFIX}general`,
//       buttonText: { displayText: '⚙️ Commandes Générales' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}multimedia`,
//       buttonText: { displayText: '🖼️ Multimédia' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}catalogue`,
//       buttonText: { displayText: '🛍️ Catalogue' },
//       type: 1,
//     },
//   ];

//   try {
//     const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//     await sock.sendMessage(sender, {
//       video: videoBuffer,
//       gifPlayback: true,
//       caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Amusez-vous avec Aquila Bot ! 😎',
//       buttons: buttons,
//       headerType: 5,
//     });
//   } catch (err) {
//     console.error('Erreur chargement GIF menu :', err.message);
//     try {
//       const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//       await sock.sendMessage(sender, {
//         image: imageBuffer,
//         caption: `${menuText}\n⚠️ GIF du menu non chargé.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//         footer: 'Amusez-vous avec Aquila Bot ! 😎',
//         buttons: buttons,
//         headerType: 4,
//       });
//     } catch (err) {
//       console.error('Erreur chargement image menu :', err.message);
//       await sock.sendMessage(sender, {
//         text: `${menuText}\n⚠️ Média du menu non chargé.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//         footer: 'Amusez-vous avec Aquila Bot ! 😎',
//         buttons: buttons,
//         headerType: 1,
//       });
//     }
//   }
// }

// export { showMenuImage, showMenuVideo };










// import fs from 'fs';

// export const CREATOR_CONTACT = 'https://wa.me/+24166813542';
// export const GROUP_INVITE = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5?mode=ems_copy_t';
// export const PREFIX = '.';
// export const MENU_IMAGE_PATH = './images/menu.jpg';
// export const MENU_VIDEO_PATH = './videos/senku1.mp4';
// export const CREATOR_JID = '24166813542@s.whatsapp.net';

// function generateMenuText(isOwner = false) {
//   let menu = `
// ╭─── *🌌 AQUILA BOT 🌟* ───╮
// │ *Créé par* : Essongue Yann Chéri  
// │ *Alias* : Essoya le prince myènè  
// │ 
// ╰───────────────────╯

// *📞 Contact* : ${CREATOR_CONTACT}  
// *👥 Groupe officiel* : ${GROUP_INVITE}

// ╭─── *⚙️ Commandes Générales* ───╮
// │ *${PREFIX}help*     📜 Afficher ce menu
// │ *${PREFIX}menu*     🎥 Menu animé (GIF)
// │ *${PREFIX}info*     ℹ️ Infos sur le bot
// │ *${PREFIX}creator*  🧑‍💻 Contact du créateur
// ╰───────────────────╯

// ╭─── *🖼️ Multimédia* ───╮
// │ *${PREFIX}sticker*   🎨 Image/vidéo → sticker
// │ *${PREFIX}image*     🖼️ Sticker → image
// │ *${PREFIX}video*     🎞️ Sticker animé → vidéo
// │ *${PREFIX}download*  ⬇️ Télécharger un statut
// │ *${PREFIX}tiktok <url>*  📹 Télécharger vidéo TikTok
// │ *${PREFIX}insta <url>*   📸 Télécharger vidéo Instagram
// │ *${PREFIX}gimage <req>*  🔎 Rechercher images Google
// ╰───────────────────╯

// ╭─── *🔍 Recherche* ───╮
// │ *${PREFIX}find <req>*  🔎 Rechercher sur Google
// ╰───────────────────╯

// ╭─── *🛍️ Catalogue* ───╮
// │ *${PREFIX}catalogue*  🛒 Voir tous les produits
// │ *${PREFIX}produit1*   📚 Azeva
// │ *${PREFIX}produit2*   📝 Oreniga
// │ *${PREFIX}produit3*   ✍️ Alissa CV-Letters
// │ *${PREFIX}produit4*   🏫 Alissa School
// │ *${PREFIX}produit5*   🔐 Décodeur64
// ╰───────────────────╯

// ╭─── *😄 Réactions Fun* ───╮
// │ *${PREFIX}react <emoji>* 😊 Réagir (ex: ${PREFIX}react 👍)
// │ *${PREFIX}laugh*    😂 Audio rire
// │ *${PREFIX}cry*      😢 Audio pleurs
// │ *${PREFIX}applaud*  👏 Audio applaudissements
// │ *${PREFIX}dorian*   👍 Sticker pouce
// │ *${PREFIX}gloglo*   😆 Sticker drôle
// │ *${PREFIX}zi*       😔 Sticker triste
// ╰───────────────────╯

// ╭─── *👥 Gestion Groupe (Admins)* ───╮
// │ *${PREFIX}join <lien>*      🤝 Rejoindre un groupe
// │ *${PREFIX}promote @user*    ⬆️ Promouvoir membre
// │ *${PREFIX}demote @user*     ⬇️ Rétrograder admin
// │ *${PREFIX}kick @user*       🚪 Retirer membre
// │ * Veuillez spécifier un utilisateur avec @user ou citer un message.
// │ *${PREFIX}add <numéro>*     ➕ Ajouter membre
// │ *${PREFIX}tagall [msg]*     🔔 Mentionner tous
// │ *${PREFIX}hidetag [msg]*    🔕 Mention discrète
// │ *${PREFIX}kickall*          🧹 Retirer non-admins
// │ *${PREFIX}antilink on|off*  🔗 Bloquer liens
// │ *${PREFIX}antiword on|off*  📜 Bloquer mots interdits
// │ *${PREFIX}welcome on|off*   👋 Messages bienvenue/au revoir
// │ *${PREFIX}block on|off*     🔒 Bloquer/débloquer groupe
// │ *${PREFIX}setclose hh:mm*   🌙 Fermeture auto
// │ *${PREFIX}setopen hh:mm*    ☀️ Ouverture auto
// │ *${PREFIX}delete*           🗑️ Supprimer message cité
// ╰───────────────────╯

// ╭─── *🤖 Mode IA* ───╮
// │ Posez une question ou envoyez une note vocale pour une réponse intelligente ! 💬
// │ *Note* : Si le mode IA est désactivé, le bot répondra "Désolé, je ne peux pas répondre pour le moment."
// ╰───────────────────╯

// ╭─── *🎉 Fonctionnalités Spéciales* ───╮
// │ *en cours..........
// ╰───────────────────╯

// ╭─── *🔥 Réactions Automatiques* ───╮
// │ *essoya* → 👍 Sticker pouce
// │ *zigh*  → 😔 Sticker triste
// │ *lol, mdr, haha, 😂, zoua, drôle, 🤣, gloria* → 😆 Sticker drôle
// │ *aigle* → 🦅 Audio aigle
// │ *ingrat* → 😣 Audio ingrat
// ╰───────────────────╯
// `;

//   if (isOwner) {
//     menu += `
// ╭─── *🔒 Commandes Propriétaire* ───╮
// │ *${PREFIX}gemini on|off*  🤖 Activer/désactiver IA
// │ *${PREFIX}restart*        🔄 Redémarrer le bot
// │ *${PREFIX}update*         📡 Mettre à jour
// │ *${PREFIX}broadcast <msg>* 📢 Message à tous
// ╰───────────────────╯
// `;
//   }

//   menu += `
// ╭───────────────────╮
// │ *🚀 Amusez-vous avec Aquila Bot !* 😎
// ╰───────────────────╯
//   `;
//   return menu;
// }

// async function showMenuImage(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);

//   // Define reply buttons
//   const buttons = [
//     {
//       buttonId: `${PREFIX}general`,
//       buttonText: { displayText: '⚙️ Commandes Générales' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}multimedia`,
//       buttonText: { displayText: '🖼️ Multimédia' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}join ${GROUP_INVITE}`,
//       buttonText: { displayText: '👥 Rejoindre le Groupe' },
//       type: 1,
//     },
//   ];

//   try {
//     const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//     await sock.sendMessage(sender, {
//       image: imageBuffer,
//       caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Amusez-vous avec Aquila Bot ! 😎',
//       buttons: buttons,
//       headerType: 4,
//     });
//   } catch (err) {
//     console.error('Erreur chargement image menu :', err.message);
//     await sock.sendMessage(sender, {
//       text: `${menuText}\n⚠️ Image du menu non chargée.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Amusez-vous avec Aquila Bot ! 😎',
//       buttons: buttons,
//       headerType: 1,
//     });
//   }
// }

// async function showMenuVideo(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);

//   // Define reply buttons
//   const buttons = [
//     {
//       buttonId: `${PREFIX}general`,
//       buttonText: { displayText: '⚙️ Commandes Générales' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}multimedia`,
//       buttonText: { displayText: '🖼️ Multimédia' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}join ${GROUP_INVITE}`,
//       buttonText: { displayText: '👥 Rejoindre le Groupe' },
//       type: 1,
//     },
//   ];

//   try {
//     const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//     await sock.sendMessage(sender, {
//       video: videoBuffer,
//       gifPlayback: true,
//       caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Amusez-vous avec Aquila Bot ! 😎',
//       buttons: buttons,
//       headerType: 5,
//     });
//   } catch (err) {
//     console.error('Erreur chargement GIF menu :', err.message);
//     try {
//       const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//       await sock.sendMessage(sender, {
//         image: imageBuffer,
//         caption: `${menuText}\n⚠️ GIF du menu non chargé.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//         footer: 'Amusez-vous avec Aquila Bot ! 😎',
//         buttons: buttons,
//         headerType: 4,
//       });
//     } catch (err) {
//       console.error('Erreur chargement image menu :', err.message);
//       await sock.sendMessage(sender, {
//         text: `${menuText}\n⚠️ Média du menu non chargé.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//         footer: 'Amusez-vous avec Aquila Bot ! 😎',
//         buttons: buttons,
//         headerType: 1,
//       });
//     }
//   }
// }

// export { showMenuImage, showMenuVideo };









// import fs from 'fs';

// export const CREATOR_CONTACT = 'https://wa.me/+24166813542';
// export const GROUP_INVITE = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5?mode=ems_copy_t';
// export const PREFIX = '.';
// export const MENU_IMAGE_PATH = './images/menu.jpg';
// export const MENU_VIDEO_PATH = './videos/senku1.mp4';
// export const CREATOR_JID = '24166813542@s.whatsapp.net';

// function generateMenuText(isOwner = false) {
//   let menu = `
// ╔═══════ ✧ *AQUILA BOT* ✧ ═══════╗
// ║ *Créateur* : Essongue Yann Chéri   ║
// ║ *Surnom* : Essoya, Prince Myènè   ║
// ║ *Version* : 6.0.1                 ║
// ╚═══════════════════════════════════╝

// 📞 *Contact Créateur* : ${CREATOR_CONTACT}  
// 👥 *Groupe Officiel* : ${GROUP_INVITE}

// ✨ *Bienvenue dans l'univers d'Aquila Bot !* ✨
// Ce bot polyvalent offre des fonctionnalités avancées pour gérer vos groupes, créer des contenus multimédias et interagir de manière ludique et intelligente ! Explorez les commandes ci-dessous pour découvrir tout ce qu'Aquila peut faire pour vous.

// ═══════════════════════════════════════
// 🌟 *Commandes Générales* 🌟
// ═══════════════════════════════════════
// │ *${PREFIX}help*      📜 Afficher ce menu détaillé
// │ *${PREFIX}menu*      🎬 Menu animé en GIF
// │ *${PREFIX}info*      ℹ️ Informations sur le bot
// │ *${PREFIX}creator*   🧑‍💻 Contacter le créateur
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 🎨 *Multimédia et Téléchargements* 🎨
// ═══════════════════════════════════════
// │ *${PREFIX}sticker*    🖼️ Convertir image/vidéo en sticker
// │ *${PREFIX}image*      🖼️ Transformer sticker en image
// │ *${PREFIX}video*      🎞️ Convertir sticker animé en vidéo
// │ *${PREFIX}download*   ⬇️ Télécharger un statut WhatsApp
// │ *${PREFIX}tiktok <url>* 📹 Télécharger une vidéo TikTok
// │ *${PREFIX}gimage <terme>* 🔎 Recherche d'images Google
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 🔎 *Recherche et Exploration* 🔎
// ═══════════════════════════════════════
// │ *${PREFIX}find <terme>* 🔎 Effectuer une recherche Google
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 🛒 *Catalogue des Produits* 🛒
// ═══════════════════════════════════════
// │ *${PREFIX}catalogue*  📋 Afficher tous les produits
// │ *${PREFIX}produit1*   📚 Azeva : Solution éducative
// │ *${PREFIX}produit2*   📝 Oreniga : Outils d'écriture
// │ *${PREFIX}produit3*   ✍️ Alissa CV-Letters : Création CV
// │ *${PREFIX}produit4*   🏫 Alissa School : Gestion scolaire
// │ *${PREFIX}produit5*   🔐 Décodeur64 : Sécurité numérique
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 😄 *Réactions et Divertissements* 😄
// ═══════════════════════════════════════
// │ *${PREFIX}react <emoji>* 😊 Réagir avec un emoji (ex: ${PREFIX}react 👍)
// │ *${PREFIX}laugh*         😂 Audio de rire
// │ *${PREFIX}cry*           😢 Audio de pleurs
// │ *${PREFIX}applaud*       👏 Audio d'applaudissements
// │ *${PREFIX}dorian*        👍 Sticker pouce levé
// │ *${PREFIX}gloglo*        😆 Sticker drôle
// │ *${PREFIX}zi*            😔 Sticker triste
// │ *${PREFIX}setstatut [drole|triste|autre|random]* 📱 Définir un statut WhatsApp
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 👑 *Gestion de Groupe (Admins Uniquement)* 👑
// ═══════════════════════════════════════
// │ *${PREFIX}join <lien>*       🤝 Rejoindre un groupe via lien
// │ *${PREFIX}promote @user*     ⬆️ Promouvoir un membre en admin
// │ *${PREFIX}demote @user*      ⬇️ Rétrograder un admin
// │ *${PREFIX}kick @user*        🚪 Expulser un membre (@user ou citer)
// │ *${PREFIX}add <numéro>*      ➕ Ajouter un membre (format international)
// │ *${PREFIX}tagall [msg]*      🔔 Mentionner tous les membres
// │ *${PREFIX}hidetag [msg]*     🔕 Mention discrète de tous
// │ *${PREFIX}kickall*           🧹 Expulser tous les non-admins
// │ *${PREFIX}antilink on|off*   🔗 Activer/désactiver blocage des liens
// │ *${PREFIX}antiword on|off*   📜 Activer/désactiver blocage des mots interdits
// │ *${PREFIX}welcome on|off*    👋 Activer/désactiver messages de bienvenue/au revoir
// │ *${PREFIX}block on|off*      🔒 Verrouiller/déverrouiller le groupe
// │ *${PREFIX}setclose hh:mm*    🌙 Programmer la fermeture automatique
// │ *${PREFIX}setopen hh:mm*     ☀️ Programmer l'ouverture automatique
// │ *${PREFIX}delete*            🗑️ Supprimer un message cité
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 🤖 *Mode Intelligence Artificielle* 🤖
// ═══════════════════════════════════════
// │ Posez une question ou envoyez une note vocale pour une réponse intelligente ! 💬
// │ *Note* : Si le mode IA est désactivé, le bot répondra : "Désolé, je ne peux pas répondre pour le moment."
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 🎉 *Fonctionnalités Spéciales* 🎉
// ═══════════════════════════════════════
// │ *En cours............................
// ╰──────────────────────────────────────╯

// ═══════════════════════════════════════
// 🔥 *Réactions Automatiques* 🔥
// ═══════════════════════════════════════
// │ *essoya* → 👍 Sticker pouce levé
// │ *zigh*  → 😔 Sticker triste
// │ *lol, mdr, haha, 😂, zoua, drôle, 🤣, gloria* → 😆 Sticker drôle
// │ *aigle* → 🦅 Audio d'aigle
// │ *ingrat* → 😣 Audio ingrat
// ╰──────────────────────────────────────╯
// `;

//   if (isOwner) {
//     menu += `
// ═══════════════════════════════════════
// 🔒 *Commandes Réservées au Créateur* 🔒
// ═══════════════════════════════════════
// │ *${PREFIX}gemini on|off*   🤖 Activer/désactiver le mode IA
// │ *${PREFIX}restart*         🔄 Redémarrer le bot
// │ *${PREFIX}update*          📡 Lancer une mise à jour
// │ *${PREFIX}broadcast <msg>* 📢 Envoyer un message à tous
// ╰──────────────────────────────────────╯
// `;
//   }

//   menu += `
// ╔═══════════════════════════════════╗
// ║ *🚀 Plongez dans l'aventure avec Aquila Bot !* 😎
// ╚═══════════════════════════════════╝
//   `;
//   return menu;
// }

// async function showMenuImage(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);

//   // Define reply buttons
//   const buttons = [
//     {
//       buttonId: `${PREFIX}general`,
//       buttonText: { displayText: '⚙️ Commandes Générales' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}multimedia`,
//       buttonText: { displayText: '🎨 Multimédia' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}join ${GROUP_INVITE}`,
//       buttonText: { displayText: '👥 Rejoindre le Groupe' },
//       type: 1,
//     },
//   ];

//   try {
//     const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//     await sock.sendMessage(sender, {
//       image: imageBuffer,
//       caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande pour commencer !*`,
//       footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
//       buttons: buttons,
//       headerType: 4,
//     });
//   } catch (err) {
//     console.error('Erreur lors du chargement de l\'image du menu :', err.message);
//     await sock.sendMessage(sender, {
//       text: `${menuText}\n⚠️ Impossible de charger l'image du menu.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//       footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
//       buttons: buttons,
//       headerType: 1,
//     });
//   }
// }

// async function showMenuVideo(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);

//   // Define reply buttons
//   const buttons = [
//     {
//       buttonId: `${PREFIX}general`,
//       buttonText: { displayText: '⚙️ Commandes Générales' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}multimedia`,
//       buttonText: { displayText: '🎨 Multimédia' },
//       type: 1,
//     },
//     {
//       buttonId: `${PREFIX}join ${GROUP_INVITE}`,
//       buttonText: { displayText: '👥 Rejoindre le Groupe' },
//       type: 1,
//     },
//   ];

//   try {
//     const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//     await sock.sendMessage(sender, {
//       video: videoBuffer,
//       gifPlayback: true,
//       caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande pour commencer !*`,
//       footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
//       buttons: buttons,
//       headerType: 5,
//     });
//   } catch (err) {
//     console.error('Erreur lors du chargement du GIF du menu :', err.message);
//     try {
//       const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//       await sock.sendMessage(sender, {
//         image: imageBuffer,
//         caption: `${menuText}\n⚠️ Impossible de charger le GIF du menu.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//         footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
//         buttons: buttons,
//         headerType: 4,
//       });
//     } catch (err) {
//       console.error('Erreur lors du chargement de l\'image du menu :', err.message);
//       await sock.sendMessage(sender, {
//         text: `${menuText}\n⚠️ Impossible de charger le média du menu.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
//         footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
//         buttons: buttons,
//         headerType: 1,
//       });
//     }
//   }
// }

// export { showMenuImage, showMenuVideo };










import fs from 'fs';

export const CREATOR_CONTACT = 'https://wa.me/+24166813542';
export const GROUP_INVITE = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5?mode=ems_copy_t';
export const PREFIX = '.';
export const MENU_IMAGE_PATH = './images/menu.jpg';
export const MENU_VIDEO_PATH = './videos/senku1.mp4';
export const CREATOR_JID = '24166813542@s.whatsapp.net';

function generateMenuText(isOwner = false) {
  let menu = `
╔═══════ ✧ *AQUILA BOT* ✧ ═══════╗
║ *Créateur* : Essongue Yann Chéri   ║
║ *Surnom* : Essoya, Prince Myènè   ║
║ *Version* : 6.0.1                 ║
╚═══════════════════════════════════╝

📞 *Contact Créateur* : ${CREATOR_CONTACT}  
👥 *Groupe Officiel* : ${GROUP_INVITE}

✨ *Bienvenue dans l'univers d'Aquila Bot !* ✨
Ce bot polyvalent offre des fonctionnalités avancées pour gérer vos groupes, créer des contenus multimédias et interagir de manière ludique et intelligente ! Explorez les commandes ci-dessous pour découvrir tout ce qu'Aquila peut faire pour vous.

═══════════════════════════════════════
🌟 *Commandes Générales* 🌟
═══════════════════════════════════════
│ *${PREFIX}help*      📜 Afficher ce menu détaillé
│ *${PREFIX}menu*      🎬 Menu animé en vidéo
│ *${PREFIX}info*      ℹ️ Informations sur le bot
│ *${PREFIX}creator*   🧑‍💻 Contacter le créateur
│ *${PREFIX}alive*     ✅ Vérifier si le bot est en ligne
╰──────────────────────────────────────╯

═══════════════════════════════════════
🎨 *Multimédia et Téléchargements* 🎨
═══════════════════════════════════════
│ *${PREFIX}sticker*    🖼️ Convertir image/vidéo en sticker
│ *${PREFIX}image*      🖼️ Transformer sticker en image
│ *${PREFIX}download*   ⬇️ Télécharger un statut WhatsApp
│ *${PREFIX}tiktok <url>* 📹 Télécharger une vidéo TikTok
│ *${PREFIX}jolie*       🌟 Envoyer une vidéo "jolie" aléatoire
│ *${PREFIX}musique*    🎵 Envoyer une musique aléatoire
╰──────────────────────────────────────╯

═══════════════════════════════════════
🔎 *Recherche et Exploration* 🔎
═══════════════════════════════════════
│ *${PREFIX}find <terme>* 🔎 Effectuer une recherche Google
│ *${PREFIX}gimage <terme>* 🖼️ Recherche d'images Google
╰──────────────────────────────────────╯

═══════════════════════════════════════
🛒 *Catalogue des Produits* 🛒
═══════════════════════════════════════
│ *${PREFIX}catalogue*  📋 Afficher tous les produits
│ *${PREFIX}produit1*   📚 Azeva : Solution éducative
│ *${PREFIX}produit2*   📝 Oreniga : Inscription concours
│ *${PREFIX}produit3*   ✍️ Alissa CV-Letters : Création CV
│ *${PREFIX}produit4*   🏫 Alissa School : Gestion scolaire
│ *${PREFIX}produit5*   🔐 Décodeur64 : Encodeur/Décodeur base64
╰──────────────────────────────────────╯

═══════════════════════════════════════
😄 *Réactions et Divertissements* 😄
═══════════════════════════════════════
│ *${PREFIX}react <emoji>* 😊 Réagir avec un emoji (ex: ${PREFIX}react 👍)
│ *${PREFIX}laugh*         😂 Audio de rire
│ *${PREFIX}cry*           😢 Audio de pleurs
│ *${PREFIX}applaud*       👏 Audio d'applaudissements
│ *${PREFIX}dorian*        👍 Sticker pouce levé
│ *${PREFIX}gloglo*        😆 Sticker drôle
│ *${PREFIX}zi*            😔 Sticker triste
╰──────────────────────────────────────╯

═══════════════════════════════════════
👑 *Gestion de Groupe (Admins Uniquement)* 👑
═══════════════════════════════════════
│ *${PREFIX}join <lien>*       🤝 Rejoindre un groupe via lien
│ *${PREFIX}promote @user*     ⬆️ Promouvoir un membre en admin
│ *${PREFIX}demote @user*      ⬇️ Rétrograder un admin
│ *${PREFIX}kick @user*        🚪 Expulser un membre (@user ou citer)
│ *${PREFIX}add <numéro>*      ➕ Ajouter un membre (format international)
│ *${PREFIX}tagall [msg]*      🔔 Mentionner tous les membres
│ *${PREFIX}hidetag [msg]*     🔕 Mention discrète de tous
│ *${PREFIX}kickall*           🧹 Expulser tous les non-admins
│ *${PREFIX}antilink on|off*   🔗 Activer/désactiver blocage des liens
│ *${PREFIX}antiword on|off*   📜 Activer/désactiver blocage des mots interdits
│ *${PREFIX}welcome on|off*    👋 Activer/désactiver messages de bienvenue/au revoir
│ *${PREFIX}block on|off*      🔒 Verrouiller/déverrouiller le groupe
│ *${PREFIX}setclose hh:mm*    🌙 Programmer la fermeture automatique
│ *${PREFIX}setopen hh:mm*     ☀️ Programmer l'ouverture automatique
│ *${PREFIX}delete*            🗑️ Supprimer un message cité
│ *${PREFIX}online*            📱 Liste des membres (approximation en ligne)
│ *${PREFIX}stat*              📊 Statistiques du groupe et de l'utilisateur
╰──────────────────────────────────────╯

═══════════════════════════════════════
🤖 *Mode Intelligence Artificielle* 🤖
═══════════════════════════════════════
│ Posez une question ou envoyez une note vocale pour une réponse intelligente ! 💬
│ *${PREFIX}resetgemini*       🔄 Réinitialiser la limite quotidienne IA (admins)
│ *Note* : Si le mode IA est désactivé, le bot répondra : "Désolé, je ne peux pas répondre pour le moment."
╰──────────────────────────────────────╯

═══════════════════════════════════════
🔥 *Réactions Automatiques* 🔥
═══════════════════════════════════════
│ *essoya* → 👍 Sticker pouce levé
│ *zigh*  → 😔 Sticker triste
│ *lol, mdr, haha, 😂, zoua, drôle, 🤣, gloria* → 😆 Sticker drôle
│ *aigle* → 🦅 Audio d'aigle
│ *ingrat* → 😣 Audio ingrat
╰──────────────────────────────────────╯
`;

  if (isOwner) {
    menu += `
═══════════════════════════════════════
🔒 *Commandes Réservées au Créateur* 🔒
═══════════════════════════════════════
│ *${PREFIX}gemini on|off*   🤖 Activer/désactiver le mode IA
│ *${PREFIX}restart*         🔄 Redémarrer le bot
│ *${PREFIX}update*          📡 Lancer une mise à jour
│ *${PREFIX}broadcast <msg>* 📢 Envoyer un message à tous
╰──────────────────────────────────────╯
`;
  }

  menu += `
╔═══════════════════════════════════╗
║ *🚀 Plongez dans l'aventure avec Aquila Bot !* 😎
╚═══════════════════════════════════╝
  `;
  return menu;
}

async function showMenuImage(sock, sender) {
  const isOwner = sender === CREATOR_JID;
  const menuText = generateMenuText(isOwner);

  // Define reply buttons
  const buttons = [
    {
      buttonId: `${PREFIX}general`,
      buttonText: { displayText: '⚙️ Commandes Générales' },
      type: 1,
    },
    {
      buttonId: `${PREFIX}multimedia`,
      buttonText: { displayText: '🎨 Multimédia' },
      type: 1,
    },
    {
      buttonId: `${PREFIX}join ${GROUP_INVITE}`,
      buttonText: { displayText: '👥 Rejoindre le Groupe' },
      type: 1,
    },
  ];

  try {
    const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
    await sock.sendMessage(sender, {
      image: imageBuffer,
      caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande pour commencer !*`,
      footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
      buttons: buttons,
      headerType: 4,
    });
  } catch (err) {
    console.error('Erreur lors du chargement de l\'image du menu :', err.message);
    await sock.sendMessage(sender, {
      text: `${menuText}\n⚠️ Impossible de charger l'image du menu.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
      footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
      buttons: buttons,
      headerType: 1,
    });
  }
}

async function showMenuVideo(sock, sender) {
  const isOwner = sender === CREATOR_JID;
  const menuText = generateMenuText(isOwner);

  // Define reply buttons
  const buttons = [
    {
      buttonId: `${PREFIX}general`,
      buttonText: { displayText: '⚙️ Commandes Générales' },
      type: 1,
    },
    {
      buttonId: `${PREFIX}multimedia`,
      buttonText: { displayText: '🎨 Multimédia' },
      type: 1,
    },
    {
      buttonId: `${PREFIX}join ${GROUP_INVITE}`,
      buttonText: { displayText: '👥 Rejoindre le Groupe' },
      type: 1,
    },
  ];

  try {
    const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
    await sock.sendMessage(sender, {
      video: videoBuffer,
      gifPlayback: true,
      caption: `${menuText}\n📌 *Utilisez les boutons ci-dessous ou tapez une commande pour commencer !*`,
      footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
      buttons: buttons,
      headerType: 5,
    });
  } catch (err) {
    console.error('Erreur lors du chargement du GIF du menu :', err.message);
    try {
      const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
      await sock.sendMessage(sender, {
        image: imageBuffer,
        caption: `${menuText}\n⚠️ Impossible de charger le GIF du menu.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
        footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
        buttons: buttons,
        headerType: 4,
      });
    } catch (err) {
      console.error('Erreur lors du chargement de l\'image du menu :', err.message);
      await sock.sendMessage(sender, {
        text: `${menuText}\n⚠️ Impossible de charger le média du menu.\n📌 *Utilisez les boutons ci-dessous ou tapez une commande.*`,
        footer: 'Aquila Bot - Votre assistant intelligent ! 😎',
        buttons: buttons,
        headerType: 1,
      });
    }
  }
}

export { showMenuImage, showMenuVideo };