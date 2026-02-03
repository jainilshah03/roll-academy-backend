import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ======================
   GET INSTRUCTOR BY ID
====================== */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIX

  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id },
    });

    if (!instructor) {
      return NextResponse.json(
        { message: "Instructor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instructor);
  } catch (err) {
    console.error("GET INSTRUCTOR ERROR:", err);
    return NextResponse.json(
      { message: "Failed to fetch instructor" },
      { status: 500 }
    );
  }
}

/* ======================
   UPDATE INSTRUCTOR
====================== */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIX

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const bio = formData.get("bio") as string | null;

    await prisma.instructor.update({
      where: { id },
      data: { name, slug, bio },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("UPDATE INSTRUCTOR ERROR:", err);
    return NextResponse.json(
      { message: "Failed to update instructor" },
      { status: 500 }
    );
  }
}

/* ======================
   DELETE INSTRUCTOR
====================== */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIX

  try {
    await prisma.instructor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE INSTRUCTOR ERROR:", err);
    return NextResponse.json(
      { message: "Failed to delete instructor" },
      { status: 500 }
    );
  }
}
