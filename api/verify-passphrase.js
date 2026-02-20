module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Passphrase');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const passphrase = req.headers['x-passphrase'];
  if (passphrase && passphrase === process.env.EDIT_PASSPHRASE) {
    return res.status(200).json({ valid: true });
  }
  return res.status(401).json({ valid: false });
};
