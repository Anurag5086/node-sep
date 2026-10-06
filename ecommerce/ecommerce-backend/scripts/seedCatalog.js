/**
 * Seeds LuxeMart categories and ~50 products with image URLs.
 * Run: node scripts/seedCatalog.js
 * Idempotent: skips products whose title already exists; fills missing images on existing rows.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const mongoose = require('mongoose')
const Product = require('../models/Product')
const CategoryModel = require('../models/Category')

const CATEGORIES = [
  {
    title: 'Mobile Phones',
    description: 'Latest smartphones and flagships from top brands.',
  },
  {
    title: 'Laptops & Tablets',
    description: 'Work, create, and play on powerful portable devices.',
  },
  {
    title: 'Fashion & Apparel',
    description: 'Elevated everyday wear for men and women.',
  },
  {
    title: 'Footwear',
    description: 'Sneakers, boots, and sandals for every occasion.',
  },
  {
    title: 'Home & Kitchen',
    description: 'Comfort and style for modern living spaces.',
  },
  {
    title: 'Beauty & Care',
    description: 'Skincare, grooming, and personal care essentials.',
  },
  {
    title: 'Sports & Fitness',
    description: 'Gear up for training, yoga, and outdoor adventures.',
  },
  {
    title: 'Watches & Accessories',
    description: 'Watches, bags, eyewear, and everyday carry.',
  },
]

/** @type {Array<Omit<import('../models/Product'), '_id'> & { category: string, image: string }>} */
const PRODUCTS = [
  // Mobile Phones (5 new; iPhone may already exist)
  {
    category: 'Mobile Phones',
    title: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    description:
      '200MP camera, titanium frame, S Pen support, and all-day battery for power users.',
    mrpPrice: 134999,
    sellingPrice: 119999,
    stockQuantity: 45,
    rating: 4.6,
    noOfRating: 128,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop',
  },
  {
    category: 'Mobile Phones',
    title: 'Google Pixel 9 Pro',
    brand: 'Google',
    description:
      'Pure Android experience with advanced computational photography and Gemini on-device.',
    mrpPrice: 109999,
    sellingPrice: 94999,
    stockQuantity: 32,
    rating: 4.5,
    noOfRating: 89,
    image: 'https://images.unsplash.com/photo-1598327275664-5b02001faec0?w=800&auto=format&fit=crop',
  },
  {
    category: 'Mobile Phones',
    title: 'OnePlus 13',
    brand: 'OnePlus',
    description: 'Snapdragon flagship, 120Hz AMOLED, and ultra-fast wired charging.',
    mrpPrice: 69999,
    sellingPrice: 62999,
    stockQuantity: 60,
    rating: 4.4,
    noOfRating: 210,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
  },
  {
    category: 'Mobile Phones',
    title: 'Xiaomi 15 Ultra',
    brand: 'Xiaomi',
    description: 'Leica-tuned camera system, premium build, and vivid 2K display.',
    mrpPrice: 89999,
    sellingPrice: 79999,
    stockQuantity: 28,
    rating: 4.3,
    noOfRating: 54,
    image: 'https://images.unsplash.com/photo-1565849904461-04a516aa2c38?w=800&auto=format&fit=crop',
  },
  {
    category: 'Mobile Phones',
    title: 'Nothing Phone (3)',
    brand: 'Nothing',
    description: 'Glyph interface, transparent design, and clean Nothing OS experience.',
    mrpPrice: 49999,
    sellingPrice: 44999,
    stockQuantity: 75,
    rating: 4.2,
    noOfRating: 167,
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&auto=format&fit=crop',
  },
  // Laptops & Tablets
  {
    category: 'Laptops & Tablets',
    title: 'MacBook Air M4 13"',
    brand: 'Apple',
    description: 'Silent fanless design, all-day battery, and stunning Liquid Retina display.',
    mrpPrice: 114900,
    sellingPrice: 104900,
    stockQuantity: 22,
    rating: 4.8,
    noOfRating: 312,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
  },
  {
    category: 'Laptops & Tablets',
    title: 'Dell XPS 15 OLED',
    brand: 'Dell',
    description: 'Creator-ready laptop with OLED panel, premium chassis, and strong thermals.',
    mrpPrice: 189990,
    sellingPrice: 169990,
    stockQuantity: 14,
    rating: 4.6,
    noOfRating: 76,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop',
  },
  {
    category: 'Laptops & Tablets',
    title: 'HP Spectre x360 14',
    brand: 'HP',
    description: '2-in-1 convertible with gem-cut edges, touch screen, and stylus support.',
    mrpPrice: 142999,
    sellingPrice: 127999,
    stockQuantity: 18,
    rating: 4.4,
    noOfRating: 41,
    image: 'https://images.unsplash.com/photo-1525547719578-a369d4adb4b8?w=800&auto=format&fit=crop',
  },
  {
    category: 'Laptops & Tablets',
    title: 'Lenovo ThinkPad X1 Carbon',
    brand: 'Lenovo',
    description: 'Ultralight business laptop with legendary keyboard and MIL-spec durability.',
    mrpPrice: 165000,
    sellingPrice: 148500,
    stockQuantity: 20,
    rating: 4.7,
    noOfRating: 98,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop',
  },
  {
    category: 'Laptops & Tablets',
    title: 'ASUS ROG Zephyrus G14',
    brand: 'ASUS',
    description: 'Compact gaming powerhouse with high refresh display and RTX graphics.',
    mrpPrice: 154990,
    sellingPrice: 139990,
    stockQuantity: 16,
    rating: 4.5,
    noOfRating: 143,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop',
  },
  {
    category: 'Laptops & Tablets',
    title: 'iPad Air M3 11"',
    brand: 'Apple',
    description: 'Thin, light tablet for notes, design, and entertainment with Apple Pencil.',
    mrpPrice: 59900,
    sellingPrice: 54900,
    stockQuantity: 40,
    rating: 4.7,
    noOfRating: 205,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop',
  },
  // Fashion & Apparel (8)
  {
    category: 'Fashion & Apparel',
    title: 'Linen Relaxed Fit Shirt',
    brand: 'LuxeMart Studio',
    description: 'Breathable European linen with a relaxed silhouette for warm days.',
    mrpPrice: 3499,
    sellingPrice: 2799,
    stockQuantity: 120,
    rating: 4.3,
    noOfRating: 67,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b56?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'Slim Stretch Chinos',
    brand: 'Urban Edge',
    description: 'Soft cotton blend with subtle stretch and a modern tapered leg.',
    mrpPrice: 2999,
    sellingPrice: 2199,
    stockQuantity: 200,
    rating: 4.2,
    noOfRating: 134,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b069a0a?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'Merino Crew Neck Sweater',
    brand: 'North Loom',
    description: 'Fine merino wool layer that regulates temperature without bulk.',
    mrpPrice: 4499,
    sellingPrice: 3599,
    stockQuantity: 85,
    rating: 4.6,
    noOfRating: 52,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'Classic Denim Trucker Jacket',
    brand: 'Blue Route',
    description: 'Medium-wash denim with durable stitching and timeless trucker styling.',
    mrpPrice: 4999,
    sellingPrice: 3999,
    stockQuantity: 64,
    rating: 4.5,
    noOfRating: 88,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'Premium Cotton Polo',
    brand: 'LuxeMart Studio',
    description: 'Piqué cotton polo with ribbed collar and refined fit for work or weekend.',
    mrpPrice: 1999,
    sellingPrice: 1499,
    stockQuantity: 150,
    rating: 4.1,
    noOfRating: 41,
    image: 'https://images.unsplash.com/photo-1622445275463-afa725ab932d?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'High-Rise Wide Leg Jeans',
    brand: 'Denim Co.',
    description: 'Vintage-inspired wide leg with comfortable high rise and deep indigo wash.',
    mrpPrice: 3799,
    sellingPrice: 2999,
    stockQuantity: 90,
    rating: 4.4,
    noOfRating: 73,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'Silk Blend Kurta Set',
    brand: 'Indie Weave',
    description: 'Festive-ready kurta with subtle sheen and coordinated bottom piece.',
    mrpPrice: 5999,
    sellingPrice: 4799,
    stockQuantity: 55,
    rating: 4.7,
    noOfRating: 29,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a41?w=800&auto=format&fit=crop',
  },
  {
    category: 'Fashion & Apparel',
    title: 'Wool Blend Overcoat',
    brand: 'North Loom',
    description: 'Structured overcoat for layering through winter with hidden button placket.',
    mrpPrice: 8999,
    sellingPrice: 7499,
    stockQuantity: 30,
    rating: 4.6,
    noOfRating: 18,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop',
  },
  // Footwear
  {
    category: 'Footwear',
    title: 'Velocity Run Sneakers',
    brand: 'StrideLab',
    description: 'Lightweight mesh upper with responsive foam for daily training runs.',
    mrpPrice: 6999,
    sellingPrice: 5499,
    stockQuantity: 110,
    rating: 4.5,
    noOfRating: 192,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
  },
  {
    category: 'Footwear',
    title: 'Heritage Leather Chelsea Boots',
    brand: 'CraftStep',
    description: 'Full-grain leather Chelsea with elastic gussets and cushioned insole.',
    mrpPrice: 8999,
    sellingPrice: 7299,
    stockQuantity: 48,
    rating: 4.6,
    noOfRating: 61,
    image: 'https://images.unsplash.com/photo-1638247025967-f4b4b106f597?w=800&auto=format&fit=crop',
  },
  {
    category: 'Footwear',
    title: 'Canvas City Slip-Ons',
    brand: 'EasyWalk',
    description: 'Minimal slip-on with breathable canvas and vulcanized sole.',
    mrpPrice: 2499,
    sellingPrice: 1899,
    stockQuantity: 180,
    rating: 4.0,
    noOfRating: 220,
    image: 'https://images.unsplash.com/photo-1525966220604-9c0732e331e8?w=800&auto=format&fit=crop',
  },
  {
    category: 'Footwear',
    title: 'TrailGrip Hiking Shoes',
    brand: 'PeakTrail',
    description: 'Water-resistant upper and aggressive lugs for weekend treks.',
    mrpPrice: 6499,
    sellingPrice: 5199,
    stockQuantity: 70,
    rating: 4.4,
    noOfRating: 44,
    image: 'https://images.unsplash.com/photo-1606107557192-0be74c2b5b48?w=800&auto=format&fit=crop',
  },
  {
    category: 'Footwear',
    title: 'Oxford Brogue Formal Shoes',
    brand: 'CraftStep',
    description: 'Hand-finished brogue detailing for boardrooms and celebrations.',
    mrpPrice: 7999,
    sellingPrice: 6499,
    stockQuantity: 36,
    rating: 4.5,
    noOfRating: 27,
    image: 'https://images.unsplash.com/photo-1614252238956-17c852fc6e50?w=800&auto=format&fit=crop',
  },
  {
    category: 'Footwear',
    title: 'Cloud Comfort Slides',
    brand: 'EasyWalk',
    description: 'Ergonomic footbed and soft straps for lounge and poolside ease.',
    mrpPrice: 1799,
    sellingPrice: 1299,
    stockQuantity: 200,
    rating: 4.2,
    noOfRating: 156,
    image: 'https://images.unsplash.com/photo-1603487742131-416a7feb21dd?w=800&auto=format&fit=crop',
  },
  // Home & Kitchen
  {
    category: 'Home & Kitchen',
    title: 'Ceramic Pour-Over Coffee Set',
    brand: 'BrewHaus',
    description: 'Includes dripper, carafe, and filters for café-style pour-over at home.',
    mrpPrice: 3499,
    sellingPrice: 2799,
    stockQuantity: 65,
    rating: 4.6,
    noOfRating: 38,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop',
  },
  {
    category: 'Home & Kitchen',
    title: 'Cooling Memory Foam Pillow',
    brand: 'RestNest',
    description: 'Gel-infused memory foam with breathable cover for neck support.',
    mrpPrice: 2999,
    sellingPrice: 2299,
    stockQuantity: 95,
    rating: 4.3,
    noOfRating: 112,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop',
  },
  {
    category: 'Home & Kitchen',
    title: 'Soy Wax Candle Trio',
    brand: 'Aura Home',
    description: 'Three calming scents in reusable glass jars with cotton wicks.',
    mrpPrice: 1999,
    sellingPrice: 1599,
    stockQuantity: 140,
    rating: 4.5,
    noOfRating: 89,
    image: 'https://images.unsplash.com/photo-1602600189884-0a458a9c4f0a?w=800&auto=format&fit=crop',
  },
  {
    category: 'Home & Kitchen',
    title: 'Hard-Anodized Cookware 5-Piece',
    brand: 'ChefLine',
    description: 'Even-heating pots and pans with stay-cool handles and glass lids.',
    mrpPrice: 6999,
    sellingPrice: 5599,
    stockQuantity: 42,
    rating: 4.4,
    noOfRating: 63,
    image: 'https://images.unsplash.com/photo-1556909212-d5b604d0f90c?w=800&auto=format&fit=crop',
  },
  {
    category: 'Home & Kitchen',
    title: 'Arc Minimal Desk Lamp',
    brand: 'Aura Home',
    description: 'Adjustable LED lamp with warm dimming for focused desk work.',
    mrpPrice: 4499,
    sellingPrice: 3699,
    stockQuantity: 58,
    rating: 4.2,
    noOfRating: 34,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop',
  },
  {
    category: 'Home & Kitchen',
    title: 'Organic Cotton Bed Sheet Set',
    brand: 'RestNest',
    description: '400 thread count sateen weave in neutral tones, fits queen beds.',
    mrpPrice: 4999,
    sellingPrice: 3999,
    stockQuantity: 72,
    rating: 4.6,
    noOfRating: 47,
    image: 'https://images.unsplash.com/photo-1522771739844-15052f2142b5?w=800&auto=format&fit=crop',
  },
  // Beauty & Care
  {
    category: 'Beauty & Care',
    title: 'Vitamin C Brightening Serum',
    brand: 'GlowTheory',
    description: '15% stable vitamin C to help even tone and boost radiance.',
    mrpPrice: 1899,
    sellingPrice: 1499,
    stockQuantity: 160,
    rating: 4.4,
    noOfRating: 301,
    image: 'https://images.unsplash.com/photo-1620916565828-4211444f251b?w=800&auto=format&fit=crop',
  },
  {
    category: 'Beauty & Care',
    title: 'Daily Hydrating Moisturizer SPF 30',
    brand: 'GlowTheory',
    description: 'Lightweight lotion with broad-spectrum SPF for everyday protection.',
    mrpPrice: 1599,
    sellingPrice: 1299,
    stockQuantity: 175,
    rating: 4.3,
    noOfRating: 188,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop',
  },
  {
    category: 'Beauty & Care',
    title: 'Matte Velvet Lipstick',
    brand: 'Chroma',
    description: 'Long-wear matte finish with nourishing oils, available in rose nude.',
    mrpPrice: 999,
    sellingPrice: 799,
    stockQuantity: 220,
    rating: 4.2,
    noOfRating: 412,
    image: 'https://images.unsplash.com/photo-1586495777744-4413d210d989?w=800&auto=format&fit=crop',
  },
  {
    category: 'Beauty & Care',
    title: 'Argan Repair Shampoo 400ml',
    brand: 'SilkRoot',
    description: 'Sulfate-free formula with argan oil for smooth, manageable hair.',
    mrpPrice: 899,
    sellingPrice: 699,
    stockQuantity: 190,
    rating: 4.1,
    noOfRating: 95,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fc4904bc1?w=800&auto=format&fit=crop',
  },
  {
    category: 'Beauty & Care',
    title: 'Sonic Electric Toothbrush Pro',
    brand: 'PearlCare',
    description: 'Five cleaning modes, two-minute timer, and travel case included.',
    mrpPrice: 4999,
    sellingPrice: 3799,
    stockQuantity: 88,
    rating: 4.5,
    noOfRating: 156,
    image: 'https://images.unsplash.com/photo-1607613009820-a38f7819a736?w=800&auto=format&fit=crop',
  },
  {
    category: 'Beauty & Care',
    title: 'Oud Wood Eau de Parfum',
    brand: 'Maison Luxe',
    description: 'Warm oud and amber notes in a 50ml glass flacon.',
    mrpPrice: 6499,
    sellingPrice: 5299,
    stockQuantity: 40,
    rating: 4.7,
    noOfRating: 22,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop',
  },
  // Sports & Fitness
  {
    category: 'Sports & Fitness',
    title: 'ProGrip Yoga Mat 6mm',
    brand: 'FlexForm',
    description: 'Non-slip TPE mat with alignment lines for studio and home practice.',
    mrpPrice: 2499,
    sellingPrice: 1999,
    stockQuantity: 130,
    rating: 4.5,
    noOfRating: 178,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop',
  },
  {
    category: 'Sports & Fitness',
    title: 'Adjustable Dumbbell Pair 24kg',
    brand: 'IronPulse',
    description: 'Quick-dial weight selection for full-body strength training.',
    mrpPrice: 24999,
    sellingPrice: 21999,
    stockQuantity: 25,
    rating: 4.6,
    noOfRating: 67,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop',
  },
  {
    category: 'Sports & Fitness',
    title: 'Insulated Steel Water Bottle 1L',
    brand: 'HydroTrack',
    description: 'Keeps drinks cold 24h or hot 12h with leak-proof sport cap.',
    mrpPrice: 1999,
    sellingPrice: 1599,
    stockQuantity: 200,
    rating: 4.4,
    noOfRating: 245,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6ce?w=800&auto=format&fit=crop',
  },
  {
    category: 'Sports & Fitness',
    title: 'Resistance Bands Set of 5',
    brand: 'FlexForm',
    description: 'Color-coded latex bands with door anchor and carry pouch.',
    mrpPrice: 1499,
    sellingPrice: 1199,
    stockQuantity: 165,
    rating: 4.3,
    noOfRating: 133,
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format&fit=crop',
  },
  {
    category: 'Sports & Fitness',
    title: 'AeroFlow Cycling Helmet',
    brand: 'PeakTrail',
    description: 'Ventilated road helmet with MIPS-inspired protection system.',
    mrpPrice: 5999,
    sellingPrice: 4799,
    stockQuantity: 52,
    rating: 4.5,
    noOfRating: 39,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  },
  {
    category: 'Sports & Fitness',
    title: 'Carbon Lite Tennis Racket',
    brand: 'CourtPro',
    description: 'Lightweight graphite frame with pre-strung hybrid setup.',
    mrpPrice: 8999,
    sellingPrice: 7499,
    stockQuantity: 34,
    rating: 4.2,
    noOfRating: 21,
    image: 'https://images.unsplash.com/photo-1622163642999-6c7bc7b7a6a9?w=800&auto=format&fit=crop',
  },
  // Watches & Accessories
  {
    category: 'Watches & Accessories',
    title: 'Classic Automatic Watch 42mm',
    brand: 'TimeForge',
    description: 'Sapphire crystal, exhibition caseback, and genuine leather strap.',
    mrpPrice: 18999,
    sellingPrice: 15999,
    stockQuantity: 38,
    rating: 4.7,
    noOfRating: 84,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop',
  },
  {
    category: 'Watches & Accessories',
    title: 'Polarized Aviator Sunglasses',
    brand: 'SunCraft',
    description: 'UV400 polarized lenses with lightweight metal frame.',
    mrpPrice: 3999,
    sellingPrice: 2999,
    stockQuantity: 92,
    rating: 4.4,
    noOfRating: 117,
    image: 'https://images.unsplash.com/photo-1572635196233-14b250f58821?w=800&auto=format&fit=crop',
  },
  {
    category: 'Watches & Accessories',
    title: 'Minimal Backpack 20L',
    brand: 'CarryAll',
    description: 'Water-resistant laptop sleeve and hidden back pocket for travel.',
    mrpPrice: 4499,
    sellingPrice: 3599,
    stockQuantity: 77,
    rating: 4.5,
    noOfRating: 93,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
  },
  {
    category: 'Watches & Accessories',
    title: 'Wireless Earbuds ANC Pro',
    brand: 'SoundHive',
    description: 'Active noise cancellation, 36-hour case battery, and multipoint pairing.',
    mrpPrice: 7999,
    sellingPrice: 5999,
    stockQuantity: 105,
    rating: 4.6,
    noOfRating: 402,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop',
  },
  {
    category: 'Watches & Accessories',
    title: 'Slim Leather Card Holder',
    brand: 'CraftStep',
    description: 'Holds 6 cards and folded notes in a pocket-friendly profile.',
    mrpPrice: 1999,
    sellingPrice: 1499,
    stockQuantity: 145,
    rating: 4.3,
    noOfRating: 56,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop',
  },
  {
    category: 'Watches & Accessories',
    title: 'Smartwatch Active Series',
    brand: 'PulseGear',
    description: 'AMOLED display, GPS, heart rate, and 100+ workout modes.',
    mrpPrice: 12999,
    sellingPrice: 9999,
    stockQuantity: 68,
    rating: 4.4,
    noOfRating: 211,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop',
  },
]

async function ensureCategories() {
  const map = new Map()
  for (const cat of CATEGORIES) {
    let doc = await CategoryModel.findOne({ title: cat.title })
    if (!doc) {
      doc = await CategoryModel.create({
        title: cat.title,
        description: cat.description,
        isActive: true,
      })
      console.log(`+ category: ${cat.title}`)
    } else {
      console.log(`= category: ${cat.title}`)
    }
    map.set(cat.title, doc._id)
  }
  return map
}

function hasImage(product) {
  return Array.isArray(product.images) && product.images.some((u) => String(u || '').trim())
}

async function patchMissingImages(fallbackByTitle) {
  const all = await Product.find()
  let patched = 0
  for (const p of all) {
    if (hasImage(p)) continue
    const fallback =
      fallbackByTitle.get(p.title) ||
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop'
    p.images = [fallback]
    await p.save()
    patched += 1
    console.log(`~ image added: ${p.title}`)
  }
  return patched
}

async function seedProducts(categoryIds) {
  let inserted = 0
  let skipped = 0

  for (const item of PRODUCTS) {
    const exists = await Product.findOne({ title: item.title })
    if (exists) {
      skipped += 1
      continue
    }

    const categoryId = categoryIds.get(item.category)
    if (!categoryId) {
      throw new Error(`Unknown category: ${item.category}`)
    }

    await Product.create({
      title: item.title,
      description: item.description,
      mrpPrice: item.mrpPrice,
      sellingPrice: item.sellingPrice,
      images: [item.image],
      stockQuantity: item.stockQuantity,
      isActive: true,
      categoryId,
      rating: item.rating,
      noOfRating: item.noOfRating,
      brand: item.brand,
    })
    inserted += 1
    console.log(`+ product: ${item.title}`)
  }

  return { inserted, skipped }
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set')
    process.exit(1)
  }

  await mongoose.connect(uri)

  const fallbackByTitle = new Map(PRODUCTS.map((p) => [p.title, p.image]))
  const categoryIds = await ensureCategories()
  const { inserted, skipped } = await seedProducts(categoryIds)
  const patched = await patchMissingImages(fallbackByTitle)

  const total = await Product.countDocuments()
  const withoutImg = await Product.countDocuments({
    $or: [{ images: { $size: 0 } }, { images: { $exists: false } }],
  })

  console.log('\nDone.')
  console.log(`Inserted: ${inserted}, skipped (duplicate title): ${skipped}, images patched: ${patched}`)
  console.log(`Total products: ${total}, without images: ${withoutImg}`)

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
