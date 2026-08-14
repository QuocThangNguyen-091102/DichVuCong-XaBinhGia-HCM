const { ORG_NAME, AREAS } = require('../lib/areas');

module.exports = (req, res) => {
  res.status(200).json({ orgName: ORG_NAME, areas: AREAS });
};
