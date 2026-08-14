const { COOKIE_NAME } = require('../../lib/auth');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
  res.status(200).json({ success: true });
};
