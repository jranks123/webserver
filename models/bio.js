var mongoose = require('mongoose');

var biosSchema = new mongoose.Schema({
		name : String,
		bio : String
	});

module.exports = mongoose.model('bios', biosSchema);

