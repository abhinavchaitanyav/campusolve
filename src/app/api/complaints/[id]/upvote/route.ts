import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

// POST /api/complaints/:id/upvote — toggles the current user's upvote
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.upvote.findUnique({
    where: {
      userId_complaintId: { userId: session.user.id, complaintId: params.id },
    },
  });

  if (existing) {
    await prisma.upvote.delete({ where: { id: existing.id } });
    const count = await prisma.upvote.count({ where: { complaintId: params.id } });
    return NextResponse.json({ upvoted: false, count });
  }

  await prisma.upvote.create({
    data: { userId: session.user.id, complaintId: params.id },
  });
  const count = await prisma.upvote.count({ where: { complaintId: params.id } });
  return NextResponse.json({ upvoted: true, count });
}
