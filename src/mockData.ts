import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'demo-test-1',
    name: '🚀 DEMO TEST PRODUCT',
    description: 'This is a high-visibility product added for your demo testing. It has 999 stock and is priced for testing transactions.',
    price: 99.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    numReviews: 999,
    reviews: [],
    stock: 999
  },
  {
    id: '1',
    name: 'Handwoven Pure Pashmina Shawl',
    description: 'Authentic 100% pure pashmina shawl handcrafted by artisans in Kathmandu. Extremely soft, lightweight, and warm.',
    price: 15000.00,
    category: 'Handicrafts',
    image: 'https://picsum.photos/seed/pashmina/600/600',
    rating: 4.8,
    numReviews: 124,
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'Aarav Sharma',
        rating: 5,
        comment: 'Absolutely stunning quality! The texture is incredibly soft.',
        createdAt: '2024-05-10T10:00:00Z'
      }
    ],
    stock: 15
  },
  {
    id: '2',
    name: 'Antique Brass Buddha Statue',
    description: 'Exquisite brass Buddha statue with intricate detailing. Perfect for home decor or meditation spaces.',
    price: 8500.50,
    category: 'Handicrafts',
    image: 'https://picsum.photos/seed/buddha/600/600',
    rating: 4.9,
    numReviews: 86,
    reviews: [],
    stock: 5
  },
  {
    id: '3',
    name: 'Organic Himalayan Oolong Tea',
    description: 'Premium organic oolong tea harvested from the high altitudes of Ilam, Nepal. Rich aroma and smooth taste.',
    price: 1250.00,
    category: 'Food & Beverages',
    image: 'https://picsum.photos/seed/tea/600/600',
    rating: 4.7,
    numReviews: 210,
    reviews: [],
    stock: 50
  },
  {
    id: '4',
    name: 'SwiftPro Smartwatch Gen 2',
    description: 'Modern smartwatch with health tracking, GPS, and long battery life. Sleek design for every occasion.',
    price: 25999.00,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/watch/600/600',
    rating: 4.5,
    numReviews: 1540,
    reviews: [],
    stock: 100
  }
];
