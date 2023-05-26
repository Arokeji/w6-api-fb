// import mongoose from "mongoose";
// // import { type IUser } from "./User";
// const Schema = mongoose.Schema;

// export interface IFriendship {
//   sender: IUser;
//   reciever: IUser;
//   status: string;
// }

// // Creacion del esquema del libro
// const friendshipSchema = new Schema<IFriendship>(
//   {
//     sender: {
//       // Parametros del campo
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     reciever: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     status: {
//       type: "string",
//     },
//   },
//   {
//     // Deja fecha y hora
//     timestamps: true,
//   }
// );

// // Creacion del modelo en si con un nombre y la configuracion del esquema
// export const Friendship = mongoose.model<IFriendship>("Friendship", friendshipSchema);
