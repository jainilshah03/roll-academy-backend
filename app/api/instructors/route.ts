import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
      },
    });

    return NextResponse.json(instructors);
  } catch (err) {
    console.error("GET INSTRUCTORS ERROR:", err);
    return NextResponse.json(
      { message: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}
