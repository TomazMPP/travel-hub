import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("travel-hub-auth", process.env.AUTH_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
