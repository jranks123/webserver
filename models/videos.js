var mongoose = require('mongoose');

var youtubeVidSchema = new mongoose.Schema({
	name : String,
	url: { type: String }
});

module.exports = mongoose.model('youtubevids', youtubeVidSchema);
