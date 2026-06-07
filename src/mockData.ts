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
