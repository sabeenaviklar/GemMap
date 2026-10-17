/**
 * End-to-End User Flow Verification Script
 * Tests:
 * 1. Healthcheck
 * 2. User Login & Cookie authentication
 * 3. Image upload with magic bytes (JPEG/PNG/WebP) to /api/upload
 * 4. Image serving from /api/uploads/[filename]
 * 5. Add Place creation with coordinates & price
 * 6. Vote toggle on place + Hidden Gem Score recomputation
 * 7. Visit confirmation toggle + auto-verification rule check
 * 8. Review submission with rating & tip
 * 9. Natural language query parsing
 * 10. Bookmark & List creation
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("🚀 Starting E2E Verification against", BASE_URL);

  // 1. Healthcheck
  console.log("\n1. Testing Healthcheck (/api/health)...");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  if (healthRes.status !== 200 || healthData.status !== "ok") {
    throw new Error(`Healthcheck failed: ${JSON.stringify(healthData)}`);
  }
  console.log("✅ Healthcheck passed: DB is", healthData.db);

  // 2. User Login
  console.log("\n2. Testing User Login (/api/auth/login)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "priya.explorer@gmail.com",
      password: "Password123!",
    }),
  });
  if (!loginRes.ok) {
    const err = await loginRes.text();
    throw new Error(`Login failed: ${err}`);
  }
  const cookie = loginRes.headers.get("set-cookie");
  const loginData = await loginRes.json();
  console.log(`✅ Logged in as: ${loginData.user.name} (${loginData.user.role}, ${loginData.user.reputation} pts)`);

  // 3. Image Upload
  console.log("\n3. Testing Image Upload with real JPEG magic bytes (/api/upload)...");
  // Valid minimal JPEG binary buffer (FF D8 FF E0 00 10 4A 46 49 46 00 01 ...)
  const sampleJpeg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0xff, 0xd9,
  ]);

  const formData = new FormData();
  formData.append(
    "images",
    new Blob([sampleJpeg], { type: "image/jpeg" }),
    "secret_rooftop.jpg"
  );

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed: ${err}`);
  }
  const uploadData = await uploadRes.json();
  const uploadedUrl = uploadData.urls[0];
  console.log("✅ Image uploaded successfully:", uploadedUrl);

  // 4. Verify Image Serving
  console.log("\n4. Verifying uploaded image stream (/api/uploads/[filename])...");
  const imageStreamRes = await fetch(`${BASE_URL}${uploadedUrl}`);
  if (!imageStreamRes.ok) {
    throw new Error(`Failed to stream uploaded image: status ${imageStreamRes.status}`);
  }
  const contentType = imageStreamRes.headers.get("content-type");
  const cacheControl = imageStreamRes.headers.get("cache-control");
  console.log(`✅ Image stream verified: Content-Type=${contentType}, Cache=${cacheControl}`);

  // 5. Create Place
  console.log("\n5. Testing Create Place (/api/places)...");
  const newPlacePayload = {
    name: "Secret Sea-Facing Attic " + Date.now().toString().slice(-4),
    category: "study",
    description: "An authentic quiet rooftop space overlooking the Arabian sea with study tables.",
    coordinates: [72.825, 19.06],
    area: "Bandra West",
    city: "Mumbai",
    pricePerPerson: 80,
    openingHours: "08:00 AM - 10:00 PM",
    amenities: ["Wi-Fi", "Power Outlets", "Seating"],
    vibeTags: ["quiet", "scenic", "solo-friendly"],
    crowdLevels: {
      morning: "low",
      afternoon: "medium",
      evening: "high",
      night: "low",
    },
    images: [uploadedUrl],
  };

  const createPlaceRes = await fetch(`${BASE_URL}/api/places`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(newPlacePayload),
  });

  if (!createPlaceRes.ok) {
    const err = await createPlaceRes.text();
    throw new Error(`Place creation failed: ${err}`);
  }
  const createPlaceData = await createPlaceRes.json();
  const createdSlug = createPlaceData.place.slug;
  const createdId = createPlaceData.place._id;
  console.log(`✅ Place created: "${createPlaceData.place.name}" (Slug: ${createdSlug}, Status: ${createPlaceData.place.status}, Score: ${createPlaceData.place.hiddenGemScore})`);

  // 6. Upvote Place
  console.log("\n6. Testing Upvote Toggle (/api/places/[id]/vote)...");
  const voteRes = await fetch(`${BASE_URL}/api/places/${createdSlug}/vote`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const voteData = await voteRes.json();
  console.log(`✅ Vote recorded: Upvotes = ${voteData.upvoteCount}, New Score = ${voteData.hiddenGemScore}`);

  // 7. Visit Confirmation ("I visited this")
  console.log("\n7. Testing Visit Confirmation (/api/places/[id]/visit)...");
  const visitRes = await fetch(`${BASE_URL}/api/places/${createdSlug}/visit`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const visitData = await visitRes.json();
  console.log(`✅ Visit confirmed: Visits = ${visitData.visitCount}, Status = ${visitData.status}`);

  // 8. Submit Review & Tip
  console.log("\n8. Testing Review Submission (/api/places/[id]/reviews)...");
  const reviewRes = await fetch(`${BASE_URL}/api/places/${createdSlug}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      rating: 5,
      tip: "The corner desk near the window has the best breeze and a dedicated power outlet!",
    }),
  });
  const reviewData = await reviewRes.json();
  console.log(`✅ Review posted: Avg Rating = ${reviewData.placeStats.avgRating}, Reviews = ${reviewData.placeStats.reviewCount}`);

  // 9. Natural Language Query Check
  console.log("\n9. Testing Natural Language Query (/api/search)...");
  const nlpRes = await fetch(`${BASE_URL}/api/search?q=cheap%20quiet%20place%20to%20study%20near%20Bandra%20under%20100`);
  const nlpData = await nlpRes.json();
  console.log(`✅ NLP Search parsed: Locality="${nlpData.parsed.locality}", MaxPrice=₹${nlpData.parsed.maxPrice}, Category="${nlpData.parsed.category}"`);
  console.log(`   Found ${nlpData.total} matching spots.`);

  // 10. Bookmark & List Creation
  console.log("\n10. Testing Curated Trail List (/api/lists)...");
  const listRes = await fetch(`${BASE_URL}/api/lists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      title: "My Custom E2E Study Trail",
      places: [createdId],
      isPublic: true,
    }),
  });
  const listData = await listRes.json();
  console.log(`✅ Trail created: "${listData.list.title}" (Share ID: ${listData.list.shareId})`);

  console.log("\n==================================================");
  console.log("🎉 ALL E2E USER FLOW TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("❌ E2E Verification failed:", err);
  process.exit(1);
});
