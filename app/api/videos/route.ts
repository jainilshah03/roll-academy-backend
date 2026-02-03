import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ---- CORS CONFIG ---- */
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/* ---- GET VIDEOS (TRAINING / GENERAL ONLY) ---- */
export async function GET(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    /**
     * 🚨 IMPORTANT RULE
     * instructorId MUST be null here
     * otherwise instructor videos leak into training
     */

    // ---- NO TOKEN (frontend proxy) ----
    if (!token) {
      const videos = await prisma.video.findMany({
        where: {
          instructorId: null, // ✅ FIX
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(videos, { headers: corsHeaders });
    }

    const userId = token.id as string;
    const userRole = token.role as string;

    let whereClause: any = {
      instructorId: null, // ✅ FIX (GLOBAL)
    };

    // ---- NON-ADMIN USERS ----
    if (userRole !== "ADMIN") {
      whereClause.OR = [
        { visibility: "PUBLIC" },
        { targetedId: userId },
        { targetedId: null },
      ];
    }
    // ---- ADMIN USERS ----
    // Admin sees ALL training videos (still excluding instructor videos)

    const videos = await prisma.video.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(videos, { headers: corsHeaders });
  } catch (err) {
    console.error("GET VIDEOS ERROR:", err);
    return new NextResponse("Error fetching videos", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

/* ---- CREATE VIDEO (UNCHANGED) ---- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const video = await prisma.video.create({
      data: {
        title: body.title,
        url: body.url,
        description: body.description ?? "",
        visibility: body.visibility ?? "PUBLIC",
      },
    });

    return NextResponse.json(video, { headers: corsHeaders });
  } catch (err) {
    console.error("CREATE VIDEO ERROR:", err);
    return new NextResponse("Error creating video", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

/* ---- REQUIRED FOR CORS ---- */
export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
