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
    image: "https://static-01.daraz.com.np/p/e92309bc65567e19b565a7cc70f0492c.jpg",
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
    image: "https://static-01.daraz.com.np/p/cfaaf082b6703e9a422c13daf0b7bf4b.jpg",
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
    image: "https://static-01.daraz.com.np/p/f26b506ffca3212f9901520a2bfeb70f.jpg",
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
    image: "https://static-01.daraz.com.np/p/7f9e0263e0b2144783bcee75b9cc7612.jpg",
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
    image: "https://static-01.daraz.com.np/p/a96cf2949c25e06be70f32d73a4aa299.jpg",
    rating: 4.4,
    numReviews: 14,
    stock: 45
  },
  {
    id: "mart-product-14",
    name: "Rongxin Europe Plug Portable Mini Clip Fan Or Table Fan 3 Blades",
    description: "Ultra-convenient and highly flexible portable cooling fan featuring 3 streamlined blades. Designed for silent operation on your desk, bedside table, or clipped onto bookshelves. Perfect energy-efficient companion for hot summer afternoons.",
    price: 715.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/c4932d72ce8e6984f0aa13b46148f628.jpg",
    rating: 4.6,
    numReviews: 18,
    stock: 32
  },
  {
    id: "mart-product-15",
    name: "Asta WOLF Strike Wireless Earbuds (New Launch) | 45H Playtime | Dual ENC Noise Cancellation",
    description: "High-fidelity wireless audio earbuds with an incredible 45-hour total playtime. Features dual Environmental Noise Cancellation (ENC) for crystal-clear phone calls, ultra-low 40ms audio-to-video latency, stable Bluetooth 5.3 technology, and rapid charging.",
    price: 999.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/8c7d033a6298763d5e493de1146520a2.jpg",
    rating: 4.8,
    numReviews: 54,
    stock: 70
  },
  {
    id: "mart-product-16",
    name: "Sparnod Fitness STH-3002 Home Use Walking Pad & Treadmill Compact Ultra-Slim",
    description: "Ultra-slim, ready-to-use compact home treadmill and walking pad workspace companion. Engineered with high-durability shock absorption layers, dynamic real-time LED display, and robust 100 Kg maximum loading capacity.",
    price: 26499.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/934b8752e6a939eab21e0c2ad819ae39.jpg",
    rating: 4.9,
    numReviews: 11,
    stock: 8
  },
  {
    id: "mart-product-17",
    name: "Unisex Linen Comfort Trouser | Breathable Summer Casual Relax Fit Track Pants",
    description: "Premium lightweight linen comfort trousers designed for cozy summer wear. Features breathable weave, elegant loose relax-fit shape, and elastic waistband with adjustable drawstrings.",
    price: 1599.00,
    category: "Home & Lifestyle",
    image: "https://np-live-21.slatic.net/kf/Sb95a2add06d249c6a0a04da9cddd88a0i.jpg",
    rating: 4.5,
    numReviews: 28,
    stock: 60
  },
  {
    id: "mart-product-18",
    name: "Prime Picks Premium Dental Flosser | IPX7 Portable Oral Irrigator",
    description: "Aesthetic compact waterproof electric dental water flosser. Configured with 3-speed intelligence modes (Soft, Normal, Pulse) for supreme plaque cleaning, deep ortho care, and healthy gums.",
    price: 799.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/40a9811a23e9f02ad76ced500ec9670a.png",
    rating: 4.7,
    numReviews: 44,
    stock: 40
  },
  {
    id: "mart-product-19",
    name: "Big Size Desk PC Computer Desktop Mouse Mat Pad",
    description: "Spacious extra-large desk pad designed to accommodate your computer keyboard and high-speed gaming mice. Features smooth premium anti-fray micro-woven design and skid-proof rubber base.",
    price: 370.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/0034b9285cc735fa96248c0658566804.jpg",
    rating: 4.6,
    numReviews: 39,
    stock: 110
  },
  {
    id: "mart-product-20",
    name: "Reusable Lint Remover For Pets – Ideal for Clothes, Beds & Carpets",
    description: "Effective eco-friendly self-cleaning hair and lint remover. Effortlessly rolls away dog and cat fur from delicate fabrics, linen sheets, couches, blankets, and vehicle seats.",
    price: 66.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/e5c07206bbcd03db8265986d4023b637.jpg",
    rating: 4.4,
    numReviews: 65,
    stock: 150
  },
  {
    id: "mart-product-31",
    name: "Pearlescent Lip Gloss Stick Moisturizing Long Lasting Sparkling Lip Balm Shimmer Lipstick Pen Makeup Cosmetics",
    description: "Experience sparkling elegance with this moisturizing pearlescent lip gloss stick. Engineered with long-lasting hydration factors, premium shimmering glitter micro-particles, and a precise control twist-up pen design. Delivers a soft, non-sticky velvet shimmer finish for gorgeous look daily.",
    price: 248.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 28,
    stock: 120
  },
  {
    id: "mart-product-32",
    name: "HY320 4K Android 13 Projector | Native 1080P | 390 ANSI | WiFi6 | BT5.0 | Portable Home Cinema",
    description: "Unparalleled cinema-grade home entertainment hub. Equipped with native 1080P resolution with 4K decoding support, ultra-bright 390 ANSI lumens, integrated Android 13 OS for instant access to Netflix and YouTube, ultra-fast WiFi 6 and Bluetooth 5.0, auto-focus, and flexible vertical keystone correction.",
    price: 12857.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 45,
    stock: 15
  },
  {
    id: "mart-product-33",
    name: "Men Multipocket Cargo Trouser",
    description: "High-comfort utility daily wear cargo trousers. Tailored from top-tier heavy cotton twill designed to breathe and stretch under rugged outdoor conditions. Set with multiple extra-roomy utility pockets, secure lock stitching, button-fly zipper, and an ergonomic comfortable straight fit contour.",
    price: 1429.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 64,
    stock: 40
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
    price: Math.round(p.price * 1.05), // Added 5% markup as requested by user
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
