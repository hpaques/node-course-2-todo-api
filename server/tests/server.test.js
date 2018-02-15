const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

// To be executed before the test starts
beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    // grab id of first item
    var id = todos[0]._id.toHexString();
    // change text
    todos[0].text = 'Changing todo task';
    todos[0].completed = true;

    request(app)
      .patch(`/todos/${id}`)
      .send(todos[0])
      .expect(200)
      .expect((res) => {
        // console.log('res:', res.body);
        expect(res.body.todo.text).toBe(todos[0].text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    // grab id of second item
    var id = todos[1]._id.toHexString();

    // update text, set completed to false
    todos[1].text = 'Mission accomplished';
    todos[1].completed = false;
    // 200
    // text is changed, complete false, completedAt is null .toNotExist
    request(app)
      .patch(`/todos/${id}`)
      .send(todos[1])
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[1].text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    // not provide an 'x-auth' token
    // expect 401 back
    // expect body is equal to an empty object - to equal notToBe
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        })
      });
  });

  it('should return validation error if request invalid', (done) => {
    // send invalid email and invalid password
    // expect 400

    request(app)
      .post('/users')
      .send({
        // email: 'and',
        email: 'henriqueexample.com',
        password: '123456_'
      })
      .expect(400)
      .end(done);

  });

  it('should not create user if email in use', (done) => {
    // use an email that is already taken (get from the seed)
    // expect 400

    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        // email: 'henrique@example.com',
        password: 'password123!'
      })
      .expect(400)
      .end(done);
  });
});
