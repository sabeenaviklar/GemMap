import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import List from "@/models/List";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { idOrShareId: string } }
) {
  try {
    await connectToDatabase();
    const { idOrShareId } = params;

    const isMongoId = mongoose.Types.ObjectId.isValid(idOrShareId);
    const filter = isMongoId ? { _id: idOrShareId } : { shareId: idOrShareId };

    const list = await List.findOne(filter)
      .populate("owner", "name reputation badges")
      .populate(
        "places",
        "name slug description category pricePerPerson area images avgRating hiddenGemScore location openingHours vibeTags amenities"
      );

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const session = await getSessionUser(req);
    const isOwner = session && list.owner && (list.owner as unknown as { _id: mongoose.Types.ObjectId })._id.toString() === session.userId;

    if (!list.isPublic && !isOwner) {
      return NextResponse.json({ error: "This list is private" }, { status: 403 });
    }

    return NextResponse.json({ list, isOwner });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { idOrShareId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrShareId } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrShareId);
    const filter = isMongoId ? { _id: idOrShareId } : { shareId: idOrShareId };

    const list = await List.findOne(filter);
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (list.owner.toString() !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    if (body.title !== undefined) list.title = body.title;
    if (body.places !== undefined) list.places = body.places;
    if (body.isPublic !== undefined) list.isPublic = body.isPublic;

    await list.save();
    const updated = await List.findById(list._id).populate("places");

    return NextResponse.json({ message: "List updated", list: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { idOrShareId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    const { idOrShareId } = params;
    const isMongoId = mongoose.Types.ObjectId.isValid(idOrShareId);
    const filter = isMongoId ? { _id: idOrShareId } : { shareId: idOrShareId };

    const list = await List.findOne(filter);
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (list.owner.toString() !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await List.deleteOne({ _id: list._id });
    return NextResponse.json({ message: "List deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete list";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
