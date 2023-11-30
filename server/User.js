const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  salt: { type: String, required: true },
  verified: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  superheroLists: { type: Array, default: [] },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
