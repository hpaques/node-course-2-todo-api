var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    // Info on the user who created the todo
    _creator: {
      // setup the type to be of type ObjectId
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
});

module.exports = {Todo};
