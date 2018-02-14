const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc';

// generating the 'salt'
// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash);
//   });
// });

var hashedPassword = '$2a$10$.D3LscZPGh38Rk837OnMZuX3qM7jq268/SqdR.cxngn4xgZKtHQcS';

// the result of call below (res) is a TRUE / FALSE value
bcrypt.compare('123', hashedPassword, (err, res) => {
  console.log(res);
});
// var data = {
//   id: 10
// };

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
//
// console.log(`message: ${message}`);
// console.log(`hash: ${hash}`);
//
// // Creating the data
// var data = {
//   id: 4
// };
//
// // hashing the data
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
//   // 'somesecret' is the 'salt' on the hash
// }

// ALL THE CODE ABOVE CAN BE REPLACED WITH THIS LINE
// var token = jwt.sign(data, '123abc'); // '123abc' is the 'salt'
// console.log(token);

// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// // verifying the data
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed, dont trust');
// }

// ALL THE CODE ABOVE CAN BE REPLACED WITH THIS LINE
// var decoded = jwt.verify(token,'123abc');
// console.log('decoded: ',decoded);
