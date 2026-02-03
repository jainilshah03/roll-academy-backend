// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

/* ================= GET USER ================= */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // admin can get any; others only themselves
    if (token.role !== "ADMIN" && token.id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { password, ...safe } = user as any;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE USER ================= */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/users/[id] error:", err);
    const status = (err as any)?.code === "P2025" ? 404 : 500;
    const msg = status === 404 ? "Not found" : "Internal server error";
    return NextResponse.json({ message: msg }, { status });
  }
}

/* ================= DELETE USER ================= */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    const status = (err as any)?.code === "P2025" ? 404 : 500;
    const msg = status === 404 ? "Not found" : "Internal server error";
    return NextResponse.json({ message: msg }, { status });
  }
}
