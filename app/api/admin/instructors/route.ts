import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

/* ============ R2 CONFIG ============ */
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET = process.env.R2_BUCKET!;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL!;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

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

    let avatarUrl: string | null = null;

    if (avatarFile) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = avatarFile.name.split(".").pop();
      const key = `avatars/${slug}-${Date.now()}.${ext}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: avatarFile.type || "image/jpeg",
        })
      );

      avatarUrl = `${R2_PUBLIC_BASE_URL}/${key}`;
    }

    await prisma.instructor.create({
      data: {
        name,
        slug,
        bio,
        avatar: avatarUrl, // ✅ store public R2 URL
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("CREATE INSTRUCTOR ERROR:", err);
    return NextResponse.json(
      { message: "Failed to create instructor" },
      { status: 500 }
    );
  }
}
