import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import Visit from "@/models/Visit";
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
      return NextResponse.json({ error: "Authentication required to confirm visit" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const existingVisit = await Visit.findOne({
      place: place._id,
      user: session.userId,
    });

    let visited = false;
    if (existingVisit) {
      await Visit.deleteOne({ _id: existingVisit._id });
      visited = false;
    } else {
      await Visit.create({
        place: place._id,
        user: session.userId,
      });
      visited = true;

      // Reward +5 reputation points for real-world visit confirmation
      await User.findByIdAndUpdate(session.userId, { $inc: { reputation: 5 } });
    }

    const visitCount = await Visit.countDocuments({ place: place._id });
    place.visitCount = visitCount;

    // Recalculate score & check auto verification
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
      message: visited ? "Visit confirmed! Thanks for verifying." : "Visit confirmation removed",
      visited,
      visitCount: place.visitCount,
      hiddenGemScore: place.hiddenGemScore,
      status: place.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Visit action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
