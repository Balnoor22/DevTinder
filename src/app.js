const express = require("express");

const app = express();

//Now b is optional here,even if we type /ac in url,it will still work  (/abc,/ac)
app.get("/ab?c", (req, res) => {
  res.send({ firstName: "Balnoor", lastName: "Singh" });
});

//It means u can add as many b's as u want to (like /abc, /abbbbc, /abbbbbbbbbbbbbbbbbbbc)
app.get("/ab+c", (req, res) => {
  res.send({ firstName: "Balnoor", lastName: "Singh" });
});

app.listen(3000, () => {
  console.log("Server is successfully listening on port 3000....");
});
