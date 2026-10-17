import mongoose, { Schema, Document, Model } from "mongoose";

export interface IList extends Document {
  owner: mongoose.Types.ObjectId;
  title: string;
  places: mongoose.Types.ObjectId[];
  isPublic: boolean;
  shareId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema = new Schema<IList>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    places: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    isPublic: { type: Boolean, default: true },
    shareId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

const List: Model<IList> =
  mongoose.models.List || mongoose.model<IList>("List", ListSchema);

export default List;
