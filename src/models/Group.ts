import mongoose from "mongoose";
import { type IUser } from "./Usuario";
const Schema = mongoose.Schema;

export interface IGroup {
  admin: IUser;
  users: IUser;
  groupName: string;
  coverImage: string;
}

// Creacion del esquema del libro
const groupSchema = new Schema<IGroup>(
  {
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
    groupName: {
      type: String,
      required: false,
      trim: true,
      min: [1, "Tiene que tener como minimo una pagina"],
      max: [15000, "Como maximo se permiten 15000 paginas"],
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
