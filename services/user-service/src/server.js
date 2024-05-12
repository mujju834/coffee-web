//server.js
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "/user.proto";
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObject.userPackage;

//data
const mongoose = require("mongoose");
const User = require("./models/user");
const { validateUser } = require("../../shared/src/validation/userValidator");

/*------------------------------------------------------------------------------------------------ */
//config
const path = require("path");
const config = require(path.join(
  __dirname,
  "..",
  "..",
  "shared",
  "src",
  "config",
  "config.js"
));
const mongoHost = config.mongo.host;
const mongoPort = config.mongo.port;
const mongoDatabase = config.mongo.database;
const serviceHost = config.grpc.userServiceHost;
const servicePort = config.grpc.userServicePort;

//Connect to MongoDB
mongoose
  .connect(
    "mongodb://" + mongoHost + ":" + mongoPort + "/" + mongoDatabase + "",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

//Implement gRPC server
const server = new grpc.Server();
server.bind(
  serviceHost + ":" + servicePort,
  grpc.ServerCredentials.createInsecure()
);
/*------------------------------------------------------------------------------------------------ */

server.addService(userPackage.UserService.service, {
  registerUser: registerUser,
  getAllUsers: getAllUsers,
  getUserName: getUserName,
  updateCart: updateCart,
  getCartItems: getCartItems,
  clearCart: clearCart,
  addPromoCode: addPromoCode,
  retrievePromoCodes: retrievePromoCodes,
  removePromoCode: removePromoCode,
});

async function registerUser(call, callback) {
  const { username, email, password } = call.request;
  // Validate user input
  const validationErrors = validateUser({ username, email, password });
  if (validationErrors) {
    callback(null, {
      success: false,
      message: validationErrors.join(", "),
    });
    return;
  }

  try {
    //Create a new user
    const newUser = new User({
      username: username,
      email: email,
      password: password,
      createdAt: new Date(),
    });

    //Check if the user already exits in db
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      callback(null, { success: false, message: "User already exists" });
    }

    await newUser.save();
    callback(null, { success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error registering user",
    });
  }
}

async function getAllUsers(call, callback) {
  try {
    const users = await User.find();
    const response = {
      users: users.map((user) => {
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
          createdAt: user.createdAt,
        };
      }),
    };
    console.log(response);
    callback(null, response);
  } catch (error) {
    console.error("Error retrieving users:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error retrieving users.",
    });
  }
}

async function updateCart(call, callback) {
  const { userId, itemId, itemName, price, quantity } = call.request;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      callback(null, { success: false, message: "User not found!" });
      return;
    }

    const cartItem = user.cart.find((item) => item.itemId === itemId);

    if (cartItem) {
      cartItem.quantity = quantity;
      callback(null, {
        success: true,
        message: `Update quantity successfully`,
      });
    } else {
      user.cart.push({ itemId, itemName, price, quantity });
      callback(null, {
        success: true,
        message: `Add item to cart successfully`,
      });
    }

    await user.save();
  } catch (error) {
    console.error("Error updating cart:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error updating cart",
    });
  }
}

async function clearCart(call, callback) {
  const { userId } = call.request;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      callback(null, { success: false, message: "User not found!" });
      return;
    }

    user.cart = []; // Clear the cart by setting it to an empty array
    await user.save();

    callback(null, {
      success: true,
      message: `Cart cleared successfully`,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error clearing cart",
    });
  }
}

async function getCartItems(call, callback) {
  const { userId } = call.request;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      callback(null, { items: [] });
      return;
    }

    const cartItems = user.cart.map((item) => {
      return {
        itemId: item.itemId.toString(),
        itemName: item.itemName,
        price: item.price,
        quantity: item.quantity,
        discountedValue: item.discountedValue,
      };
    });
    callback(null, { items: cartItems });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error fetching cart items",
    });
  }
}

async function getUserName(call, callback) {
  const { userId } = call.request;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      callback(null, { name: "" });
      return;
    }
    const response = { name: user.username };
    callback(null, response);
  } catch (error) {
    console.error("Error getting username:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error getting username",
    });
  }
}

async function addPromoCode(call, callback) {
  const { userId, promoCodeId } = call.request;
  try {
    const user = await User.findById(userId);
    if (!user) {
      callback(null, { success: false, message: "User ID not found" });
      return;
    }
    // Check if the promoCodeId already exists in the user's promos array
    if (user.promos.includes(promoCodeId)) {
      callback(null, {
        success: false,
        message: "Promo Code already exists for this user",
      });
      return;
    }
    // Assuming you have a field named 'promos' in your user schema
    user.promos.push(promoCodeId);
    await user.save();

    callback(null, { success: true, message: "Promo code added successfully" });
  } catch (error) {
    console.error("Error adding promo code:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error adding promo code.",
    });
  }
}

async function retrievePromoCodes(call, callback) {
  const { userId } = call.request;
  try {
    const user = await User.findById(userId);
    if (!user) {
      callback({ code: grpc.status.NOT_FOUND, details: "User ID not found." });
      return;
    }

    callback(null, { promos: user.promos });
  } catch (error) {
    console.error("Error retrieving promo code:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error retrieving promo code.",
    });
  }
}

async function removePromoCode(call, callback) {
  const { userId, promoCodeId } = call.request;
  try {
    const user = await User.findById(userId);
    if (!user) {
      callback(null, { success: false, message: "User ID not found" });
      return;
    }

    // Check if the promoCodeId exists in the user's promos array
    const promoIndex = user.promos.indexOf(promoCodeId);
    if (promoIndex === -1) {
      callback(null, {
        success: false,
        message: "Promo Code not found for this user",
      });
      return;
    }

    // Remove the promo code from the user's promos array
    user.promos.splice(promoIndex, 1);
    await user.save();

    callback(null, {
      success: true,
      message: "Promo code removed successfully",
    });
  } catch (error) {
    console.error("Error removing promo code:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Error removing promo code.",
    });
  }
}

server.start();
console.log("gRPC server running on port " + servicePort);
