import React from 'react';
import { Landmark, Globe, ShoppingBag, Coffee, Star, Home, Sparkles, Gift, Smartphone, Zap, Heart, Utensils } from 'lucide-react';

export const CATEGORIES = [
  { name: 'Electronic Devices', icon: <Smartphone size={18} />, color: 'bg-blue-600' },
  { name: 'Handicrafts', icon: <Landmark size={18} />, color: 'bg-orange-500' },
  { name: 'Home & Lifestyle', icon: <Home size={18} />, color: 'bg-indigo-500' },
  { name: 'Groceries', icon: <Utensils size={18} />, color: 'bg-green-600' },
  { name: 'Health & Beauty', icon: <Heart size={18} />, color: 'bg-pink-500' },
  { name: 'Fashion', icon: <ShoppingBag size={18} />, color: 'bg-red-500' },
  { name: 'Sports & Outdoor', icon: <Zap size={18} />, color: 'bg-yellow-600' },
  { name: 'Organic Tea', icon: <Coffee size={18} />, color: 'bg-green-700' },
  { name: 'Art & Decor', icon: <Star size={18} />, color: 'bg-purple-500' },
  { name: 'Gift Sets', icon: <Gift size={18} />, color: 'bg-teal-500' },
];

export const NEPAL_CITIES = [
  "Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Biratnagar", 
  "Birgunj", "Butwal", "Dharan", "Hetauda", "Janakpur", "Itahari"
];

