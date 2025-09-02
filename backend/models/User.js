const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema (name, email, password)
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, lowercase: true, unique: true, required: true },
  password: { type: String, required: true, minlength: 6, select: false } 
}, { timestamps: true });

// Before saving, hash the password if it’s new or changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); 
  next();
});

// Add method to check password during login
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
