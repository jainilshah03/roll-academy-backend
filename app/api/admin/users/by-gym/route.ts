import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.error("❌ No token found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "ADMIN") {
      console.error("❌ Not admin:", token.role);
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get("gymId");
    const gymName = searchParams.get("gymName");

    console.log("🔍 Fetching users - gymId:", gymId, "gymName:", gymName);

    if (!gymId && !gymName) {
      console.log("⚠️ No gymId or gymName provided");
      return NextResponse.json([]);
    }

    // Build the where clause based on which parameter is provided
    const whereClause: any = {};
    if (gymId) {
      whereClause.gymId = gymId;
    } else if (gymName) {
      whereClause.gymName = gymName;
    }

    console.log("📋 Query where clause:", whereClause);

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

    console.log(`✅ Found ${users.length} users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Users by gym error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
