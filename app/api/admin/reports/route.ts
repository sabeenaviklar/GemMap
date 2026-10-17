import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Report from "@/models/Report";
import Place from "@/models/Place";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const reports = await Report.find()
      .populate("place", "name slug category area status reportCount")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reports });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { reportId, status, removePlace } = body;

    const report = await Report.findById(reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    report.status = status || "reviewed";
    await report.save();

    if (removePlace) {
      await Place.findByIdAndUpdate(report.place, { status: "removed" });
    }

    return NextResponse.json({ message: "Report updated", report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
