const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser()); //to read cookies from user req

app.post("/signup", async (req, res) => {
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

    await user.save();
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//How to match login password with Hashed password in DB
app.post("/login", async (req, res) => {
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
    const isPasswordValid = await user.validatePassword(password);  //password sent by user during login,to be compared with pass stored in DB 

    if (isPasswordValid) {
      //Create a JWT token
      const token = user.getJWT();

      //Add the token to cookies and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),  //expires in 8 hrs from now
      });
      res.send("Login Successful!!");
    } else {
      throw new Error("Incorrect Password");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  //Sending a connection request
  res.send(user.firstName + " " + "sent a connection request");
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777....");
    });
  })
  .catch((err) => {
    console.log("Database cannot be established!!");
  });
