// const mongoose = require("mongoose");
// const { connect } = require("../db.js");
// const { Friendship } = require("../src/models/Friendship");
// const { friendshipList } = require("./friendshipList"); // Assuming friendshipList is exported from a separate file

// const friendshipSeed = async () => {
//   try {
//     // Connection
//     await connect();
//     console.log("Successfully connected from the seed");

//     // Clearing the Friendship collection
//     await Friendship.collection.drop();
//     console.log("Friendship collection cleared");

//     // Inserting friendships
//     const documents = friendshipList.map((friendship) => new Friendship(friendship));
//     for (let i = 0; i < documents.length; i++) {
//       const document = documents[i];
//       await document.save();
//     }
//     console.log("Data inserted successfully");
//   } catch (error) {
//     console.error(error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// friendshipSeed();
