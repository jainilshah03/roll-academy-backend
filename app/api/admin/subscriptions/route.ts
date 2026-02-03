import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(subscriptions);
  } catch (err) {
    console.error("ADMIN SUBSCRIPTIONS ERROR:", err);
    return NextResponse.json(
      { message: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
