import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import Review from "@/models/Review";
import User from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import { reviewCreateSchema } from "@/lib/validators";
import { calculateHiddenGemScore } from "@/lib/hiddenGemScore";

export async function GET(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const reviews = await Review.find({ place: place._id })
      .populate("user", "name reputation badges")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to post a review" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const body = await req.json();
    const result = reviewCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({
      place: place._id,
      user: session.userId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this place. Each user can review once." },
        { status: 409 }
      );
    }

    const review = await Review.create({
      place: place._id,
      user: session.userId,
      rating: result.data.rating,
      tip: result.data.tip,
    });

    // Update place avgRating and reviewCount
    const allReviews = await Review.find({ place: place._id });
    const count = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Math.round((sum / count) * 10) / 10;

    place.reviewCount = count;
    place.avgRating = avgRating;

    // Recalculate score
    const scoreResult = calculateHiddenGemScore({
      avgRating: place.avgRating,
      reviewCount: place.reviewCount,
      pricePerPerson: place.pricePerPerson,
      upvotes: place.upvoteCount,
      distinctVisits: place.visitCount,
    });
    place.hiddenGemScore = scoreResult.score;

    if (scoreResult.shouldBeVerified && place.status === "pending") {
      place.status = "verified";
    }

    await place.save();

    // Reward +10 reputation points for helpful tip/review
    await User.findByIdAndUpdate(session.userId, { $inc: { reputation: 10 } });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name reputation badges"
    );

    return NextResponse.json(
      {
        message: "Review submitted successfully!",
        review: populatedReview,
        placeStats: {
          reviewCount: place.reviewCount,
          avgRating: place.avgRating,
          hiddenGemScore: place.hiddenGemScore,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
