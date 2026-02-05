import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const ALLOWED_ORIGIN = "https://roll.academy"; // or https://www.roll.academy

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    // 🔥 FIX: await headers()
    const h = await headers();

    const token = await getToken({
      req: {
        headers: Object.fromEntries(h.entries()),
      } as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.error("❌ No token found");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    if ((token as any).role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get("gymId");
    const gymName = searchParams.get("gymName");

    if (!gymId && !gymName) {
      return NextResponse.json([], { headers: corsHeaders });
    }

    const whereClause: any = {};
    if (gymId) whereClause.gymId = gymId;
    else if (gymName) whereClause.gymName = gymName;

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ Users fetch error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
