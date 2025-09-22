// const ytdl = require('ytdl-core');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// async function downloadYouTube(sock, sender, url) {
//     if (!ytdl.validateURL(url)) {
//         await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
//         return;
//     }

//     try {
//         const info = await ytdl.getInfo(url);

//         // Choisir un format contenant vidéo + audio
//         const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: f => f.hasAudio && f.hasVideo });
//         if (!format) {
//             await sock.sendMessage(sender, { text: 'Impossible de trouver une vidéo avec audio intégré sur YouTube.' });
//             return;
//         }

//         const tempPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);
//         await new Promise((resolve, reject) => {
//             ytdl(url, { format })
//                 .pipe(fs.createWriteStream(tempPath))
//                 .on('finish', resolve)
//                 .on('error', reject);
//         });

//         const videoBuffer = fs.readFileSync(tempPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

//         fs.unlinkSync(tempPath);

//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube.' });
//     }
// }

// export{ downloadYouTube };








// import ytdl from 'ytdl-core';
// import fs from 'fs';
// import path from 'path';
// import os from 'os';
// import fetch from 'node-fetch';
// import { JSDOM } from 'jsdom';

// const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;

// async function post(url, formdata) {
//     return fetch(url, {
//         method: 'POST',
//         headers: {
//             accept: "*/*",
//             'accept-language': "en-US,en;q=0.9",
//             'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
//         },
//         body: new URLSearchParams(Object.entries(formdata))
//     });
// }

// async function downloadYouTube(sock, sender, url, type = 'mp4', quality = '360p', bitrate = '360', server = 'en68') {
//     if (!ytIdRegex.test(url)) {
//         await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url> [mp4|mp3] [qualité]' });
//         return;
//     }

//     try {
//         const ytId = ytIdRegex.exec(url)[1];
//         url = `https://youtu.be/${ytId}`;
//         const res = await post(`https://www.y2mate.com/mates/${server}/analyze/ajax`, {
//             url,
//             q_auto: 0,
//             ajax: 1
//         });
//         const json = await res.json();
//         const { document } = new JSDOM(json.result).window;
//         const tables = document.querySelectorAll('table');
//         const table = tables[{ mp4: 0, mp3: 1 }[type] || 0];
//         let list;
//         switch (type) {
//             case 'mp4':
//                 list = Object.fromEntries([...table.querySelectorAll('td > a[href="#"]')]
//                     .filter(v => !/\.3gp/.test(v.innerHTML))
//                     .map(v => [v.innerHTML.match(/.*?(?=\()/)[0].trim(), v.parentElement.nextSibling.nextSibling.innerHTML]));
//                 break;
//             case 'mp3':
//                 list = {
//                     '128kbps': table.querySelector('td > a[href="#"]').parentElement.nextSibling.nextSibling.innerHTML
//                 };
//                 break;
//             default:
//                 list = {};
//         }

//         const filesize = list[quality];
//         if (!filesize) {
//             await sock.sendMessage(sender, { text: `Qualité ${quality} non disponible pour ce type (${type}).` });
//             return;
//         }

//         const id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', ''];
//         const thumb = document.querySelector('img').src;
//         const title = document.querySelector('b').innerHTML;
//         const res2 = await post(`https://www.y2mate.com/mates/${server}/convert`, {
//             type: 'youtube',
//             _id: id[1],
//             v_id: ytId,
//             ajax: '1',
//             token: '',
//             ftype: type,
//             fquality: bitrate
//         });
//         const json2 = await res2.json();
//         const dl_link = /<a.+?href="(.+?)"/.exec(json2.result)[1].replace(/https/g, 'http');
//         const response = await fetch(dl_link);
//         const tempPath = path.join(os.tmpdir(), `yt_${Date.now()}.${type}`);
//         const fileStream = fs.createWriteStream(tempPath);
//         await new Promise((resolve, reject) => {
//             response.body.pipe(fileStream);
//             response.body.on('error', reject);
//             fileStream.on('finish', resolve);
//         });

//         const fileBuffer = fs.readFileSync(tempPath);
//         const message = {
//             [type === 'mp4' ? 'video' : 'audio']: fileBuffer,
//             mimetype: type === 'mp4' ? 'video/mp4' : 'audio/mp3',
//             caption: title
//         };

//         await sock.sendMessage(sender, message);
//         fs.unlinkSync(tempPath);
//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de télécharger le contenu YouTube.' });
//     }
// }

// export { downloadYouTube };









import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;

async function post(url, formdata, service = 'yt1s') {
    const headers = {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'origin': service === 'yt1s' ? 'https://yt1s.com.co' : 'https://www.y2mate.com',
        'referer': service === 'yt1s' ? 'https://yt1s.com.co/en110' : 'https://www.y2mate.com/en68'
    };
    console.log(`[INFO] ${new Date().toLocaleString()} Envoi requête POST à ${url}:`, Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&'));
    return fetch(url, {
        method: 'POST',
        headers,
        body: new URLSearchParams(Object.entries(formdata))
    });
}

async function downloadYouTube(sock, sender, url, type = 'mp4', quality = '360p', bitrate = '360', server = 'en110', useFallback = true) {
    if (!ytIdRegex.test(url)) {
        await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url> [mp4|mp3] [qualité]' });
        return;
    }

    try {
        const ytId = ytIdRegex.exec(url)[1];
        url = `https://youtu.be/${ytId}`;

        // Fonction générique pour tenter le téléchargement (YT1s ou y2mate)
        async function tryDownload(baseUrl, serviceServer, serviceName) {
            const analyzeUrl = `${baseUrl}/mates/${serviceServer}/analyze/ajax`;
            const res = await post(analyzeUrl, {
                url,
                q_auto: 0,
                ajax: 1
            }, serviceName);

            // Vérifier si la réponse est JSON
            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (err) {
                console.error(`[ERREUR] ${new Date().toLocaleString()} Réponse non-JSON de ${analyzeUrl}: ${text.slice(0, 100)}`);
                throw new Error(`Réponse non-JSON de ${analyzeUrl}: ${err.message}`);
            }

            if (!json.result) {
                throw new Error(`Échec de l'analyse sur ${serviceName}`);
            }

            const { document } = new JSDOM(json.result).window;
            const tables = document.querySelectorAll('table');
            const tableIndex = { mp4: 0, mp3: 1 }[type] || 0;
            const table = tables[tableIndex];

            if (!table) {
                throw new Error(`Tableau non trouvé pour le type ${type} sur ${serviceName}`);
            }

            let list = {};
            switch (type) {
                case 'mp4':
                    list = Object.fromEntries(
                        [...table.querySelectorAll('td > a[href="#"]')]
                            .filter(v => !/\.3gp/i.test(v.innerHTML))
                            .map(v => {
                                const qualityMatch = v.innerHTML.match(/^(.*?(?=\s*\(|\s*$))/i);
                                const qualityKey = qualityMatch ? qualityMatch[1].trim() : 'unknown';
                                const size = v.parentElement.nextSibling?.nextSibling?.innerHTML || '';
                                return [qualityKey, size];
                            })
                    );
                    break;
                case 'mp3':
                    const mp3Link = table.querySelector('td > a[href="#"]');
                    if (mp3Link) {
                        list = {
                            '128kbps': mp3Link.parentElement.nextSibling?.nextSibling?.innerHTML || ''
                        };
                    }
                    break;
            }

            const filesize = list[quality];
            if (!filesize) {
                const available = Object.keys(list).join(', ') || 'aucune';
                throw new Error(`Qualité "${quality}" non disponible pour ${type}. Options : ${available}`);
            }

            const idMatch = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || ['', ''];
            const thumb = document.querySelector('img')?.src || '';
            const title = document.querySelector('b')?.innerHTML || 'Titre inconnu';

            const convertUrl = `${baseUrl}/mates/${serviceServer}/convert`;
            const res2 = await post(convertUrl, {
                type: 'youtube',
                _id: idMatch[1],
                v_id: ytId,
                ajax: '1',
                token: '',
                ftype: type,
                fquality: bitrate
            }, serviceName);

            const json2 = await res2.json();
            if (!json2.result) {
                throw new Error(`Échec de la conversion sur ${serviceName}`);
            }

            const dlMatch = /<a[^>]+href="([^"]+)"[^>]*>Download|Convert/i.exec(json2.result);
            const dl_link = (dlMatch ? dlMatch[1] : '').replace(/https:/g, 'http:');

            if (!dl_link) {
                throw new Error(`Lien de téléchargement non trouvé sur ${serviceName}`);
            }

            const response = await fetch(dl_link, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
                }
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status} lors du téléchargement`);
            }

            const tempPath = path.join(os.tmpdir(), `yt_${Date.now()}.${type}`);
            const fileStream = fs.createWriteStream(tempPath);
            await new Promise((resolve, reject) => {
                response.body.pipe(fileStream);
                response.body.on('error', reject);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
                fileStream.on('error', reject);
            });

            const stats = fs.statSync(tempPath);
            if (stats.size === 0) {
                throw new Error('Fichier téléchargé vide');
            }

            const fileBuffer = fs.readFileSync(tempPath);
            const KB = parseFloat(filesize) * (1000 * /MB$/.test(filesize)) || stats.size / 1024;

            const message = {
                [type === 'mp4' ? 'video' : 'audio']: fileBuffer,
                mimetype: type === 'mp4' ? 'video/mp4' : 'audio/mpeg',
                caption: `${title}\nTaille: ${filesize} (${Math.round(KB)} KB)`
            };

            await sock.sendMessage(sender, message);
            fs.unlinkSync(tempPath);

            return true; // Succès
        }

        // Essayer YT1s en premier
        try {
            await tryDownload('https://yt1s.com.co', server, 'YT1s');
        } catch (err) {
            console.error(`[ERREUR] ${new Date().toLocaleString()} Échec YT1s:`, err.message);
            if (useFallback) {
                await sock.sendMessage(sender, { text: 'Échec YT1s, tentative avec y2mate...' });
                await tryDownload('https://www.y2mate.com', 'en68', 'y2mate');
            } else {
                throw err;
            }
        }

    } catch (err) {
        console.error(`[ERREUR] ${new Date().toLocaleString()} Erreur finale:`, err.message);
        await sock.sendMessage(sender, { text: `Erreur lors du téléchargement : ${err.message}. Vérifiez l'URL ou essayez une autre qualité.` });
    }
}

async function ytsr(query) {
    const link = /youtube\.com\/results\?search_query=/.test(query) ? query : ('https://youtube.com/results?search_query=' + encodeURIComponent(query));
    const res = await fetch(link, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        }
    });
    const html = await res.text();
    const dataMatch = /var ytInitialData = (.+)/.exec(html);
    if (!dataMatch) {
        throw new Error('Impossible de parser les résultats YouTube');
    }
    const data = new Function('return ' + dataMatch[1])();
    const lists = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    const formatList = {
        query,
        link,
        items: []
    };

    for (const list of lists) {
        const type = {
            videoRenderer: 'video',
            shelfRenderer: 'playlist',
            radioRenderer: 'live',
            channelRenderer: 'channel',
            showingResultsForRenderer: 'typo',
            horizontalCardListRenderer: 'suggestionCard'
        }[Object.keys(list)[0]] || '';
        const content = list[Object.keys(list)[0]] || {};
        if (content) {
            switch (type) {
                case 'typo':
                    formatList.correctQuery = content.correctedQuery.runs[0].text;
                    break;
                case 'video':
                    formatList.items.push({
                        type,
                        title: content.title.runs[0].text.replace('â€’', '‒'),
                        views: content.viewCountText?.simpleText || '',
                        description: content.descriptionSnippet ? content.descriptionSnippet.runs[0].text.replace('Â ...', ' ...') : '',
                        duration: content.lengthText ? [content.lengthText.simpleText, content.lengthText.accessibility.accessibilityData.label] : ['', ''],
                        thumbnail: content.thumbnail.thumbnails,
                        link: 'https://youtu.be/' + content.videoId,
                        videoId: content.videoId,
                        author: {
                            name: content.ownerText.runs[0].text,
                            link: content.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
                            thumbnail: content.channelThumbnailWithLinkRenderer ? content.channelThumbnailWithLinkRenderer.thumbnail.thumbnails : [],
                            verified: content.ownerBadges && /BADGE_STYLE_TYPE_VERIFIED/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? (/BADGE_STYLE_TYPE_VERIFIED_ARTIST/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? 'artist' : true) : false
                        }
                    });
                    break;
                case 'channel':
                    formatList.items.push({
                        type,
                        title: content.title ? content.title.simpleText.replace('â€’', '‒') : '',
                        description: content.descriptionSnippet ? content.descriptionSnippet.runs[0].text.replace('Â ...', ' ...') : '',
                        videoCount: content.videoCountText ? content.videoCountText.runs[0].text : '',
                        thumbnail: content.thumbnail.thumbnails,
                        subscriberCount: content.subscriberCountText ? content.subscriberCountText.simpleText.replace('Â ', ' ') : '',
                        link: 'https://youtube.com' + content.navigationEndpoint.commandMetadata.webCommandMetadata.url,
                        verified: content.ownerBadges && /BADGE_STYLE_TYPE_VERIFIED/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? (/BADGE_STYLE_TYPE_VERIFIED_ARTIST/.test(content.ownerBadges[0].metadataBadgeRenderer.style) ? 'artist' : true) : false
                    });
                    break;
                case 'playlist':
                    formatList.items.push({
                        type,
                        title: content.title.simpleText.replace('â€’', '‒')
                    });
                    break;
            }
        }
    }
    return formatList;
}

export { downloadYouTube, ytsr };