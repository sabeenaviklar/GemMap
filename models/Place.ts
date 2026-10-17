import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlace extends Document {
  name: string;
  slug: string;
  description: string;
  category: "food" | "study" | "viewpoint" | "thrift" | "hangout";
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  area: string;
  city: string;
  pricePerPerson: number;
  priceBand: "budget" | "moderate" | "treat";
  openingHours: string;
  amenities: string[];
  vibeTags: string[];
  crowdLevels: {
    morning: "low" | "medium" | "high";
    afternoon: "low" | "medium" | "high";
    evening: "low" | "medium" | "high";
    night: "low" | "medium" | "high";
  };
  images: string[];
  createdBy: mongoose.Types.ObjectId;
  status: "pending" | "verified" | "removed";
  upvoteCount: number;
  visitCount: number;
  reviewCount: number;
  avgRating: number;
  hiddenGemScore: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["food", "study", "viewpoint", "thrift", "hangout"],
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    area: { type: String, required: true, index: true },
    city: { type: String, default: "Mumbai", index: true },
    pricePerPerson: { type: Number, required: true, default: 0, index: true },
    priceBand: {
      type: String,
      enum: ["budget", "moderate", "treat"],
      default: "budget",
    },
    openingHours: { type: String, default: "10:00 AM - 10:00 PM" },
    amenities: { type: [String], default: [] },
    vibeTags: { type: [String], default: [] },
    crowdLevels: {
      morning: { type: String, enum: ["low", "medium", "high"], default: "low" },
      afternoon: { type: String, enum: ["low", "medium", "high"], default: "medium" },
      evening: { type: String, enum: ["low", "medium", "high"], default: "high" },
      night: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    },
    images: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "removed"],
      default: "pending",
      index: true,
    },
    upvoteCount: { type: Number, default: 0 },
    visitCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 3.5 },
    hiddenGemScore: { type: Number, default: 50, index: true },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial 2dsphere index for location queries
PlaceSchema.index({ location: "2dsphere" });
// Compound text index for fast keyword searching
PlaceSchema.index({ name: "text", description: "text", area: "text" });

const Place: Model<IPlace> =
  mongoose.models.Place || mongoose.model<IPlace>("Place", PlaceSchema);

export default Place;
