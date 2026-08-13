import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.upsert({
    where: { email: "student@campus.edu" },
    update: {},
    create: { name: "Asha Rao", email: "student@campus.edu", role: "STUDENT" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@campus.edu" },
    update: {},
    create: { name: "Facilities Admin", email: "admin@campus.edu", role: "ADMIN" },
  });

  await prisma.complaint.createMany({
    data: [
      {
        title: "WiFi unreachable in Block C",
        description: "No signal on 2nd and 3rd floor since this morning.",
        category: "WIFI",
        priority: "HIGH",
        status: "PENDING",
        location: "Block C",
        roomTag: "2nd Floor",
        userId: student.id,
      },
      {
        title: "Broken projector in Lab 4",
        description: "Projector bulb blown, can't run afternoon sessions.",
        category: "LAB",
        priority: "MED",
        status: "IN_PROGRESS",
        location: "Science Building",
        roomTag: "Lab 4",
        userId: student.id,
        assignedToId: admin.id,
        department: "IT Services",
      },
      {
        title: "Leaking tap in Hostel B washroom",
        description: "Constant leak, water pooling on floor — slip hazard.",
        category: "HOSTEL",
        priority: "URGENT",
        status: "PENDING",
        location: "Hostel B",
        roomTag: "Common Washroom",
        userId: student.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
