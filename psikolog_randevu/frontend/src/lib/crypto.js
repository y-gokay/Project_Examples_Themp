// Client-side E2E crypto via Web Crypto API.
// Server never sees plaintext, passphrase, or unwrapped private key.

const KDF_ITERATIONS = 310000;
const KDF_HASH = 'SHA-256';

const te = new TextEncoder();
const td = new TextDecoder();

const toBase64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.length; i += 1) str += String.fromCharCode(bytes[i]);
  return btoa(str);
};

const fromBase64 = (b64) => {
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) bytes[i] = str.charCodeAt(i);
  return bytes.buffer;
};

const randomBytes = (len) => {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return buf;
};

export const generateKeypair = async () => {
  const kp = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 3072, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt']
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', kp.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  return { publicJwk, privateJwk };
};

export const deriveKekFromPassphrase = async (
  passphrase,
  saltInput,
  iterations = KDF_ITERATIONS
) => {
  const saltBuf =
    typeof saltInput === 'string'
      ? new Uint8Array(fromBase64(saltInput))
      : saltInput instanceof Uint8Array
        ? saltInput
        : new Uint8Array(saltInput);
  const base = await crypto.subtle.importKey(
    'raw',
    te.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuf, iterations, hash: KDF_HASH },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const wrapPrivateKey = async (privateJwk, passphrase) => {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const kek = await deriveKekFromPassphrase(passphrase, salt, KDF_ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    kek,
    te.encode(JSON.stringify(privateJwk))
  );
  return {
    encryptedPrivateKey: toBase64(ciphertext),
    privateKeyIv: toBase64(iv),
    privateKeySalt: toBase64(salt),
    kdfParams: { iterations: KDF_ITERATIONS, hash: KDF_HASH },
  };
};

export const unwrapPrivateKey = async (record, passphrase) => {
  const { encryptedPrivateKey, privateKeyIv, privateKeySalt, kdfParams } = record;
  const iterations = kdfParams?.iterations ?? KDF_ITERATIONS;
  const kek = await deriveKekFromPassphrase(passphrase, privateKeySalt, iterations);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(privateKeyIv) },
    kek,
    fromBase64(encryptedPrivateKey)
  );
  const jwk = JSON.parse(td.decode(plain));
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
};

export const importPublicKey = (jwkString) => {
  const jwk = typeof jwkString === 'string' ? JSON.parse(jwkString) : jwkString;
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
};

export const encryptNote = async (payload, publicKey) => {
  const dataKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    dataKey,
    te.encode(JSON.stringify(payload))
  );
  const rawDataKey = await crypto.subtle.exportKey('raw', dataKey);
  const wrapped = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawDataKey);
  return {
    ciphertext: toBase64(ciphertext),
    iv: toBase64(iv),
    encryptedDataKey: toBase64(wrapped),
  };
};

export const decryptNote = async ({ ciphertext, iv, encryptedDataKey }, privateKey) => {
  const rawDataKey = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    fromBase64(encryptedDataKey)
  );
  const dataKey = await crypto.subtle.importKey(
    'raw',
    rawDataKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(iv) },
    dataKey,
    fromBase64(ciphertext)
  );
  return JSON.parse(td.decode(plain));
};
