import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/api/mock-db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ business_id: string }> },
) {
  const { business_id } = await params;
  const business = getBusiness(business_id);
  if (!business) {
    return NextResponse.json({ detail: "Business not found." }, { status: 404 });
  }
  return NextResponse.json(business);
}
