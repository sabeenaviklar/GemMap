import { NextRequest, NextResponse } from "next/server";
import { getFile, isSafeFilename } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    if (!isSafeFilename(filename)) {
      return NextResponse.json(
        { error: "Invalid or prohibited filename" },
        { status: 400 }
      );
    }

    const file = await getFile(filename);
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Return binary stream with permanent cache header
    return new NextResponse(new Uint8Array(file.buffer), {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": file.buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error streaming file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
