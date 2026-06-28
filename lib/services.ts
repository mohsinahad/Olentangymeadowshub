export type ServiceCategory = {
  slug: string;
  label: string;
  icon: string;
  description: string;
};

export type ServiceGroup = {
  group: string;
  icon: string;
  services: ServiceCategory[];
};

export const SERVICE_CATEGORY_GROUPS: ServiceGroup[] = [
  {
    group: "Outdoor & Yard",
    icon: "🌿",
    services: [
      { slug: "lawn-mowing", label: "Lawn Mowing", icon: "🌿", description: "Mowing, edging, and trimming" },
      { slug: "garden-weeding", label: "Garden Weeding", icon: "🌻", description: "Keep your garden weed-free all season" },
      { slug: "leaf-blowing", label: "Leaf Blowing", icon: "🍂", description: "Clear leaves from yard and walkways" },
      { slug: "mulching", label: "Mulching", icon: "🌱", description: "Spread mulch in garden beds" },
      { slug: "tree-trimming", label: "Tree Trimming", icon: "🌳", description: "Trim branches and shape shrubs" },
      { slug: "snow-shoveling", label: "Snow Shoveling", icon: "❄️", description: "Driveways, sidewalks, and steps cleared" },
    ],
  },
  {
    group: "Home Exterior",
    icon: "🏠",
    services: [
      { slug: "window-cleaning", label: "Window Cleaning", icon: "🪟", description: "Streak-free windows inside and out" },
      { slug: "gutter-cleaning", label: "Gutter Cleaning", icon: "🏠", description: "Clear leaves and debris from gutters" },
      { slug: "pressure-washing", label: "Pressure Washing", icon: "💦", description: "Driveways, decks, and siding" },
      { slug: "deck-cleaning", label: "Deck Cleaning", icon: "🪵", description: "Scrub and seal your outdoor deck" },
      { slug: "painting", label: "Painting", icon: "🎨", description: "Interior or exterior painting" },
    ],
  },
  {
    group: "Home Interior",
    icon: "🧹",
    services: [
      { slug: "house-cleaning", label: "House Cleaning", icon: "🧹", description: "Full interior clean top to bottom" },
      { slug: "carpet-cleaning", label: "Carpet Cleaning", icon: "🧽", description: "Deep clean carpets and rugs" },
      { slug: "garage-organizing", label: "Garage Organizing", icon: "📦", description: "Sort, organize, and haul out clutter" },
      { slug: "laundry-help", label: "Laundry Help", icon: "👕", description: "Wash, dry, and fold your laundry" },
      { slug: "moving-help", label: "Moving Help", icon: "🚚", description: "Help loading, unloading, and carrying" },
    ],
  },
  {
    group: "Errands & Delivery",
    icon: "🛒",
    services: [
      { slug: "grocery-running", label: "Grocery Running", icon: "🛒", description: "Pick up and deliver your groceries" },
      { slug: "car-washing", label: "Car Washing", icon: "🚗", description: "Full wash, wax, and interior clean" },
      { slug: "package-pickup", label: "Package Pickup", icon: "📬", description: "Pick up packages or make drop-offs" },
      { slug: "airport-dropoff", label: "Airport Drop-off", icon: "✈️", description: "Reliable rides to and from the airport" },
    ],
  },
  {
    group: "Pets & Animals",
    icon: "🐾",
    services: [
      { slug: "dog-walking", label: "Dog Walking", icon: "🐶", description: "Daily walks for your furry friend" },
      { slug: "pet-sitting", label: "Pet Sitting", icon: "🐱", description: "In-home pet care while you're away" },
      { slug: "pet-grooming", label: "Pet Grooming", icon: "✂️", description: "Baths, trims, and nail clipping" },
    ],
  },
  {
    group: "Pool & Recreation",
    icon: "🏊",
    services: [
      { slug: "pool-cleaning", label: "Pool Cleaning", icon: "🏊", description: "Skimming, vacuuming, and chemistry" },
      { slug: "hot-tub-cleaning", label: "Hot Tub Cleaning", icon: "♨️", description: "Clean and balance your hot tub" },
    ],
  },
  {
    group: "Tech & Repairs",
    icon: "🔧",
    services: [
      { slug: "tech-help", label: "Tech Help", icon: "💻", description: "Setup, troubleshoot, and teach tech skills" },
      { slug: "furniture-assembly", label: "Furniture Assembly", icon: "🪑", description: "IKEA and flat-pack furniture built" },
      { slug: "handyman", label: "Handyman Services", icon: "🔧", description: "Small repairs and odd jobs around the house" },
    ],
  },
];

export const SERVICE_CATEGORIES = SERVICE_CATEGORY_GROUPS.flatMap((g) => g.services);

export function getCategoryBySlug(slug: string) {
  return SERVICE_CATEGORIES.find((s) => s.slug === slug);
}

export function getCategoryLabel(slug: string) {
  return getCategoryBySlug(slug)?.label ?? slug;
}
