const authService = require('../services/authService');

exports.register = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Invalid name/email/password' });
  }
  try {
    const result = await authService.registerUser({ name, email, password });
    return res.status(201).json(result);
  } catch (e) {
    if (e.code === 'EMAIL_TAKEN') return res.status(409).json({ error: 'Email already in use' });
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await authService.loginUser({ email, password });
    return res.json(result);
  } catch (e) {
    if (e.code === 'BAD_CREDENTIALS') return res.status(401).json({ error: 'Invalid email or password' });
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const me = await authService.getMe(req.userId);
    if (!me) return res.status(404).json({ error: 'Not found' });
    return res.json(me);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
