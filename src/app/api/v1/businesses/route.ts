import { NextResponse, type NextRequest } from "next/server";
import { listBusinesses, createBusiness } from "@/lib/api/mock-db";

export async function GET() {
  return NextResponse.json(listBusinesses());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.business_type) {
      return NextResponse.json(
        { detail: "name and business_type are required." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      createBusiness({
        name: body.name,
        business_type: body.business_type,
        description: body.description,
        location: body.location,
      }),
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }
}
