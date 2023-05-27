import mongoose from "mongoose";
import { type IUser } from "./User";
const Schema = mongoose.Schema;

export interface IFriendship {
  sender: IUser;
  receiver: IUser;
  status: string;
}

const statusOptions = ["accept", "deny", "pending"];
const friendshipSchema = new Schema<IFriendship>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: statusOptions,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Friendship = mongoose.model("Friendship", friendshipSchema);
