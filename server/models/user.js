const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true, // make sure that user email is unique
      validate: {
        validator: validator.isEmail
        },
        message: '{VALUE} is not a valid email'
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    tokens: [{
      access: {
        type: String,
        require: true
      },
      token: {
        type: String,
        require: true
      }
    }]
});

// ----------- INSTANCE METHODS ------------ //

// Creating INSTANCEs methods, using the keyword '.methods'
// Overriding method to determine what to return to the user in the JSON object
UserSchema.methods.toJSON = function () {
  var user = this;

  // convert this into an object so that we can access the properties of the object
  var userObject = user.toObject();

  // select only '_id' and 'email' to be returned
  return _.pick(userObject, ['_id', 'email']);
}

// Creating instance methods for 'class' UserSchema
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access},'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  });
};

// Remove a token from the user
UserSchema.methods.removeToken = function(token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  })
};

// ----------- MODEL METHODS ------------ //

// ------
// Creating a model method, using the key word '.statics'
// ------
UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch(e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });

    // the line below does the same as the code above
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token, // this allows us to query a token value within the array of tokens
    'tokens.access': 'auth' // samething here, searching for 'auth' in the tokens.access array
  })
};

// ------
// Method: findByCredentials
// ------
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;
  return User.findOne({email}).then((user) => {
    if (!user){
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        // if password does not match, then reject
        if(!res){
          return reject();
        }
        // if password matched, then return user.
        return resolve(user);
      });

    });
  });
};

// -----
// Defining UserSchema Middleware
// -----

// hash and salt the user password
UserSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')){

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};
