export type LocalBusinessPost = {
  id: string;
  title: string;
  excerpt: string;
  postedAt: string;
};

export type LocalBusiness = {
  slug: string;
  name: string;
  category: string;
  location: string;
  tagline: string;
  online: boolean;
  verified: boolean;
  followers: number;
  initials: string;
  contactOptions: string[];
  posts: LocalBusinessPost[];
};

export const localBusinesses: LocalBusiness[] = [
  {
    slug: "kape-santo",
    name: "Kape Santo",
    category: "Coffee Shop",
    location: "Cebu City",
    tagline: "Small batch brews and community events for creators.",
    online: true,
    verified: true,
    followers: 1842,
    initials: "KS",
    contactOptions: ["Inquire", "Book a visit", "Reserve for event"],
    posts: [
      {
        id: "ks-1",
        title: "Friday Espresso Flight",
        excerpt: "Try our three-origin espresso flight with pastry pairing this Friday.",
        postedAt: "2h ago",
      },
      {
        id: "ks-2",
        title: "Local Artists Wall",
        excerpt: "We are opening our wall to local visual artists this month.",
        postedAt: "1d ago",
      },
    ],
  },
  {
    slug: "isla-fresh-mart",
    name: "Isla Fresh Mart",
    category: "Grocery",
    location: "Davao City",
    tagline: "Daily essentials with same-day barangay delivery.",
    online: false,
    verified: true,
    followers: 965,
    initials: "IF",
    contactOptions: ["Inquire", "Book a visit", "Bulk order inquiry"],
    posts: [
      {
        id: "if-1",
        title: "Weekend Farm Drop",
        excerpt: "Fresh vegetables from partner farms arrive every Saturday morning.",
        postedAt: "5h ago",
      },
      {
        id: "if-2",
        title: "Delivery Areas Updated",
        excerpt: "Expanded same-day delivery to 3 new barangays.",
        postedAt: "2d ago",
      },
    ],
  },
  {
    slug: "northshore-gadgets",
    name: "Northshore Gadgets",
    category: "Electronics",
    location: "Quezon City",
    tagline: "Affordable devices with after-sales support and repair.",
    online: true,
    verified: false,
    followers: 2310,
    initials: "NG",
    contactOptions: ["Inquire", "Book a visit", "Request product demo"],
    posts: [
      {
        id: "ng-1",
        title: "Student Bundle Promo",
        excerpt: "Laptop + accessories bundles now available for back-to-school season.",
        postedAt: "1h ago",
      },
      {
        id: "ng-2",
        title: "Repair Clinic Slots",
        excerpt: "Walk-in repair clinic slots open every Wednesday and Saturday.",
        postedAt: "3d ago",
      },
    ],
  },
];

export function getLocalBusinessBySlug(slug: string): LocalBusiness | undefined {
  return localBusinesses.find((business) => business.slug === slug);
}
