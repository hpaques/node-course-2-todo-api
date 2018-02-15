
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
var {authenticate} = require('./middleware/authenticate');

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

app.get('/users/me', authenticate, (req, res) => {
  // This route uses a middleware that will authenticate the user before going forward
  //  via the 'authenticate' middleware.
  res.send(req.user);
});

// -------
// POST /users/login {email, password}
//  ROUTE To handle user login
// -------
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    // the case where user is not found will be handled by 'catch'
    // 'catch' will also address any problems with 'generareAuthToken' - that is
    // why we use a 'return' for 'user.generateAuthToken'
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

// // -------
// // example
// // -------
// app.get('/user/me', authenticate, (req, res) => {
//   // to get some property from the header in req, we just need to pass the key.
//   // In this case, we pass 'x-auth', and we get back that token that we will need
//   // to verify.
//   var token = req.header('x-auth');
//
//   User.findByToken(token).then((user) => {
//     if(!user){
//       // We could the code below, which is the same as the return statement
//       //  under the 'catch'
//       //
//       //    res.status(401).send();
//       //
//       // A simpler way to do that, we also resturn a Promise reject here, which
//       //  will also be catched by the 'catch' statement, and return the samething
//       //  as the above code.
//       return Promise.reject();
//     }
//     res.send(user);
//   }).catch((e) => {
//     res.status(401).send(); // Authentication is required
//   });
//
// });

// ------------------------
app.listen(port, () => {
    console.log(`Started on PORT ${port}`);
});

module.exports = {app};
