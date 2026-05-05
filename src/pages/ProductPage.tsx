import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, Send, User, Heart, Share2, MapPin, BadgeCheck, Store, Zap, Landmark, ChevronDown } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { AdPlacement } from '../components/AdPlacement';
import { NEPAL_CITIES } from '../constants';

export default function ProductPage({ products, onAddToCart, onAddReview }: { 
  products: Product[], 
  onAddToCart: (p: Product) => void,
  onAddReview: (productId: string, rating: number, comment: string) => void
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Kathmandu');
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);

  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAddReview(product.id, rating, comment);
      setComment('');
      setRating(5);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="bg-daraz-bg min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex gap-2 text-xs text-neutral-500 mb-4 items-center">
          <Link to="/" className="hover:text-daraz-orange">Home</Link>
          <span>/</span>
          <Link to={`/?category=${product.category}`} className="hover:text-daraz-orange">{product.category}</Link>
          <span>/</span>
          <span className="text-neutral-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-4 space-y-4">
            <div className="aspect-square border border-neutral-100 overflow-hidden">
              <img 
                src={product.image} 
                className="w-full h-full object-contain" 
                alt={product.name}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square border border-neutral-100 cursor-pointer hover:border-daraz-orange">
                  <img src={product.image} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* Center: Product Details */}
          <div className="lg:col-span-5 space-y-6">
            <h1 className="text-xl md:text-2xl font-medium text-neutral-800 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 border-r border-neutral-200 pr-4">
                  {[...Array(5)].map((_, i) => (
                     <Star 
                       key={i} 
                       size={14} 
                       className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} 
                       fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                     />
                  ))}
                  <span className="text-xs text-blue-500 hover:underline cursor-pointer ml-1">{product.numReviews} Ratings</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-neutral-500 font-medium uppercase tracking-tighter">Brand:</span>
                   <span className="text-xs text-blue-500 hover:underline cursor-pointer">Official Store</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Share2 size={18} className="text-neutral-400 cursor-pointer hover:text-daraz-orange" />
                <Heart size={18} className="text-neutral-400 cursor-pointer hover:text-daraz-orange" />
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-sm">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-daraz-orange">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-neutral-400 line-through">{formatCurrency(product.price * 1.2)}</span>
                <span className="text-xs text-neutral-800 font-medium">-20%</span>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-daraz-orange/10 px-2 py-1 inline-flex text-daraz-orange text-[10px] font-bold uppercase rounded-sm">
                 <Zap size={10} fill="currentColor" /> Flash Sale ends in 02:44:12
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 py-6 border-b border-neutral-100">
               <div className="flex flex-col gap-4">
                  <span className="text-sm text-neutral-500">Quantity</span>
                  <div className="flex items-center gap-4">
                    <div className="flex border border-neutral-200 rounded-sm">
                       <button className="px-4 py-1.5 bg-neutral-100 border-r border-neutral-200 hover:bg-neutral-200">-</button>
                       <input type="text" value="1" className="w-12 text-center text-sm outline-none" readOnly />
                       <button className="px-4 py-1.5 bg-neutral-100 border-l border-neutral-200 hover:bg-neutral-200">+</button>
                    </div>
                    <span className="text-xs text-neutral-500">Only {product.stock} items left</span>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => {
                  onAddToCart(product);
                  navigate('/cart');
                }}
                className="flex-1 bg-blue-500 text-white font-bold py-3.5 rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Buy Now
              </button>
              <button 
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-daraz-orange text-white font-bold py-3.5 rounded-sm hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Add to Cart
              </button>
            </div>

            <AdPlacement type="banner" />
          </div>

          {/* Right: Delivery & Seller */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-4 space-y-4">
                <div className="flex justify-between items-start">
                   <h3 className="text-xs font-bold text-neutral-500 uppercase">Delivery Options</h3>
                   <Share2 size={14} className="text-neutral-400" />
                </div>
                
                <div className="flex gap-3 items-start relative">
                   <MapPin size={16} className="text-neutral-400 mt-1 shrink-0" />
                   <div className="text-xs flex-1">
                      <p className="font-bold text-neutral-800">Bagmati, {selectedCity}</p>
                      <button 
                        onClick={() => setIsCitySelectorOpen(!isCitySelectorOpen)}
                        className="text-blue-500 font-medium flex items-center gap-1 uppercase text-[10px]"
                      >
                        CHANGE <ChevronDown size={10} />
                      </button>

                      {isCitySelectorOpen && (
                        <div className="absolute top-full left-0 w-64 max-h-60 overflow-y-auto bg-white border border-neutral-200 z-50 shadow-xl mt-1 rounded-sm scrollbar-thin scrollbar-thumb-neutral-200">
                          {NEPAL_CITIES.map(city => (
                            <button
                              key={city}
                              onClick={() => {
                                setSelectedCity(city);
                                setIsCitySelectorOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0",
                                selectedCity === city ? "text-daraz-orange font-bold" : "text-neutral-600"
                              )}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                </div>

                <div className="h-px bg-neutral-200"></div>

                <div className="flex gap-3 items-start">
                   <Truck size={16} className="text-neutral-400 mt-1 shrink-0" />
                   <div className="text-xs flex-1">
                      <div className="flex justify-between">
                         <p className="font-bold text-neutral-800">Standard Delivery</p>
                         <p className="font-bold text-neutral-800">{formatCurrency(15)}</p>
                      </div>
                      <p className="text-neutral-500">Scheduled: 3 - 5 days</p>
                   </div>
                </div>

                <div className="flex gap-3 items-start">
                   <Landmark size={16} className="text-neutral-400 mt-1 shrink-0" />
                   <div className="text-xs">
                      <p className="font-bold text-neutral-800">Cash on Delivery Available</p>
                   </div>
                </div>

                <div className="h-px bg-neutral-200"></div>

                <div className="flex gap-3 items-start">
                   <RefreshCw size={16} className="text-neutral-400 mt-1 shrink-0" />
                   <div className="text-xs">
                      <p className="font-bold text-neutral-800">7 Days Returns</p>
                      <p className="text-neutral-500">Change of mind is not applicable</p>
                   </div>
                </div>

                <div className="flex gap-3 items-start">
                   <ShieldCheck size={16} className="text-neutral-400 mt-1 shrink-0" />
                   <div className="text-xs">
                      <p className="font-bold text-neutral-800">Warranty Not Available</p>
                   </div>
                </div>
             </div>

             <div className="bg-neutral-50 border border-neutral-100 rounded-sm p-4 space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-xs font-bold text-neutral-500 uppercase">Service</h3>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                      <Store size={20} className="text-daraz-orange" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-neutral-800 uppercase tracking-tight">Official Marketplace</p>
                      <button className="text-[10px] text-blue-500 font-bold uppercase hover:underline">Chat with Seller</button>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                   <div className="text-center border-r border-neutral-200">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold">Rating</p>
                      <p className="text-sm font-bold text-neutral-800">92%</p>
                   </div>
                   <div className="text-center border-r border-neutral-200">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold">Shipment</p>
                      <p className="text-sm font-bold text-neutral-800">99%</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold">Chat</p>
                      <p className="text-sm font-bold text-neutral-800">100%</p>
                   </div>
                </div>
                <button className="w-full py-2 bg-white border border-neutral-200 text-xs font-bold uppercase hover:bg-neutral-50 transition-colors">Go to Store</button>
             </div>
          </div>
        </div>

        {/* Product Description / Reviews */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-12 bg-white rounded-sm shadow-sm p-6 md:p-10">
              <div className="border-b border-neutral-200 mb-8 flex gap-8">
                 <button className="pb-4 text-sm font-bold text-daraz-orange border-b-2 border-daraz-orange uppercase tracking-widest italic">Description</button>
                 <button className="pb-4 text-sm font-bold text-neutral-500 hover:text-daraz-orange uppercase tracking-widest italic">Ratings & Reviews</button>
              </div>

              <AdPlacement type="banner" className="mb-6" />
              
              <div className="max-w-4xl space-y-8">
                 <div>
                    <h3 className="text-lg font-bold text-neutral-800 mb-4 uppercase italic">Product Stories</h3>
                    <p className="text-neutral-600 leading-relaxed italic">{product.description}</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neutral-100">
                    <img src={product.image} className="w-full h-64 object-cover rounded-sm" alt="" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/detail-1/600/400" className="w-full h-64 object-cover rounded-sm" alt="" referrerPolicy="no-referrer" />
                 </div>
              </div>

              {/* Real Reviews Hook */}
              <div className="mt-20 pt-20 border-t border-neutral-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-neutral-800 mb-6 uppercase italic">Ratings & Reviews</h2>
                    <div className="flex items-baseline gap-2 mb-2">
                       <span className="text-4xl font-bold text-neutral-800">{product.rating.toFixed(1)}</span>
                       <span className="text-xl text-neutral-400">/ 5</span>
                    </div>
                    <div className="flex items-center gap-1 mb-6">
                       {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                       ))}
                       <span className="text-xs text-neutral-500 ml-2">{product.numReviews} Ratings</span>
                    </div>
                    
                    <div className="space-y-2 mb-12">
                      {[5, 4, 3, 2, 1].map((lvl) => (
                        <div key={lvl} className="flex items-center gap-4 text-xs">
                          <div className="flex gap-0.5 w-16">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={8} className={i < lvl ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} fill={i < lvl ? "currentColor" : "none"} />
                             ))}
                          </div>
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${Math.random() * 100}%` }}></div>
                          </div>
                          <span className="w-8 text-right text-neutral-400">{(Math.random() * 20).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-daraz-bg p-6 rounded-sm">
                      <h3 className="text-xs font-bold uppercase text-neutral-800 mb-4 italic">Write a Review</h3>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              className={cn(
                                "p-1.5 transition-all outline-none",
                                rating >= s ? "text-yellow-400" : "text-neutral-200"
                              )}
                            >
                              <Star size={20} fill={rating >= s ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                        <textarea 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Your feedback..."
                          className="w-full bg-white border border-neutral-200 rounded-sm p-3 text-xs outline-none h-24 resize-none focus:border-daraz-orange"
                        />
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-daraz-orange text-white py-2.5 rounded-sm font-bold uppercase text-[10px] tracking-widest hover:opacity-90 disabled:opacity-50"
                        >
                          {isSubmitting ? "Submitting..." : "Post Review"}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="lg:col-span-2 divide-y divide-neutral-100">
                    {product.reviews.length === 0 ? (
                      <div className="py-20 text-center text-neutral-400 uppercase text-[10px] font-bold tracking-widest italic">No Reviews Yet</div>
                    ) : (
                      product.reviews.map((review) => (
                        <div key={review.id} className="py-8 first:pt-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={12} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} fill={i < review.rating ? "currentColor" : "none"} />
                               ))}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-bold text-neutral-800 mb-2 uppercase tracking-tighter">Verified Purchase from {review.userName}</p>
                          <p className="text-sm text-neutral-600 font-normal leading-relaxed italic pr-12">"{review.comment}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
