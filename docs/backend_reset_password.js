/**
 * ═══════════════════════════════════════════════════════════════════════
 *  RESET MOT DE PASSE — Code à intégrer dans ton serveur Express
 *  Suivi Arbitres Handball — v0.3.3
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  PRÉREQUIS
 *  ---------
 *  npm install nodemailer
 *
 *  BASE DE DONNÉES
 *  ---------------
 *  Ajouter cette table MySQL :
 *
 *    CREATE TABLE password_reset_tokens (
 *      id         INT AUTO_INCREMENT PRIMARY KEY,
 *      user_id    INT NOT NULL,
 *      token      VARCHAR(128) NOT NULL UNIQUE,
 *      expires_at DATETIME NOT NULL,
 *      used       TINYINT(1) DEFAULT 0,
 *      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 *      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 *    );
 *
 *  VARIABLES D'ENVIRONNEMENT (.env)
 *  ---------------------------------
 *  SMTP_HOST=smtp.ton-fournisseur.fr
 *  SMTP_PORT=587
 *  SMTP_USER=reinit@commission-arbitres-occitanie.fr
 *  SMTP_PASS=mot_de_passe_smtp
 *  SMTP_FROM="Commission Arbitres Occitanie <reinit@commission-arbitres-occitanie.fr>"
 *  APP_URL=https://109.31.202.140
 *  TOKEN_EXPIRY_MINUTES=30
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

const crypto     = require('crypto');
const nodemailer = require('nodemailer');

// ── Configurer le transporteur SMTP ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true si port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Durée de validité du token (minutes) ─────────────────────────────────
const TOKEN_EXPIRY = parseInt(process.env.TOKEN_EXPIRY_MINUTES) || 30;

/**
 * POST /auth/forgot-password
 * Body : { email }
 *
 * Génère un token, l'enregistre en BDD, envoie l'email.
 * Répond toujours 200 (même si l'email n'existe pas) → anti-énumération.
 */
async function forgotPassword(req, res, db) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    // 1. Chercher l'utilisateur (silencieux si absent)
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );

    if (rows.length > 0) {
      const userId = rows[0].id;

      // 2. Invalider les anciens tokens de cet utilisateur
      await db.execute(
        'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
        [userId]
      );

      // 3. Générer un token sécurisé
      const token     = crypto.randomBytes(48).toString('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY * 60 * 1000);

      await db.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );

      // 4. Construire et envoyer l'email
      const resetLink = `${process.env.APP_URL}/reset-password.html?token=${token}`;

      await transporter.sendMail({
        from:    process.env.SMTP_FROM,
        to:      email,
        subject: 'Réinitialisation de votre mot de passe — Suivi Arbitres HB',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;">
            <h2 style="color:#1D3A7A;">Réinitialisation de mot de passe</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe pour l'application <strong>Suivi Arbitres Handball</strong>.</p>
            <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${resetLink}"
                 style="background:#1D3A7A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p style="font-size:13px;color:#666;">Ce lien est valide <strong>${TOKEN_EXPIRY} minutes</strong>.</p>
            <p style="font-size:13px;color:#666;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p style="font-size:11px;color:#aaa;">Commission Arbitres Occitanie</p>
          </div>
        `,
      });
    }

    // Toujours répondre 200 (même si email inconnu)
    return res.json({ message: 'Si un compte existe, un email a été envoyé.' });

  } catch (e) {
    console.error('[forgot-password]', e.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * POST /auth/reset-password
 * Body : { token, newPassword }
 *
 * Vérifie le token, applique le nouveau mot de passe.
 * À adapter selon ton système de hashage existant (bcrypt recommandé).
 */
async function resetPassword(req, res, db, hashPassword) {
  // hashPassword est ta fonction existante de hashage (ex: bcrypt.hash)
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
  }

  // Politique de sécurité identique au frontend
  const pwdOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword);
  if (!pwdOk) {
    return res.status(400).json({
      error: 'Le mot de passe ne respecte pas la politique de sécurité (8 car., majuscule, minuscule, chiffre, spécial)'
    });
  }

  try {
    // 1. Chercher le token valide et non expiré
    const [rows] = await db.execute(
      `SELECT prt.id, prt.user_id
       FROM password_reset_tokens prt
       WHERE prt.token = ?
         AND prt.used = 0
         AND prt.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Lien invalide ou expiré.' });
    }

    const { id: tokenId, user_id: userId } = rows[0];

    // 2. Hasher le nouveau mot de passe
    const hashed = await hashPassword(newPassword);

    // 3. Mettre à jour le mot de passe
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    // 4. Invalider le token
    await db.execute('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenId]);

    return res.json({ message: 'Mot de passe mis à jour avec succès.' });

  } catch (e) {
    console.error('[reset-password]', e.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * INTÉGRATION dans ton router Express
 * ------------------------------------
 *
 *   const { forgotPassword, resetPassword } = require('./reset_password');
 *
 *   // db = ton pool MySQL (mysql2/promise)
 *   // hashPassword = ta fonction bcrypt.hash ou équivalent
 *
 *   router.post('/auth/forgot-password', (req, res) =>
 *     forgotPassword(req, res, db)
 *   );
 *
 *   router.post('/auth/reset-password', (req, res) =>
 *     resetPassword(req, res, db, hashPassword)
 *   );
 */

module.exports = { forgotPassword, resetPassword };
