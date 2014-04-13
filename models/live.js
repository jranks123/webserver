var mongoose = require('mongoose');

var tourdatesschema = new mongoose.Schema({
	location : String,
	venue 	 : String,
	date 	 : Date,
	tickets  : String,
	showDate : String
});

module.exports = mongoose.model('tourdates', tourdatesschema);

