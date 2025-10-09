const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    //Validation of data -> Good practice to create validation fxn in seperate utils folder
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //Encryption of password -> for this we will use a very *famous npm package called *bcrypt*
    const passwordHash = await bcrypt.hash(password, 10); //it returns a promise hence await

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    //Add the token to cookies and send the response back to the user
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), //expires in 8 hrs from now
    });

    res.json({ message: "User added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//How to match login password with Hashed password in DB
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Invalid email format!");
    }
    //Checking if the emailId even exists in DB or not
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Incorrect EmailId");
    }

    // const isPasswordValid = await bcrypt.compare(password, user.password); //1st arg is pass given by user during login,2nd is the hashed pass stored in DB.It returns true/false
    const isPasswordValid = await user.validatePassword(password); //password sent by user during login,to be compared with pass stored in DB

    if (isPasswordValid) {
      //Create a JWT token
      const token = await user.getJWT();

      //Add the token to cookies and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), //expires in 8 hrs from now
      });
      res.send(user);
    } else {
      throw new Error("Incorrect Password");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  }); //we set token = null and expired the cookie right now
  res.send("Logout Successful!!");
});

module.exports = authRouter;
