import { PrismaClient, Role } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Do not run seed in production");
  }

  await prisma.post.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.trend.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = hashSync("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Island Admin",
      email: "admin@negosyante.test",
      passwordHash,
      role: Role.admin,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Juan Dela Cruz",
      email: "user@negosyante.test",
      passwordHash,
      role: Role.user,
    },
  });

  const verifiedBusiness = await prisma.user.create({
    data: {
      name: "Mia Santos",
      email: "biz@negosyante.test",
      passwordHash,
      role: Role.business_verified,
      businessName: "Mia's Kape & Co",
    },
  });

  const pendingBusiness = await prisma.user.create({
    data: {
      name: "Rico Lim",
      email: "pending@negosyante.test",
      passwordHash,
      role: Role.business_pending,
      businessName: "Rico Streetwear",
    },
  });

  await prisma.post.createMany({
    data: [
      {
        content: "#TipidHacks is trending after creators shared budget meal plans.",
        tags: ["TipidHacks", "BudgetMeals"],
        likes: 42,
        comments: 13,
        shares: 10,
        views: 4200,
        authorId: user.id,
      },
      {
        content: "Mia's Kape launches #IslandLatte challenge for summer.",
        tags: ["IslandLatte", "CoffeePH"],
        likes: 91,
        comments: 17,
        shares: 28,
        views: 9800,
        authorId: verifiedBusiness.id,
      },
    ],
  });

  await prisma.verificationRequest.create({
    data: {
      userId: pendingBusiness.id,
      businessName: pendingBusiness.businessName ?? "Rico Streetwear",
      documentType: "mayor_permit",
      documentUrl: seedDocumentName,
      status: "pending",
    },
  });

  await prisma.trend.createMany({
    data: [
      { keyword: "#TipidHacks", engagementPercent: 78.2, views: 5000000, growthPercent: 33.1 },
      { keyword: "#IslandLatte", engagementPercent: 84.5, views: 2700000, growthPercent: 49.2 },
      { keyword: "#BentaPH", engagementPercent: 69.9, views: 1800000, growthPercent: 22.5 },
    ],
  });

  console.log("Seed complete", { admin: admin.email, user: user.email, verifiedBusiness: verifiedBusiness.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const seedDocumentName = "seed-sample-permit.pdf";
  await writeFile(path.join(uploadsDir, seedDocumentName), Buffer.from("%PDF-1.1\n%seed file\n"));
