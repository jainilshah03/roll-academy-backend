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
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Correct user id
    const userId = token.sub as string;

    console.log("🔍 Fetching videos for user:", userId);

    const videos = await prisma.video.findMany({
      where: {
        targetedId: userId,
      },
      orderBy: { createdAt: "desc" },

      // ✅ IMPORTANT: include `angles`
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        angles: true,        // ✅ ADD THIS
        thumbnail: true,
        visibility: true,
        createdAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Found ${videos.length} videos for user ${userId}`);

    return NextResponse.json(videos);
  } catch (error) {
    console.error("❌ My videos error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
