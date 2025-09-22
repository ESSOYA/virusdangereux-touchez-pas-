



// /**
//  * Utility functions for the Aquila Bot.
//  * Includes safe message sending, operation retry logic, and other helpers.
//  */

// /**
//  * Safely sends a message with a delay to avoid rate-limiting.
//  * @param {Object} sock - The WhatsApp socket instance.
//  * @param {string} jid - The recipient's JID (e.g., user or group ID).
//  * @param {Object} content - The message content (text, image, audio, etc.).
//  * @param {number} [delay=0] - Delay in milliseconds before sending.
//  * @returns {Promise<void>}
//  */
// export async function safeSendMessage(sock, jid, content, delay = 0) {
//   try {
//     if (delay > 0) {
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//     await sock.sendMessage(jid, content);
//     console.log(`Message sent to ${jid}`);
//   } catch (err) {
//     console.error(`Error sending message to ${jid}:`, err.message);
//     throw err;
//   }
// }

// /**
//  * Retries an operation multiple times with exponential backoff.
//  * @param {Function} operation - The async function to retry.
//  * @param {number} [maxAttempts=3] - Maximum number of retry attempts.
//  * @param {number} [initialDelay=1000] - Initial delay in milliseconds.
//  * @returns {Promise<any>} - The result of the operation.
//  * @throws {Error} - If all retries fail.
//  */
// export async function retryOperation(operation, maxAttempts = 3, initialDelay = 1000) {
//   let lastError;
//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//     try {
//       return await operation();
//     } catch (err) {
//       lastError = err;
//       console.warn(`Attempt ${attempt} failed: ${err.message}`);
//       if (attempt === maxAttempts) break;
//       const delay = initialDelay * Math.pow(2, attempt - 1);
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
//   throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`);
// }

// /**
//  * Sends a reaction to a message.
//  * @param {Object} sock - The WhatsApp socket instance.
//  * @param {string} jid - The recipient's JID.
//  * @param {string} messageId - The ID of the message to react to.
//  * @param {string} emoji - The emoji to send as a reaction.
//  * @returns {Promise<void>}
//  */
// export async function reactToMessage(sock, jid, messageId, emoji) {
//   try {
//     await sock.sendMessage(jid, {
//       react: { text: emoji, key: { remoteJid: jid, id: messageId } }
//     });
//     console.log(`Reaction ${emoji} sent to message ${messageId} in ${jid}`);
//   } catch (err) {
//     console.error(`Error sending reaction to ${jid}:`, err.message);
//   }
// }







/**
 * Utility functions for the Aquila Bot.
 * Includes safe message sending, operation retry logic, and other helpers.
 */
import fs from 'fs/promises';

/**
 * Safely sends a message with a delay to avoid rate-limiting.
 * @param {Object} sock - The WhatsApp socket instance.
 * @param {string} jid - The recipient's JID (e.g., user or group ID).
 * @param {Object} content - The message content (text, image, audio, etc.).
 * @param {number} [delay=0] - Delay in milliseconds after sending.
 * @returns {Promise<Object>} - The sent message object with key.id.
 * @throws {Error} - If the message sending fails or the sent message is invalid.
 */
export async function safeSendMessage(sock, jid, content, delay = 0) {
  try {
    console.log(`Envoi du message à ${jid}:`, JSON.stringify(content, null, 2));
    const sentMsg = await sock.sendMessage(jid, content);
    if (!sentMsg || !sentMsg.key || !sentMsg.key.id) {
      console.warn(`Message envoyé à ${jid} n'a pas de clé valide:`, sentMsg);
      throw new Error('Message envoyé invalide ou sans clé.');
    }
    console.log(`Message envoyé avec succès à ${jid}, ID: ${sentMsg.key.id}`);
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return sentMsg;
  } catch (err) {
    console.error(`Erreur dans safeSendMessage à ${jid}:`, err.message);
    if (err.message.includes('rate-overlimit')) {
      console.warn('Rate limit atteint, nouvelle tentative dans 5 secondes...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await safeSendMessage(sock, jid, content, delay); // Réessayer
    }
    throw err; // Relancer l'erreur pour la gérer dans l'appelant
  }
}

/**
 * Retries an operation multiple times with exponential backoff.
 * @param {Function} operation - The async function to retry.
 * @param {number} [maxAttempts=3] - Maximum number of retry attempts.
 * @param {number} [initialDelay=1000] - Initial delay in milliseconds.
 * @returns {Promise<any>} - The result of the operation.
 * @throws {Error} - If all retries fail.
 */
export async function retryOperation(operation, maxAttempts = 3, initialDelay = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      console.warn(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxAttempts) break;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`);
}

/**
 * Sends a reaction to a message.
 * @param {Object} sock - The WhatsApp socket instance.
 * @param {string} jid - The recipient's JID.
 * @param {string} messageId - The ID of the message to react to.
 * @param {string} emoji - The emoji to send as a reaction.
 * @returns {Promise<void>}
 */
export async function reactToMessage(sock, jid, messageId, emoji) {
  try {
    await sock.sendMessage(jid, {
      react: { text: emoji, key: { remoteJid: jid, id: messageId } }
    });
    console.log(`Reaction ${emoji} sent to message ${messageId} in ${jid}`);
  } catch (err) {
    console.error(`Error sending reaction to ${jid}:`, err.message);
  }
}