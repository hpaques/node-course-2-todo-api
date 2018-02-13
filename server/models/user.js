const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

var User = mongoose.model('User', UserSchema);

module.exports = {User};
