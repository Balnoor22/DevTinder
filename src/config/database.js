const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://Noor:jattdesi45@namastenode.ip1waje.mongodb.net/DevTinder"
  ); //it returns u a promise so we wrap it inside async fxn
};

module.exports = connectDB;

//Now require it in app.js (starting point)  
