export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processVideo } from "@/lib/processVideo";
import { mkdir, unlink } from "fs/promises";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

/* ================= R2 CLIENT ================= */
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/* ================= UTILS ================= */
function extractR2Key(url: string): string {
  const u = new URL(url);
  return u.pathname.slice(1);
}

/* ================= FIX & UPLOAD (BACKGROUND) ================= */
async function fixAndUploadVideo(rawUrl: string, videoId: string) {
  const tmpDir = path.join(process.cwd(), "tmp");
  await mkdir(tmpDir, { recursive: true });

  const rawPath = path.join(tmpDir, `${nanoid()}-raw.mp4`);
  const fixedPath = path.join(tmpDir, `${nanoid()}-fixed.mp4`);

  try {
    const key = extractR2Key(rawUrl);

    /* ⬇️ STREAM FROM R2 → FILE */
    const obj = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    );

    if (!obj.Body || !(obj.Body instanceof Readable)) {
      throw new Error("Failed to read R2 object");
    }

    await pipeline(obj.Body, fs.createWriteStream(rawPath));

    /* 🎬 PROCESS VIDEO (FFMPEG) */
    await processVideo(rawPath, fixedPath);

    /* ⬆️ UPLOAD FIXED VIDEO */
    const newKey = `videos/${Date.now()}-${nanoid()}.mp4`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: newKey,
        Body: fs.createReadStream(fixedPath),
        ContentType: "video/mp4",
      })
    );

    const fixedUrl = `${process.env.R2_PUBLIC_BASE_URL}/${newKey}`;

    /* ✅ MARK VIDEO READY */
    await prisma.video.update({
      where: { id: videoId },
      data: {
        url: fixedUrl,
        status: "READY",
      },
    });
  } catch (err) {
    console.error("VIDEO PROCESS ERROR:", err);
  } finally {
    /* 🧹 CLEANUP */
    try {
      await unlink(rawPath);
      await unlink(fixedPath);
    } catch {}
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description = "",
      visibility = "PRIVATE",
      url,
      angles,
      gymId,
      targetedId,
      uploadedById,
    } = body;

    if (!title || (!url && !angles)) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    /* ✅ CREATE VIDEO (PROCESSING) */
    const video = await prisma.video.create({
      data: {
        title,
        description,
        visibility,
        url,
        angles,
        gymId,
        targetedId,
        uploadedById,
        status: "PROCESSING",
      },
    });

    /* 🔥 PROCESS VIDEO IN BACKGROUND */
    if (url) {
      fixAndUploadVideo(url, video.id).catch(console.error);
    }

    /**
     * ⚠️ Multi-angle processing intentionally disabled
     * We will wire it correctly after single-video flow is stable
     */

    return NextResponse.json(video);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
