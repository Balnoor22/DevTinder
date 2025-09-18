const mongoose = require("mongoose");
//Defining user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
  },
  password: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
});

//** So first of all u create a schema and then u create a model out of it and then with this model we will create
// new-new instances of this model whenever we need to post user Data in DB*/
//Now creating user model

module.exports = mongoose.model("User",userSchema);