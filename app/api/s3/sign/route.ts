// app/api/s3/sign/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getToken } from "next-auth/jwt";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  try {
    // 1. Authenticate using NextAuth JWT
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2. Parse JSON body
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ message: "Missing" }, { status: 400 });
    }

    // 3. Prepare S3 signed URL
    const Key = `videos/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key,
      ContentType: contentType,
      ACL: "private",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    const objectUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

    // 4. Return signed URL + final object URL
    return NextResponse.json({ uploadUrl, objectUrl });
  } catch (error) {
    console.error("S3 sign error:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

// Reject GET or others
export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
