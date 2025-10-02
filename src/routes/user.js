const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

//Get all the pending connection requests for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    //findOne returns a single obj and Find returns an Array of objs
    const receivedRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName photoUrl age gender about skills"
    ); //OR
    // }).populate("fromUserId", ["firstName", "lastName"]);

    res.json({ message: "Data fetched successfully", data: receivedRequests });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    //Balnoor => Elon => accepted
    //Abit => Balnoor => accepted  (so we will get for both toUserId and fromUserId )
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        //As _ids are in ObjectId form so to compare,we use toString to compare the strings of_id
        return row.toUserId;
      }
      return row.fromUserId;
    }); //we only want to show data of User table that we got by .populate() and not other unnecessary fields of connectionReq table

    res.json({ message: "Connections found are: ", data: data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    //User should see all the user cards except
    //1. his own card
    //2. his connnections
    //3. ignored people
    //4. already sent the connection request(interested) to

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1; //As route will be like /feed?page=1&limit=10,1 and 10 will be in string form and we want 1,10 as int.And if we dont get anything from query as its optional,assume page no is 1
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;  //we dont want to show more than 50 users at a time

    const skip = (page - 1) * limit;

    //Find all connection requests (sent + received)
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId"); //now after finding matching data,only the fields entered in select will be sent back/shown
    // .populate("fromUserId", "firstName")
    // .populate("toUserId", "firstName")   //populate was just for our understanding using names

    //hence above are the users we want to hide from loggedInUser(also included myself)
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString()); //So we removed duplicates as in if there were many Balnoor's fromUserIds,only one will be stored in Set,i.e only unique userId entries are added
      hideUsersFromFeed.add(req.toUserId.toString()); //we want id as a string and not ObjectId
    });

    //Finding all the users in User DB,whose _id is not present in hideUsersFromFeed Set/Array(i.e users we want to show in feed)
    //Array.from(Set) -> fxn to convert Set to Array
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, //$nin -> not in (array)
        { _id: { $ne: loggedInUser._id } }, //$ne -> not equal to
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit); //now we want our API to return only 10 users at a time in feed(called Pagination)

    res.json({data: users});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
