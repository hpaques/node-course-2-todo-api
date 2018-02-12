const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Data to be included in the DB
const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
},{
    _id: new ObjectID(),
    text: 'Second test todo'
}];

// To be executed before the test starts
beforeEach((done) => {
    // Clean up the Todo collection
    Todo.remove({}).then(()=> {
        // Insert data in the DB
        return Todo.insertMany(todos);
    }). then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

        Todo.find({text}).then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
        }).catch((e) => done(e));
        });
    });

    it('should not create todo with invalid data', (done) => {

        request(app)
            .post('/todos')
            .send({text: ''})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
  // test cases --> async:
  it('should return todo doc', (done) => {

    // supertest request
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200) // status return: OK
      .expect((res) => {
        // check if text return is the same as expected
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return a 404 if todo not found', (done) => {

    // Create a new _id here, and using toHexString, make the assertion
    var id = new ObjectID();

    // make sure to get a 404 back
    request(app)
      .get(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('it should return 404 for non-object ids', (done) => {
    // todos /123
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });

});

// DELETE route
describe('DELETE /todos/:id',() => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexId);
    })
    .end((err,res) => {
      if (err){
        return done(err);
      }
      // query database by findById
      Todo.findById(hexId).then((todo) => {
        console.log(`Todo removed ${todo}`);
        expect(todo).toBeFalsy();
        done();
      }).catch((e) => done(e));

    });

  });

  it('should return 404 if todo not found', (done) => {
    var id = new ObjectID();

    // make sure to get a 404 back
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});
