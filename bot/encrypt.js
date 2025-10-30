// encrypt.js  – CommonJS version matching the embedded decrypt logic
const crypto = require('crypto');
const cfg = require('./scripts/cryptoConfig.js');

// --- helpers ---------------------------------------------------
function deriveAesKey(p) {
  return crypto.createHash('sha256').update(String(p), 'utf8').digest();
}

function rotateBuffer(buf, n) {
  const out = Buffer.alloc(buf.length);
  const len = buf.length;
  n = ((n % len) + len) % len;
  for (let i = 0; i < len; i++) out[i] = buf[(i + n) % len];
  return out;
}

function makeRoundKeys(passphrase, rounds = 3) {
  const base = crypto.createHash('sha256').update(String(passphrase), 'utf8').digest();
  const keys = [];
  for (let r = 0; r < rounds; r++) {
    const rot = rotateBuffer(base, r * 7 + (r % 3));
    const rev = Buffer.from(rot).reverse();
    const mix = crypto.createHash('sha256').update(rev).update(Buffer.from([r])).digest();
    keys.push(mix);
  }
  return keys;
}

// --- XOR encode (inverse of convolutedXorDecode) ----------------
function convolutedXorEncode(text) {
  let buf = Buffer.from(String(text), 'utf8');
  const keys = makeRoundKeys(cfg.XOR_PASSPHRASE, 3);

  // reverse of the 3 loops used in decode
  for (let i = 0; i < buf.length; i++)
    buf[i] ^= keys[0][i % keys[0].length];

  for (let i = 0; i < buf.length; i++) {
    const tweak = (i * 31) & 0xff;
    buf[i] ^= keys[1][(i + 13) % keys[1].length] ^ tweak;
  }

  const k2 = Buffer.from(keys[2]).reverse();
  for (let i = 0; i < buf.length; i++) {
    let v = buf[i] ^ k2[i % k2.length];
    v = ((v & 0x0f) << 4) | ((v & 0xf0) >> 4);
    buf[i] = v;
  }

  return buf.toString('base64');
}

// --- Caesar cipher ----------------------------------------------
function caesarEncrypt(str, shift) {
  return String(str).replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

// --- AES encrypt ------------------------------------------------
function aesEncrypt(text, pass) {
  const iv = crypto.randomBytes(16);
  const key = deriveAesKey(pass);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('base64') + ':' + enc.toString('base64');
}

// --- combined ---------------------------------------------------
function encryptAll(token) {
  const s1 = caesarEncrypt(token, cfg.CAESAR_SHIFT_A);
  const s2 = caesarEncrypt(s1, cfg.CAESAR_SHIFT_B);
  const s3 = convolutedXorEncode(s2);
  const s4 = aesEncrypt(s3, cfg.AES_PASSPHRASE);
  return s4;
}

module.exports = { encryptAll };
