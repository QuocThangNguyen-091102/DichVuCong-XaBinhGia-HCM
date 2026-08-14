const crypto = require('crypto');

const COOKIE_NAME = 'ksk_admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // Phiên đăng nhập kéo dài 8 giờ

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'Thiếu biến môi trường ADMIN_SESSION_SECRET (một chuỗi bí mật bất kỳ để ký phiên đăng nhập).'
    );
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

function createSessionToken() {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;

  const [expiresStr, signature] = token.split('.');
  if (!expiresStr || !signature) return false;

  const expected = sign(expiresStr);
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(signature);

  if (expectedBuf.length !== givenBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, givenBuf)) return false;

  const expires = Number(expiresStr);
  if (!expires || Date.now() > expires) return false;

  return true;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

module.exports = {
  COOKIE_NAME,
  SESSION_DURATION_MS,
  createSessionToken,
  verifySessionToken,
  parseCookies,
  isAuthenticated,
};
