import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.roll.academy",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "Missing instructor slug" },
        { status: 400, headers: corsHeaders }
      );
    }

    const instructor = await prisma.instructor.findUnique({
      where: { slug },
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
            url: true,
            angles: true,
          },
        },
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(instructor, { headers: corsHeaders });
  } catch (err) {
    console.error("INSTRUCTOR FETCH ERROR:", err);
    return NextResponse.json(
      { message: "Failed to fetch instructor" },
      { status: 500, headers: corsHeaders }
    );
  }
}
