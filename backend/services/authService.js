// All business logic for auth: DB checks, hashing (via model), token issuing
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const makeToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '1h'
  });

exports.registerUser = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email taken');
    err.code = 'EMAIL_TAKEN';
    throw err;
  }
  const user = await User.create({ name, email, password }); // hashes in pre-save
  const accessToken = makeToken(user._id);
  return { user: { id: user._id, name: user.name, email: user.email }, accessToken };
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  const ok = user && (await user.comparePassword(password));
  if (!ok) {
    const err = new Error('Bad credentials');
    err.code = 'BAD_CREDENTIALS';
    throw err;
  }
  const accessToken = makeToken(user._id);
  return { user: { id: user._id, name: user.name, email: user.email }, accessToken };
};

exports.getMe = async (userId) => {
  const me = await User.findById(userId).lean();
  return me
    ? { id: me._id, name: me.name, email: me.email, createdAt: me.createdAt }
    : null;
};
