

// import { downloadContentFromMessage } from 'baileys';
// import fs from 'fs/promises';
// import { exec as execCallback } from 'child_process';
// import path from 'path';
// import os from 'os';
// import util from 'util';

// export const execAsync = util.promisify(execCallback);

// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
//         await sock.sendMessage(sender, {
//             text: 'Veuillez citer un sticker animé pour le convertir en vidéo.'
//         });
//         return;
//     }

//     let inputPath, outputPath;

//     try {
//         // Vérifier si FFmpeg est disponible
//         await execAsync('ffmpeg -version').catch(() => {
//             throw new Error('FFmpeg n\'est pas installé sur le serveur.');
//         });

//         // Télécharger le sticker
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) {
//             buffer = Buffer.concat([buffer, chunk]);
//         }

//         if (buffer.length === 0) {
//             throw new Error('Le sticker téléchargé est vide.');
//         }
//         if (buffer.length > 5 * 1024 * 1024) {
//             throw new Error('Le sticker est trop volumineux (max 5 Mo).');
//         }

//         inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);

//         await fs.writeFile(inputPath, buffer);

//         // Convertir en vidéo avec options optimisées
//         const ffmpegCmd = `ffmpeg -i ${inputPath} -c:v libx264 -vf scale=320:320 -crf 28 -pix_fmt yuv420p -movflags +faststart -t 10 ${outputPath}`;
//         await execAsync(ffmpegCmd);

//         if (!await fs.access(outputPath).then(() => true).catch(() => false)) {
//             throw new Error('La conversion en vidéo a échoué.');
//         }

//         const videoBuffer = await fs.readFile(outputPath);
//         if (videoBuffer.length === 0) {
//             throw new Error('Le fichier vidéo est vide.');
//         }

//         await sock.sendMessage(sender, {
//             video: videoBuffer,
//             mimetype: 'video/mp4',
//             caption: 'Voici votre vidéo convertie !'
//         });

//     } catch (err) {
//         console.error('Erreur lors de la conversion:', err.message);
//         await sock.sendMessage(sender, {
//             text: `Erreur : ${err.message}`
//         });
//     } finally {
//         // Nettoyage
//         try {
//             if (inputPath && await fs.access(inputPath).then(() => true).catch(() => false)) {
//                 await fs.unlink(inputPath);
//             }
//             if (outputPath && await fs.access(outputPath).then(() => true).catch(() => false)) {
//                 await fs.unlink(outputPath);
//             }
//         } catch (cleanupErr) {
//             console.error('Erreur lors du nettoyage:', cleanupErr.message);
//         }
//     }
// }

// export { stickerToVideo };






import { downloadContentFromMessage } from 'baileys';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec as execCallback } from 'child_process';
import util from 'util';
import axios from 'axios';
import FormData from 'form-data';
import { load } from 'cheerio';

const execAsync = util.promisify(execCallback);

async function isAnimatedWebP(buffer) {
    // Check for WebP signature (RIFF and WEBP)
    const webpSignature = buffer.slice(0, 12).toString('hex').toUpperCase();
    if (!webpSignature.startsWith('52494646') || !webpSignature.includes('57454250')) {
        return { valid: false, reason: 'Not a WebP file' };
    }

    // Check for ANIM and ANMF chunks (indicating animated WebP)
    const bufferString = buffer.toString('ascii');
    if (bufferString.includes('ANIM') && bufferString.includes('ANMF')) {
        return { valid: true, animated: true };
    }
    return { valid: true, animated: false, reason: 'Not an animated WebP' };
}

async function webp2mp4File(path, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const form = new FormData();
            form.append('new-image-url', '');
            form.append('new-image', fs.createReadStream(path));
            const response = await axios({
                method: 'post',
                url: 'https://s6.ezgif.com/webp-to-mp4',
                data: form,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
                },
                timeout: 30000
            });

            if (response.status !== 200) {
                console.error(`ezgif.com upload failed with status ${response.status}:`, response.statusText);
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const $ = load(response.data);
            const file = $('input[name="file"]').attr('value');
            if (!file) {
                console.error('ezgif.com response HTML:', response.data);
                throw new Error('Failed to retrieve file token from ezgif.com');
            }

            const bodyFormThen = new FormData();
            bodyFormThen.append('file', file);
            bodyFormThen.append('convert', 'Convert WebP to MP4!');
            const conversionResponse = await axios({
                method: 'post',
                url: `https://ezgif.com/webp-to-mp4/${file}`,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
                },
                timeout: 30000
            });

            const $conversion = load(conversionResponse.data);
            const result = 'https:' + $conversion('div#output > p.outfile > video > source').attr('src');
            if (!result) {
                console.error('ezgif.com conversion response HTML:', conversionResponse.data);
                throw new Error('Failed to retrieve converted video URL');
            }

            return {
                status: true,
                message: 'Converted using ezgif.com',
                result
            };
        } catch (err) {
            console.error(`ezgif.com attempt ${attempt} failed:`, err.message);
            if (attempt === retries) {
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function stickerToVideo(sock, sender, quoted, messageId) {
    if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
        await sock.sendMessage(sender, {
            text: 'Veuillez citer un sticker animé pour le convertir en vidéo.'
        });
        return;
    }

    let inputPath, outputPath;

    try {
        // Télécharger le sticker
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (buffer.length === 0) {
            throw new Error('Le sticker téléchargé est vide.');
        }
        if (buffer.length > 5 * 1024 * 1024) {
            throw new Error('Le sticker est trop volumineux (max 5 Mo).');
        }

        // Valider le fichier WebP
        const webpCheck = await isAnimatedWebP(buffer);
        if (!webpCheck.valid) {
            throw new Error(webpCheck.reason);
        }
        if (!webpCheck.animated) {
            throw new Error('Le sticker WebP n\'est pas animé.');
        }

        // Log des informations sur le fichier
        console.log('Sticker info:', {
            size: buffer.length,
            header: buffer.slice(0, 12).toString('hex').toUpperCase()
        });

        inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
        outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
        await fsPromises.writeFile(inputPath, buffer);

        // Envoyer un message de progression
        await sock.sendMessage(sender, {
            text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...'
        });

        // Tenter la conversion avec FFmpeg
        let conversionResult;
        try {
            const ffmpegCmd = `ffmpeg -f webp_pipe -i "${inputPath}" -c:v libx264 -vf scale=320:320 -crf 28 -pix_fmt yuv420p -movflags +faststart -t 10 "${outputPath}"`;
            await execAsync(ffmpegCmd).catch(err => {
                console.error('FFmpeg error:', err.message);
                throw new Error('Échec de la conversion FFmpeg.');
            });

            if (!await fsPromises.access(outputPath).then(() => true).catch(() => false)) {
                throw new Error('Le fichier vidéo n\'a pas été créé.');
            }

            const videoBuffer = await fsPromises.readFile(outputPath);
            if (videoBuffer.length === 0) {
                throw new Error('Le fichier vidéo est vide.');
            }

            conversionResult = {
                status: true,
                message: 'Converted using FFmpeg',
                result: videoBuffer
            };
        } catch (ffmpegErr) {
            console.error('FFmpeg failed, trying ezgif.com:', ffmpegErr.message);
            // Fallback to ezgif.com
            const ezgifResult = await webp2mp4File(inputPath);
            if (!ezgifResult.status || !ezgifResult.result) {
                throw new Error('Échec de la conversion avec ezgif.com.');
            }

            const videoResponse = await axios({
                url: ezgifResult.result,
                method: 'GET',
                responseType: 'arraybuffer',
                timeout: 30000
            });
            const videoBuffer = Buffer.from(videoResponse.data);

            if (videoBuffer.length === 0) {
                throw new Error('Le fichier vidéo téléchargé est vide.');
            }

            conversionResult = {
                status: true,
                message: ezgifResult.message,
                result: videoBuffer
            };
        }

        // Envoyer la vidéo
        await sock.sendMessage(sender, {
            video: conversionResult.result,
            mimetype: 'video/mp4',
            caption: `Voici votre vidéo convertie ! (${conversionResult.message})`
        });

    } catch (err) {
        console.error('Erreur lors de la conversion:', err.message);
        await sock.sendMessage(sender, {
            text: `Erreur : ${err.message}`
        });
    } finally {
        // Nettoyage
        try {
            if (inputPath && await fsPromises.access(inputPath).then(() => true).catch(() => false)) {
                await fsPromises.unlink(inputPath);
            }
            if (outputPath && await fsPromises.access(outputPath).then(() => true).catch(() => false)) {
                await fsPromises.unlink(outputPath);
            }
        } catch (cleanupErr) {
            console.error('Erreur lors du nettoyage:', cleanupErr.message);
        }
    }
}

export { stickerToVideo };