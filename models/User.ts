import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  reputation: number;
  badges: string[];
  savedPlaces: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    reputation: { type: Number, default: 10 },
    badges: {
      type: [String],
      default: ["Newcomer"],
    },
    savedPlaces: [{ type: Schema.Types.ObjectId, ref: "Place" }],
  },
  { timestamps: true }
);

// Prevent model overwrite in development HMR
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
