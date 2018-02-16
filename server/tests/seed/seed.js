const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

// Data to be included in the DB
var userOneId = new ObjectID();
var userTwoId = new ObjectID();

// USERS
const users = [{
  _id: userOneId,
  email: 'first@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'second@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
  }]
}];

// TODOS
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
},{
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}];

// Populating database with todos
const populateTodos = (done) => {
    // Clean up the Todo collection
    Todo.remove({}).then(()=> {
        // Insert data in the DB
        return Todo.insertMany(todos);
    }). then(() => done());
};

// Populating database with users
const populateUsers = (done) => {
  // Clean up Users collectin
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};
