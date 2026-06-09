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
    id: "mart-product-21",
    name: "Goldstar Classic Unisex Sneakers (G10-S301) - Lightweight Walking Shoes",
    description: "Nepal's most iconic domestic footwear brand. The Goldstar G10 unisex sneakers are designed for day-to-day comfort, featuring a resilient synthetic canvas finish, non-slip lightweight rubber sole, and classic double-stripe aesthetics. Perfect for morning runs, casual outings, or college wear.",
    price: 1150.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/e3caacda676b25ea6bfcf4b9de623efc.jpg",
    rating: 4.7,
    numReviews: 120,
    stock: 55
  },
  {
    id: "mart-product-22",
    name: "Baltra Rapid-Boil Electric Stainless Steel Kettle (1.8L, 1500W)",
    description: "Modern high-speed Baltra water heater. Built of premium polished stainless steel with double wall thermal intelligence. Features 360-degree wireless swivel base, automatic safety steam-sensor shutoff, boil-dry protection, and visual LED indicator. Essential kitchen assistant for homes in Kathmandu.",
    price: 1399.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/9fbe7e9154ae1b4618ecbf3589df28e2.jpg",
    rating: 4.6,
    numReviews: 87,
    stock: 30
  },
  {
    id: "mart-product-23",
    name: "Ultima Watch Circle Smartwatch with Bluetooth Calling and AMOLED Display",
    description: "Premium Nepalese tech brand smartwatch featuring 1.43\" ultra-bypassing AMOLED display, intelligent bluetooth phone calling system with noise isolation microphone, 24H active heart rate sensor, sleep cycle scanner, SpO2 tracker, and 100+ active fitness modes. Elegant dark metallic case.",
    price: 3899.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/d9bc0fa6bc43df9fac9cda6c2bef9433.jpg",
    rating: 4.9,
    numReviews: 45,
    stock: 15
  },
  {
    id: "mart-product-24",
    name: "Mamaearth Ultra-Light Indian Sunscreen SPF50 with Turmeric & Carrot Seed",
    description: "Dermatologically certified SPF 50 non-greasy lotion specifically formulated for Indian & Nepalese skin tones. Infused with natural turmeric extracts and vitamin-rich carrot seed oil to shield against severe UV damage, block blue-screen emission, and preserve skin health without white casts.",
    price: 750.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.8,
    numReviews: 92,
    stock: 65
  },
  {
    id: "mart-product-25",
    name: "Kathmandu Craft Wooden 12-Jar Rotating Spice Rack / Masala Box Organizer",
    description: "Aesthetic, handcrafted rotational spice rack constructed from durable imported timber. Features 12 clear glass airtight shaker jars, smooth-spinning turntable mechanism, and space-saving vertical footprint. Organizes your native Nepalese spices in beautiful rusticity.",
    price: 1850.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/d05be7ea5c7aefcd3baf62cdfa6eefcb.jpg",
    rating: 4.5,
    numReviews: 24,
    stock: 25
  },
  {
    id: "mart-product-26",
    name: "Mivon Professional Non-Slip 6mm TPE Yoga & Exercise Mat",
    description: "Dual-layer eco-friendly textured TPE fitness mat with superior cushioning, joint-safe shock absorption, alignment assistance stripes, and sweat-proof anti-tear technology. Comes complete with a neat black mesh travel carry bag and strap.",
    price: 1250.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/40cbefced289ce08fae84cd01eef2cf4.jpg",
    rating: 4.6,
    numReviews: 19,
    stock: 40
  },
  {
    id: "mart-product-27",
    name: "Pigeon Deluxe Inner-Lid Stainless Steel Pressure Cooker - 3 Liters",
    description: "Heavily-engineered food-grade stainless steel pressure cooker. Configured with a thick sandwich base for uniform heat distribution, sturdy heat-resistant handles, and triple safety protection mechanisms. Absolute household darling for cooking rice and dal perfectly in record time.",
    price: 2950.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/16cef2a94de2ac0af9cdbe1ae82cefab.jpg",
    rating: 4.8,
    numReviews: 54,
    stock: 18
  },
  {
    id: "mart-product-28",
    name: "Joyroom Portable Waterproof Bluetooth Speaker with RGB Light Show",
    description: "Compact tubular outdoor speaker system with dual passive radiators delivering deep punchy bass. Features 12 hours of uninterrupted audio play, IPX7 complete waterproof build, multi-mode mesmerizing LED light effects, and stable Bluetooth 5.1 connection.",
    price: 2650.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/82beef977ebadced4ef67ad8efc2efb3.jpg",
    rating: 4.7,
    numReviews: 31,
    stock: 22
  },
  {
    id: "mart-product-29",
    name: "Lotus Herbals Safe Sun 3-in-1 Matte Look Daily Sunscreen SPF 40",
    description: "Popular tinted matte daily sunscreen cream combining high-grade UV protection with lightweight makeup foundation finish. Features sweat-proof, oil-controlling, and skin-brightening properties. Delivers non-sticky, velvet-smooth compliance throughout summer.",
    price: 620.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/1abe7ebda6278fcdaeef46cdef82f9c3.jpg",
    rating: 4.5,
    numReviews: 62,
    stock: 80
  },
  {
    id: "mart-product-30",
    name: "Asta WOLF Boost 20000mAh Ultra-Fast Power Bank with Liquid LED Display",
    description: "Sleek high-density portable power battery backing 22.5W Power Delivery (PD) and Quick Charge 3.0. Equipped with 3 smart output slots, advanced smart-chip protection against overheating/overvoltage, and stunning liquid crystal display to track charge percentage.",
    price: 2499.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/d9caedfa78bcdeba69cde47ae8efc2ba9.jpg",
    rating: 4.8,
    numReviews: 38,
    stock: 35
  },
  {
    id: "mart-product-31",
    name: "Asta WOLF Phoenix Smartwatch with 1.85\" IPS Full Touch Screen & BT Calling",
    description: "Budget-friendly durable calling smartwatch from Asta WOLF. Supports a large 1.85-inch vibrant HD IPS display, built-in speaker and high-clarity dialer, IP67 dust & splash waterproofing, 7-day battery life, and complete health tracking including sleep and heart monitoring.",
    price: 2499.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/e92309bc65567e19b565a7cc70f0492c.jpg",
    rating: 4.6,
    numReviews: 29,
    stock: 45
  },
  {
    id: "mart-product-32",
    name: "Baltra Sensible Induction Cooktop (1600W, Feather Touch Controls)",
    description: "Highly energy-efficient induction cooktop featuring a durable polished micro-crystal plate, 6-preset cooking modes, and advanced heat-control sensor. Great for fast cooking without gas. Designed elegantly to suit Nepalese home kitchens.",
    price: 3699.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/9fbe7e9154ae1b4618ecbf3589df28e2.jpg",
    rating: 4.8,
    numReviews: 48,
    stock: 15
  },
  {
    id: "mart-product-33",
    name: "Ultima Atom 192 Wireless Earbuds with 42 Hours Playback & ASAP Charge",
    description: "Premium sound experience with 13mm bass boost drivers, environmental noise cancellation, low latency gaming mode, and ultra-comfortable ergonomic fit. Bluetooth 5.3 creates seamless connections and ASAP Charge gives 75 minutes of playback with just 10 minutes of charging.",
    price: 1399.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/d9bc0fa6bc43df9fac9cda6c2bef9433.jpg",
    rating: 4.7,
    numReviews: 76,
    stock: 80
  },
  {
    id: "mart-product-34",
    name: "WOW Skin Science Red Onion Black Seed Hair Oil (200mL)",
    description: "100% pure cold-pressed botanical oil blend featuring red onion extract and black seed oil. Strengthens hair roots, revitalizes weak strands, reduces hair fall, and adds standard glossy shine. Non-sticky, non-greasy, and fully free of synthetic silicones.",
    price: 599.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.5,
    numReviews: 83,
    stock: 40
  },
  {
    id: "mart-product-35",
    name: "Mamaearth Onion Hair Fall Control Shampoo with Plant Keratin (400mL)",
    description: "Enriched with red onion liquid extract and soy amino acids, this shampoo nourishes follicles, boosts hair density, and significantly limits hair breakage. Formulated for color-treated and natural hair, strictly containing no sulfates, parabens, or phthalates.",
    price: 850.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.7,
    numReviews: 104,
    stock: 35
  },
  {
    id: "mart-product-36",
    name: "Baltra Royal Mixer Grinder with 3 Durable Stainless Steel Jars (500W)",
    description: "Heavy-duty copper-wound motor mixer grinder. Features standard high-speed grinding, visual pulse controller, overload security, and durable vacuum feet. Comes with three robust stainless steel liquidizing, dry, and wet chutney-grinding jars and leak-proof lids.",
    price: 3499.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/16cef2a94de2ac0af9cdbe1ae82cefab.jpg",
    rating: 4.5,
    numReviews: 32,
    stock: 20
  },
  {
    id: "mart-product-37",
    name: "Goldstar Sneaker G3S Athletic Running Shoes - Ultra Light & Durable",
    description: "Nepal's favorite athletic footwear designed with dynamic mesh upper for prime breathability, heavy cushioning phylon sole for impact absorbency, and non-slip rubber grip. Excellent for hiking, gym workouts, or casual everyday wear.",
    price: 1350.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/e3caacda676b25ea6bfcf4b9de623efc.jpg",
    rating: 4.8,
    numReviews: 95,
    stock: 50
  },
  {
    id: "mart-product-38",
    name: "Lotus Herbals Safe Sun SPF 50 Matte Gel Daily Sunscreen (100g)",
    description: "Innovative oil-control gel formulation that absorbs immediately to give a non-sticky matte finish. Protects efficiently against UVA and UVB skin damage, prevents sunburns and premature lines, and limits sweat production.",
    price: 720.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/1abe7ebda6278fcdaeef46cdef82f9c3.jpg",
    rating: 4.6,
    numReviews: 110,
    stock: 60
  },
  {
    id: "mart-product-39",
    name: "Unisex Fleece Comfort Hooded Sweatshirt with Kangaroo Pocket",
    description: "Cozy heavy-blend unisex hoodie constructed with thick inner fleece, adjustable double-lined hood with drawstring, and spacious kangaroo pocket. Provides exceptional warmth in chilly Kathmandu winter mornings.",
    price: 1250.00,
    category: "Home & Lifestyle",
    image: "https://np-live-21.slatic.net/kf/Sb95a2add06d249c6a0a04da9cddd88a0i.jpg",
    rating: 4.7,
    numReviews: 38,
    stock: 45
  },
  {
    id: "mart-product-40",
    name: "Pigeon Non-Stick Kitchen Set - Kadai, Tawa, and Fry Pan (3-Piece)",
    description: "Complete basic cooking set from Pigeon. Covered with 3 layers of food-grade non-stick surface, sturdy heat-resistant handles, and uniform heat-routing bottom compatible with gas stoves. Perfect starter kit.",
    price: 2799.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/16cef2a94de2ac0af9cdbe1ae82cefab.jpg",
    rating: 4.6,
    numReviews: 29,
    stock: 18
  },
  {
    id: "mart-product-41",
    name: "MyPower 10000mAh Powerbank M-105 with Dual USB Ports & Type-C Output",
    description: "Ultra-compact travel battery from MyPower. Built with standard charging protection, a neat battery indicators strip, dual input ports, and dual premium fast charging ports up to 2.1A. Reliable back-up battery.",
    price: 1250.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/d9caedfa78bcdeba69cde47ae8efc2ba9.jpg",
    rating: 4.7,
    numReviews: 23,
    stock: 40
  },
  {
    id: "mart-product-42",
    name: "Wildcraft Trailblazer Outdoor Hiking Backpack - 40 Liters",
    description: "Pro-performance hiking and travel gear from Wildcraft. Offers a spacious 40L multi-pocket layout, ergonomic padded shoulder straps, supportive waist buckle, and heavy-duty water-repellent nylon. Perfect for standard weekend treks.",
    price: 3250.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 12,
    stock: 15
  },
  {
    id: "mart-product-43",
    name: "Cetaphil Gentle Skin Cleanser for Sensitive Skin (250mL)",
    description: "Dermatologist-recommended non-foaming face and body wash. Specifically engineered with micellar technology to dissolve grease and impurities without drying out the skin barrier. Fully soap-free and hypoallergenic.",
    price: 1150.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.9,
    numReviews: 55,
    stock: 30
  },
  {
    id: "mart-product-44",
    name: "Decathlon Quechua Hiking Backpack NH100 (10 Liters) - Compact Bag",
    description: "Iconic compact outdoor daypack. Offers a handy 10-liter volume, padded back straps, double thumb locks, and a quick-zip front compartment. Highly robust and ideal for day trips, cycling, or casual storage.",
    price: 590.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 112,
    stock: 90
  },
  {
    id: "mart-product-45",
    name: "High-Pressure Elastic Car & Bike Garden Washer Water Spray Gun",
    description: "Heavy-duty brass water spray nozzle featuring a premium leak-proof flexible pipe adapter and multiple spray modes (jet, mist, cone, flat). Excellent for cleaning mud off automobiles or watering the garden.",
    price: 650.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/40cbefced289ce08fae84cd01eef2cf4.jpg",
    rating: 4.6,
    numReviews: 21,
    stock: 55
  },
  {
    id: "mart-product-46",
    name: "Classic Wooden Multipurpose Foldable Laptop & Study Table",
    description: "Space-saving portable workstation crafted with a durable MDF wooden top, carbon steel folding legs, convenient integrated iPad holder slit, and ergonomic cup rest. Excellent for remote working or bedside study.",
    price: 850.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/d05be7ea5c7aefcd3baf62cdfa6eefcb.jpg",
    rating: 4.6,
    numReviews: 67,
    stock: 45
  },
  {
    id: "mart-product-47",
    name: "Yonex GR-303 Aluminum Badminton Racket Set with Carry Bag",
    description: "Standard beginner-to-intermediate outdoor recreational racket twin pack from Yonex. Includes two steel-shaft aluminum rackets, durable synthetic nylon gut stringing, and a full zip shoulder carry bag.",
    price: 1950.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/40cbefced289ce08fae84cd01eef2cf4.jpg",
    rating: 4.6,
    numReviews: 31,
    stock: 25
  },
  {
    id: "mart-product-48",
    name: "Nivia Storm Football (Size 5, Rubberized Multi-surface Match ball)",
    description: "Perfect heavy-duty recreation and match ball constructed with 32 panels of durable natural rubber. Excellent structural shape retention, dynamic air retention, and reliable grip on any playground.",
    price: 1299.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/40cbefced289ce08fae84cd01eef2cf4.jpg",
    rating: 4.8,
    numReviews: 44,
    stock: 35
  },
  {
    id: "mart-product-49",
    name: "The Derma Co 2% Salicylic Acid Face Serum for Acne-prone Skin (30mL)",
    description: "Highly effective skin-clarifying formula pairing 2% salicylic acid with witch hazel extracts to melt pore grime, smooth skin bumps, and limit active acne breakouts. Safe, dermatologically vetted, and oil-free.",
    price: 999.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.7,
    numReviews: 40,
    stock: 22
  },
  {
    id: "mart-product-50",
    name: "Kent Gold Gravity-based Non-electric UF Water Purifier (20 Liters)",
    description: "Top-performance gravity-fed drinking water filter. Built with elegant Food-Grade transparent tank, Hollow Fiber Ultrafiltration (UF) membrane that structures complete protection against bacteria and cysts, and 20L storage.",
    price: 4200.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/16cef2a94de2ac0af9cdbe1ae82cefab.jpg",
    rating: 4.7,
    numReviews: 19,
    stock: 12
  },
  {
    id: "mart-product-51",
    name: "Baltra Quartz Room Heater - 2-Rod Instant Heater with Overheat Protection",
    description: "Reliable winter room heater constructed with two high-grade quartz tubes delivering instant glowing heat. Features individual rod control switches, an automatic safety tip-over security switch, and silent running.",
    price: 1599.00,
    category: "Electronic Devices",
    image: "https://static-01.daraz.com.np/p/9fbe7e9154ae1b4618ecbf3589df28e2.jpg",
    rating: 4.5,
    numReviews: 53,
    stock: 40
  },
  {
    id: "mart-product-52",
    name: "Microfiber Fluffy Anti-Skid Shaggy Bathroom Door & Floor Mat",
    description: "Luxurious plush bathroom rug woven with thick super-absorbent microfibers, featuring a water-proof non-slip latex rubber underlay. Extremely soft underfoot and machine washable.",
    price: 399.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/0034b9285cc735fa96248c0658566804.jpg",
    rating: 4.7,
    numReviews: 82,
    stock: 100
  },
  {
    id: "mart-product-53",
    name: "3D Brick PE Foam Self-Adhesive Wall Wallpaper Stickers (10-Pack)",
    description: "Renovation-level PE foam wall cushioning panels featuring clean white brick aesthetics. Backed with rich sticky glue for simple peel-and-stick application. Waterproof, sound-softening, and joint-safe.",
    price: 1499.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/e5c07206bbcd03db8265986d4023b637.jpg",
    rating: 4.6,
    numReviews: 24,
    stock: 50
  },
  {
    id: "mart-product-54",
    name: "Stainless Steel Double Pole Folding Clothes Dryer and Hanging Rack",
    description: "Corrosion-resistant metal clothes airer framework featuring extensive dual rods, adjustable wing heights, and fold-flat mechanics for simple vertical storage. Robust design holds heavy wet garments comfortably.",
    price: 1890.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/d05be7ea5c7aefcd3baf62cdfa6eefcb.jpg",
    rating: 4.5,
    numReviews: 15,
    stock: 30
  },
  {
    id: "mart-product-55",
    name: "Tresemme Keratin Smooth Damage Repair Shampoo with Argan Oil (340mL)",
    description: "Salon-grade smoothing shampoo infused with natural argan oil and restructuring keratin. Seals cuticles, controls frizz for up to 7 days, and repairs weak hair. Safe for everyday color treated washes.",
    price: 650.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.8,
    numReviews: 91,
    stock: 55
  },
  {
    id: "mart-product-56",
    name: "Premium Adjustable Iron Dumbbell Gym Weight Lifting Set (15kg)",
    description: "Heavy-duty home gym strength-training package. Standard with two dumbbells bars, solid safety spinlock collars, and multiple chrome plate increments summing to 15 Kg. Excellent for standard home training.",
    price: 4500.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/40cbefced289ce08fae84cd01eef2cf4.jpg",
    rating: 4.7,
    numReviews: 18,
    stock: 12
  },
  {
    id: "mart-product-57",
    name: "Mamaearth Tea Tree Face Wash with Neem and Tea Tree Oil (100mL)",
    description: "Gently controls skin oils, dissolves deep dirt, and limits acne pimples. Infused with natural tea tree essential oils, cleansing neem extracts, and conditioning aloe vera.",
    price: 399.00,
    category: "Health & Beauty",
    image: "https://static-01.daraz.com.np/p/f96bee7e7ac8cbef2cde1297eefcbdf2.jpg",
    rating: 4.6,
    numReviews: 115,
    stock: 75
  },
  {
    id: "mart-product-58",
    name: "Classic Stainless Steel Double-walled Vacuum Insulated Flask (1.0L)",
    description: "Premium grade thermos bottle keeping hot water steaming and cold juice frozen for 24 full hours. Built with a robust food safe stainless body and airtight screw-on cup cap.",
    price: 1150.00,
    category: "Home & Lifestyle",
    image: "https://static-01.daraz.com.np/p/16cef2a94de2ac0af9cdbe1ae82cefab.jpg",
    rating: 4.7,
    numReviews: 43,
    stock: 25
  },
  {
    id: "mart-product-59",
    name: "Tokla Gold CTC Premium Himalayan Rich Tea Bag Packet (1kg)",
    description: "Nepal's premium high-aroma Himalayan tea, CTC processed for a bold taste, perfect coppery appearance, and refreshing morning energy. Ideal for boiling traditional Nepali milk tea (Chiya).",
    price: 520.00,
    category: "Groceries",
    image: "https://static-01.daraz.com.np/p/0034b9285cc735fa96248c0658566804.jpg",
    rating: 4.8,
    numReviews: 60,
    stock: 150
  },
  {
    id: "mart-product-60",
    name: "Goldstar G10 Classic Low-Top Unisex Casual Walk Shoes",
    description: "The low-profile variant of Nepal's legendary sneaker. Features a highly flexible synthetic canvas upper, super-breathable construction, and high-tension rubber traction soles. Perfect match for active casual everyday wears.",
    price: 950.00,
    category: "Sports & Outdoor",
    image: "https://static-01.daraz.com.np/p/e3caacda676b25ea6bfcf4b9de623efc.jpg",
    rating: 4.8,
    numReviews: 135,
    stock: 65
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
