import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // ✅ FIX: await params
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "Missing instructor slug" },
        { status: 400 }
      );
    }

    const instructor = await prisma.instructor.findUnique({
      where: { slug }, // ✅ NOW VALID
      include: {
        videos: {
          where: {
            instructorId: { not: null },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            visibility: true,
            url: true,     // ✅ REQUIRED
            angles: true,  // ✅ REQUIRED
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instructor);
  } catch (err) {
    console.error("INSTRUCTOR FETCH ERROR:", err);
    return NextResponse.json(
      { message: "Failed to fetch instructor" },
      { status: 500 }
    );
  }
}
