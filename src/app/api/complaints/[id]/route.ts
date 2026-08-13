import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, isStaff } from "@/lib/auth";

// PATCH /api/complaints/:id — Admin/Staff updates status, department, assignee
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user || !isStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, department, assignedToId, note } = await req.json();

  const existing = await prisma.complaint.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.complaint.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(assignedToId !== undefined ? { assignedToId } : {}),
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
  });

  if (status && status !== existing.status) {
    await prisma.statusLog.create({
      data: {
        complaintId: params.id,
        fromStatus: existing.status,
        toStatus: status,
        note,
        loggedById: session.user.id,
      },
    });
  }

  return NextResponse.json(updated);
}

// GET single complaint w/ full log history
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      assignedTo: { select: { id: true, name: true } },
      logs: { orderBy: { createdAt: "desc" }, include: { loggedBy: true } },
      upvotes: true,
    },
  });
  if (!complaint) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(complaint);
}
