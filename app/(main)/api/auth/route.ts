// src/app/api/auth/route.ts
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getAccessTokenRaw } = getKindeServerSession();
    const accessToken = await getAccessTokenRaw();

    // If there's no access token, signal unauthenticated to the client
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', login_url: '/api/auth/login' },
        { status: 401 }
      );
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    // If any error occurs (including unauthenticated), return a JSON 401
    return NextResponse.json(
      { success: false, error: 'UNAUTHORIZED', login_url: '/api/auth/login' },
      { status: 401 }
    );
  }
}