import { PrismaClient, Role } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

async function loadLocalEnv() {
  if (process.env.DATABASE_URL) return;

  try {
    const envText = await readFile(path.join(process.cwd(), ".env"), "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^"|"$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Local seed still works if env is already injected by the shell.
  }
}

async function main() {
  await loadLocalEnv();

  if (process.env.NODE_ENV === "production") {
    throw new Error("Do not run seed in production");
  }

  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const seedDocumentName = "seed-sample-permit.pdf";
  await writeFile(path.join(uploadsDir, seedDocumentName), Buffer.from("%PDF-1.1\n%seed file\n"));

  await prisma.post.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.trend.deleteMany();
  await prisma.trendingPost.deleteMany();
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

  await prisma.trendingPost.createMany({
    data: [
      {
        title: "YouTube: Creator Economy Turns Local",
        category: "youtube",
        snippet: "Local creators are turning long-form clips into citywide discoverability engines.",
        content: "The YouTube rail is now the long-form lane for Negosyante Island. This story explores creator-led business discovery, interviews, and explainers that turn attention into trust.",
        imageUrl: "/trending/hawak-mo-ang-beat.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "Why YouTube still leads trust",
        insightBody: "Long-form video lets businesses show process, proof, and personality before the click.",
      },
      {
        title: "TikTok: 15-Second Buyer Attention",
        category: "tiktok",
        snippet: "Short-form attention is the fastest lane from curiosity to action.",
        content: "The TikTok rail shows how fast hooks, captions, and motion previews can pull people into a story before they scroll away.",
        imageUrl: "/trending/me-and-my-bro.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "Why short-form wins first impressions",
        insightBody: "A sharp opening frame and a readable subtitle are enough to start a journey.",
      },
      {
        title: "Instagram: Visual Moodboard Wave",
        category: "instagram",
        snippet: "Curated visuals drive immediate vibe checks and saving behavior.",
        content: "Instagram stories here act as visual moodboards, helping users see tone, colors, and product style at a glance.",
        imageUrl: "/trending/hawak-mo-ang-beat.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "Visual language matters",
        insightBody: "Consistency across visuals builds memory faster than text alone.",
      },
      {
        title: "Facebook: Community Pulse Report",
        category: "facebook",
        snippet: "Community comments and shares still move local discovery.",
        content: "The Facebook lane keeps conversation, local groups, and repost culture in the same place so users can judge momentum quickly.",
        imageUrl: "/trending/me-and-my-bro.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "Why community still converts",
        insightBody: "Social proof from neighbors is still one of the strongest trust signals.",
      },
      {
        title: "X: Breaking Thread Snapshot",
        category: "x",
        snippet: "Fast context and breaking reactions in one channel.",
        content: "The X rail is intentionally compressed: headlines, reactions, and immediate context stay readable in a single glance.",
        imageUrl: "/trending/hawak-mo-ang-beat.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "When speed beats depth",
        insightBody: "Some stories are best seen as live reactions before they become deep analysis.",
      },
      {
        title: "Reddit: Threaded Hot Takes",
        category: "reddit",
        snippet: "Community debate turns loose opinions into useful signal.",
        content: "Reddit-style rows are the best place for layered takes, practical advice, and the kind of discussion that surfaces hidden context.",
        imageUrl: "/trending/me-and-my-bro.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "The value of threaded context",
        insightBody: "When users can compare opinions, they get better context faster.",
      },
      {
        title: "The Internet: Culture Heat Check",
        category: "the_internet",
        snippet: "A broad culture lane that captures what everyone is remixing.",
        content: "This story box acts like the Internet shelf: broad, weird, fast, and perfect for immediate cultural context.",
        imageUrl: "/trending/hawak-mo-ang-beat.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "The culture layer above all channels",
        insightBody: "Broad internet signal ties the specialized platforms together.",
      },
      {
        title: "For You: Mixed Signal Discovery",
        category: "youtube",
        snippet: "Mixed recommendations help the user settle into the right lane.",
        content: "The For You lane is a curated blend of the strongest stories across formats, balancing surprise with relevance.",
        imageUrl: "/trending/me-and-my-bro.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "Why mixed feeds keep users moving",
        insightBody: "Variety prevents fatigue and keeps the rail feeling alive.",
      },
      {
        title: "Deep Dive: Insider Context",
        category: "facebook",
        snippet: "Insight-ready cards for users who want the next layer.",
        content: "Deep Dive cards bring the extra context, interpretation, and angle behind the story box.",
        imageUrl: "/trending/hawak-mo-ang-beat.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "The next layer after the headline",
        insightBody: "Insight cards help users understand why a story matters.",
      },
      {
        title: "Fast Facts: What’s Moving Right Now",
        category: "instagram",
        snippet: "Short context blocks for the user who just wants the headline and the why.",
        content: "Fast Facts is the compact lane for users who want to move quickly without missing context.",
        imageUrl: "/trending/me-and-my-bro.svg",
        videoUrl: null,
        videoLoopSeconds: 5,
        isDraft: false,
        isInsightReady: true,
        insightTitle: "The compact format wins attention",
        insightBody: "Users can decide faster when the facts are front-loaded.",
      },
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
