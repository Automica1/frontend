// src/app/api/auth/route.ts
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getAccessTokenRaw } = getKindeServerSession();
    const accessToken = await getAccessTokenRaw();
    
    return NextResponse.json({ accessToken });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }
}