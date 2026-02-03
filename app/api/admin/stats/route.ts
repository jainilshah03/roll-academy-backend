import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalVideos,
      instructors,
      students,
      gyms,
    ] = await Promise.all([
      // 🎬 All videos (training + instructor)
      prisma.video.count(),

      // 👨‍🏫 Instructor table
      prisma.instructor.count(),

      // 🎓 All NON-ADMIN users = students
      prisma.user.count({
        where: {
          OR: [
            { role: null },
            { role: "USER" },
            { role: "STUDENT" },
          ],
        },
      }),

      // 🏋️ Total gyms
      prisma.gym.count(),
    ]);

    return NextResponse.json({
      totalVideos,
      instructors,
      students,
      gyms,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}