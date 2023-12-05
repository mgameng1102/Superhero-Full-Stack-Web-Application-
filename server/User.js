const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superheroListSchema = new Schema({
  listName: { type: String, required: true },
  description: { type: String },
  visibility: { type: String, default: 'private' },
  heroes: { type: Array, default: [] },
  reviews: { type: Array, default: [] },
  lastModified: { type: Date, default: Date.now },
});

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  salt: { type: String, required: true },
  verified: { type: Boolean, default: false },
  privilege:{ type: Boolean, default: false},
  disabled: { type: Boolean, default: false },
  superheroLists: { type: [superheroListSchema], default: [] },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
