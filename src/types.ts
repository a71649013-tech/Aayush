/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'merchant';
  isMerchant?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  numReviews: number;
  reviews: Review[];
  stock: number;
  sellerId?: string;
  sellerName?: string;
  status?: 'active' | 'pending' | 'rejected';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  address: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'delayed';
  method: string;
  address: Address;
  createdAt: any;
  updatedAt?: any;
  trackingNumber?: string;
  estimatedDelivery?: string;
}
