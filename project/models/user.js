var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
	local            : {
        username     : {type: String,
        				unique: true},
        password     : {type: String},
        email		 : {type: String},
        resetPasswordToken: String,
		resetPasswordExpires: Date
    },
    facebook         : {
        id           : {type: String},
        token        : {type: String},
        name         : {type: String}
    },
    twitter          : {
        id           : {type: String},
        token        : {type: String},
        displayName  : {type: String},
        username     : {type: String}
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(newUser.local.password, salt, function(err, hash){
			newUser.local.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.createFacebookUser = function(newUser, callback){
		newUser.save(callback);
}

module.exports.createTwitterUser = function(newUser, callback){
		newUser.save(callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {'local.username': username};
	User.findOne(query, callback)
}

module.exports.getUserByEmail = function(email, callback){
	var query = {'local.email': email};
	User.findOne(query, callback)
}

module.exports.comparePassword= function (candidatePassword,hash,callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if (err) throw err;
		callback(null, isMatch);
	});
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
} 
