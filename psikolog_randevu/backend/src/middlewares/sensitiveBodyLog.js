'use strict';

const SENSITIVE_KEYS = new Set([
  'password',
  'passphrase',
  'recoveryPhrase',
  'mnemonic',
  'secret',
  'encryptedPrivateKey',
  'recoveryWrappedPrivateKey',
  'escrowWrappedPrivateKey',
  'ciphertext',
  'encryptedDataKey',
  'privateKeyIv',
  'privateKeySalt',
  'token',
]);

const mask = (value) => {
  if (value == null) return value;
  if (typeof value === 'string') {
    if (value.length <= 8) return '[MASKED]';
    return `${value.slice(0, 4)}…[MASKED](${value.length})`;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return maskObject(value);
  }
  return '[MASKED]';
};

const maskObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      item && typeof item === 'object' ? maskObject(item) : item
    );
  }
  const out = {};
  for (const [key, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = mask(v);
    } else if (v && typeof v === 'object') {
      out[key] = maskObject(v);
    } else {
      out[key] = v;
    }
  }
  return out;
};

/**
 * Geliştirme ortamında hassas alanları maskeleyerek istek gövdesini loglar.
 * Morgan gövde yazdırmaz; POST/PATCH debug için kullanılır.
 */
module.exports = function sensitiveBodyLog(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return next();
  }
  if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
    return next();
  }
  const path = req.originalUrl || '';
  const hits =
    path.includes('/api/keys') ||
    path.includes('/api/notes') ||
    path.includes('/api/auth');
  if (!hits || !req.body || typeof req.body !== 'object') {
    return next();
  }
  try {
    const safe = maskObject(req.body);
    // eslint-disable-next-line no-console
    console.log('[body]', req.method, path.split('?')[0], JSON.stringify(safe));
  } catch {
    // eslint-disable-next-line no-console
    console.log('[body]', req.method, path.split('?')[0], '[unserializable]');
  }
  next();
};
