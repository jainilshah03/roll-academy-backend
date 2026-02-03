import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { message: "Missing payment details" },
        { status: 400 }
      );
    }

    // 🔐 Create expected signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    // ❌ Signature mismatch
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // ✅ Mark subscription as PAID
    await prisma.subscription.update({
      where: {
        razorpayOrderId: razorpay_order_id,
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: "PAID",
      },
    });

    return NextResponse.json({ message: "Payment verified" });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return NextResponse.json(
      { message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
