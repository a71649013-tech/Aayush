import { Product, Review } from './types';

// Compact representation of 100+ highly realistic Daraz products
const RAW_PRODUCTS = [
  // --- ELECTRONIC DEVICES (11 items) ---
  {
    id: "daraz-elec-1",
    name: "PowerLink 3-Way Heavy Duty Extension Socket (3m)",
    description: "Premium power strip model PL2023M-3M equipped with 3 universal outlets, convenient safety shutters to protect children from accidents, and an elegant red neon main switch. Completed with a durable 3-meter cord and 100% pure copper internals.",
    price: 1270.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 53,
    stock: 30
  },
  {
    id: "daraz-elec-2",
    name: "Micro High-Quality Multi-Socket Extension Board",
    description: "Heavy duty white-orange multi-plug power bar model MPS-514, featuring 6 multi-standard electrical sockets, built-in surge protection, on/off master control switch, and professional safety shutters. Built with fire-retardant material.",
    price: 1150.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1620286127226-a3f559ebd616?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 18,
    stock: 25
  },
  {
    id: "daraz-elec-3",
    name: "SOKANY Professional Multi Smart Air Fryer (4.5L)",
    description: "Elegant 4.5L heavy duty family air fryer in full matte obsidian black. Engineered with rapid 3D air circulation tech, rotary dial timers and temperature knobs, non-slip handle, and dishwasher-safe food rack.",
    price: 5499.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 39,
    stock: 12
  },
  {
    id: "daraz-elec-4",
    name: "Midea Premium Stainless Steel Digital Deck Oven",
    description: "Luxury double deck oven appliance model 57.7837 featuring thick stainless steel build, wide micro-convection heating decks, intuitive electronic display screen, and high quality glass door windows. Pure luxury appliance.",
    price: 22990.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 12,
    stock: 5
  },
  {
    id: "daraz-elec-5",
    name: "Redmi Buds 5 Active Wireless Bluetooth Earbuds",
    description: "Redmi Buds 5 Active delivers deep bass up to 12mm dynamic drivers, dual-mic environmental noise cancellation for crystal clear calls, and up to 30 hours of ultra-long battery life with fast charge support.",
    price: 2999.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 142,
    stock: 110
  },
  {
    id: "daraz-elec-6",
    name: "Fantech Captain HG11 7.1 Virtual Gaming Headset",
    description: "Professional gaming headset featuring virtual 7.1 surround audio sound, beautiful pastel RGB illumination strip, high-sensitivity noise-cancelling flexible microphone, and heavy duty metal alloy frame styling.",
    price: 3499.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 68,
    stock: 45
  },
  {
    id: "daraz-elec-7",
    name: "Anker PowerCore Select 10000mAh Power Bank",
    description: "Legendary Anker quality compact external battery charger with dual high-speed PowerIQ charging ports, advanced multi-protect safety systems, and durable scratch-proof exterior design casing.",
    price: 2999.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1609591035210-226ea96e5db4?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 231,
    stock: 95
  },
  {
    id: "daraz-elec-8",
    name: "Hikvision 1080p Full HD Web Camera with Mic",
    description: "Full glass lens webcam model DS-U02 delivering stunning wide-angle 1080p capture resolutions, built-in dual omnidirectional active microphones, and flexible clip stand compatibility for monitors or desks.",
    price: 2250.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1603162597514-1e5b85a36ebd?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 22,
    stock: 19
  },
  {
    id: "daraz-elec-9",
    name: "Boya BY-M1 Omnidirectional Lavalier Mic (6m)",
    description: "The gold standard lapel microphone featuring extremely low self-noise performance levels, 6-meter highly shielded copper wire cable, and standard gold-plated 3.5mm connector for mobiles and DSLRs.",
    price: 1050.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 145,
    stock: 220
  },
  {
    id: "daraz-elec-10",
    name: "OnePlus Nord Buds 2r Dual Mic TWS",
    description: "Experience massive 12.4mm dynamic sound drivers with active bass-wave boost algorithm. Features dual microphone wind-noise reduction, IP55 sweat resistance, and super-fast 10-minute quick charge playback.",
    price: 4299.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1588449668338-d1516831a4ee?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 87,
    stock: 63
  },
  {
    id: "daraz-elec-11",
    name: "Xiaomi Mi Smart Band 8 Active Fitness Tracker",
    description: "Sleek fitness bracelet equipped with a high-definition 1.47-inch TFT color exhibition, 50+ diverse professional sports modes, 24-hour absolute heart rate tracking, and premium 14-day absolute standby endurance.",
    price: 3599.00,
    category: "Electronic Devices",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 120,
    stock: 80
  },

  // --- HANDICRAFTS (11 items) ---
  {
    id: "daraz-handi-1",
    name: "Handwoven Pure Nepal Hemp Backpack",
    description: "Authentic sustainable backpack handwoven in Western Nepal using wild Nepalese mountain hemp fiber. Embellished with durable heavy-duty vintage metal hardware zippers and multiple pocket partitions.",
    price: 2450.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 32,
    stock: 14
  },
  {
    id: "daraz-handi-2",
    name: "Premium Handcrafted Singing Bowl Set (6\u201d)",
    description: "Genuine high-quality bell bronze alloy sound bowl tuned to deep therapeutic heart chakra healing frequencies. Complete with a padded rosewood striker mallet and beautiful circular silk donut cushion.",
    price: 4500.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1581888517319-570283943d82?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 45,
    stock: 8
  },
  {
    id: "daraz-handi-3",
    name: "Handmade Felt Ball Rainbow Coasters (4-Pack)",
    description: "Adorable coaster plates crafted entirely of hand-matted 100% pure New Zealand sheep wool balls. Protects wooden tea tables from hot mugs or moisture rings perfectly with high visual charm.",
    price: 350.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 19,
    stock: 180
  },
  {
    id: "daraz-handi-4",
    name: "Traditional Nepali Mithila Wall Painting Art",
    description: "Traditional handmade folk painting made on handmade canvas paper using rich natural colors. Painted beautifully by local Janakpur female artists, depicting joyous marriage assembly setups.",
    price: 1800.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 11,
    stock: 6
  },
  {
    id: "daraz-handi-5",
    name: "Wooden Hand-Carved Astamangal Wall Plaque",
    description: "Heavy solid natural Newari wood wall plaque intricately hand-carved in Kathmandu valley. Detailed with the Eight Auspicious Buddhist symbols (Astamangal) for continuous luck and protection.",
    price: 3200.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    numReviews: 9,
    stock: 4
  },
  {
    id: "daraz-handi-6",
    name: "Yak Bone Tibetan Mala Prayer Beads (108)",
    description: "Charming traditional meditation mala comprised of 108 hand-shaped yak bone beads inlaid with delicate circular brass metal, turquoise resin, and red carnelian rings.",
    price: 1200.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 27,
    stock: 22
  },
  {
    id: "daraz-handi-7",
    name: "Handcrafted Lokta Paper Leatherette Diary",
    description: "Gorgeous thick notebook standard with authentic tree-free Lokta paper harvested sustainably in high altitude mountains. Covered in soft vintage embossed faux leather wrap binding.",
    price: 450.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 16,
    stock: 140
  },
  {
    id: "daraz-handi-8",
    name: "Sherpa Style Knit Earflap Warm Woolen Hat",
    description: "Thick double-insulated hand-knitted 100% fine sheep wool winter hat. Finished inside with super-soft fleece lining layer for absolute comfort against snowy Himalayan cold.",
    price: 650.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d4db53e?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 31,
    stock: 75
  },
  {
    id: "daraz-handi-9",
    name: "Artisanal Handmade Brass Butter Lamp Stand",
    description: "Traditional premium heavy solid pure brass ritual butter lamp container. Intricately polished with custom floral engravings to bring peace and cosmic wellness to praying spaces.",
    price: 950.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1602165038089-2ff61d935401?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 15,
    stock: 35
  },
  {
    id: "daraz-handi-10",
    name: "Chobhar Handwoven Bamboo Storage Basket",
    description: "Traditional lightweight and eco-friendly storage picnic basket handwoven nicely using split mountain bamboo culms. Ideal for cosmetics container or serving raw village vegetables.",
    price: 850.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1526434426575-cf0286640850?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 8,
    stock: 50
  },
  {
    id: "daraz-handi-11",
    name: "Hand-Knitted Cozy Merino Wool Scarf",
    description: "Extremely heavy-knit long fashion scarf created beautifully with premium 100% merino block wool yarn. Delivers highly elegant style with thick tassel end detailing.",
    price: 1500.00,
    category: "Handicrafts",
    image: "https://images.unsplash.com/photo-1520638029751-3407583e0df8?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 24,
    stock: 32
  },

  // --- HOME & LIFESTYLE (11 items) ---
  {
    id: "daraz-home-1",
    name: "Cutey's \"简约生活\" Creative Storage Canister",
    description: "A highly charming and premium quality orange storage canister featuring cartoonish rabbit/cactus ears on the cover. Labeled \"简约生活 Cutey's \u2014 Enjoy, live for yourself\", it is perfect for kitchen condiments, coffee beans, cotton pads, or small decorative items.",
    price: 315.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 24,
    stock: 45
  },
  {
    id: "daraz-home-2",
    name: "Sticky Bunny Utility Wall Hooks (3-Pack)",
    description: "Set of three self-adhesive wall hooks in adorable pastel pink bunny themes. Features water-resistant backplates, easy wall attachment, and heavy-duty holding power. Ideal for hanging bathroom robes, kitchen keys, or dish towels.",
    price: 90.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 14,
    stock: 120
  },
  {
    id: "daraz-home-3",
    name: "JO TRACE Elegant Flower Adhesive Hooks (6-pack)",
    description: "Model 52.25257 deluxe transparent JO TRACE hooks with floral gold-toned plates. Extremely strong adhesive backing provides hassle-free toolless wall installation that supports a maximum load capacity of 1.5kg. Fully waterproof and rustproof.",
    price: 125.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 35,
    stock: 80
  },
  {
    id: "daraz-home-4",
    name: "Daisy Heart Stainless Steel Wall Hooks (2-Pack)",
    description: "Rustproof stainless steel adhesive hooks showing intricate heart-shaped and wildflower laser-cut backplates. Backed with authentic industrial self-adhesive sheet that grips firmly onto ceramic tiles, concrete, or dryboards with up to 1.5kg load capacity.",
    price: 120.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
    rating: 4.4,
    numReviews: 9,
    stock: 95
  },
  {
    id: "daraz-home-5",
    name: "Kanisha Heavy Duty Protective Latex Gloves (L)",
    description: "Premium Kanisha multi-purpose industrial pink rubber gloves. Equipped with extra safety non-slip palm grip patterns, long cuffs for water entry protection, and soft inner lining. Perfect for cleaning, dishwashing, or chemical handling.",
    price: 355.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
    rating: 4.3,
    numReviews: 12,
    stock: 150
  },
  {
    id: "daraz-home-6",
    name: "Sovereign Teardrop Relief Glass Vase Jar",
    description: "Exclusive model 55.9933 heavyweight crystal candle votive / center piece container. Molded with stunning teardrop scalloped lens patterns that shimmer and project warm lighting effects across your dining room.",
    price: 1385.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 16,
    stock: 18
  },
  {
    id: "daraz-home-7",
    name: "Alpine Resin Grooved Hanging Planter Basket",
    description: "Heavy duty white scalloped-groove plastic planter pot model 32.28544. Includes an integrated snap-on bottom drainage catch plate tray and triple-linked secure white chains with metal ceiling hook. Fully UV resistant.",
    price: 123.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 29,
    stock: 50
  },
  {
    id: "daraz-home-8",
    name: "Premium Cotton King Size Bed Sheet",
    description: "Soft hotel-luxury bedding item manufactured of breathable 300 thread count long-staple cotton sheets. Includes 1 standard mattress cover and 2 color-matched overlapping envelope closure pillowcases.",
    price: 1750.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 43,
    stock: 65
  },
  {
    id: "daraz-home-9",
    name: "Non-Slip Microfiber Absorbent Bath Mat Mat",
    description: "Extremely plush bathroom mat lined with quick-dry high pile microfiber shag. Incorporates an absolute heavy-duty anti-slide TP latex backing layer to prevent slipping on wet marble tiles.",
    price: 450.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 50,
    stock: 130
  },
  {
    id: "daraz-home-10",
    name: "Foldable Metal Wall Mounted Towel Hanger Rack",
    description: "Space-saving folding towel stand created beautifully with 304 marine grade chrome-finished stainless steel. Features 5 primary hangers plus an integrated upper layout rack.",
    price: 850.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800",
    rating: 4.4,
    numReviews: 18,
    stock: 45
  },
  {
    id: "daraz-home-11",
    name: "Ultra-Sonic Warm Mist Cool Mist Air Humidifier",
    description: "Aromatherapy dynamic humidifier containing 2.5L clean tank capacity. Delivers fully adjustable misting speed, automatic low-water level safety shutdown sensor, and beautiful warm LED ambient night lighting.",
    price: 2200.00,
    category: "Home & Lifestyle",
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 29,
    stock: 17
  },

  // --- GROCERIES (11 items) ---
  {
    id: "daraz-groc-1",
    name: "Sharkhenai Stainless No-Drip Oil Dispenser",
    description: "A deluxe 500ml oil and vinegar dispenser with a modern brushed stainless steel sleeve cover over a thick lead-free glass bottle. Features a drip-free spout with easy lever-controlled nozzle and comfortable thumb trigger.",
    price: 330.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 72,
    stock: 65
  },
  {
    id: "daraz-groc-2",
    name: "Cherry Blossom Ceramic Cup & Saucer Set",
    description: "Authentic fine ceramic 6-piece mugs and matching saucers collection. Adorned with delicate hand-drawn pink forest berries and red cherry blossom branch details. Presented in a sturdy gift box perfect for anniversaries or corporate presents.",
    price: 1330.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 29,
    stock: 14
  },
  {
    id: "daraz-groc-3",
    name: "Premium Sona Mansuli Rice (25kg)",
    description: "Authentic long-grain scented Sona Mansuli rice harvested direct in Terai plains. Rich daily carbohydrate supply milled cleanly without artificial aroma enhancers or synthetic polishing agents.",
    price: 2650.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 120,
    stock: 45
  },
  {
    id: "daraz-groc-4",
    name: "Pure Himalayan Gold Shilajit Resin (20g)",
    description: "100% natural wild shilajit extract directly sourced from high attitude mountain rock cracks. Packed in professional laboratory-certified UV resistant amber container. Full wellness and energy boost.",
    price: 1450.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1611070973770-b1a672610491?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 83,
    stock: 25
  },
  {
    id: "daraz-groc-5",
    name: "Cold-Pressed Natural Mustard Oil (2L)",
    description: "Unrefined heavy mustard seed oil extract processed via traditional wooden expeller method. Preserves aromatic natural essential elements and sharp pungent taste ideal for Nepali curries.",
    price: 580.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 64,
    stock: 55
  },
  {
    id: "daraz-groc-6",
    name: "Organic Red Lentils / Mass Ko Daal (1kg)",
    description: "Premium split polished yellow red lentils sourced from local eco-farms. Cleaned free of tiny dry stones, supplying ultimate protein content to your traditional family Daal Bhat recipes.",
    price: 220.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1515942900389-3477410077fa?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 38,
    stock: 120
  },
  {
    id: "daraz-groc-7",
    name: "Himalyan Fine Pink Sea Mineral Salt (1kg)",
    description: "Unprocessed organic pink crystal salt crushed cleanly at Himalayan foothill mines. Naturally rich with essential micronutrients and ancient minerals to style your dietary plates.",
    price: 110.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 95,
    stock: 200
  },
  {
    id: "daraz-groc-8",
    name: "Organic Raw Mountain Wild Honey (500g)",
    description: "100% pure wild forest flower honey harvested cleanly from deep valley bee hives. Never-heated, preserving raw natural active enzymes and thick rich amber color tones.",
    price: 650.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 42,
    stock: 45
  },
  {
    id: "daraz-groc-9",
    name: "Premium Royal Mixed Nuts Power-Pack",
    description: "Wholesale vacuum pouch package filled with perfectly ratioed fresh unsalted California almonds, premium cashew kernels, and split walnut halves. Rich, healthy energy fueling.",
    price: 980.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 53,
    stock: 80
  },
  {
    id: "daraz-groc-10",
    name: "Traditional Nepal Gundruk Pack (200g)",
    description: "Authentic heavily fermented leafy mustard and radish greens harvested in solar-dry environments. Delivers ultimate tangy ethnic spice base for winter soups and side salads.",
    price: 180.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 104,
    stock: 65
  },
  {
    id: "daraz-groc-11",
    name: "Instant Spiced Cardamom Chai Mix (30 pcs)",
    description: "Dynamic pre-sweetened Indian tea packets consisting of robust black tea leaves, creamy dairy creamer, and pure green cardamom extracts. Just combine hot water and stir instantly.",
    price: 325.00,
    category: "Groceries",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 24,
    stock: 90
  },

  // --- HEALTH & BEAUTY (11 items) ---
  {
    id: "daraz-hb-1",
    name: "Cetaphil Premium Gentle Skin Cleanser (125ml)",
    description: "The dermatologist-approved clinically tested daily face wash. Non-foaming skin protective formula respects skin's essential oil moisture barrier during dirt extraction, ideal for sensitive skin.",
    price: 945.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 153,
    stock: 120
  },
  {
    id: "daraz-hb-2",
    name: "CeraVe Daily Moisturing Ceramide Lotion",
    description: "Enriched with 3 essential skin protective ceramides and hydrating hyaluronic acid. Employs MVE formulation technology to provide continuous skin food supply up to 24 hours.",
    price: 1850.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 95,
    stock: 60
  },
  {
    id: "daraz-hb-3",
    name: "L'Oreal Extraordinary Hair Smoothing Serum",
    description: "Luxury botanical light hair serum blended beautifully with 6 rare flower seed oils. Brings extreme shine, eliminates dry hair frizz, and delivers high thermal protective styling.",
    price: 1100.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 76,
    stock: 45
  },
  {
    id: "daraz-hb-4",
    name: "Neutrogena Hydro Boost Water Gel (50g)",
    description: "Award-winning light gel moisturizer formulated with hydrating hyaluronic acid elements. Absorbs instantly into dry layers like a sponge, promoting healthy, smooth skin look.",
    price: 1650.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 114,
    stock: 55
  },
  {
    id: "daraz-hb-5",
    name: "Premium Pure Organic Aloe Vera Gel (300ml)",
    description: "99% pure natural aloe leaf juice containing no sticky artificial thickeners. Instantly cools down summer sunburns, dry razor rashes, and serves as an ultimate light hair mask base.",
    price: 350.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 242,
    stock: 140
  },
  {
    id: "daraz-hb-6",
    name: "Innisfree Green Tea Seed Hyaluronic Serum",
    description: "Sourced directly from organic Jeju Island plantations. A fast-absorbing premium moisture serum containing refreshing organic green tea extracts paired with robust triple hyaluronic acids.",
    price: 2950.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 54,
    stock: 24
  },
  {
    id: "daraz-hb-7",
    name: "COSRX Korean Snail Mucin 96 Essence",
    description: "A highly demanded Korean skincare favorite item formulated with 96.3% Snail Secretion Filtrate. Delivers rapid anti-aging skin repair, reduces red blemishes, and hydrates deeply.",
    price: 1950.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 180,
    stock: 40
  },
  {
    id: "daraz-hb-8",
    name: "Minimalist Niacinamide 10% Face Serum",
    description: "Clinical grade daily facial serum containing 10% premium Niacinamide paired with pure Zinc-PCA. Treats skin sebum overproduction, reduces coarse open pores, and brightens tone.",
    price: 1250.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 73,
    stock: 85
  },
  {
    id: "daraz-hb-9",
    name: "The Derma Co 1% Hyaluronic Sunscreen Gel",
    description: "Enriched with 1% active hyaluronic acid moisturizing complex. Super lightweight non-sticky SPF 50 sunscreen gel protecting beautifully against UVA/UVB sans oily white-cast residue.",
    price: 850.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 110,
    stock: 120
  },
  {
    id: "daraz-hb-10",
    name: "Himalaya Herbals Purifying Neem Face Wash",
    description: "Soap-free herbal face wash formulation centered on antibacterial pure Neem leaf extract and turmeric root powers. Clinically proven to minimize acne outbursts for oily skins.",
    price: 295.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800",
    rating: 4.4,
    numReviews: 310,
    stock: 180
  },
  {
    id: "daraz-hb-11",
    name: "Organic Tea Tree Essential Oil (15ml)",
    description: "100% steam distilled organic Melaleuca Alternifolia oil leaf extract concentree. Natural traditional solution for soothing pimples, clearing dandruff, or antiseptic healing.",
    price: 450.00,
    category: "Health & Beauty",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 48,
    stock: 95
  },

  // --- FASHION (11 items) ---
  {
    id: "daraz-fash-1",
    name: "Men's Cotton Casual Slim-Fit Shirt (Navy)",
    description: "Tailored utilizing 100% fine breathable long-staple cotton fibers. Implements classic chest pocket, curved hem structure, and robust button closure lines for dapper everyday look.",
    price: 1150.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 64,
    stock: 55
  },
  {
    id: "daraz-fash-2",
    name: "Women's High-Waisted Light Jeans",
    description: "Aesthetic relaxed-fit light-wash blue denim jeans. Premium double needle stitching paired with metal button hardware allows for long-lasting durability through daily outings.",
    price: 1499.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 43,
    stock: 40
  },
  {
    id: "daraz-fash-3",
    name: "Unisex Retro Round Polarized Sunglasses",
    description: "Premium steampunk retro design metal alloy frames equipped with UV400 standard high-contrast HD polarized dark lenses, ensuring ultimate eye safety.",
    price: 750.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 92,
    stock: 150
  },
  {
    id: "daraz-fash-4",
    name: "Classic White Sporty Canvas Sneakers",
    description: "Clean minimalist low-top sneakers crafted entirely of lightweight cotton canvas panels alongside a super-comfortable thick vulcanized rubber sole configuration.",
    price: 1250.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 104,
    stock: 80
  },
  {
    id: "daraz-fash-5",
    name: "Dynamic Breathable Mesh Running Sneakers",
    description: "Athletic performance shoes with integrated weave mesh upper layer to maximize continuous ventilation, lined with super cushy EVA shock absorption shock soles.",
    price: 1850.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 128,
    stock: 45
  },
  {
    id: "daraz-fash-6",
    name: "Women's Floral Cotton Kurti & Dupatta Set",
    description: "Beautiful traditional daily design floral print dress tailored beautifully from high luxury pure cotton textile. Features matching borders on the accompanying dupatta draping.",
    price: 1550.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 31,
    stock: 25
  },
  {
    id: "daraz-fash-7",
    name: "Genuine Leather Slim Bi-Fold Men's Wallet",
    description: "Premium smooth solid genuine Cow Hide leather material. Designed with slim-profile slots housing up to 8 credit cards plus double secret cash divider layouts.",
    price: 950.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 112,
    stock: 60
  },
  {
    id: "daraz-fash-8",
    name: "Waterproof Multi-Compartment College Backpack",
    description: "High volume daily travel knapsack fabricated from heavy duty moisture-proof Cordura weave. Features protective internal laptop padding layer accommodating up to 15-inch models.",
    price: 1350.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 39,
    stock: 85
  },
  {
    id: "daraz-fash-9",
    name: "Oversized Cozy Premium Unisex Hoodie (Green)",
    description: "Fall-winter heavyweight pullover designed with fluffy soft fleece lining. Comes completed with spacious front kangaroo pocket designs and extra thick adjustable drawstring hood strings.",
    price: 1650.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 54,
    stock: 70
  },
  {
    id: "daraz-fash-10",
    name: "Gold-Plated Minimalist Women's Quartz Watch",
    description: "Extremely clean and luxury analogue women's status wrist wear watch detailing high clarity mineral dial glass dome and beautiful matching gold mesh strap layout.",
    price: 2200.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 28,
    stock: 18
  },
  {
    id: "daraz-fash-11",
    name: "Sporty Breathable Quick-Dry Workout Gym Tee",
    description: "Engineered specifically utilizing dynamic dry-wick active fabrics. Lightweight athletic cut minimizes friction during intense weightlifting or long mountain runs.",
    price: 450.00,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
    rating: 4.4,
    numReviews: 69,
    stock: 130
  },

  // --- SPORTS & OUTDOOR (11 items) ---
  {
    id: "daraz-sport-1",
    name: "Insulated Sports Thermal Metal Water Bottle",
    description: "Premium double-wall vacuum insulated stainless steel water bottle in sparkling ruby metallic outer finish. Retains hot liquids warm for up to 12 hours, and cold liquids chilled for 24 hours. Convenient leakproof plastic cap.",
    price: 1420.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 32,
    stock: 45
  },
  {
    id: "daraz-sport-2",
    name: "Aluminum Badminton Rackets Set (Twin Pack)",
    description: "Lightweight and heavy duty twin bat set built using single frame aluminum rings. Set includes handy zippered full canvas carry cover sleeve and 3 premium nylon shuttlecocks.",
    price: 1450.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 28,
    stock: 40
  },
  {
    id: "daraz-sport-3",
    name: "Professional High-Bounce Soccer Ball (Size 5)",
    description: "Standard FIFA dimension match-play football created utilizing thick synthetic leather panels beautifully machine-stitched together, supplied with robust steel needle air pump.",
    price: 1150.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 78,
    stock: 55
  },
  {
    id: "daraz-sport-4",
    name: "Fitness Resistance Bands Expansion Loop Set",
    description: "Set of 5 heavy-duty color latex bands of varying resistance, complete with secure cushioned foam grips, ankle straps, door security block anchor, and compact carrying pouch.",
    price: 850.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 41,
    stock: 90
  },
  {
    id: "daraz-sport-5",
    name: "Foldable Aluminum Anti-Shock Trekking Pole",
    description: "Premium lightweight three-segment expandable aluminum mountain hike poles matching hard tungsten carbide tips and deep-grip sweat-absorbent EVA cork handles.",
    price: 1200.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1536746803623-cef87080bfc8?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 35,
    stock: 75
  },
  {
    id: "daraz-sport-6",
    name: "Multi-Pocket Outdoor Active Hydration Vest",
    description: "High durability dynamic biking/running chest rig built with breathable mesh fabrics, accommodating up to 2-liter rear hydration bladder storage (bladder sold separately).",
    price: 1850.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1502126324834-38f8e02d7160?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 12,
    stock: 30
  },
  {
    id: "daraz-sport-7",
    name: "Camping Foldable Chair with Mesh Cup Holder",
    description: "Ultra heavy-duty tube steel framing coupled with robust 600D Oxford cloth sitting sheet, designed to sustain maximum load up to 110kg and fold up instantly inside travel carrier bag.",
    price: 1350.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1617135813745-f09b2e2b8344?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 19,
    stock: 45
  },
  {
    id: "daraz-sport-8",
    name: "10mm Extra Thick Anti-Slip NBR Yoga Mat",
    description: "Eco-friendly high-density cushioning NBR yoga canvas layout. Perfect joint protection while performing complex stretching routines. Fitted with convenient travel shoulder strap.",
    price: 950.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 83,
    stock: 110
  },
  {
    id: "daraz-sport-9",
    name: "High-Grip Mountain Bicycle CNC Pedals",
    description: "Professional grade wide bicycle pedal accessories engineered with CNC aluminum block casting and 12 anti-slip tread studs to support extreme trail conditions.",
    price: 1100.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 14,
    stock: 28
  },
  {
    id: "daraz-sport-10",
    name: "Adjustable Calf Leg Compression Sleeves",
    description: "Engineered calf muscle wraps constructed of high tensile Lycra blends. Promotes quick muscle lactic acid recovery levels during hard trail cycling or marathons.",
    price: 450.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 31,
    stock: 140
  },
  {
    id: "daraz-sport-11",
    name: "Swiss-Style Multipurpose Soldier Pocket Knife",
    description: "Authentic premium steel multi-functional pocket army style tool featuring 11 classic pullout utilities: razor-sharp knives, scissor blades, wine bottle screw opener, saw blades, and tweezers.",
    price: 750.00,
    category: "Sports & Outdoor",
    image: "https://images.unsplash.com/photo-1594051808233-750c3d23b537?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 61,
    stock: 35
  },

  // --- ORGANIC TEA (11 items) ---
  {
    id: "daraz-tea-1",
    name: "Organic Himalayan Orthodox Ilam Black Tea",
    description: "Premium orthodox loose black tea grown on sunny high hills of Eastern Nepal. Exquisite golden amber cup colors detailing delicate malty honey undertone flavor profiles.",
    price: 450.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 45,
    stock: 80
  },
  {
    id: "daraz-tea-2",
    name: "Premium Mountain Flush Himalayan Green Tea",
    description: "Naturally preserved green tea buds handpicked at snow-melt misty heights. Provides an incredibly fresh herbal spring breeze taste and packed with anti-oxidants.",
    price: 390.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 32,
    stock: 120
  },
  {
    id: "daraz-tea-3",
    name: "Golden Tip Darjeeling Tea (Premium Grade)",
    description: "Specially separated orange pekoe grade tea leaves harvested under bright solar mornings. Labeled 'the Champagne of Teas' containing incredibly floral Muscatel notes.",
    price: 1250.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 24,
    stock: 25
  },
  {
    id: "daraz-tea-4",
    name: "Jasmine Infused Spring Bud White Tea",
    description: "Sun-dried luxury silver tea needle buds scented with organic night-blooming white jasmine flowers. Clean, sweet flavor designed for supreme tea connoisseur appreciation.",
    price: 680.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 18,
    stock: 40
  },
  {
    id: "daraz-tea-5",
    name: "Masala Spiced CTC Chai Mix Powder (500g)",
    description: "Traditional local value back CTC black tea mixed beautifully with fresh mountain spices: dried ginger roots, cinnamon barks, cloves, cardamoms, and black pepper grains.",
    price: 250.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 68,
    stock: 150
  },
  {
    id: "daraz-tea-6",
    name: "Chamomile Herbal Relaxing Infusion Tea",
    description: "Entire whole dried chamomile flower heads imported from specialized organic farms. Naturally 100% caffeine-free infusion ideal to induce quiet sleep and calm nerves.",
    price: 450.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 53,
    stock: 60
  },
  {
    id: "daraz-tea-7",
    name: "Lemongrass Ginger Herbal Zesty Tea Pack",
    description: "Rejuvenating wellness combination made with sun-dried sweet lemongrass blades and zesty hot ginger root chips. Perfect natural stomach digestive booster.",
    price: 380.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 29,
    stock: 95
  },
  {
    id: "daraz-tea-8",
    name: "Mint Infused Refreshing Green Tea Bags",
    description: "Excellent green tea leaves formulated along sweet peppery organic field mint flakes. Sealed inside 25 secure single envelope hot tea filters.",
    price: 220.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 40,
    stock: 110
  },
  {
    id: "daraz-tea-9",
    name: "Silver Needle White Tea Supreme Harvest",
    description: "The rarest of Himalayan harvests consisting uniquely of fluffy downy white tea tips. Extremely smooth sweet cup detailing clean woodsy sugarcane highlights.",
    price: 1850.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    numReviews: 12,
    stock: 15
  },
  {
    id: "daraz-tea-10",
    name: "Hibiscus Flower Premium Herbal Infusion",
    description: "Beautiful deep crimson tart wellness infusion consisting entirely of dried exotic hibiscus calyces. Delivers delicious cranberry-like fruity notes hot or iced.",
    price: 490.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 31,
    stock: 70
  },
  {
    id: "daraz-tea-11",
    name: "Saffron Cardamom Shahi Royal Chai Mix",
    description: "Elite holiday spice blend utilizing premium golden saffron threads and sweet cardamoms mixed alongside strong mountain CTC black tea flakes.",
    price: 520.00,
    category: "Organic Tea",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 43,
    stock: 50
  },

  // --- ART & DECOR (11 items) ---
  {
    id: "daraz-art-1",
    name: "Heavy Brass Ganesha Idol / Statue Decor",
    description: "Solid heavy brass metal sculpture of Lord Ganesha beautifully hand-carved with detailed cultural ornaments and textured backplates. Brings divine fortune to homes.",
    price: 2800.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1606293457225-420bc2472c41?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 36,
    stock: 10
  },
  {
    id: "daraz-art-2",
    name: "Floating Hexagon Wooden Shelves (Set of 3)",
    description: "Modern minimalist wall floating shelf system constructed beautifully of engineered wood panels. Includes invisible wall mounting brackets for neat setups.",
    price: 1450.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 48,
    stock: 25
  },
  {
    id: "daraz-art-3",
    name: "Metal Wire Geometric Warm Led String Lights",
    description: "Beautiful 3-meter copper cable dynamic fairy light array equipped with 20 golden geometric wire lanterns emitting super-cozy romantic white lighting hues.",
    price: 390.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1517263904008-797480d25147?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 54,
    stock: 120
  },
  {
    id: "daraz-art-4",
    name: "Clay Handcrafted Tealight Candle Holders (x4)",
    description: "Artisanal set of 4 clay terracotta tealight containers featuring intricate floral cutouts, projecting relaxing starry lighting silhouettes on bedroom walls.",
    price: 320.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 14,
    stock: 60
  },
  {
    id: "daraz-art-5",
    name: "Vintage Wooden Rotatable Blocks Desk Calendar",
    description: "Classic perpetual office desk accessory crafted nicely from natural pine blocks and textured base stands. Change dates manually forever with vintage charm.",
    price: 550.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 29,
    stock: 40
  },
  {
    id: "daraz-art-6",
    name: "Framed Abstract Modern Geometric Canvas Poster",
    description: "Beautiful printed graphic panel featuring minimal boho sun shapes, matching elegant black wooden borders. Ready-to-hang structure for living room walls.",
    price: 890.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
    rating: 4.4,
    numReviews: 18,
    stock: 35
  },
  {
    id: "daraz-art-7",
    name: "Vanilla Bergamot Double Scented Soy Candle",
    description: "Hand-poured 100% natural organic soy wax candle housed beautifully inside a frosted glass tin cup. Provides a delicious aromatherapy throw up to 35 hours.",
    price: 650.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 61,
    stock: 80
  },
  {
    id: "daraz-art-8",
    name: "Macrame Cotton Wall Hanging Boho Tapestry",
    description: "Charming traditional hand-knotted design cream-white boho decor tapestry suspended nicely from an organic smoothed wooden pine dowel structure.",
    price: 1250.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 22,
    stock: 18
  },
  {
    id: "daraz-art-9",
    name: "Artificial Eucalyptus Desktop Potted Flower",
    description: "Extremely realistic faux evergreen eucalyptus plant nested nicely inside a rustic gray cement-styling paper pulp planter pot. Perfect workdesk accent.",
    price: 450.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1512428813833-df702e704289?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 87,
    stock: 95
  },
  {
    id: "daraz-art-10",
    name: "Sleeping Buddha Head Desktop Zen Fountain",
    description: "Captivating indoor water fountain showing sleeping Buddha head. Gentle peaceful cascading waterfall sounds nicely coupled with dynamic color-changing LED lighting.",
    price: 3500.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1608889174653-817c08125032?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 15,
    stock: 6
  },
  {
    id: "daraz-art-11",
    name: "Rustic Ceramic Face Sculpture Art Vase",
    description: "Unique avant-garde abstract human face clay planter vase. Modern home design centerpiece perfect for displaying raw dried pampas grass decorations.",
    price: 1100.00,
    category: "Art & Decor",
    image: "https://images.unsplash.com/photo-1581781894097-4cb347ec4c6d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 14,
    stock: 15
  },

  // --- GIFT SETS / TOYS (11 items) ---
  {
    id: "daraz-gift-1",
    name: "Kids Cute Emoji Pedaling Tricycle",
    description: "Robust metal-frame training tricycle (item 357.3111) in gorgeous modern beige tones with orange-red fenders and a winking winky-face emoji basket. Fitted with comfortable seat rest, non-slip textured handles, and solid quiet rubber tires for indoor or garden play.",
    price: 3890.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1531983412531-1f49a365f69a?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 41,
    stock: 8
  },
  {
    id: "daraz-gift-2",
    name: "Zuru Robo Alive Dino Action Pterodactyl",
    description: "Watch your robotic dinosaur flap its colossal wings, move its claws, open its jaws, and let out a mighty, bone-chilling roar! Features highly authentic scales, soft-textured dinosaur wings, and realistic actions.",
    price: 2490.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 61,
    stock: 15
  },
  {
    id: "daraz-gift-3",
    name: "Zuru Robo Alive Dino Action Raptor (Green)",
    description: "The Robo Alive green raptor features a super-realistic hunting stance! This wild raptor dinosaur model snaps its powerful jaws, runs like a real dinosaur, and roars dynamically when touched.",
    price: 2490.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 48,
    stock: 18
  },
  {
    id: "daraz-gift-4",
    name: "Pok\u00E9mon Champions Card Battle Trading Deck",
    description: "Licensed Pok\u00E9mon Trading Card Game collector pack (edition 357.5805). Decorated with spectacular cover art featuring Ash Ketchum, Pikachu, Bulbasaur, Charmander, and Squirtle. Includes rare holofoil card pulls inside.",
    price: 350.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 104,
    stock: 220
  },
  {
    id: "daraz-gift-5",
    name: "Zuru X-Shot Air Pocket Games Blaster Gun",
    description: "High performance skin foam blaster equipped with air-pocket ammunition technology for ultimate distance up to 27m! Embellished with custom pixelated arcade graphics and dual dart-storage slots on top.",
    price: 1190.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    numReviews: 28,
    stock: 40
  },
  {
    id: "daraz-gift-6",
    name: "Corporate Velvet Writing Diary & Metal Pen",
    description: "Extremely handsome business present set standard with soft embossed ink-black diary book and a heavy solid matching steel roller ball writing tool. Gift boxed beautifully.",
    price: 1650.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 14,
    stock: 40
  },
  {
    id: "daraz-gift-7",
    name: "French Vanilla Bath & Spa Gift Bundle",
    description: "A deluxe aromatherapy bathroom relaxation present consisting of: hand soaps, exfoliating scrub sponges, foaming body wash formulas, and moisturizing creams.",
    price: 2450.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 21,
    stock: 12
  },
  {
    id: "daraz-gift-8",
    name: "Gourmet Chocolat Double-layer Assorted Box",
    description: "An incredibly decadent collection containing 24 specialty milk and dark chocolate selection truffles, filled cleanly with fresh raspberry, salted caramel, and hazelnut pastes.",
    price: 1250.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1548907040-4d17d45668ba?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 35,
    stock: 50
  },
  {
    id: "daraz-gift-9",
    name: "Aromatherapy Organic Candle & Reed Diffuser",
    description: "Combination air-freshening present package showing a lavender double-pour soy wax candle and a natural wooden fiber oil stick aroma diffuser reservoir set.",
    price: 1850.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    numReviews: 19,
    stock: 35
  },
  {
    id: "daraz-gift-10",
    name: "Himalayan Loose Leaf Tea Sommelier Sampler",
    description: "Elegant wooden box containing 6 tiny glass vials packed beautifully with loose leaf types: orthodox Ilam black, premium white, delicate silver needle, and zesty lemongrass teas.",
    price: 1950.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 16,
    stock: 18
  },
  {
    id: "daraz-gift-11",
    name: "Retro Solid Wood Hand-cranked Music Box",
    description: "Cute pocket music box intricately laser cut from birch plywood. Cranks out standard musical notations of classical legends upon side handle rotation.",
    price: 650.00,
    category: "Gift Sets",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 53,
    stock: 85
  }
];

// Sample reviewer names for dynamic premium user reviews
const SAMPLE_REVIEWERS = [
  "Abishek Karki", "Sujata Gurung", "Prajwal Shrestha", "Alisha Thapa", 
  "Anish Adhikari", "Niranjan Giri", "Sunita Maharjan", "Pradip Bhatta",
  "Samikshya Joshi", "Bibek Pandey", "Rashmi Khadka", "Dipendra Tamang"
];

const SAMPLE_COMMENTS = [
  "Absolutely incredible, matches photo 100%! Super robust build quality.",
  "Very nice seller, speedy delivery around Lalitpur context. Recommended!",
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
    sellerName: "Daraz Official Store",
    status: "active"
  });
}

// PROGRAMMATIC COPIES GENERATOR FOR DYNAMIC DEPTH (Making up 120+ realistic Daraz variations)
// We add slightly branded variations of top items to bring total dynamically to a hefty sum.
const BRANDS = ["Lhotse", "Everest Craft", "Himalayan Tech", "Bhoomi", "Mithila Co", "Doko Craft", "Daraz Basics"];
const CATEGORIES_LIST = [
  "Electronic Devices", "Handicrafts", "Home & Lifestyle", "Groceries", 
  "Health & Beauty", "Fashion", "Sports & Outdoor", "Organic Tea", "Art & Decor", "Gift Sets"
];

// Loop through each category to generate 2-3 additional items programmatically
for (let catIdx = 0; catIdx < CATEGORIES_LIST.length; catIdx++) {
  const targetCategory = CATEGORIES_LIST[catIdx];
  const sourceProducts = MOCK_PRODUCTS.filter(p => p.category === targetCategory);
  
  if (sourceProducts.length > 0) {
    for (let i = 0; i < 3; i++) {
      const src = sourceProducts[i % sourceProducts.length];
      const brand = BRANDS[(catIdx + i) % BRANDS.length];
      const brandName = `${brand} Premium ${src.name}`;
      const newId = `gen-added-${catIdx}-${i}`;
      
      MOCK_PRODUCTS.push({
        id: newId,
        name: brandName,
        description: `Deluxe edition of ${src.name} proudly customized by ${brand}. Features high quality materials specially adjusted for heavy duty requirements. Ideal selection for Nepali families inside the Kathmandu Valley.`,
        price: Math.round(src.price * (0.9 + (i * 0.15))),
        category: targetCategory,
        image: src.image,
        rating: Number((4.2 + (i * 0.25)).toFixed(1)),
        numReviews: src.numReviews + (i * 12),
        reviews: [...src.reviews],
        stock: src.stock + (i * 5),
        sellerId: "seller-admin-999",
        sellerName: `${brand} Authorized dealer`,
        status: "active"
      });
    }
  }
}
