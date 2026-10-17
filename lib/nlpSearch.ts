export interface ParsedSearchFilters {
  rawQuery: string;
  category?: string;
  maxPrice?: number;
  locality?: string;
  vibeTags: string[];
  amenities: string[];
  openNow?: boolean;
  sortBy?: "hiddenGemScore" | "nearest" | "cheapest" | "newest";
  textQueryRemaining: string;
  chips: Array<{
    id: string;
    label: string;
    type: "category" | "price" | "locality" | "vibe" | "amenity" | "openNow" | "sort";
    value: unknown;
  }>;
}

const CATEGORIES: Record<string, string[]> = {
  food: ["food", "eat", "cafe", "snack", "chai", "coffee", "restaurant", "street food", "dosa", "vada pav", "breakfast", "dinner", "lunch", "bakery"],
  study: ["study", "reading", "read", "library", "cowork", "work", "quiet desk", "book cafe", "books"],
  viewpoint: ["viewpoint", "view", "sunset", "sunrise", "scenic", "rooftop", "sea", "marine", "promenade", "skyline", "cliff"],
  thrift: ["thrift", "vintage", "flea", "market", "bazaar", "shopping", "clothes", "antique", "pre-loved"],
  hangout: ["chill", "hangout", "park", "garden", "relax", "open air", "breeze", "addaa", "friends"],
};

const LOCALITIES = [
  "Andheri",
  "Bandra",
  "Colaba",
  "Dadar",
  "Powai",
  "Fort",
  "Matunga",
  "Juhu",
  "Versova",
  "Ghatkopar",
  "Vile Parle",
  "Chembur",
  "Malad",
  "Borivali",
  "Khar",
  "Mahim",
  "Kurla",
  "BKC",
  "Thane",
  "Navi Mumbai",
  "Marine Drive",
  "Nariman Point",
  "Byculla",
  "Parel",
  "Lower Parel",
  "Girgaon",
  "Worli",
];

const VIBE_KEYWORDS: Record<string, string[]> = {
  quiet: ["quiet", "calm", "peaceful", "silent", "peace"],
  crowded: ["bustling", "crowded", "energetic", "lively"],
  scenic: ["scenic", "pretty", "beautiful", "panoramic"],
  aesthetic: ["aesthetic", "insta", "instagrammable", "cute", "vibey"],
  "late-night": ["late-night", "late night", "night", "midnight", "24/7"],
  "family-friendly": ["family-friendly", "family", "kids"],
  "solo-friendly": ["solo-friendly", "solo", "alone", "myself"],
};

const AMENITY_KEYWORDS: Record<string, string[]> = {
  "Wi-Fi": ["wifi", "wi-fi", "internet", "wlan"],
  "Power Outlets": ["plug", "power", "charging", "outlets", "socket", "sockets"],
  "Seating": ["seating", "seats", "benches", "chairs"],
  "Washroom": ["washroom", "restroom", "toilet", "loo"],
  "AC": ["ac", "air condition", "air-conditioned"],
};

export function parseNaturalLanguageQuery(query: string): ParsedSearchFilters {
  if (!query || typeof query !== "string") {
    return {
      rawQuery: "",
      vibeTags: [],
      amenities: [],
      textQueryRemaining: "",
      chips: [],
    };
  }

  const rawQuery = query.trim();
  let workingText = ` ${rawQuery.toLowerCase()} `;
  const chips: ParsedSearchFilters["chips"] = [];

  let detectedCategory: string | undefined;
  let detectedPrice: number | undefined;
  let detectedLocality: string | undefined;
  const detectedVibes: string[] = [];
  const detectedAmenities: string[] = [];
  let detectedOpenNow: boolean | undefined;
  let detectedSort: ParsedSearchFilters["sortBy"] = undefined;

  // 1. Check Price: e.g. "under 150", "below 200", "< 100", "rs 50"
  const priceRegex = /(?:under|below|less\s+than|<=?|rs\.?|inr)\s*(\d+)/i;
  const priceMatch = workingText.match(priceRegex);
  if (priceMatch && priceMatch[1]) {
    const val = parseInt(priceMatch[1], 10);
    if (!isNaN(val) && val > 0 && val <= 5000) {
      detectedPrice = val;
      workingText = workingText.replace(priceMatch[0], " ");
      chips.push({
        id: `price-${val}`,
        label: `Under ₹${val}`,
        type: "price",
        value: val,
      });
    }
  } else if (/\b(cheap|pocket-friendly|budget|affordable|inexpensive)\b/i.test(workingText)) {
    detectedPrice = 150;
    workingText = workingText.replace(/\b(cheap|pocket-friendly|budget|affordable|inexpensive)\b/i, " ");
    chips.push({
      id: "price-cheap",
      label: "Budget (≤ ₹150)",
      type: "price",
      value: 150,
    });
  }

  // 2. Check Localities: e.g. "near andheri", "in bandra", "at powai"
  for (const loc of LOCALITIES) {
    const locRegex = new RegExp(`\\b(?:near|in|at|around)?\\s*(${loc.toLowerCase()})\\b`, "i");
    if (locRegex.test(workingText)) {
      detectedLocality = loc;
      workingText = workingText.replace(locRegex, " ");
      chips.push({
        id: `loc-${loc}`,
        label: `Near ${loc}`,
        type: "locality",
        value: loc,
      });
      break;
    }
  }

  // 3. Check Categories
  for (const [catKey, keywords] of Object.entries(CATEGORIES)) {
    for (const kw of keywords) {
      const catRegex = new RegExp(`\\b${kw}\\b`, "i");
      if (catRegex.test(workingText)) {
        detectedCategory = catKey;
        workingText = workingText.replace(catRegex, " ");
        chips.push({
          id: `cat-${catKey}`,
          label: catKey.charAt(0).toUpperCase() + catKey.slice(1),
          type: "category",
          value: catKey,
        });
        break;
      }
    }
    if (detectedCategory) break;
  }

  // 4. Check Vibe Tags
  for (const [vibe, keywords] of Object.entries(VIBE_KEYWORDS)) {
    for (const kw of keywords) {
      const vibeRegex = new RegExp(`\\b${kw}\\b`, "i");
      if (vibeRegex.test(workingText)) {
        if (!detectedVibes.includes(vibe)) {
          detectedVibes.push(vibe);
          workingText = workingText.replace(vibeRegex, " ");
          chips.push({
            id: `vibe-${vibe}`,
            label: vibe,
            type: "vibe",
            value: vibe,
          });
        }
        break;
      }
    }
  }

  // 5. Check Amenities
  for (const [amenity, keywords] of Object.entries(AMENITY_KEYWORDS)) {
    for (const kw of keywords) {
      const amRegex = new RegExp(`\\b${kw}\\b`, "i");
      if (amRegex.test(workingText)) {
        if (!detectedAmenities.includes(amenity)) {
          detectedAmenities.push(amenity);
          workingText = workingText.replace(amRegex, " ");
          chips.push({
            id: `amenity-${amenity}`,
            label: amenity,
            type: "amenity",
            value: amenity,
          });
        }
        break;
      }
    }
  }

  // 6. Check Open Now
  if (/\b(open\s+now|currently\s+open|open)\b/i.test(workingText)) {
    detectedOpenNow = true;
    workingText = workingText.replace(/\b(open\s+now|currently\s+open|open)\b/i, " ");
    chips.push({
      id: "open-now",
      label: "Open Now",
      type: "openNow",
      value: true,
    });
  }

  // 7. Check Sort
  if (/\b(cheapest|lowest\s+price)\b/i.test(workingText)) {
    detectedSort = "cheapest";
    workingText = workingText.replace(/\b(cheapest|lowest\s+price)\b/i, " ");
    chips.push({ id: "sort-cheap", label: "Cheapest First", type: "sort", value: "cheapest" });
  } else if (/\b(nearest|closest)\b/i.test(workingText)) {
    detectedSort = "nearest";
    workingText = workingText.replace(/\b(nearest|closest)\b/i, " ");
    chips.push({ id: "sort-near", label: "Nearest", type: "sort", value: "nearest" });
  } else if (/\b(newest|latest)\b/i.test(workingText)) {
    detectedSort = "newest";
    workingText = workingText.replace(/\b(newest|latest)\b/i, " ");
    chips.push({ id: "sort-new", label: "Newest", type: "sort", value: "newest" });
  }

  const remaining = workingText
    .replace(/\b(place|places|spot|spots|find|show|looking|for|to|a|an|the)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    rawQuery,
    category: detectedCategory,
    maxPrice: detectedPrice,
    locality: detectedLocality,
    vibeTags: detectedVibes,
    amenities: detectedAmenities,
    openNow: detectedOpenNow,
    sortBy: detectedSort,
    textQueryRemaining: remaining,
    chips,
  };
}
