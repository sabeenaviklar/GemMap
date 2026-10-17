import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import Place from "@/models/Place";
import User from "@/models/User";
import Review from "@/models/Review";
import Vote from "@/models/Vote";
import Visit from "@/models/Visit";
import List from "@/models/List";
import Report from "@/models/Report";
import { calculateHiddenGemScore } from "@/lib/hiddenGemScore";

// 26 Sample Places across Mumbai localities
const RAW_PLACES = [
  // --- CHEAP EATS (FOOD) ---
  {
    name: "Chai Kadai & Bun Maska Corner",
    category: "food",
    area: "Matunga",
    coordinates: [72.8524, 19.0269],
    pricePerPerson: 45,
    openingHours: "06:30 AM - 10:30 PM",
    amenities: ["Seating"],
    vibeTags: ["crowded", "budget", "morning-special", "solo-friendly"],
    description:
      "[SAMPLE DATA] Tucked beside a quiet lane near Ruia College, this 40-year-old wooden shack serves piping hot ginger lemongrass chai with warm crusty bun maska. Loved by generations of college students.",
    avgRating: 4.8,
    reviewCount: 14,
    upvoteCount: 22,
    visitCount: 18,
  },
  {
    name: "Old Port Dosa Adda",
    category: "food",
    area: "Fort",
    coordinates: [72.8347, 18.9322],
    pricePerPerson: 80,
    openingHours: "08:00 AM - 09:00 PM",
    amenities: ["Washroom", "Seating"],
    vibeTags: ["budget", "solo-friendly", "heritage", "crowded"],
    description:
      "[SAMPLE DATA] Located in a colonial heritage arcade near Ballard Estate. Legendary crispy butter Mysore masala dosa served on banana leaves with freshly ground coconut-mint chutney.",
    avgRating: 4.6,
    reviewCount: 9,
    upvoteCount: 15,
    visitCount: 11,
  },
  {
    name: "Aunty's Secret Sindhi Dal Pakwan",
    category: "food",
    area: "Chembur",
    coordinates: [72.8982, 19.0622],
    pricePerPerson: 70,
    openingHours: "07:00 AM - 01:00 PM",
    amenities: ["Seating"],
    vibeTags: ["budget", "morning-special", "family-friendly"],
    description:
      "[SAMPLE DATA] Only open for morning breakfast. Golden crispy carom-seeded pakwans served with slow-simmered chana dal, tangy tamarind drizzle and chopped raw onions.",
    avgRating: 4.9,
    reviewCount: 7,
    upvoteCount: 12,
    visitCount: 9,
  },
  {
    name: "Kaka's Steamy Idli & Filter Kaapi",
    category: "food",
    area: "Dadar",
    coordinates: [72.8427, 19.019],
    pricePerPerson: 55,
    openingHours: "06:00 AM - 08:30 PM",
    amenities: ["Seating"],
    vibeTags: ["budget", "quiet", "morning-special"],
    description:
      "[SAMPLE DATA] A soothing hole-in-the-wall spot with traditional brass tumbler filter coffee and melt-in-mouth button idlis dipped in fragrant sambar.",
    avgRating: 4.7,
    reviewCount: 11,
    upvoteCount: 19,
    visitCount: 14,
  },
  {
    name: "Midnight Frankie & Bhurji Den",
    category: "food",
    area: "Andheri",
    coordinates: [72.8364, 19.129],
    pricePerPerson: 110,
    openingHours: "07:00 PM - 03:30 AM",
    amenities: ["Seating"],
    vibeTags: ["late-night", "crowded", "budget"],
    description:
      "[SAMPLE DATA] The go-to late-night hunger rescue for night-shift engineers and college crammers. Spicy paneer frankies and buttery scrambled egg bhurji with toasted pav.",
    avgRating: 4.5,
    reviewCount: 16,
    upvoteCount: 26,
    visitCount: 21,
  },
  {
    name: "Baker's Secret Irani Mawa Cake Cabin",
    category: "food",
    area: "Byculla",
    coordinates: [72.8335, 18.9774],
    pricePerPerson: 90,
    openingHours: "08:00 AM - 09:30 PM",
    amenities: ["Seating", "Washroom"],
    vibeTags: ["aesthetic", "quiet", "solo-friendly"],
    description:
      "[SAMPLE DATA] Authentic checkered floors and vintage bentwood chairs. Cardamom-infused warm mawa cakes and Irani chai served in glass tumblers.",
    avgRating: 4.7,
    reviewCount: 13,
    upvoteCount: 17,
    visitCount: 12,
  },

  // --- STUDY SPACES (STUDY) ---
  {
    name: "The Banyan Reading Veranda",
    category: "study",
    area: "Fort",
    coordinates: [72.8315, 18.9288],
    pricePerPerson: 0,
    openingHours: "09:00 AM - 07:00 PM",
    amenities: ["Wi-Fi", "Power Outlets", "Seating", "Washroom"],
    vibeTags: ["quiet", "aesthetic", "solo-friendly"],
    description:
      "[SAMPLE DATA] A tranquil covered colonial corridor surrounded by ancient banyan trees and vintage books. Silent study environment with high ceilings, breezy fans and stable Wi-Fi.",
    avgRating: 4.9,
    reviewCount: 8,
    upvoteCount: 24,
    visitCount: 16,
  },
  {
    name: "Artisan Co-Reading Loft",
    category: "study",
    area: "Bandra",
    coordinates: [72.8276, 19.0553],
    pricePerPerson: 120,
    openingHours: "08:30 AM - 10:00 PM",
    amenities: ["Wi-Fi", "Power Outlets", "Seating", "Washroom", "AC"],
    vibeTags: ["quiet", "aesthetic", "solo-friendly"],
    description:
      "[SAMPLE DATA] Half community coffee lab, half study attic. For the price of one cold brew, you get ergonomic seats, surge-protected power plugs, warm jazz and zero disturbance.",
    avgRating: 4.8,
    reviewCount: 15,
    upvoteCount: 28,
    visitCount: 20,
  },
  {
    name: "Green Glasshouse Study Nook",
    category: "study",
    area: "Powai",
    coordinates: [72.9061, 19.1232],
    pricePerPerson: 150,
    openingHours: "08:00 AM - 11:00 PM",
    amenities: ["Wi-Fi", "Power Outlets", "Seating", "Washroom", "AC"],
    vibeTags: ["quiet", "aesthetic", "scenic"],
    description:
      "[SAMPLE DATA] Glass conservatory surrounded by lush monstera and fiddle-leaf figs near the lake. Ideal for coding marathons, thesis writing and deep focus.",
    avgRating: 4.6,
    reviewCount: 6,
    upvoteCount: 14,
    visitCount: 10,
  },
  {
    name: "Lighthouse Library & Rooftop Workdesk",
    category: "study",
    area: "Versova",
    coordinates: [72.8142, 19.1325],
    pricePerPerson: 90,
    openingHours: "09:00 AM - 09:00 PM",
    amenities: ["Wi-Fi", "Power Outlets", "Seating", "Washroom"],
    vibeTags: ["quiet", "scenic", "solo-friendly"],
    description:
      "[SAMPLE DATA] Overlooking the fishing village harbor. Shaded breezy bamboo canopy with dedicated charging stations, cold iced tea and absolute silence.",
    avgRating: 4.7,
    reviewCount: 10,
    upvoteCount: 18,
    visitCount: 13,
  },
  {
    name: "Vile Parle Student Study Hall",
    category: "study",
    area: "Vile Parle",
    coordinates: [72.8441, 19.1021],
    pricePerPerson: 50,
    openingHours: "07:00 AM - 11:30 PM",
    amenities: ["Wi-Fi", "Power Outlets", "Seating", "Washroom", "AC"],
    vibeTags: ["quiet", "budget", "solo-friendly"],
    description:
      "[SAMPLE DATA] Budget student study room with cubicle desks, personal lamps, blazing fast fiber connection and filtered drinking water.",
    avgRating: 4.5,
    reviewCount: 12,
    upvoteCount: 16,
    visitCount: 15,
  },

  // --- SCENIC VIEWPOINTS (VIEWPOINT) ---
  {
    name: "Hidden Sunset Cliff",
    category: "viewpoint",
    area: "Bandra",
    coordinates: [72.8193, 19.0436],
    pricePerPerson: 0,
    openingHours: "05:30 AM - 08:30 PM",
    amenities: ["Seating"],
    vibeTags: ["scenic", "aesthetic", "quiet", "sunset"],
    description:
      "[SAMPLE DATA] A little-known rocky promontory south of Land's End. Zero crowd compared to Bandstand, offering unobstructed views of the Arabian Sea and the sea link lit up at dusk.",
    avgRating: 4.9,
    reviewCount: 18,
    upvoteCount: 29,
    visitCount: 24,
  },
  {
    name: "Gilbert Hill Sunrise Overlook",
    category: "viewpoint",
    area: "Andheri",
    coordinates: [72.8396, 19.1207],
    pricePerPerson: 0,
    openingHours: "06:00 AM - 06:00 PM",
    amenities: ["Seating"],
    vibeTags: ["scenic", "quiet", "morning-special"],
    description:
      "[SAMPLE DATA] A 66-million-year-old monolithic basalt rock column. The top stairway leads to a 360-degree aerial panorama over suburban Mumbai with cooling sea breeze.",
    avgRating: 4.7,
    reviewCount: 8,
    upvoteCount: 17,
    visitCount: 12,
  },
  {
    name: "Sewri Mangrove & Flamingo Perch",
    category: "viewpoint",
    area: "Byculla",
    coordinates: [72.8595, 18.9953],
    pricePerPerson: 0,
    openingHours: "06:00 AM - 06:30 PM",
    amenities: ["Seating"],
    vibeTags: ["scenic", "quiet", "family-friendly"],
    description:
      "[SAMPLE DATA] An elevated secluded jetty jutting into the mudflats. In winter mornings, thousands of pink lesser flamingos gather against the distant harbor cranes.",
    avgRating: 4.8,
    reviewCount: 12,
    upvoteCount: 21,
    visitCount: 14,
  },
  {
    name: "Worli Fort Breezy Bastion",
    category: "viewpoint",
    area: "Worli",
    coordinates: [72.8168, 19.0223],
    pricePerPerson: 0,
    openingHours: "06:00 AM - 07:30 PM",
    amenities: ["Seating"],
    vibeTags: ["scenic", "heritage", "solo-friendly"],
    description:
      "[SAMPLE DATA] 17th-century British stone ramparts perched above the traditional koliwada. Spectacular vantage point directly facing the Bandra-Worli Sea Link cables.",
    avgRating: 4.6,
    reviewCount: 14,
    upvoteCount: 19,
    visitCount: 15,
  },
  {
    name: "Powai Lake Secret Watchtower",
    category: "viewpoint",
    area: "Powai",
    coordinates: [72.9095, 19.1287],
    pricePerPerson: 0,
    openingHours: "06:00 AM - 08:00 PM",
    amenities: ["Seating"],
    vibeTags: ["scenic", "quiet", "aesthetic"],
    description:
      "[SAMPLE DATA] Hidden among dense eucalyptus trails along the northern perimeter of Powai lake. Quiet wooden gazebo where water lilies bloom and herons fish.",
    avgRating: 4.7,
    reviewCount: 9,
    upvoteCount: 15,
    visitCount: 11,
  },

  // --- THRIFT MARKETS & VINTAGE (THRIFT) ---
  {
    name: "Old Books & Vinyl Alley",
    category: "thrift",
    area: "Fort",
    coordinates: [72.8329, 18.9304],
    pricePerPerson: 100,
    openingHours: "11:00 AM - 08:30 PM",
    amenities: ["Seating"],
    vibeTags: ["aesthetic", "quiet", "solo-friendly", "budget"],
    description:
      "[SAMPLE DATA] A quiet cobblestone lane packed with piles of rare pre-loved classics, vintage jazz LP vinyls, and retro botanical prints for as low as ₹50.",
    avgRating: 4.8,
    reviewCount: 11,
    upvoteCount: 22,
    visitCount: 17,
  },
  {
    name: "Vintage Thread Collective",
    category: "thrift",
    area: "Bandra",
    coordinates: [72.8331, 19.062],
    pricePerPerson: 250,
    openingHours: "12:00 PM - 09:00 PM",
    amenities: ["AC", "Seating"],
    vibeTags: ["aesthetic", "budget"],
    description:
      "[SAMPLE DATA] Student-run sustainable wardrobe swap and vintage jacket garage. Oversized 90s graphic tees, Japanese denim, and retro sunglasses priced for student budgets.",
    avgRating: 4.7,
    reviewCount: 15,
    upvoteCount: 25,
    visitCount: 19,
  },
  {
    name: "Heritage Brass & Antique Alley",
    category: "thrift",
    area: "Colaba",
    coordinates: [72.8291, 18.9192],
    pricePerPerson: 150,
    openingHours: "11:00 AM - 08:00 PM",
    amenities: ["Seating"],
    vibeTags: ["heritage", "aesthetic", "solo-friendly"],
    description:
      "[SAMPLE DATA] Behind the main causeway, tiny stalls sell pocket compasses, antique magnifying glasses, copper chai kettles, and vintage Bollywood postcards.",
    avgRating: 4.5,
    reviewCount: 9,
    upvoteCount: 13,
    visitCount: 10,
  },
  {
    name: "Retro Camera & Cassette Nook",
    category: "thrift",
    area: "Dadar",
    coordinates: [72.8415, 19.0175],
    pricePerPerson: 200,
    openingHours: "11:30 AM - 08:00 PM",
    amenities: ["Seating"],
    vibeTags: ["aesthetic", "solo-friendly"],
    description:
      "[SAMPLE DATA] Analog photography heaven. Restored point-and-shoot 35mm film cameras, vintage walkmans, and cassette tapes curated by an eccentric retired sound technician.",
    avgRating: 4.9,
    reviewCount: 6,
    upvoteCount: 16,
    visitCount: 11,
  },

  // --- CHILL HANGOUTS (HANGOUT) ---
  {
    name: "Sagar Upvan Botanical Promontory",
    category: "hangout",
    area: "Colaba",
    coordinates: [72.8188, 18.9056],
    pricePerPerson: 20,
    openingHours: "06:00 AM - 08:30 PM",
    amenities: ["Seating", "Washroom"],
    vibeTags: ["quiet", "scenic", "family-friendly", "solo-friendly"],
    description:
      "[SAMPLE DATA] A peaceful 12-acre botanical sanctuary perched at the southern tip of the city. Shaded walking loops, giant cactus clusters, and stone benches facing the sea.",
    avgRating: 4.8,
    reviewCount: 17,
    upvoteCount: 27,
    visitCount: 22,
  },
  {
    name: "Silent Stone Steps & Adda",
    category: "hangout",
    area: "Versova",
    coordinates: [72.8123, 19.1352],
    pricePerPerson: 0,
    openingHours: "24 Hours",
    amenities: ["Seating"],
    vibeTags: ["late-night", "scenic", "quiet", "aesthetic"],
    description:
      "[SAMPLE DATA] Low sea-facing granite steps where local poets, musicians, and students sit late at night listening to the gentle tide under amber street lamps.",
    avgRating: 4.7,
    reviewCount: 21,
    upvoteCount: 30,
    visitCount: 26,
  },
  {
    name: "Shivaji Park Shaded Corner Benches",
    category: "hangout",
    area: "Dadar",
    coordinates: [72.8384, 19.0275],
    pricePerPerson: 0,
    openingHours: "05:00 AM - 10:30 PM",
    amenities: ["Seating"],
    vibeTags: ["family-friendly", "solo-friendly", "morning-special"],
    description:
      "[SAMPLE DATA] Beneath the sprawling canopy of gulmohar trees on the perimeter. Watch weekend cricket nets, sip tender coconut water, and read novels in peace.",
    avgRating: 4.6,
    reviewCount: 13,
    upvoteCount: 18,
    visitCount: 15,
  },
  {
    name: "Ghatkopar Lantern Adda",
    category: "hangout",
    area: "Ghatkopar",
    coordinates: [72.9099, 19.0865],
    pricePerPerson: 80,
    openingHours: "05:00 PM - 01:00 AM",
    amenities: ["Seating"],
    vibeTags: ["late-night", "crowded", "budget"],
    description:
      "[SAMPLE DATA] Fairy-lit pedestrian nook near the food street. Low cane stools, warm masala milk, board games, and lively student conversations.",
    avgRating: 4.5,
    reviewCount: 10,
    upvoteCount: 15,
    visitCount: 12,
  },
  {
    name: "Pali Hill Canopy Walk",
    category: "hangout",
    area: "Bandra",
    coordinates: [72.8298, 19.0655],
    pricePerPerson: 0,
    openingHours: "24 Hours",
    amenities: ["Seating"],
    vibeTags: ["quiet", "aesthetic", "scenic"],
    description:
      "[SAMPLE DATA] A winding tree-shaded residential slope away from traffic. Ancient rain trees, charming stone cottages, and pocket benches for quiet evening talks.",
    avgRating: 4.7,
    reviewCount: 11,
    upvoteCount: 17,
    visitCount: 13,
  },
  {
    name: "Juhu Gully Tea Garden",
    category: "hangout",
    area: "Juhu",
    coordinates: [72.8335, 19.0991],
    pricePerPerson: 60,
    openingHours: "07:00 AM - 11:00 PM",
    amenities: ["Seating", "Wi-Fi"],
    vibeTags: ["aesthetic", "budget", "solo-friendly"],
    description:
      "[SAMPLE DATA] Hidden inside an open-air alley garden behind the main road. Bamboo benches, flowering bougainvillea, organic herbal teas, and gentle sea breeze.",
    avgRating: 4.8,
    reviewCount: 14,
    upvoteCount: 23,
    visitCount: 18,
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const currentCount = await Place.countDocuments();
    if (currentCount > 0 && !force) {
      return NextResponse.json({
        message: `Database is already seeded with ${currentCount} places. Add ?force=true to re-seed.`,
        placesCount: currentCount,
      });
    }

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Place.deleteMany({}),
      Review.deleteMany({}),
      Vote.deleteMany({}),
      Visit.deleteMany({}),
      List.deleteMany({}),
      Report.deleteMany({}),
    ]);

    // Create 3 Users
    const salt = await bcrypt.genSalt(10);
    const userPass = await bcrypt.hash("Password123!", salt);
    const adminPass = await bcrypt.hash("AdminPass123!", salt);

    const adminUser = await User.create({
      name: "Aarav Mehta (Admin)",
      email: "admin@hiddengems.local",
      passwordHash: adminPass,
      role: "admin",
      reputation: 280,
      badges: ["Local Guide", "Explorer", "Newcomer"],
      savedPlaces: [],
    });

    const userPriya = await User.create({
      name: "Priya Sharma",
      email: "priya.explorer@gmail.com",
      passwordHash: userPass,
      role: "user",
      reputation: 85,
      badges: ["Explorer", "Newcomer"],
      savedPlaces: [],
    });

    const userRohan = await User.create({
      name: "Rohan Deshmukh",
      email: "rohan.student@college.edu",
      passwordHash: userPass,
      role: "user",
      reputation: 35,
      badges: ["Newcomer"],
      savedPlaces: [],
    });

    // Curated high quality photography per category
    const CATEGORY_IMAGES: Record<string, string[]> = {
      food: [
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
      ],
      study: [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
      ],
      viewpoint: [
        "https://www.mageba-group.com/sk/data/docs/en/52134/Bandra-Worli-Sea-Link.jpg?v=1.1",
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/309179823.jpg?k=53b55d5d5014e77e4629c97d3232f10512c5cdd8ec11bac91946ca4caac3dd19&o=",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUMVb-95oTi_uIreP1DD_n6_taHg0mDbsZG66EqfedyOpzWmRLjw0tYIk&s=10",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/81/5b/59/very-clean-beach-thanks.jpg?w=900&h=500&s=1",
      ],
      thrift: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1525562723836-d6571c671f1b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      ],
      hangout: [
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      ],
    };

    // Insert 26 Places
    const placesToInsert = RAW_PLACES.map((p, idx) => {
      const slug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      let priceBand: "budget" | "moderate" | "treat" = "budget";
      if (p.pricePerPerson > 300) priceBand = "treat";
      else if (p.pricePerPerson > 100) priceBand = "moderate";

      const scoreResult = calculateHiddenGemScore({
        avgRating: p.avgRating,
        reviewCount: p.reviewCount,
        pricePerPerson: p.pricePerPerson,
        upvotes: p.upvoteCount,
        distinctVisits: p.visitCount,
      });

      const pool = CATEGORY_IMAGES[p.category] || CATEGORY_IMAGES.food;
      const placeImage = pool[idx % pool.length];

      return {
        name: p.name,
        slug,
        description: p.description,
        category: p.category,
        location: {
          type: "Point",
          coordinates: p.coordinates, // [lng, lat]
        },
        area: p.area,
        city: "Mumbai",
        pricePerPerson: p.pricePerPerson,
        priceBand,
        openingHours: p.openingHours,
        amenities: p.amenities,
        vibeTags: p.vibeTags,
        crowdLevels: {
          morning: p.category === "study" || p.pricePerPerson < 60 ? "medium" : "low",
          afternoon: p.category === "study" ? "high" : "low",
          evening: p.category === "viewpoint" || p.category === "hangout" ? "high" : "medium",
          night: p.vibeTags.includes("late-night") ? "high" : "low",
        },
        images: [placeImage],
        createdBy: adminUser._id,
        status: p.visitCount >= 3 || p.upvoteCount >= 5 ? "verified" : "pending",
        upvoteCount: p.upvoteCount,
        visitCount: p.visitCount,
        reviewCount: p.reviewCount,
        avgRating: p.avgRating,
        hiddenGemScore: scoreResult.score,
        reportCount: 0,
      };
    });

    const inserted = await Place.insertMany(placesToInsert);

    // Create Sample Trail
    await List.create({
      owner: adminUser._id,
      title: "Weekend in Mumbai Under ₹300 (Study & Sunset Trail)",
      places: [inserted[0]._id, inserted[6]._id, inserted[11]._id, inserted[16]._id],
      isPublic: true,
      shareId: "weekend-under-300",
    });

    // Bookmark some places for Priya
    await User.findByIdAndUpdate(userPriya._id, {
      $set: { savedPlaces: [inserted[0]._id, inserted[1]._id, inserted[6]._id] },
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Successfully seeded ${inserted.length} Mumbai hidden gems and demo users to MongoDB!`,
      placesCount: inserted.length,
      users: ["admin@hiddengems.local", "priya.explorer@gmail.com", "rohan.student@college.edu"],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Seeding failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
