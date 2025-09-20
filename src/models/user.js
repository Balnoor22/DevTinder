const mongoose = require("mongoose");
const validator = require("validator"); //npm validator
//Defining user schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true, //now its mandatory field
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true, //no matter if user sends email in capital,we will always store in lowercase in DB
      required: true,
      unique: true, // unique emails for each user
      trim: true, //no *whitespaces
      validate(value) {
        if (!validator.isEmail(value)) {
          //validator.isEmail() return true or false
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password: " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      //custom validation fxn,it will only run for new user(post) entries,and will not work if updating info(patch,put),
      //To fix that,we will add 3rd arg.(which is obj) inside our findByKeyAndUpdate() called runValidators: true
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Invalid Gender!");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://www.pngitem.com/pimgs/m/581-5813504_avatar-dummy-png-transparent-png.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "Write your bio here", //if user doesnt fill 'about',it will get this default value
    },
    skills: {
      type: [String], //takes in array of strings
    },
  },
  {
    timestamps: true, //automatically adds time when user created or updated
  }
);

//** So first of all u create a schema and then u create a model out of it and then with this model we will create
// new-new instances of this model whenever we need to post user Data in DB*/
//Now creating user model

module.exports = mongoose.model("User", userSchema);
