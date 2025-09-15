const express = require("express");

const app = express(); //creating new instance of express js application using express fxn.This created us a server

// app.get("/user") -> **This will *only* handle GET call to /user
app.get("/user", (req, res) => {
  res.send({ firstName: "Balnoor", lastName: "Singh" });
});

app.post("/user", (req, res) => {
  //Saving data to DB
  res.send("Data successfully saved to the database");
});

app.delete("/user", (req, res) => {
  res.send("Deleted Successfully");
});

//This app.use() will match all the HTTP method API calls(like GET,POST etc) to /test
app.use("/test", (req, res) => {
  res.send("Hello from the Server");
});

//now we want our server to listen through some port no for incoming reqs
app.listen(3000, () => {
  console.log("Server is successfully listening on port 3000....");
});
