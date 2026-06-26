import { NextResponse, type NextRequest } from "next/server";
import { uploadReviewsAndRun, getBusiness } from "@/lib/api/mock-db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ business_id: string }> },
) {
  const { business_id } = await params;
  if (!getBusiness(business_id)) {
    return NextResponse.json({ detail: "Business not found." }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { detail: "Expected multipart/form-data upload." },
      { status: 400 },
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "No 'file' field in upload." }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".json")) {
      return NextResponse.json(
        { detail: "Only .json scraper files are supported." },
        { status: 400 },
      );
    }
    return NextResponse.json(uploadReviewsAndRun(business_id, file));
  } catch {
    return NextResponse.json({ detail: "Failed to parse upload." }, { status: 400 });
  }
}
