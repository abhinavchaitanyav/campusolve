import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import type { Category, Priority } from "@/types";

// GET /api/complaints?category=&status=&priority=&mine=1
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") as Category | null;
  const status = searchParams.get("status");
  const priority = searchParams.get("priority") as Priority | null;
  const mine = searchParams.get("mine");

  const complaints = await prisma.complaint.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(status ? { status: status as never } : {}),
      ...(priority ? { priority } : {}),
      ...(mine && session?.user ? { userId: session.user.id } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      assignedTo: { select: { id: true, name: true } },
      upvotes: { select: { userId: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const shaped = complaints.map((c) => ({
    ...c,
    upvoteCount: c.upvotes.length,
    hasUpvoted: session?.user
      ? c.upvotes.some((u) => u.userId === session.user.id)
      : false,
    upvotes: undefined,
  }));

  return NextResponse.json(shaped);
}

// POST /api/complaints — STUDENT files a new complaint
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, category, priority, location, roomTag, imageUrl } =
    body;

  if (!title || !description || !category || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const complaint = await prisma.complaint.create({
    data: {
      title,
      description,
      category,
      priority: priority ?? "LOW",
      location,
      roomTag,
      imageUrl,
      userId: session.user.id,
    },
  });

  return NextResponse.json(complaint, { status: 201 });
}
