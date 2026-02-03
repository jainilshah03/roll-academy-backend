import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // 🔐 AUTH
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ subscribed: false });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    // ✅ GLOBAL SUBSCRIPTION CHECK (NO GYM)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.id,
        status: "PAID", // only paid = subscribed
      },
    });

    return NextResponse.json({
      subscribed: !!subscription,
    });
  } catch (err) {
    console.error("SUBSCRIPTION STATUS ERROR:", err);
    return NextResponse.json({ subscribed: false });
  }
}
