const express = require("express");
const connectDB = require("./config/database");
const app = express();
const validator = require("validator");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();


app.use(
  cors({
    origin: "http://localhost:5173", //where ur frontend is hosted
    credentials: true, //Whitelisting frontend domain(to get cookies)
  })
);
app.use(express.json());
app.use(cookieParser()); //to read cookies from user req

//Importing our routes from diff. Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

//Now to use them,just write them like a Middleware
app.use("/", authRouter); //basically whenever a req is coming at "/" go to authRouter and check all the routes inside it if any is matching the req
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on port 7777....");
    });
  })
  .catch((err) => {
    console.log("Database cannot be established!!");
  });
