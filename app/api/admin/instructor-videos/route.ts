export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ================= GET ================= */
export async function GET() {
  const videos = await prisma.video.findMany({
    where: { instructorId: { not: null } },
    orderBy: { createdAt: "desc" },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json(videos);
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const {
      title,
      instructorId,
      visibility = "PUBLIC",
      url,
      angles,
      thumbnail, // ✅ NEW (OPTIONAL)
    } = await req.json();

    if (!title || !instructorId || (!url && !angles)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        instructorId,
        visibility,
        url: url ?? null,
        angles: angles ?? null,
        thumbnail: thumbnail ?? null, // ✅ SAVED
        status: "READY",
      },
    });

    return NextResponse.json(video);
  } catch (err) {
    console.error("INSTRUCTOR VIDEO ERROR:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
