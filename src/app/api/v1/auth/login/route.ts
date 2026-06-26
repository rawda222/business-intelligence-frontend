import { NextResponse, type NextRequest } from "next/server";
import { login } from "@/lib/api/mock-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email || !body?.password || String(body.password).length < 6) {
      return NextResponse.json(
        { detail: "Invalid email or password (min 6 chars)." },
        { status: 400 },
      );
    }
    return NextResponse.json(login({ email: body.email, password: body.password }));
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }
}
