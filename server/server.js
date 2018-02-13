require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

// setup PORT variable
//    if 'process.env.PORT' is avail, we use it
//    otherwise, use 3000
const port = process.env.PORT;

// middleware
app.use(bodyParser.json());

// POST ROUTE
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

// GET ALL ROUTE
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    })
});

// GET by ID ROUTE
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

// DELETE ROUTE
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

// PATCH route
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

app.listen(port, () => {
    console.log(`Started on PORT ${port}`);
});

module.exports = {app};
