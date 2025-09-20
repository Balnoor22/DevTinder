const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

app.use(express.json());

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

    const isPasswordValid = await bcrypt.compare(password, user.password); //1st arg is pass given by user during login,2nd is the hashed pass stored in DB.It returns true/false

    if (isPasswordValid) {
      res.send("Login Successful!!");
    } else {
      throw new Error("Incorrect Password");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    //find all users with this emailId (.find() returns an array of user objects)
    const users = await User.find({ emailId: userEmail }); //Always write await for DB operations and write inside try-catch block
    if (users.length === 0) {
      //empty array i.e no user found
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!!");
  }
});

//Feed API - GET /feed - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({}); //passing empty obj inside find will return all documents/rows of User
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong!!");
  }
});

//Delete a user from DB
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    //this below fxn is a shorthand for User.findOneAndDelete({ _id:userId }),we can directly write value of _id below
    const user = await User.findByIdAndDelete(userId);

    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// Update data of the user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    // {  sample req.body-> Basically if we send random fields like xyz,Update will not be allowed
    //   "emailId": "noor12@gmail.com",
    //   "gender": "male",
    //   "skills": ["JavaScript","Adaptive","Hardworking"],
    //   "xyz": "gsdkjflkdf"
    // }
    //API-level Data Validation
    const isUpdateAllowed = Object.keys(data).every(
      (k) => ALLOWED_UPDATES.includes(k) //It checks if every key in data is present in our ALLOWED_UPDATES,if any key like emailId,xyz is not present in ALLOWED_UPDATES then we throw an error
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data.skills.length > 10) {
      //error reading length when no skills given
      throw new Error("Skills cannot be more than 10");
    }

    await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    }); //1st arg is id of user,2nd is the updated data of user
    res.send("User details updated succesfully");
  } catch (err) {
    res.status(400).send("Update FAILED: " + err.message);
  }
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
