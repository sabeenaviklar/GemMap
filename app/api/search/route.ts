import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import { parseNaturalLanguageQuery } from "@/lib/nlpSearch";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const parsed = parseNaturalLanguageQuery(query);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { status: { $ne: "removed" } };

    if (parsed.category) {
      filter.category = parsed.category;
    }

    if (parsed.maxPrice) {
      filter.pricePerPerson = { $lte: parsed.maxPrice };
    }

    if (parsed.locality) {
      filter.area = { $regex: parsed.locality, $options: "i" };
    }

    if (parsed.vibeTags.length > 0) {
      filter.vibeTags = { $in: parsed.vibeTags };
    }

    if (parsed.amenities.length > 0) {
      filter.amenities = { $all: parsed.amenities };
    }

    if (parsed.textQueryRemaining && parsed.textQueryRemaining.length > 1) {
      filter.$or = [
        { name: { $regex: parsed.textQueryRemaining, $options: "i" } },
        { description: { $regex: parsed.textQueryRemaining, $options: "i" } },
        { area: { $regex: parsed.textQueryRemaining, $options: "i" } },
      ];
    }

    let dbQuery = Place.find(filter).populate("createdBy", "name reputation badges");

    if (parsed.sortBy === "cheapest") {
      dbQuery = dbQuery.sort({ pricePerPerson: 1, hiddenGemScore: -1 });
    } else if (parsed.sortBy === "newest") {
      dbQuery = dbQuery.sort({ createdAt: -1 });
    } else {
      dbQuery = dbQuery.sort({ hiddenGemScore: -1, reviewCount: -1 });
    }

    const places = await dbQuery.limit(50).lean();

    return NextResponse.json({
      parsed,
      total: places.length,
      places,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Search query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
