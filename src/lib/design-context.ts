export type DesignContext = {
  project: string;
  summary: string;
  principles: string[];
  trustModel: string[];
  architecture: {
    frontend: string;
    backend: string;
    database: string;
  };
  roadmap: string[];
};

export function getDesignContext(): DesignContext {
  return {
    project: "Negosyante Island",
    summary:
      "A social and culture analytics platform connecting users, verified businesses, and admins in a trustworthy system.",
    principles: [
      "Think in systems, not pages",
      "Prioritize scalability and maintainability",
      "Avoid short-term hacks that break architecture",
      "Iterate continuously with clean foundations",
    ],
    trustModel: [
      "Business verification through documentary checks",
      "Admin approval workflow for business accounts",
      "Role-based access and structured moderation",
    ],
    architecture: {
      frontend: "Next.js App Router + React",
      backend: "Next.js route handlers + Node.js runtime",
      database: "PostgreSQL via Prisma ORM",
    },
    roadmap: [
      "Business analytics and financial tooling",
      "AI-powered recommendations",
      "Regional expansion readiness",
    ],
  };
}

export const get_design_context = getDesignContext;
