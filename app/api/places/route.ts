import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Place, { IPlace } from "@/models/Place";
import User from "@/models/User";
import { placeCreateSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth";
import { calculateHiddenGemScore } from "@/lib/hiddenGemScore";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const vibe = searchParams.get("vibe");
    const amenities = searchParams.get("amenities");
    const locality = searchParams.get("locality") || searchParams.get("area");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "hiddenGemScore";
    const status = searchParams.get("status");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const maxDistance = searchParams.get("maxDistance") || "25000"; // default 25km

    // Base filter: exclude removed places unless admin explicitly asks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "removed" };
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      if (minPrice) filter.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerPerson.$lte = Number(maxPrice);
    }

    if (vibe) {
      const vibes = vibe.split(",").map((v) => v.trim()).filter(Boolean);
      if (vibes.length > 0) {
        filter.vibeTags = { $in: vibes };
      }
    }

    if (amenities) {
      const amList = amenities.split(",").map((a) => a.trim()).filter(Boolean);
      if (amList.length > 0) {
        filter.amenities = { $all: amList };
      }
    }

    if (locality) {
      filter.area = { $regex: locality, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
      ];
    }

    // Geospatial filter if lat & lng are present
    const hasGeo = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
    if (hasGeo) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(maxDistance),
        },
      };
    }

    let query = Place.find(filter).populate("createdBy", "name reputation badges");

    // Sorting
    if (!hasGeo || sort !== "nearest") {
      if (sort === "cheapest") {
        query = query.sort({ pricePerPerson: 1, hiddenGemScore: -1 });
      } else if (sort === "newest") {
        query = query.sort({ createdAt: -1 });
      } else if (sort === "rating") {
        query = query.sort({ avgRating: -1 });
      } else {
        // default hidden gem score
        query = query.sort({ hiddenGemScore: -1, reviewCount: -1 });
      }
    }

    const places = await query.limit(100).lean();

    return NextResponse.json({
      total: places.length,
      places,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch places";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to add a place" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check rate limit: max 5 places per user per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSubmissions = await Place.countDocuments({
      createdBy: session.userId,
      createdAt: { $gte: oneDayAgo },
    });

    if (recentSubmissions >= 5) {
      return NextResponse.json(
        {
          error:
            "Daily limit reached. To maintain quality, you can submit up to 5 places per day.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = placeCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const baseSlug = slugify(data.name);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Compute priceBand
    let priceBand: "budget" | "moderate" | "treat" = "budget";
    if (data.pricePerPerson > 300) priceBand = "treat";
    else if (data.pricePerPerson > 100) priceBand = "moderate";

    // Initial hidden gem score
    const scoreObj = calculateHiddenGemScore({
      avgRating: 4.0,
      reviewCount: 0,
      pricePerPerson: data.pricePerPerson,
      upvotes: 0,
      distinctVisits: 0,
    });

    const newPlace = await Place.create({
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      location: {
        type: "Point",
        coordinates: data.coordinates, // [lng, lat]
      },
      area: data.area,
      city: data.city || "Mumbai",
      pricePerPerson: data.pricePerPerson,
      priceBand,
      openingHours: data.openingHours,
      amenities: data.amenities,
      vibeTags: data.vibeTags,
      crowdLevels: data.crowdLevels,
      images: data.images,
      createdBy: session.userId,
      status: "pending",
      upvoteCount: 0,
      visitCount: 0,
      reviewCount: 0,
      avgRating: 4.0,
      hiddenGemScore: scoreObj.score,
      reportCount: 0,
    });

    // Reward contributor +15 reputation points
    const user = await User.findById(session.userId);
    if (user) {
      user.reputation = (user.reputation || 0) + 15;
      if (user.reputation >= 100 && !user.badges.includes("Local Guide")) {
        user.badges.push("Local Guide");
      } else if (user.reputation >= 30 && !user.badges.includes("Explorer")) {
        user.badges.push("Explorer");
      }
      await user.save();
    }

    return NextResponse.json(
      {
        message: "Place submitted successfully! It is now pending community verification.",
        place: newPlace,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create place";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
