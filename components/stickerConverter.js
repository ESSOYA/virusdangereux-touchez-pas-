

// import fs from 'fs/promises';
// import path from 'path';
// import os from 'os';
// import { exec } from 'child_process';
// import { downloadContentFromMessage } from 'baileys';

// export async function mediaToSticker(sock, sender, quoted) {
//   if (!quoted) {
//     await sock.sendMessage(sender, {
//       text: "Veuillez citer une image ou une vidéo courte pour la convertir en sticker.",
//     });
//     return;
//   }

//   const isImage =
//     quoted.imageMessage ||
//     (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith("image/"));
//   const isVideo =
//     quoted.videoMessage ||
//     (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith("video/"));

//   if (!isImage && !isVideo) {
//     await sock.sendMessage(sender, {
//       text: "Le message cité n’est pas une image ou une vidéo courte valide.",
//     });
//     return;
//   }

//   let inputPath, outputPath;

//   try {
//     const mediaType = isImage ? "image" : "video";
//     const mediaMessage = isImage
//       ? quoted.imageMessage || quoted.documentMessage
//       : quoted.videoMessage || quoted.documentMessage;

//     if (!mediaMessage || !mediaMessage.mimetype) {
//       throw new Error("Message média invalide ou manquant.");
//     }

//     // Télécharger le média
//     const stream = await downloadContentFromMessage(mediaMessage, mediaType);
//     let buffer = Buffer.from([]);
//     for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//     inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? "jpg" : "mp4"}`);
//     outputPath = path.join(os.tmpdir(), `output_${Date.now()}.webp`);
//     await fs.writeFile(inputPath, buffer);

//     // Convertir avec ffmpeg
//     await new Promise((resolve, reject) => {
//       const cmd = isImage
//         ? `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0" -y -vcodec libwebp ${outputPath}`
//         : `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0" -loop 0 -t 8 -y -vcodec libwebp ${outputPath}`;

//       exec(cmd, (error) => {
//         if (error) return reject(error);
//         resolve();
//       });
//     });

//     const stickerBuffer = await fs.readFile(outputPath);
//     await sock.sendMessage(sender, { sticker: stickerBuffer });
//     await sock.sendMessage(sender, { text: "Voici votre sticker 🎉" });

//   } catch (err) {
//     console.error("Erreur sticker:", err.message);
//     await sock.sendMessage(sender, {
//       text: `Impossible de convertir en sticker : ${err.message}.`,
//     });
//   } finally {
//     // Nettoyer les fichiers temporaires
//     if (inputPath && await fs.access(inputPath).then(() => true).catch(() => false)) {
//       await fs.unlink(inputPath);
//     }
//     if (outputPath && await fs.access(outputPath).then(() => true).catch(() => false)) {
//       await fs.unlink(outputPath);
//     }
//   }
// }











import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { downloadContentFromMessage } from 'baileys';

const execPromise = promisify(exec);

export async function mediaToSticker(sock, sender, quoted) {
  if (!quoted) {
    await sock.sendMessage(sender, {
      text: "Veuillez citer une image ou une vidéo courte pour la convertir en sticker.",
    });
    return;
  }

  const isImage =
    quoted.imageMessage ||
    (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith("image/"));
  const isVideo =
    quoted.videoMessage ||
    (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith("video/"));

  if (!isImage && !isVideo) {
    await sock.sendMessage(sender, {
      text: "Le message cité n’est pas une image ou une vidéo courte valide.",
    });
    return;
  }

  let inputPath, outputPath;

  try {
    const mediaType = isImage ? "image" : "video";
    const mediaMessage = isImage
      ? quoted.imageMessage || quoted.documentMessage
      : quoted.videoMessage || quoted.documentMessage;

    if (!mediaMessage || !mediaMessage.mimetype) {
      throw new Error("Message média invalide ou manquant.");
    }

    // Télécharger le média
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? "jpg" : "mp4"}`);
    outputPath = path.join(os.tmpdir(), `output_${Date.now()}.webp`);
    await fs.writeFile(inputPath, buffer);

    // Convertir avec ffmpeg
    const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
    const cmd = isImage
      ? `${ffmpegPath} -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,format=rgba" -c:v libwebp -lossless 1 -q:v 100 -compression_level 6 -loop 0 -y "${outputPath}"`
      : `${ffmpegPath} -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1,format=rgba,fps=15" -c:v libwebp -lossless 1 -q:v 100 -compression_level 6 -loop 0 -t 8 -y "${outputPath}"`;

    await execPromise(cmd);

    const stickerBuffer = await fs.readFile(outputPath);
    await sock.sendMessage(sender, { sticker: stickerBuffer });
    await sock.sendMessage(sender, { text: "Voici votre sticker 🎉" });

  } catch (err) {
    console.error("Erreur sticker:", err.message);
    await sock.sendMessage(sender, {
      text: `Impossible de convertir en sticker : ${err.message}.`,
    });
  } finally {
    // Nettoyer les fichiers temporaires
    if (inputPath && await fs.access(inputPath).then(() => true).catch(() => false)) {
      await fs.unlink(inputPath);
    }
    if (outputPath && await fs.access(outputPath).then(() => true).catch(() => false)) {
      await fs.unlink(outputPath);
    }
  }
}