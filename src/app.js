const express = require("express");
const connectDB = require("./config/database"); //Connecting to DB
const app = express();
const User = require("./models/user");

//Create POST /signup API to add data to DB
app.post("/signup", async (req, res) => {
  // Creating a new instance of the User Model
  const user = new User({
    firstName: "Balnoor",
    lastName: "Singh",
    emailId: "noorroby22@gmail.com",
    password: "jattdesi45",
  });

  //Always write all DB operations inside try-catch block
  try {
    //To store this new user in DB. All the mongoose fxns that post data,read data etc returns u a promise so have to write await infront
    await user.save();
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    //Server will only listen to incoming reqs if the DB is connected successfully
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777....");
    });
  })
  .catch((err) => {
    console.log("Database cannot be established!!");
  });
