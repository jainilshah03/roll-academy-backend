import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    // 🔐 AUTH
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string; gymId: string };

    // ❗ Prevent duplicate active subscriptions
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: decoded.id,
        status: { in: ["PENDING", "PAID"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Subscription already exists" },
        { status: 400 }
      );
    }

    // 💰 CREATE RAZORPAY ORDER
    const amount = 999 * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // 🧾 CREATE GLOBAL SUBSCRIPTION
    await prisma.subscription.create({
      data: {
        userId: decoded.id,
        gymId: decoded.gymId,
        razorpayOrderId: order.id,
        status: "PENDING",
        // gymId intentionally omitted
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json(
      { message: "Create order failed", error: err?.message },
      { status: 500 }
    );
  }
}
