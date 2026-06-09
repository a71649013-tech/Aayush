import { Product, Review } from './types';

// Real retail products from the user's shop photo collection
const RAW_PRODUCTS = [
  {
    id: "mart-product-1",
    name: "PowerLink 3-Way Extension Socket (PL2023M-3M)",
    description: "Premium power strip model PL2023M-3M equipped with 3 universal key sockets, individual light indicators/switches, convenient safety shutters to protect children, and durable on/off master controls. Complete with a heavy-duty 3-meter power cord and 100% pure copper internal contacts.",
    price: 1270.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 24,
    stock: 50
  },
  {
    id: "mart-product-2",
    name: "Adhesive Stick Hooks (3-Piece Bunny Design)",
    description: "Cute bunny and hot air balloon styled stick hooks, 3-piece set featuring ultra-strong backing adhesive. Nail-free mounting works perfectly on pristine flat wood, tiles, or glass walls. Capable of holding up to 3kg maximum loads.",
    price: 90.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 42,
    stock: 120
  },
  {
    id: "mart-product-3",
    name: "\"Cutey's\" Small Countertop Waste Bin",
    description: "Compact countertop mini dustbin featuring of an adorable orange reindeer-eared cover safety lid. Perfect size for office spaces, vanity tables, study desks, or kitchen countertops to discard daily waste efficiently in cute style.",
    price: 315.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1610141160723-d2d346e73766?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 18,
    stock: 65
  },
  {
    id: "mart-product-4",
    name: "Ceramic Tea & Coffee Cup and Saucer Set",
    description: "Delightful high tea ceramic tableware set styled in classic white. Adorned with charming pink floral sprays and sweet polka dot patterns. Glazed body and thick comfortable handles make it highly robust and presentable for family guests.",
    price: 950.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 15,
    stock: 45
  },
  {
    id: "mart-product-5",
    name: "Midea Digital Air Fryer / Multi-Cooker",
    description: "Culinary-grade premium digital air fryer from Midea. Built with a beautiful stainless steel front facade and clear tempered glass viewing window with interior lamp. Standard with various quick-touch smart presets for simple frying.",
    price: 13450.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 31,
    stock: 15
  },
  {
    id: "mart-product-6",
    name: "Sokany Black Air Fryer (Analog Dial)",
    description: "High performance Sokany air fryer. Engineered with rotary manual dials for simple heat and timer controls, dynamic 3D rapid air heating circulation, removable non-stick tray, and obsidian glossy black exterior look.",
    price: 5499.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 19,
    stock: 22
  },
  {
    id: "mart-product-7",
    name: "Kids' Tricycle / Ride-on Toy with Push Handle",
    description: "Tough family tricycle ride-on toy for kids. Constructed of an elegant beige frame, plastic anti-skid wheels, deep front toy storage basket detailed with a funny winking winking face, and helpful parent steer push handle.",
    price: 3499.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1531945086324-4a58cf041440?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 29,
    stock: 18
  },
  {
    id: "mart-product-8",
    name: "Hanging Plastic Flower Pot Planter Set",
    description: "Weather-resistant scalloped edge plastic flower planter pot. Comes fully assembled with a high-durability white hanging triple chain hook. Designed of lightweight UV-stable resin for gorgeous outdoor balcony gardens.",
    price: 123.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 12,
    stock: 80
  },
  {
    id: "mart-product-9",
    name: "E88 Pro With Dual Battery and 4K HD Camera",
    description: "High-performance aerial photography quadcopter. Features dual 4K HD cameras with adjustable wide-angle views, headless mode, optical flow positioning, altitude hold, smart gravity sensing, and intuitive trajectory route flying. Comes with two rechargeable high-capacity batteries providing long-endurance flight time.",
    price: 3412.5,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 36,
    stock: 25
  },
  {
    id: "mart-product-10",
    name: "MEMO CX07 Magnetic Cooler Fan 15W Instant Heatdissipation Phone Cooler Semiconductor Heatsink Compatible with Mobile and Tab Cooling Fan for Gaming",
    description: "Premium semiconductor magnetic phone cooler fan with 15W supreme rapid cooling capability. Features dynamic RGB backlighting and dual-mode silent cooling. Compact shape fits masterfully with major gaming phones and tablets for non-stop smooth frame rates.",
    price: 1522.5,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 24,
    stock: 50
  },
  {
    id: "mart-product-11",
    name: "Computer Set with Core i3 3rd Gen, 8GB DDR3 RAM, 256GB SSD, and 19-inch Monitor",
    description: "Complete cost-effective desktop computer workstation bundle. Excellent for students and commercial offices. Features a standard Intel Core i3 3rd Gen processor, 8GB responsive hardware memory, 256GB high-speed SSD storage, paired with a gorgeous high-contrast 19-inch LED monitor, premium wired keyboard and optical mouse.",
    price: 16275.0,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 18,
    stock: 12
  },
  {
    id: "mart-product-12",
    name: "Mosquito Net Tent for Bed Large Folding Canopy Net Tent Portable Mattress Mosquito Netting for Indoor",
    description: "Multi-functional convenient folding canopy net tent shelter. Formulated using double-filament extra-dense breathable hexagonal mesh. Offers 360-degree perfect shielding against insect bites. Super convenient setup with pop-up structural spring steel loop rings. Easy to fold flat, clean, and carry.",
    price: 1470.0,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 40,
    stock: 65
  },
  {
    id: "mart-product-13",
    name: "Professional Mini Hair Straightener – Titanium Flat Iron for Hair Styling & Straightening, Portable & High_Quality Hot Comb",
    description: "Ultra-compact aesthetic mini flat iron designed with precision floating titanium-coated heating plates. Rehearses high-efficiency continuous styling and instant uniform heating up to 200°C. Perfect lightweight travel-sized design for touch-ups, short cuts, bangs, and smooth straight finishes anywhere.",
    price: 787.5,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    rating: 4.4,
    numReviews: 14,
    stock: 45
  }
];

// Sample reviewer names for premium reviews
const SAMPLE_REVIEWERS = [
  "Abishek Karki", "Sujata Gurung", "Prajwal Shrestha", "Alisha Thapa", 
  "Anish Adhikari", "Niranjan Giri", "Sunita Maharjan", "Pradip Bhatta",
  "Samikshya Joshi", "Bibek Pandey", "Rashmi Khadka", "Dipendra Tamang"
];

const SAMPLE_COMMENTS = [
  "Absolutely incredible, matches photo 100%! Super robust build quality.",
  "Very nice seller, speedy delivery around Kathmandu context. Recommended!",
  "Great premium feel, value is exceptional compared to normal retail shop prices.",
  "Highly pleased with my purchase, packaging was extremely neat and bubble-wrapped.",
  "Sturdy material and looks luxurious. Will definitely order from here again!",
  "Works perfectly out of the box, no defects. Very fast logistics!"
];

// Generate the fully structured Product array
export const MOCK_PRODUCTS: Product[] = [];

// Base array generation
for (const p of RAW_PRODUCTS) {
  const reviewsCount = Math.min(3, Math.floor(p.rating * 10) % 4 + 1);
  const reviewsList: Review[] = [];
  
  for (let i = 0; i < reviewsCount; i++) {
    const rIdx = (p.name.length + i) % SAMPLE_REVIEWERS.length;
    const cIdx = (p.description.length + i) % SAMPLE_COMMENTS.length;
    const revRating = Math.min(5, Math.max(3, Math.round(p.rating) + (i % 2 === 0 ? 0 : -1)));
    
    reviewsList.push({
      id: `rev-${p.id}-${i}`,
      userId: `user-gen-${rIdx}`,
      userName: SAMPLE_REVIEWERS[rIdx],
      rating: revRating,
      comment: SAMPLE_COMMENTS[cIdx],
      createdAt: new Date(Date.now() - (i * 86400000 * 3)).toISOString()
    });
  }

  MOCK_PRODUCTS.push({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.image,
    rating: p.rating,
    numReviews: p.numReviews,
    reviews: reviewsList,
    stock: p.stock,
    sellerId: "seller-admin-999",
    sellerName: "Nepali Mart Stores",
    status: "active"
  });
}
