import { z } from "zod";

const BANNED_WORDS = [
  "spam",
  "viagra",
  "casino",
  "cryptocurrency",
  "scam",
  "free money",
  "click here",
  "buy followers",
];

export function containsSpamOrProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

// User registration & login schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Place schema
export const placeCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  category: z.enum(["food", "study", "viewpoint", "thrift", "hangout"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000)
    .refine((val) => !containsSpamOrProfanity(val), {
      message: "Description contains disallowed or spam keywords",
    }),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
  area: z.string().min(2, "Area or locality is required").max(100),
  city: z.string().default("Mumbai"),
  pricePerPerson: z.number().min(0).max(10000),
  openingHours: z.string().min(2).max(100),
  amenities: z.array(z.string()).default([]),
  vibeTags: z.array(z.string()).default([]),
  crowdLevels: z
    .object({
      morning: z.enum(["low", "medium", "high"]).default("low"),
      afternoon: z.enum(["low", "medium", "high"]).default("medium"),
      evening: z.enum(["low", "medium", "high"]).default("high"),
      night: z.enum(["low", "medium", "high"]).default("medium"),
    })
    .default({
      morning: "low",
      afternoon: "medium",
      evening: "high",
      night: "medium",
    }),
  images: z.array(z.string()).max(4).default([]),
});

// Review schema
export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  tip: z
    .string()
    .min(5, "Tip or review must be at least 5 characters")
    .max(500)
    .refine((val) => !containsSpamOrProfanity(val), {
      message: "Review contains disallowed or spam keywords",
    }),
});

// Report schema
export const reportCreateSchema = z.object({
  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .max(300),
});

// List schema
export const listCreateSchema = z.object({
  title: z.string().min(2).max(100),
  places: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
});
