
// import 'dotenv/config';
// import axios from 'axios';
// import { CohereClient } from 'cohere-ai';

// // Contact du créateur pour logs
// export const CREATOR_CONTACT = '24106813542@s.whatsapp.net';

// // Gestion multi-clés depuis le .env
// export const GEMINI_KEYS = process.env.GEMINI_API_KEYS?.split(',').filter(Boolean) || [];
// export const COHERE_KEYS = process.env.CO_API_KEY?.split(',').filter(Boolean) || [];

// export const blockedGeminiKeys = {};
// export const blockedCohereKeys = {};
// export const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes

// // ---------- SUPPRESSION DES EMOJIS ----------
// function removeEmojis(text) {
//     return text.replace(
//         /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
//         ''
//     ).trim();
// }

// // ---------- LOG VERS LE CRÉATEUR ----------
// async function sendLogToCreator(message) {
//     console.log(`[LOG vers créateur] ${message}`);
//     // Intégrer ici l'envoi réel WhatsApp si nécessaire
// }

// // ---------- DÉTERMINATION DU CONTEXTE DE L'UTILISATEUR ----------
// function determineUserContext(input, isAudio = false) {
//     // Si c'est une note vocale et pas encore de retranscription, utiliser un contexte par défaut
//     if (isAudio && (!input || input === '')) {
//         return 'L’utilisateur a envoyé une note vocale. Retranscrivez-la et répondez en fonction du contenu.';
//     }

//     const lowerInput = (input || '').toLowerCase();
//     let context = '';

//     if (isAudio) {
//         context = 'L’utilisateur a envoyé une note vocale. Retranscrivez-la et répondez en fonction du contenu.';
//     } else if (lowerInput.includes('aide') || lowerInput.includes('comment')) {
//         context = 'Vous semblez avoir besoin d’aide ou d’explications. Je vais répondre de manière claire et détaillée.';
//     } else if (lowerInput.includes('blague') || lowerInput.includes('drôle')) {
//         context = 'Vous cherchez quelque chose de drôle ! Je vais répondre avec humour et légèreté.';
//     } else if (lowerInput.includes('info') || lowerInput.includes('savoir')) {
//         context = 'Vous voulez en savoir plus. Je vais fournir une réponse informative et concise.';
//     } else {
//         context = 'Je vais répondre de manière amicale et naturelle, adaptée à votre demande.';
//     }

//     return context;
// }

// // ---------- SYSTEM PROMPT DYNAMIQUE ----------
// function getSystemPrompt(isCreator, input, isAudio = false) {
//     const userContext = determineUserContext(input, isAudio);
//     let basePrompt = `
// Vous êtes Aquila Bot, créé par Essoya le prince myènè.
// Assistant WhatsApp amical et drôle.
// ${isCreator ? "Adressez-vous à l'utilisateur comme 'Mon créateur'." 
//             : `Répondez en tenant compte du contexte suivant : ${userContext}`}
// `;

//     if (isAudio) basePrompt += " Retranscrivez la note vocale et répondez en fonction de son contenu. N'utilisez pas d'emojis dans vos réponses.";

//     return basePrompt;
// }

// // ---------- FONCTION COHERE ----------
// async function askCohereFallback(input, sender, isAudio = false, audioTranscription = null) {
//     const now = Date.now();
//     const isCreator = sender === CREATOR_CONTACT;
//     const question = isAudio ? audioTranscription || "Contenu audio non retranscrit" : input || "Demande non spécifiée";

//     let prompt = `${getSystemPrompt(isCreator, question, isAudio)}\nQuestion: ${question}`;

//     // Pour les utilisateurs, on ajoute les commandes en bas
//     if (!isCreator && !isAudio) {
//         prompt += "\n\nN'oublie pas : commandes disponibles -> .menu pour le menu, .catalogue pour voir les réalisations du maître.";
//     }

//     for (const key of COHERE_KEYS) {
//         if (blockedCohereKeys[key] && blockedCohereKeys[key] > now) continue;

//         try {
//             const cohere = new CohereClient({ apiKey: key });
//             const response = await cohere.chat({
//                 model: "command-xlarge-nightly",
//                 message: prompt
//             });

//             const text = response.text || 'Désolé, je n’ai pas compris.';
//             await sendLogToCreator(`[Cohere] Réponse envoyée à ${sender}: ${text}`);
//             return text;

//         } catch (err) {
//             console.error(`[Cohere] Erreur avec clé ${key}:`, err.message);
//             blockedCohereKeys[key] = now + BLOCK_TIME;
//         }
//     }

//     return 'Toutes les clés Cohere ont échoué.';
// }

// // ---------- FONCTION GEMINI ----------
// async function askGemini(input, sender, audioData = null) {
//     const now = Date.now();
//     const isCreator = sender === CREATOR_CONTACT;
//     const isAudio = !!audioData;

//     // Utiliser une chaîne vide par défaut pour input si non défini
//     const safeInput = input || '';
//     let audioTranscription = null;
//     const parts = [{ text: getSystemPrompt(isCreator, safeInput, isAudio) }];

//     if (isAudio) {
//         // Demander à Gemini de retranscrire l'audio
//         parts.push({ text: "Retranscrivez la note vocale et répondez en fonction de son contenu." });
//         parts.push({ inline_data: { mime_type: "audio/ogg", data: audioData.toString('base64') } });
//     } else {
//         parts.push({ text: safeInput });
//     }

//     for (const key of GEMINI_KEYS) {
//         if (blockedGeminiKeys[key] && blockedCohereKeys[key] > now) continue;

//         try {
//             const response = await axios.post(
//                 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//                 { contents: [{ parts }] },
//                 { headers: { 'X-goog-api-key': key, 'Content-Type': 'application/json' } }
//             );

//             let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

//             // Extraire la retranscription si audio
//             if (isAudio) {
//                 const transcriptionMatch = text.match(/Transcription\s*:\s*([\s\S]*?)(?:\n\n|\n|$)/i);
//                 audioTranscription = transcriptionMatch ? transcriptionMatch[1].trim() : text;
//                 text = removeEmojis(text);
//             }

//             // Pour les utilisateurs, ajout des commandes en bas si ce n'est pas audio
//             if (!isCreator && !isAudio) {
//                 text += "\n\nN'oublie pas : commandes disponibles -> .menu pour le menu, .catalogue pour voir les réalisations du maître.";
//             }

//             if (text) {
//                 await sendLogToCreator(`[Gemini] Réponse envoyée à ${sender}: ${text}${isAudio ? ` (Transcription: ${audioTranscription})` : ''}`);
//                 return text;
//             }

//         } catch (err) {
//             console.error(`[Gemini] Erreur avec clé ${key}:`, err.message);

//             if ([429, 403].includes(err.response?.status)) {
//                 blockedGeminiKeys[key] = now + BLOCK_TIME;
//             }
//         }
//     }

//     // Fallback Cohere
//     return await askCohereFallback(safeInput, sender, isAudio, audioTranscription);
// }





// export { askGemini };








import 'dotenv/config';
import axios from 'axios';
import { CohereClient } from 'cohere-ai';

// Contact du créateur pour logs
export const CREATOR_CONTACT =process.env.CREATOR_CONTACT;

// Gestion multi-clés depuis le .env
export const GEMINI_KEYS = process.env.GEMINI_API_KEYS?.split(',').filter(Boolean) || [];
export const COHERE_KEYS = process.env.CO_API_KEY?.split(',').filter(Boolean) || [];

export const blockedGeminiKeys = {};
export const blockedCohereKeys = {};
export const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes

// ---------- SUPPRESSION DES EMOJIS ----------
function removeEmojis(text) {
    return text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
        ''
    ).trim();
}

// ---------- LOG VERS LE CRÉATEUR ----------
async function sendLogToCreator(message) {
    console.log(`[LOG vers créateur] ${message}`);
    // Intégrer ici l'envoi réel WhatsApp si nécessaire
}

// ---------- DÉTERMINATION DU CONTEXTE DE L'UTILISATEUR ----------
function determineUserContext(input, isAudio = false, isImage = false) {
    if (isImage) {
        return 'L’utilisateur a envoyé une image. Décrivez son contenu et fournissez une analyse pertinente.';
    }
    if (isAudio && (!input || input === '')) {
        return 'L’utilisateur a envoyé une note vocale. Retranscrivez-la et répondez en fonction du contenu.';
    }

    const lowerInput = (input || '').toLowerCase();
    let context = '';

    if (isAudio) {
        context = 'L’utilisateur a envoyé une note vocale. Retranscrivez-la et répondez en fonction du contenu.';
    } else if (lowerInput.includes('aide') || lowerInput.includes('comment')) {
        context = 'Vous semblez avoir besoin d’aide ou d’explications. Je vais répondre de manière claire et détaillée.';
    } else if (lowerInput.includes('blague') || lowerInput.includes('drôle')) {
        context = 'Vous cherchez quelque chose de drôle ! Je vais répondre avec humour et légèreté.';
    } else if (lowerInput.includes('info') || lowerInput.includes('savoir')) {
        context = 'Vous voulez en savoir plus. Je vais fournir une réponse informative et concise.';
    } else {
        context = 'Je vais répondre de manière amicale et naturelle, adaptée à votre demande.';
    }

    return context;
}

// ---------- SYSTEM PROMPT DYNAMIQUE ----------
function getSystemPrompt(isCreator, input, isAudio = false, isImage = false) {
    const userContext = determineUserContext(input, isAudio, isImage);
    let basePrompt = `
Vous êtes Aquila Bot, créé par Essoya le prince myènè.
Assistant WhatsApp amical et drôle.
${isCreator ? "Adressez-vous à l'utilisateur comme 'Mon créateur'." 
            : `Répondez en tenant compte du contexte suivant : ${userContext}`}
`;

    if (isAudio) basePrompt += " Retranscrivez la note vocale et répondez en fonction de son contenu. N'utilisez pas d'emojis dans vos réponses.";
    if (isImage) basePrompt += " Décrivez l'image fournie et fournissez une analyse pertinente. N'utilisez pas d'emojis dans vos réponses.";

    return basePrompt;
}

// ---------- FONCTION COHERE ----------
async function askCohereFallback(input, sender, isAudio = false, audioTranscription = null) {
    const now = Date.now();
    const isCreator = sender === CREATOR_CONTACT;
    const question = isAudio ? audioTranscription || "Contenu audio non retranscrit" : input || "Demande non spécifiée";

    let prompt = `${getSystemPrompt(isCreator, question, isAudio)}\nQuestion: ${question}`;

    // Pour les utilisateurs, on ajoute les commandes en bas
    if (!isCreator && !isAudio) {
        prompt += "\n\nN'oublie pas : commandes disponibles -> .menu pour le menu, .catalogue pour voir les réalisations du maître.";
    }

    for (const key of COHERE_KEYS) {
        if (blockedCohereKeys[key] && blockedCohereKeys[key] > now) continue;

        try {
            const cohere = new CohereClient({ apiKey: key });
            const response = await cohere.chat({
                model: "command-xlarge-nightly",
                message: prompt
            });

            const text = response.text || 'Désolé, je n’ai pas compris.';
            await sendLogToCreator(`[Cohere] Réponse envoyée à ${sender}: ${text}`);
            return text;

        } catch (err) {
            console.error(`[Cohere] Erreur avec clé ${key}:`, err.message);
            blockedCohereKeys[key] = now + BLOCK_TIME;
        }
    }

    return 'Toutes les clés Cohere ont échoué.';
}

// ---------- FONCTION GEMINI UNIFIÉE ----------
export async function askGemini(input, sender, audioBuffer = null, lastMessage = null, base64Image = null) {
    const now = Date.now();
    const isCreator = sender === CREATOR_CONTACT;
    const isAudio = !!audioBuffer;
    const isImage = !!base64Image;

    // Utiliser une chaîne vide par défaut pour input si non défini
    const safeInput = input || (isImage ? 'Décris cette image' : '');
    let audioTranscription = null;
    const parts = [{ text: getSystemPrompt(isCreator, safeInput, isAudio, isImage) }];

    if (isAudio) {
        parts.push({ text: "Retranscrivez la note vocale et répondez en fonction de son contenu." });
        parts.push({ inline_data: { mime_type: "audio/ogg", data: audioBuffer.toString('base64') } });
    } else if (isImage) {
        parts.push({ text: safeInput });
        parts.push({ inline_data: { mime_type: "image/jpeg", data: base64Image } });
    } else {
        parts.push({ text: safeInput });
    }

    // Ajouter l'historique si fourni
    if (lastMessage) {
        parts.push({ text: `Historique de la conversation : ${lastMessage}` });
    }

    for (const key of GEMINI_KEYS) {
        if (blockedGeminiKeys[key] && blockedGeminiKeys[key] > now) continue;

        try {
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                { contents: [{ parts }] },
                { headers: { 'X-goog-api-key': key, 'Content-Type': 'application/json' } }
            );

            let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Extraire la retranscription si audio
            if (isAudio) {
                const transcriptionMatch = text.match(/Transcription\s*:\s*([\s\S]*?)(?:\n\n|\n|$)/i);
                audioTranscription = transcriptionMatch ? transcriptionMatch[1].trim() : text;
                text = removeEmojis(text);
            } else if (isImage) {
                text = removeEmojis(text); // Supprimer les emojis pour les images aussi
            }

            // Pour les utilisateurs, ajout des commandes en bas si ce n'est pas audio ni image
            if (!isCreator && !isAudio && !isImage) {
                text += "\n\nN'oublie pas : commandes disponibles -> .menu pour le menu, .catalogue pour voir les réalisations du maître.";
            }

            if (text) {
                await sendLogToCreator(`[Gemini] Réponse envoyée à ${sender}: ${text}${isAudio ? ` (Transcription: ${audioTranscription})` : ''}${isImage ? ` (Image analysée)` : ''}`);
                return text;
            }

        } catch (err) {
            console.error(`[Gemini] Erreur avec clé ${key}:`, err.message);

            if ([429, 403].includes(err.response?.status)) {
                blockedGeminiKeys[key] = now + BLOCK_TIME;
            }
        }
    }

    // Fallback Cohere si Gemini échoue (uniquement pour texte ou audio)
    if (!isImage) {
        return await askCohereFallback(safeInput, sender, isAudio, audioTranscription);
    }

    return 'Désolé, une erreur est survenue lors de l\'analyse de l\'image.';
}
