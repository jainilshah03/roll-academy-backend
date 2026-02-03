import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      _count: {
        select: { users: true },
      },
    },
  });

  return NextResponse.json(gyms);
}
