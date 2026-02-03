// app/api/videos/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---- CORS CONFIG ----
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ---- GET SINGLE VIDEO ----
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const video = await prisma.video.findUnique({ where: { id } });

    if (!video) {
      return new NextResponse("Video not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    return NextResponse.json(video, { headers: corsHeaders });
  } catch (err) {
    console.error("GET VIDEO ERROR:", err);
    return new NextResponse("Error fetching video", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// ---- UPDATE VIDEO ----
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.video.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        visibility: body.visibility ?? "PRIVATE",
      },
    });

    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return new NextResponse("Error updating video", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// ---- DELETE VIDEO ----
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.video.delete({ where: { id } });

    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return new NextResponse("Error deleting video", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// ---- REQUIRED FOR CORS ----
export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
