const mongoose = require("mongoose");
const validator = require("validator"); //npm validator
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not a valid gender type`,
      },
      //custom validation fxn,it will only run for new user(post) entries,and will not work if updating info(patch,put),
      //To fix that,we will add 3rd arg.(which is obj) inside our findByKeyAndUpdate() called runValidators: true
      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("Invalid Gender!");
      //   }
      // },
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },
    about: {
      type: String,
      default: "About", //if user doesnt fill 'about',it will get this default value
    },
    skills: {
      type: [String], //takes in array of strings
    },
  },
  {
    timestamps: true, //automatically adds time when user created or updated
  }
);

//**dont write arrow fxn as 'this' keyword only works with older fxn
userSchema.methods.getJWT = async function () {
  const user = this; //every user document like Balnoor,Elon are instances of this User model.So when we refer to 'this' here,it will represent that particular instance.Eg->in "/login" after getting user=User.findOne(emailId),we will do user.getJWT(),so 'this' will refer to loggedIn user

  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$798", {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password; //this.password,also its the official password hash stored in DB

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};

//** So first of all u create a schema and then u create a model out of it and then with this model we will create
// new-new instances of this model whenever we need to post user Data in DB*/
//Now creating user model

module.exports = mongoose.model("User", userSchema);
