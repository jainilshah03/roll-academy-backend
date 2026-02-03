// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/* ---------------- GET ALL USERS (ADMIN ONLY) ---------------- */
export async function GET(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get("gymId");

    if (!gymId) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: { gymId },
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = users.map(({ password, ...rest }) => rest);
    return NextResponse.json(safeUsers);
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


/* ---------------- CREATE USER (ADMIN ONLY) ---------------- */
export async function POST(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name, role = "TEACHER", password, gymId } = body;

if (!email || !password || !gymId) {
  return NextResponse.json(
    { message: "Missing fields" },
    { status: 400 }
  );
}

const hashedPassword = await bcrypt.hash(password, 10);

const user = await prisma.user.create({
  data: {
    email,
    name,
    role,
    password: hashedPassword,
    gym: {
      connect: { id: gymId },
    },
  },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    gymId: true,
  },
});


    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/users error:", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
