import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisit extends Document {
  place: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VisitSchema.index({ place: 1, user: 1 }, { unique: true });

const Visit: Model<IVisit> =
  mongoose.models.Visit || mongoose.model<IVisit>("Visit", VisitSchema);

export default Visit;
