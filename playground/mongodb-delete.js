// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoBD server');
    }
    console.log('Connected to MongoDB server');

    // deleteMany
    // db.collection('Todos').deleteMany({ text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    // deleteOne
    // db.collection('Todos').deleteOne({text: 'eat lunch'}).then((result) => {
    //     console.log(result);
    // });

    // findOneAndDelete
    // db.collection('Todos').findOneAndDelete({ completed: false}).then((result) => {
    //     console.log(result)
    // });


    // delete all the duplicates in 'Users' where {name: 'Henrique'}
    db.collection('Users').deleteMany({ name: 'Henrique'}).then((result) => {
        console.log(result);
    });

    // findOneAndDelete by _id
    db.collection('Users').findOneAndDelete({ _id: new ObjectID('5a78c05d19a007317cbc0f6a')}).then((result) => {
        console.log(result);
    });
    // db.close();
});