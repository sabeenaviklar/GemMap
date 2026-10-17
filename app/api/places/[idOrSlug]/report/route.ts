import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import Report from "@/models/Report";
import { getSessionUser } from "@/lib/auth";
import { reportCreateSchema } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to report a place" }, { status: 401 });
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
    const result = reportCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const report = await Report.create({
      place: place._id,
      user: session.userId,
      reason: result.data.reason,
      status: "pending",
    });

    place.reportCount = (place.reportCount || 0) + 1;
    await place.save();

    return NextResponse.json(
      { message: "Report submitted. Our moderation team will review this place.", reportId: report._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to report place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
