import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  place: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  tip: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tip: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// One review per user per place
ReviewSchema.index({ place: 1, user: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
