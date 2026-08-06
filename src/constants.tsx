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
  "Birgunj", "Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Biratnagar", 
  "Butwal", "Dharan", "Hetauda", "Janakpur", "Itahari"
];

export const CITY_PROVINCE_MAP: Record<string, string> = {
  "Birgunj": "Madhesh Province",
  "Janakpur": "Madhesh Province",
  "Kathmandu": "Bagmati Province",
  "Lalitpur": "Bagmati Province",
  "Bharatpur": "Bagmati Province",
  "Hetauda": "Bagmati Province",
  "Pokhara": "Gandaki Province",
  "Biratnagar": "Koshi Province",
  "Dharan": "Koshi Province",
  "Itahari": "Koshi Province",
  "Butwal": "Lumbini Province"
};

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; defaultArea: string }> = {
  "Birgunj": { lat: 27.0094, lng: 84.8778, defaultArea: "Ghantaghar Chowk" },
  "Kathmandu": { lat: 27.6915, lng: 85.3201, defaultArea: "Maitighar" },
  "Pokhara": { lat: 28.2096, lng: 83.9587, defaultArea: "Lakeside" },
  "Lalitpur": { lat: 27.6727, lng: 85.3252, defaultArea: "Mangal Bazaar" },
  "Bharatpur": { lat: 27.6833, lng: 84.4333, defaultArea: "Lions Chowk" },
  "Biratnagar": { lat: 26.4525, lng: 87.2718, defaultArea: "Bargachhi" },
  "Butwal": { lat: 27.7006, lng: 83.4484, defaultArea: "Traffic Chowk" },
  "Dharan": { lat: 26.8124, lng: 87.2835, defaultArea: "Bhanuchowk" },
  "Hetauda": { lat: 27.4281, lng: 85.0323, defaultArea: "Seema Chowk" },
  "Janakpur": { lat: 26.7271, lng: 85.9231, defaultArea: "Bhanu Chowk" },
  "Itahari": { lat: 26.6630, lng: 87.2760, defaultArea: "Main Square" }
};

