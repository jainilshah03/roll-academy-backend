import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Gym name is required" },
      { status: 400 }
    );
  }

  try {
    const gym = await prisma.gym.create({
      data: { name },
    });

    return NextResponse.json(gym);
  } catch (error) {
    return NextResponse.json(
      { error: "Gym already exists or failed" },
      { status: 500 }
    );
  }
}
