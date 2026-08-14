const crypto = require('crypto');
const { createSessionToken, COOKIE_NAME, SESSION_DURATION_MS } = require('../../lib/auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: 'Máy chủ chưa cấu hình mật khẩu quản trị (ADMIN_PASSWORD).' });
    return;
  }

  const provided = String((req.body || {}).password || '');
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(String(expected));

  const isValid =
    providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isValid) {
    res.status(401).json({ error: 'Sai mật khẩu.' });
    return;
  }

  const token = createSessionToken();
  const maxAgeSeconds = Math.floor(SESSION_DURATION_MS / 1000);

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`
  );
  res.status(200).json({ success: true });
};
