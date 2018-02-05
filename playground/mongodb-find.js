// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoBD server');
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({completed: false}).toArray().then((docs) => {
    // db.collection('Todos').find({
    //     _id: new ObjectID('5a78c38e4fc4a50d2dfdebfb')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('unable to fetch todos', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count ${count}`);
    // }, (err) => {
    //     console.log('unable to fetch todos', err);
    // });

    db.collection('Users').find({name: 'Paques'}).toArray().then((docs) => {
        console.log('User(s):');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('unable to fetch users');
    });

    // db.close();
});