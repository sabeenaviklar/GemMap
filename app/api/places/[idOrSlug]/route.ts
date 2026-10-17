import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import Vote from "@/models/Vote";
import Visit from "@/models/Visit";
import User from "@/models/User";
import { getSessionUser } from "@/lib/auth";
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

    const place = await Place.findOne(filter).populate("createdBy", "name reputation badges");
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const session = await getSessionUser(req);
    let hasVoted = false;
    let hasVisited = false;
    let isSaved = false;

    if (session) {
      const [voteDoc, visitDoc, userDoc] = await Promise.all([
        Vote.findOne({ place: place._id, user: session.userId }),
        Visit.findOne({ place: place._id, user: session.userId }),
        User.findById(session.userId).select("savedPlaces"),
      ]);
      hasVoted = !!voteDoc;
      hasVisited = !!visitDoc;
      if (userDoc && userDoc.savedPlaces) {
        isSaved = userDoc.savedPlaces.some((id) => id.toString() === place._id.toString());
      }
    }

    // Score breakdown
    const scoreBreakdown = calculateHiddenGemScore({
      avgRating: place.avgRating,
      reviewCount: place.reviewCount,
      pricePerPerson: place.pricePerPerson,
      upvotes: place.upvoteCount,
      distinctVisits: place.visitCount,
    });

    return NextResponse.json({
      place,
      userState: {
        hasVoted,
        hasVisited,
        isSaved,
      },
      scoreBreakdown,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const isCreator = place.createdBy.toString() === session.userId;
    const isAdmin = session.role === "admin";
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to edit this place" }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = [
      "description",
      "pricePerPerson",
      "openingHours",
      "amenities",
      "vibeTags",
      "crowdLevels",
      "images",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (place as any)[field] = body[field];
      }
    });

    // Recalculate score
    const scoreObj = calculateHiddenGemScore({
      avgRating: place.avgRating,
      reviewCount: place.reviewCount,
      pricePerPerson: place.pricePerPerson,
      upvotes: place.upvoteCount,
      distinctVisits: place.visitCount,
    });
    place.hiddenGemScore = scoreObj.score;
    if (scoreObj.shouldBeVerified && place.status === "pending") {
      place.status = "verified";
    }

    await place.save();
    return NextResponse.json({ message: "Place updated successfully", place });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const isCreator = place.createdBy.toString() === session.userId;
    const isAdmin = session.role === "admin";
    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized to delete this place" }, { status: 403 });
    }

    place.status = "removed";
    await place.save();

    return NextResponse.json({ message: "Place removed successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
