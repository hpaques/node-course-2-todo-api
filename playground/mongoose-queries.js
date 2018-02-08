const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5a7a19c32e2c133bbdb02bbe11';

// Checking if the id provided is valid
// if (!ObjectID.isValid()) {
//     console.log('ID not valid');
// }

// // Todo.find({
// //     _id: id
// // }).then((todos) => {
// //     console.log('Todos:', todos);
// // });

// // Todo.findOne({
// //     _id: id
// // }).then((todo) => {
// //     console.log('Todo:', todo);
// // });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo by ID:', todo);
// }).catch((e) => console.log(e));

User.findById(id).then((user) => {
    if(!user) {
        return console.log('user not found');
    }

    console.log('User found:', user);
}).catch((e) => console.log(e.message));