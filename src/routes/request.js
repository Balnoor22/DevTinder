const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; //logged in user
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      //Handling corner cases ->
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status }); //must write return if u want the code to stop going forward
      }

      //Handling user sending connectionRequest to itself
      //-->We did that in schema using schema Validation using schema.pre()

      //To prevent any random(not in our DB) toUserId attack
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not Found!" });
      }

      //Check IF there is already an existing ConnectionRequest either from Balnoor to Elon or from Elon to Balnoor using $or
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          //it takes array of objs
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save(); //save in DB

      res.json({
        message: req.user.firstName+" "+status+" "+toUser.firstName,
        data, //also sent data containing info as response
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = requestRouter;
