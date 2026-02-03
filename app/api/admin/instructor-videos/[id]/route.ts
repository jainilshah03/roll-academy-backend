import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/deleteFromR2";
import { uploadVideoToR2 } from "@/lib/uploadVideoToR2";

/* ================= GET SINGLE ================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true } },
    },
  });

  if (!video) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}

/* ================= DELETE ================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: { url: true, angles: true },
  });

  if (!video) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // SINGLE VIDEO
  if (video.url) {
    const key = new URL(video.url).pathname.slice(1);
    await deleteFromR2(key);
  }

  // MULTI-ANGLE
  if (video.angles) {
    const angles = video.angles as Record<string, string>;
    for (const url of Object.values(angles)) {
      const key = new URL(url).pathname.slice(1);
      await deleteFromR2(key);
    }
  }

  await prisma.video.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

/* ================= UPDATE ================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let updatedAngles = video.angles as any;

  if (body.newAngles) {
    updatedAngles = updatedAngles || {};

    for (const [angle, file] of Object.entries(body.newAngles)) {
      if (file) {
        const oldUrl = updatedAngles[angle];
        if (oldUrl) {
          const oldKey = new URL(oldUrl).pathname.slice(1);
          await deleteFromR2(oldKey);
        }

        updatedAngles[angle] = await uploadVideoToR2(file as any, "instructors");
      }
    }
  }

  const updated = await prisma.video.update({
    where: { id },
    data: {
      title: body.title,
      visibility: body.visibility,
      angles: updatedAngles,
    },
  });

  return NextResponse.json(updated);
}
