// import mongoose from "mongoose";
// import { connect } from "../db.js";
// import { Group } from "../models/Group.ts";
// import { faker } from "@faker-js/faker";

// const groupSeed = async () => {
//   try {
//     // Conexion
//     await connect();
//     console.log("Conexion desde el seed satisfactoria");

//     // Borrado de datos
//     await Group.collection.drop();
//     console.log("Limpieza de la coleccion Group realizada");

//     const groupList = [
//       {
//         groupName: "Cocina facil",
//         admin: 543,
//         users: [{}],
//       },
//       {
//         groupName: "1984",
//         admin: 328,
//         users: [{}],
//       },
//       {
//         groupName: "To Kill a Mockingbird",
//         admin: 281,
//         users: [{}],
//       },
//     ];

//     for (let i = 0; i < 50; i++) {
//       let newGroup = {};
//       try {
//         newGroup = {
//           groupName: faker.lorem.words(2),
//           // author: faker.name.fullName(),
//           admin: faker.datatype.number({ min: 100, max: 300 }),
//           rating: Math.floor(Math.random() * 11),
//           users: {
//             name: faker.internet.userName(),
//             category: faker.color.human(),
//           },
//         };
//       } catch (error) {
//         console.error(error);
//         console.log(error);
//       }
//       groupList.push(newGroup);
//     }

//     // Insercion de groups
//     const documents = groupList.map((group) => new Group(group));
//     await Group.insertMany(documents);
//     console.log("Datos insertados correctamente");
//   } catch (error) {
//     console.error(error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// groupSeed();
