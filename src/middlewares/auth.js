const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //Read the token from the req cookies
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    //Validate the token
    const decodedObj = await jwt.verify(token, "DEV@Tinder$798");

    const { _id } = decodedObj;

    //Find(check) the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user; //we have attached the user we found to request, now when the control will go to next req handler,the user will already be there in its req

    next(); //so if token is valid and user is also found, we will call next handler.Eg-> we will write this userAuth fxn like app.get("/profile", userAuth, async(req,res)).So basically before doing the main logic of /profile we can do user authentication and next() will move us to the next req handler
    //and if userAuth fails,the next req handler will not even be called
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
