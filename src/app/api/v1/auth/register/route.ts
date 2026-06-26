import { NextResponse, type NextRequest } from "next/server";
import { register } from "@/lib/api/mock-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email || !body?.password || !body?.full_name) {
      return NextResponse.json(
        { detail: "email, password and full_name are required." },
        { status: 400 },
      );
    }
    if (String(body.password).length < 6) {
      return NextResponse.json(
        { detail: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      register({ email: body.email, password: body.password, full_name: body.full_name }),
    );
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }
}
