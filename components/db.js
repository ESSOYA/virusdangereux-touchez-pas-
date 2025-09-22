

 
// import sqlite3 from 'sqlite3';

// const db = new sqlite3.Database('./warnings.db', (err) => {
//   if (err) {
//     console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
//   } else {
//     console.log('Base de données ouverte avec succès.');
//   }
// });

// export async function initDatabase() {
//   db.run(`CREATE TABLE IF NOT EXISTS warnings (groupId TEXT, userId TEXT, count INTEGER, PRIMARY KEY (groupId, userId))`);
//   db.run(`CREATE TABLE IF NOT EXISTS group_settings (groupId TEXT PRIMARY KEY, anti_link INTEGER DEFAULT 0, anti_word INTEGER DEFAULT 0, welcome INTEGER DEFAULT 0, blocked INTEGER DEFAULT 0, close_time TEXT DEFAULT '22:00', open_time TEXT DEFAULT '09:00')`);
//   db.run(`ALTER TABLE group_settings ADD COLUMN blocked INTEGER DEFAULT 0`, (err) => {
//     if (err && !err.message.includes('duplicate column name')) {
//       console.error('Erreur lors de l\'ajout de la colonne blocked:', err.message);
//     }
//   });
//   db.run(`ALTER TABLE group_settings ADD COLUMN close_time TEXT DEFAULT '22:00'`, (err) => {
//     if (err && !err.message.includes('duplicate column name')) {
//       console.error('Erreur lors de l\'ajout de la colonne close_time:', err.message);
//     }
//   });
//   db.run(`ALTER TABLE group_settings ADD COLUMN open_time TEXT DEFAULT '09:00'`, (err) => {
//     if (err && !err.message.includes('duplicate column name')) {
//       console.error('Erreur lors de l\'ajout de la colonne open_time:', err.message);
//     }
//   });
// }

// export async function getWarningCount(groupId, userId) {
//   return new Promise((resolve, reject) => {
//     db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
//       if (err) reject(err);
//       resolve(row ? row.count : 0);
//     });
//   });
// }

// export async function incrementWarning(groupId, userId) {
//   const count = await getWarningCount(groupId, userId);
//   return new Promise((resolve, reject) => {
//     db.run(`INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`, [groupId, userId, count + 1], (err) => {
//       if (err) reject(err);
//       resolve(count + 1);
//     });
//   });
// }

// export async function resetWarning(groupId, userId) {
//   return new Promise((resolve, reject) => {
//     db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
//       if (err) reject(err);
//       resolve();
//     });
//   });
// }

// export async function getGroupSetting(groupId, setting) {
//   return new Promise((resolve, reject) => {
//     db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
//       if (err) reject(err);
//       resolve(row ? row[setting] : (setting === 'close_time' ? '22:00' : setting === 'open_time' ? '09:00' : 0));
//     });
//   });
// }

// export async function setGroupSetting(groupId, setting, value) {
//   return new Promise((resolve, reject) => {
//     db.run(
//       `INSERT OR REPLACE INTO group_settings (groupId, ${setting}) VALUES (?, ?)`,
//       [groupId, value],
//       (err) => {
//         if (err) reject(err);
//         resolve();
//       }
//     );
//   });
// }








import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./warnings.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Base de données ouverte avec succès.');
  }
});

// Initialisation des tables
export async function initDatabase() {
  // Table warnings (déjà existante)
  db.run(`CREATE TABLE IF NOT EXISTS warnings (
    groupId TEXT,
    userId TEXT,
    count INTEGER,
    PRIMARY KEY (groupId, userId)
  )`);

  // Table group_settings (déjà existante, mais on s'assure que toutes les colonnes sont présentes)
  db.run(`CREATE TABLE IF NOT EXISTS group_settings (
    groupId TEXT PRIMARY KEY,
    anti_link INTEGER DEFAULT 0,
    anti_word INTEGER DEFAULT 0,
    welcome INTEGER DEFAULT 0,
    blocked INTEGER DEFAULT 0,
    close_time TEXT DEFAULT '22:00',
    open_time TEXT DEFAULT '09:00'
  )`);

  // Table global_settings pour gemini_enabled
  db.run(`CREATE TABLE IF NOT EXISTS global_settings (
    setting TEXT PRIMARY KEY,
    value INTEGER
  )`);

  // Table gemini_usage pour suivre l'utilisation quotidienne
  db.run(`CREATE TABLE IF NOT EXISTS gemini_usage (
    userId TEXT PRIMARY KEY,
    usage INTEGER DEFAULT 0,
    lastReset TEXT DEFAULT (date('now'))
  )`);

  // Table group_stats pour les stats globales du groupe
  db.run(`CREATE TABLE IF NOT EXISTS group_stats (
    groupId TEXT PRIMARY KEY,
    totalMessages INTEGER DEFAULT 0
  )`);

  // Table user_stats pour les stats par utilisateur dans un groupe
  db.run(`CREATE TABLE IF NOT EXISTS user_stats (
    groupId TEXT,
    userId TEXT,
    messageCount INTEGER DEFAULT 0,
    PRIMARY KEY (groupId, userId)
  )`);

  // Ajout des colonnes manquantes dans group_settings (si nécessaire)
  db.run(`ALTER TABLE group_settings ADD COLUMN blocked INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erreur lors de l\'ajout de la colonne blocked:', err.message);
    }
  });
  db.run(`ALTER TABLE group_settings ADD COLUMN close_time TEXT DEFAULT '22:00'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erreur lors de l\'ajout de la colonne close_time:', err.message);
    }
  });
  db.run(`ALTER TABLE group_settings ADD COLUMN open_time TEXT DEFAULT '09:00'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erreur lors de l\'ajout de la colonne open_time:', err.message);
    }
  });
}

// Fonctions pour les avertissements (déjà existantes)
export async function getWarningCount(groupId, userId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
      if (err) reject(err);
      resolve(row ? row.count : 0);
    });
  });
}

export async function incrementWarning(groupId, userId) {
  const count = await getWarningCount(groupId, userId);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`,
      [groupId, userId, count + 1],
      (err) => {
        if (err) reject(err);
        resolve(count + 1);
      }
    );
  });
}

export async function resetWarning(groupId, userId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

// Fonctions pour les paramètres de groupe (déjà existantes)
export async function getGroupSetting(groupId, setting) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
      if (err) reject(err);
      resolve(row ? row[setting] : (setting === 'close_time' ? '22:00' : setting === 'open_time' ? '09:00' : 0));
    });
  });
}

export async function setGroupSetting(groupId, setting, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO group_settings (groupId, ${setting}) VALUES (?, ?)`,
      [groupId, value],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

// Nouvelles fonctions pour les paramètres globaux
export async function getGlobalSetting(setting) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT value FROM global_settings WHERE setting = ?`, [setting], (err, row) => {
      if (err) reject(err);
      resolve(row ? row.value : 1); // Par défaut, gemini_enabled est à 1 (activé)
    });
  });
}

export async function setGlobalSetting(setting, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO global_settings (setting, value) VALUES (?, ?)`,
      [setting, value],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

// Nouvelles fonctions pour l'utilisation de Gemini
export async function incrementGeminiUsage(userId) {
  const count = await getGeminiUsage(userId);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO gemini_usage (userId, usage, lastReset) VALUES (?, ?, date('now'))`,
      [userId, count + 1],
      (err) => {
        if (err) reject(err);
        resolve(count + 1);
      }
    );
  });
}

export async function getGeminiUsage(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT usage FROM gemini_usage WHERE userId = ? AND lastReset = date('now')`,
      [userId],
      (err, row) => {
        if (err) reject(err);
        resolve(row ? row.usage : 0);
      }
    );
  });
}

export async function resetDailyGeminiUsage() {
  return new Promise((resolve, reject) => {
    // Supprimer les enregistrements des jours précédents
    db.run(`DELETE FROM gemini_usage WHERE lastReset != date('now')`, (err) => {
      if (err) reject(err);
      // Réinitialiser l'usage à 0 pour le jour actuel
      db.run(`UPDATE gemini_usage SET usage = 0, lastReset = date('now')`, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
}

// Nouvelles fonctions pour les statistiques
export async function incrementMessageCount(groupId, userId, count) {
  return new Promise((resolve, reject) => {
    // Incrémenter totalMessages pour le groupe
    db.run(
      `INSERT INTO group_stats (groupId, totalMessages) VALUES (?, ?)
       ON CONFLICT(groupId) DO UPDATE SET totalMessages = totalMessages + ?`,
      [groupId, count, count],
      (err) => {
        if (err) reject(err);
        // Incrémenter messageCount pour l'utilisateur
        db.run(
          `INSERT INTO user_stats (groupId, userId, messageCount) VALUES (?, ?, ?)
           ON CONFLICT(groupId, userId) DO UPDATE SET messageCount = messageCount + ?`,
          [groupId, userId, count, count],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      }
    );
  });
}

export async function getGroupStats(groupId) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT totalMessages FROM group_stats WHERE groupId = ?`, [groupId], (err, row) => {
      if (err) reject(err);
      resolve(row ? { totalMessages: row.totalMessages } : { totalMessages: 0 });
    });
  });
}

export async function getUserStats(groupId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT messageCount FROM user_stats WHERE groupId = ? AND userId = ?`,
      [groupId, userId],
      (err, row) => {
        if (err) reject(err);
        resolve(row ? { messageCount: row.messageCount } : { messageCount: 0 });
      }
    );
  });
}