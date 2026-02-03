// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma"; // up 4 levels from this file

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // admin can get any; others can get only themselves
    if (token.role !== "ADMIN" && token.id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // don't return password
    const { password, ...safe } = user as any;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/users/[id] error:", err);
    // handle not found / prisma errors
    const status = (err as any)?.code === "P2025" ? 404 : 500;
    const msg = status === 404 ? "Not found" : "Internal server error";
    return NextResponse.json({ message: msg }, { status });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/users/[id] error:", err);
    const status = (err as any)?.code === "P2025" ? 404 : 500;
    const msg = status === 404 ? "Not found" : "Internal server error";
    return NextResponse.json({ message: msg }, { status });
  }
}
