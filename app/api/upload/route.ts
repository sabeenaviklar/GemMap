import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { saveFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Authentication required to upload images" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      // Also check single 'image' field
      const single = formData.get("image") as File | null;
      if (single) {
        files.push(single);
      } else {
        return NextResponse.json({ error: "No image file provided" }, { status: 400 });
      }
    }

    if (files.length > 4) {
      return NextResponse.json({ error: "Maximum 4 images allowed per place" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 5MB size limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const saved = await saveFile(buffer, file.name);
        uploadedUrls.push(saved.url);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Validation error";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        message: "Images uploaded successfully",
        urls: uploadedUrls,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
