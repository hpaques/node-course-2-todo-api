
var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

// setup PORT variable
//    if 'process.env.PORT' is avail, we use it
//    otherwise, use 3000
const port = process.env.PORT || 3000;

// middleware
app.use(bodyParser.json());

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

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    })
});

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

app.listen(port, () => {
    console.log(`Started on PORT ${port}`);
});

module.exports = {app};
