var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASEURL);
// DATABASEURL = mongodb://hwp:holly@ds233218.mlab.com:33218/todo_app_hwp
// user: hwp / holly
module.exports = {mongoose};
