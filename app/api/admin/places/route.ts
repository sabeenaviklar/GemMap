import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get("type") || "all";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = {};
    if (filterType === "pending") {
      query = { status: "pending" };
    } else if (filterType === "reported") {
      query = { reportCount: { $gt: 0 } };
    }

    const places = await Place.find(query)
      .populate("createdBy", "name email reputation")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ places });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin places";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { placeId, action } = body;

    if (!placeId || !["approve", "verify", "remove", "restore"].includes(action)) {
      return NextResponse.json({ error: "Invalid placeId or action" }, { status: 400 });
    }

    const place = await Place.findById(placeId);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    if (action === "approve" || action === "verify") {
      place.status = "verified";
    } else if (action === "remove") {
      place.status = "removed";
    } else if (action === "restore") {
      place.status = "pending";
    }

    await place.save();
    return NextResponse.json({ message: `Place status updated to ${place.status}`, place });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update place status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
