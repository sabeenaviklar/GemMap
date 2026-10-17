import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import Vote from "@/models/Vote";
import User from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import { calculateHiddenGemScore } from "@/lib/hiddenGemScore";

export async function POST(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to vote" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const existingVote = await Vote.findOne({
      place: place._id,
      user: session.userId,
    });

    let voted = false;
    if (existingVote) {
      // Toggle off
      await Vote.deleteOne({ _id: existingVote._id });
      voted = false;
    } else {
      // Add vote
      await Vote.create({
        place: place._id,
        user: session.userId,
      });
      voted = true;

      // Small reputation bump (+2) for engaging
      await User.findByIdAndUpdate(session.userId, { $inc: { reputation: 2 } });
    }

    const upvoteCount = await Vote.countDocuments({ place: place._id });
    place.upvoteCount = upvoteCount;

    // Recalculate Hidden Gem Score
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

    return NextResponse.json({
      message: voted ? "Vote recorded!" : "Vote removed",
      voted,
      upvoteCount: place.upvoteCount,
      hiddenGemScore: place.hiddenGemScore,
      status: place.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Vote action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
