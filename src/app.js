const express = require("express");

const app = express(); //creating new instance of express js application using express fxn.This created us a server

//Now our server will only respond once u go to this url(localhost:3000/test)
app.use("/test", (req, res) => {
  //This cb arrow fxn is called Request Handler
  res.send("Hello from the Server");
});

app.use("/", (req, res) => {
  res.send("Hello from the Dashboard!");
});

app.use("/hello", (req, res) => {
  res.send("Hello hello hello....");
});

//now we want our server to listen through some port no for incoming reqs
app.listen(3000, () => {
  console.log("Server is successfully listening on port 3000....");
});
