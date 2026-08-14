const { isAuthenticated } = require('../../lib/auth');

module.exports = (req, res) => {
  res.status(200).json({ authenticated: isAuthenticated(req) });
};
