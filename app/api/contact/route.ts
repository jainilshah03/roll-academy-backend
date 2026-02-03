import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/* =========================
   CORS CONFIG
========================= */
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000", // frontend URL
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* =========================
   OPTIONS — REQUIRED FOR CORS
========================= */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* =========================
   POST — PUBLIC CONTACT FORM
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, fileUrl } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, email and message are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        fileUrl,
      },
    });

    return NextResponse.json(
      { success: true, contact },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("CONTACT POST ERROR:", error);
    return NextResponse.json(
      { message: "Failed to submit contact form" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =========================
   GET — ADMIN: LIST ENQUIRIES
========================= */
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("CONTACT GET ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch enquiries" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =========================
   PATCH — ADMIN: UPDATE STATUS
========================= */
export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { message: "Missing enquiry id or status" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!["NEW", "READ", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("CONTACT PATCH ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update enquiry" },
      { status: 500, headers: corsHeaders }
    );
  }
}
