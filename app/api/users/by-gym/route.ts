import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get("gymId");
    const gymName = searchParams.get("gymName");

    if (!gymId && !gymName) {
      return NextResponse.json([]);
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

    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ Users by gym error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
