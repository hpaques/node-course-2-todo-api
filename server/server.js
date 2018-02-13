
// -----------
// Environment configuration
// -----------
require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

const port = process.env.PORT;

// middleware
app.use(bodyParser.json());

// -----------
// POST ROUTE - create new todo
// -----------
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

// -----------
// GET ALL ROUTE
// -----------
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    })
});

// -----------
// GET by ID ROUTE
// -----------
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;

  // Check if ID is valid
  if (!ObjectID.isValid(id)){
    console.log('ID not valid');
    return res.status(404).send();
  }

  // Fetch todo
  Todo.findById(id).then((todo) => {
    if (!todo){
      console.log('ID not FOUND');
      return res.status(404).send();
    }
    // return todo document found as an object
    res.send({todo});
  }, (e) => {
    console.log('another issue');
    res.status(400).send();
  });
});

// -----------
// DELETE ROUTE
// -----------
app.delete('/todos/:id', (req,res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(404).send();
  })
});

// -----------
// PATCH route
// -----------
app.patch('/todos/:id', (req,res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text'],['completed']);

  // console.log('PATCH');
  // console.log('req.body:',req.body);
  // console.log('body:',body);
  // console.log('id:',id);

  if (!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  // making the actual update
  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    // console.log('return',todo);
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });

});

// -----------
// POST /users - creating a new user
// -----------

// Similar to the route to create a new todo
//  first creates a new instance of the model
//  then save the todo - if things well, return the doc,
//    otherwise sends back the error
//  Use _.pick to pulling of the individual properties, instead of creating a
//    new object and including what we want in the object -- see the PATCH route
//  The email is now unique. In order to make this change to actually work,
//    we need first to shutdown the server, wipe out the TodoApp database, and then
//    re-start the server.
//  Use Postman to check if the route is working as expected. Check with invalid email
 //   and passwords as well.

app.post('/users', (req,res) => {
  // get the user information
  var user = new User(_.pick(req.body,['email'],['password']));

  user.save().then(() => {
    // generate the token for the user being signed in
    return user.generateAuthToken();
  }).then((token) => {
      // after the token is generated, then return the created user
      // header: when pre-fixing a header with 'x-', you are creating a custom
      //         header. We send back the token in the header
      res.header('x-auth', token).send(user);
  }).catch ((e) => {
    res.status(400).send(e);
  });
});

// ------------------------
app.listen(port, () => {
    console.log(`Started on PORT ${port}`);
});

module.exports = {app};
