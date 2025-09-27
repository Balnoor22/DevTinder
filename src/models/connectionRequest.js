const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        //we use enum whenever we want to restrict user to certain values,if u write any other value an error is thrown
        values: ["ignored", "interested", "aceepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1}); 

//use normal fxn.It acts as Middleware and will be called before saving/storing connectionrequest data in DB(hence .pre())
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  //Check If the fromUserId is same as toUserId
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot Send Connection request to yourself!");
  }
  next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
