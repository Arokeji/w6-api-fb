import { type IGroup } from "./Group";
import { type IUser } from "./User";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IPost {
  user: IUser;
  text: string;
  attachedFile: string;
  liked?: [IUser];
  group?: IGroup;
}

// Creacion del esquema del autor
const authorSchema = new Schema<IPost>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    trim: true,
    minLength: [1, "No se puede enviar un post vacío."],
    required: true,
  },
  attachedFile: {
    type: String,
    required: false,
  },
  liked: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
});

// Creacion del modelo en si con un nombre y la configuracion del esquema
export const Post = mongoose.model<IPost>("Post", authorSchema);
