"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  IndianRupee,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import DynamicLocationPicker from "@/components/Map/DynamicLocationPicker";

const CATEGORIES = [
  { id: "food", label: "Cheap Food & Chai", emoji: "🍜" },
  { id: "study", label: "Quiet Study Space", emoji: "📚" },
  { id: "viewpoint", label: "Scenic Viewpoint", emoji: "🌅" },
  { id: "thrift", label: "Thrift & Vintage Market", emoji: "🛍️" },
  { id: "hangout", label: "Chill Hangout", emoji: "☕" },
];

const VIBE_OPTIONS = [
  "quiet",
  "scenic",
  "aesthetic",
  "late-night",
  "solo-friendly",
  "family-friendly",
  "budget",
  "crowded",
];

const AMENITY_OPTIONS = [
  "Wi-Fi",
  "Power Outlets",
  "Seating",
  "Washroom",
  "AC",
];

export default function AddPlacePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Multi-step form step: 1: Basics, 2: Location, 3: Details & Vibes, 4: Images & Review
  const [step, setStep] = useState(1);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [coordinates, setCoordinates] = useState<[number, number]>([72.825, 19.06]); // [lng, lat]
  const [pricePerPerson, setPricePerPerson] = useState(60);
  const [openingHours, setOpeningHours] = useState("08:00 AM - 10:00 PM");
  const [vibeTags, setVibeTags] = useState<string[]>(["quiet", "budget"]);
  const [amenities, setAmenities] = useState<string[]>(["Seating"]);
  const [crowdLevels, setCrowdLevels] = useState({
    morning: "low",
    afternoon: "medium",
    evening: "high",
    night: "medium",
  });

  // Image Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Require auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/places/new");
    }
  }, [user, authLoading, router]);

  // Handle image files selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (imageFiles.length + files.length > 4) {
      alert("Maximum 4 images allowed per place.");
      return;
    }

    const newFiles = [...imageFiles, ...files].slice(0, 4);
    setImageFiles(newFiles);

    // Generate previews
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const toggleVibe = (tag: string) => {
    setVibeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleAmenity = (am: string) => {
    setAmenities((prev) =>
      prev.includes(am) ? prev.filter((a) => a !== am) : [...prev, am]
    );
  };

  // Submit Place Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      // Step 1: Upload images if any
      let finalUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        imageFiles.forEach((f) => formData.append("images", f));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uData = await uploadRes.json();
          throw new Error(uData.error || "Failed to upload images");
        }
        const uData = await uploadRes.json();
        finalUrls = uData.urls || [];
      }

      // Step 2: Post place data
      const placeData = {
        name,
        category,
        description,
        area,
        city,
        coordinates,
        pricePerPerson: Number(pricePerPerson),
        openingHours,
        amenities,
        vibeTags,
        crowdLevels,
        images: finalUrls,
      };

      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(placeData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit place");
      }

      // Redirect to newly created place
      router.push(`/places/${data.place.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating place";
      setErrorMsg(msg);
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Community Contribution (+15 Reputation Points)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Add a Local Hidden Gem
        </h1>
        <p className="text-xs text-slate-500">
          New spots start as "Pending" and become "Community Verified" once 3 discoverers confirm their physical visit.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        {[
          { num: 1, label: "Basics" },
          { num: 2, label: "Map Location" },
          { num: 3, label: "Details & Vibes" },
          { num: 4, label: "Photos & Review" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-2 cursor-pointer ${
              step === s.num
                ? "text-brand-600 dark:text-brand-400 font-bold"
                : step > s.num
                ? "text-slate-800 dark:text-slate-200 font-semibold"
                : "text-slate-400 font-normal"
            }`}
            onClick={() => setStep(s.num)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? "bg-brand-600 text-white shadow-sm"
                  : step > s.num
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </div>
            <span className="text-xs hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/20 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-soft">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            1. Place Basics
          </h2>

          {/* Place Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Place Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bun Maska & Lemongrass Chai Shack"
              className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center gap-2 transition-all ${
                    category === cat.id
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Area & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Area / Locality *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Bandra West, Fort, Matunga..."
                className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Why is this place special? (Description) *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the atmosphere, authentic charm, special menu items or views..."
              className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={!name || !area || !description}
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-brand-700 disabled:opacity-50"
            >
              <span>Next: Set Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TAP-ON-MAP LOCATION PICKER */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              2. Precise Pin Location
            </h2>
            <span className="text-xs text-slate-400">
              Click anywhere on the map or drag the pin
            </span>
          </div>

          <DynamicLocationPicker
            initialCoordinates={coordinates}
            onChange={(coords) => setCoordinates(coords)}
          />

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-brand-700"
            >
              <span>Next: Details & Vibes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS, HOURS, VIBES, AMENITIES */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-soft">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            3. Pricing, Hours & Vibes
          </h2>

          {/* Pricing & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Avg Price Per Person (₹) *
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                required
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(Number(e.target.value))}
                className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-[10px] text-slate-400">
                Enter 0 for free viewpoints / public gardens
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Opening Hours *
              </label>
              <input
                type="text"
                required
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="e.g. 07:00 AM - 10:30 PM or 24 Hours"
                className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Vibe Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Vibes & Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleVibe(tag)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                    vibeTags.includes(tag)
                      ? "bg-sunset-500 text-white font-bold"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Available Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((am) => (
                <label
                  key={am}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(am)}
                    onChange={() => toggleAmenity(am)}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>{am}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-brand-700"
            >
              <span>Next: Photos & Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: IMAGES & FINAL SUBMIT */}
      {step === 4 && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-soft"
        >
          <div className="space-y-1">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              4. Photos (Optional) & Final Submit
            </h2>
            <p className="text-xs text-slate-500">
              Upload up to 4 real photos (max 5MB each). If no photos are uploaded, a clean gradient placeholder will be displayed automatically.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors">
            <input
              type="file"
              id="place-images"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="place-images"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Click to browse photos
              </span>
              <span className="text-[11px] text-slate-400">
                JPG, PNG or WebP • Max 5MB per image • Up to 4 images
              </span>
            </label>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="relative h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Summary Preview Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Submission Review:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div>
                <strong>Name:</strong> {name}
              </div>
              <div>
                <strong>Category:</strong> {category}
              </div>
              <div>
                <strong>Locality:</strong> {area}, {city}
              </div>
              <div>
                <strong>Price:</strong> ₹{pricePerPerson} / person
              </div>
              <div>
                <strong>Coordinates:</strong> {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
              </div>
              <div>
                <strong>Photos:</strong> {imageFiles.length} attached
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-700 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">🌀</span>
                  <span>{uploadingImages ? "Uploading Photos..." : "Saving Place..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Publish Hidden Gem</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
