import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const bio = formData.get("bio") as string | null;
    const avatarFile = formData.get("avatar") as File | null;

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug required" },
        { status: 400 }
      );
    }

    let avatarPath: string | null = null;

    if (avatarFile) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "instructors"
      );

      await mkdir(uploadDir, { recursive: true });

      const filename = `${slug}-${Date.now()}${path.extname(
        avatarFile.name
      )}`;

      await writeFile(path.join(uploadDir, filename), buffer);

      avatarPath = `/uploads/instructors/${filename}`;
    }

    await prisma.instructor.create({
      data: {
        name,
        slug,
        bio,
        avatar: avatarPath,
      },
    });

    // ✅ IMPORTANT: always return success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("CREATE INSTRUCTOR ERROR:", err);
    return NextResponse.json(
      { message: "Failed to create instructor" },
      { status: 500 }
    );
  }
}
