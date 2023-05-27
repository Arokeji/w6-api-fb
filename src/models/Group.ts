import mongoose from "mongoose";
import { type IUser } from "./User";
const Schema = mongoose.Schema;

export interface IGroup {
  groupName: string;
  admin: IUser;
  users: IUser;
  coverImage: string;
}

// Creacion del esquema del libro
const groupSchema = new Schema<IGroup>(
  {
    groupName: {
      type: String,
      required: true,
    },
    admin: {
      // Parametros del campo
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "IUser",
    },
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IUser",
    },
    coverImage: {
      type: String,
      required: false,
    },
  },
  {
    // Deja fecha y hora
    timestamps: true,
  }
);

// Creacion del modelo en si con un nombre y la configuracion del esquema
export const Group = mongoose.model<IGroup>("Group", groupSchema);
