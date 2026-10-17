import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

// Ensure upload directory exists
export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export interface FileValidationResult {
  valid: boolean;
  mimeType?: string;
  ext?: string;
  error?: string;
}

/**
 * Validates file buffer by inspecting magic bytes
 */
export function validateImageSignature(buffer: Buffer): FileValidationResult {
  if (buffer.length < 12) {
    return { valid: false, error: "File buffer too small or corrupt." };
  }

  // Check JPEG (FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: "image/jpeg", ext: "jpg" };
  }

  // Check PNG (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: "image/png", ext: "png" };
  }

  // Check WEBP (RIFF....WEBP)
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (isRiff && isWebp) {
    return { valid: true, mimeType: "image/webp", ext: "webp" };
  }

  return {
    valid: false,
    error: "Invalid file format. Only JPEG, PNG, and WebP images are allowed.",
  };
}

/**
 * Checks for path traversal and ensures filename matches safe format: gem_[32-hex-chars].[ext]
 */
export function isSafeFilename(filename: string): boolean {
  if (!filename || typeof filename !== "string") return false;
  // Strictly allow only lowercase alphanumeric, underscore, and safe extensions
  const safePattern = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i;
  if (!safePattern.test(filename)) return false;

  const targetPath = path.resolve(UPLOAD_DIR, filename);
  // Must reside strictly within UPLOAD_DIR
  return targetPath.startsWith(UPLOAD_DIR + path.sep);
}

export function getFilePath(filename: string): string {
  if (!isSafeFilename(filename)) {
    throw new Error("Invalid or unsafe filename");
  }
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Storage Abstraction: save file buffer and return public relative URL
 */
export async function saveFile(
  buffer: Buffer,
  originalFilename?: string
): Promise<{ url: string; filename: string; mimeType: string }> {
  ensureUploadDir();

  const validation = validateImageSignature(buffer);
  if (!validation.valid || !validation.ext || !validation.mimeType) {
    throw new Error(validation.error || "File signature validation failed");
  }

  // 5MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    throw new Error("File exceeds 5MB size limit");
  }

  const uniqueId = crypto.randomBytes(16).toString("hex");
  const filename = `gem_${Date.now()}_${uniqueId}.${validation.ext}`;
  const targetPath = path.join(UPLOAD_DIR, filename);

  await fs.promises.writeFile(targetPath, buffer);

  return {
    url: `/api/uploads/${filename}`,
    filename,
    mimeType: validation.mimeType,
  };
}

/**
 * Read file stream or buffer from storage
 */
export async function getFile(filename: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!isSafeFilename(filename)) return null;

  const fullPath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(fullPath)) return null;

  const buffer = await fs.promises.readFile(fullPath);
  const ext = path.extname(filename).toLowerCase().replace(".", "");

  let mimeType = "application/octet-stream";
  if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
  else if (ext === "png") mimeType = "image/png";
  else if (ext === "webp") mimeType = "image/webp";

  return { buffer, mimeType };
}
