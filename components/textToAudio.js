
// import fs from 'fs';
// import path from 'path';
// import gTTS from 'gtts';
// import ffmpeg from 'fluent-ffmpeg';

//     async function textToAudio(text, lang = 'fr') {
//         return new Promise((resolve, reject) => {
//             try {
//                 const tmpMp3 = path.join(__dirname, `tts_${Date.now()}.mp3`);
//                 const tmpOgg = path.join(__dirname, `tts_${Date.now()}.ogg`);
//                 const gtts = new gTTS(text, lang);

//                 gtts.save(tmpMp3, function (err) {
//                     if (err) return reject(err);

//                     // Conversion MP3 -> OGG Opus
//                     ffmpeg(tmpMp3)
//                         .audioCodec('libopus')
//                         .format('ogg')
//                         .on('end', () => {
//                             const buffer = fs.readFileSync(tmpOgg);
//                             fs.unlinkSync(tmpMp3);
//                             fs.unlinkSync(tmpOgg);
//                             resolve(buffer);
//                         })
//                         .on('error', (err) => reject(err))
//                         .save(tmpOgg);
//                 });
//             } catch (err) {
//                 reject(err);
//             }
//         });
//     }

//     export{ textToAudio };






import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import gTTS from 'gtts';
import ffmpeg from 'fluent-ffmpeg';

// Définir __dirname pour ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour convertir texte en audio OGG (Opus)
export async function textToAudio(text, lang = 'fr') {
  return new Promise((resolve, reject) => {
    try {
      // Chemins temporaires
      const timestamp = Date.now();
      const tmpMp3 = path.join(__dirname, `tts_${timestamp}.mp3`);
      const tmpOgg = path.join(__dirname, `tts_${timestamp}.ogg`);

      // Générer le MP3 avec gTTS
      const speech = new gTTS(text, lang);
      speech.save(tmpMp3, (err) => {
        if (err) return reject(err);

        // Conversion MP3 -> OGG Opus
        ffmpeg(tmpMp3)
          .audioCodec('libopus')
          .format('ogg')
          .on('end', () => {
            try {
              const buffer = fs.readFileSync(tmpOgg);
              // Nettoyer les fichiers temporaires
              fs.unlinkSync(tmpMp3);
              fs.unlinkSync(tmpOgg);
              resolve(buffer);
            } catch (err) {
              reject(err);
            }
          })
          .on('error', (err) => reject(err))
          .save(tmpOgg);
      });
    } catch (err) {
      reject(err);
    }
  });
}
