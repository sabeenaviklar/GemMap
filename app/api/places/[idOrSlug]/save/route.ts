import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import User from "@/models/User";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to bookmark places" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrSlug } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };

    const place = await Place.findOne(filter);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const placeIdStr = place._id.toString();
    const alreadySaved = user.savedPlaces.some((id) => id.toString() === placeIdStr);

    let isSaved = false;
    if (alreadySaved) {
      user.savedPlaces = user.savedPlaces.filter((id) => id.toString() !== placeIdStr);
      isSaved = false;
    } else {
      user.savedPlaces.push(place._id as mongoose.Types.ObjectId);
      isSaved = true;
    }

    await user.save();

    return NextResponse.json({
      message: isSaved ? "Place saved to your profile" : "Place removed from bookmarks",
      isSaved,
      savedCount: user.savedPlaces.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
