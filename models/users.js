var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	email : String,
	hash: String
});

module.exports = mongoose.model('users', userSchema);