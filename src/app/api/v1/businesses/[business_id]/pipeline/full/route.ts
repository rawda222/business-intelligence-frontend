import { NextResponse } from "next/server";
import { runFullPipeline } from "@/lib/api/mock-db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ business_id: string }> },
) {
  const { business_id } = await params;
  return NextResponse.json(runFullPipeline(business_id));
}
