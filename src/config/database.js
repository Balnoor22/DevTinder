const mongoose = require("mongoose");

const connectDB = async () => {
  console.log(process.env.DB_CONNECTION_SECRET);
  await mongoose.connect(process.env.DB_CONNECTION_SECRET); //it returns u a promise so we wrap it inside async fxn
};

module.exports = connectDB;

//Now require it in app.js (starting point)
