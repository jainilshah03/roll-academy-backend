import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const ALLOWED_ORIGIN = "https://www.roll.academy";

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
    const session = await getServerSession(authOptions);

    if (!session || (session as any).user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
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
