import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/db";
import List from "@/models/List";
import { getSessionUser } from "@/lib/auth";
import { listCreateSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    const lists = await List.find({ owner: session.userId })
      .populate("places", "name slug category pricePerPerson area images avgRating hiddenGemScore location")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ lists });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch lists";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const result = listCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const shareId = crypto.randomBytes(6).toString("hex");

    const newList = await List.create({
      owner: session.userId,
      title: result.data.title,
      places: result.data.places,
      isPublic: result.data.isPublic ?? true,
      shareId,
    });

    const populated = await List.findById(newList._id).populate(
      "places",
      "name slug category pricePerPerson area images avgRating hiddenGemScore location"
    );

    return NextResponse.json(
      { message: "Trail list created!", list: populated },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
