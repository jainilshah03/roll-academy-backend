import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gyms = await prisma.gym.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(gyms);
  } catch (error) {
    console.error("Fetch gyms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gyms" },
      { status: 500 }
    );
  }
}
