import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Package, 
  Bell, 
  Megaphone, 
  CheckCheck, 
  ChevronRight, 
  Send, 
  ArrowLeft,
  Sparkles,
  Info,
  ShoppingBag,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';
import { cn } from '../lib/utils';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  getDocs, 
  deleteDoc, 
  limit,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Chat {
  id: string;
  senderName: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: Array<{
    sender: 'user' | 'merchant';
    text: string;
    time: string;
  }>;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { 
    user, 
    unreadCount, 
    setUnreadCount,
    nativePermission,
    requestNotificationPermission,
    dispatchNotification
  } = useFirebase();
  const [activeCategory, setActiveCategory] = useState<'chats' | 'orders' | 'activities' | 'promos'>('promos');
  
  // Localized mock data
  const [unreadDots, setUnreadDots] = useState({
    chats: true,
    orders: true,
    activities: true,
    promos: true,
  });

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'nepali-mart-cs',
      senderName: 'Nepali Mart Customer Support',
      avatarColor: 'bg-orange-500',
      lastMessage: 'Namaste! How can we assist you with Nepali Mart Gems today?',
      time: '10:45 AM',
      unread: true,
      messages: [
        { sender: 'merchant', text: 'Namaste! Welcome to Nepali Mart Customer Support. 🙏', time: '10:42 AM' },
        { sender: 'merchant', text: 'How can we assist you with Nepali Mart Gems, or your Order status today?', time: '10:43 AM' }
      ]
    },
    {
      id: 'himalayan-handicrafts',
      senderName: 'Patan Handicrafts Guild',
      avatarColor: 'bg-emerald-600',
      lastMessage: 'Sure, we can customize the wooden carving size for you.',
      time: 'Yesterday',
      unread: true,
      messages: [
        { sender: 'user', text: 'Hello, is it possible to customize the size of the wooden Buddha statue?', time: 'Yesterday' },
        { sender: 'merchant', text: 'Namaste! Yes, absolutely. We work directly with master artisans in Patan. What dimensions are you looking for?', time: 'Yesterday' },
        { sender: 'user', text: 'Around 12 inches by 12 inches.', time: 'Yesterday' },
        { sender: 'merchant', text: 'Sure, we can customize the wooden carving size for you. It will take around 3 days extra for carving.', time: 'Yesterday' }
      ]
    },
    {
      id: 'organic-tea-farm',
      senderName: 'Ilam Tea Garden merchant',
      avatarColor: 'bg-green-700',
      lastMessage: 'The Premium Orthodox Black Tea is freshly packed. Delivery leaves tomorrow.',
      time: '3 days ago',
      unread: false,
      messages: [
        { sender: 'user', text: 'Is this tea organic certified?', time: '3 days ago' },
        { sender: 'merchant', text: 'Yes, our tea is sourced directly from certified organic farms in Ilam, eastern hills of Nepal.', time: '3 days ago' },
        { sender: 'merchant', text: 'The Premium Orthodox Black Tea is freshly packed. Delivery leaves tomorrow.', time: '3 days ago' }
      ]
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'ord-1',
      title: 'Package Arrived at Kathmandu Sorting Center 📦',
      desc: 'Your order containing Premium Himalayan Orthodox Tea has arrived at the central Nepal hub and is being routed.',
      time: '07/06/2026',
      unread: true,
      status: 'In Transit',
      orderId: 'NM-99231'
    },
    {
      id: 'ord-2',
      title: 'Order Dispatched from Patan Warehouse 🚚',
      desc: 'Handcrafted Brass Butter Lamp package has been handed over to Daraz Express delivery courier headed to Pokhara.',
      time: '04/06/2026',
      unread: true,
      status: 'Shipped',
      orderId: 'NM-99182'
    }
  ]);

  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      title: 'Check-in Streak Active! 🔥',
      desc: 'You have checked in 3 days in a row. Complete tomorrow to unlock the 15% off voucher.',
      time: '06/06/2026',
      unread: true,
      points: '+50 Gems'
    },
    {
      id: 'act-2',
      title: 'Security Notice',
      desc: 'Your account was logged in from a new mobile device. If this wasn\'t you, please reset your password.',
      time: '05/06/2026',
      unread: false,
      points: null
    }
  ]);

  const [promotions, setPromotions] = useState([
    {
      id: 'promo-1',
      title: 'The wait is over—it\'s finally here! 🎉🔥',
      date: '06/06/2026',
      unread: true,
      bannerTitle: '6.6 MID YEAR SHOPPING FEST',
      bannerSub: 'PLAY GEMS TREASURE CHEST & WIN FREE GIFTS DAILY',
      discount: 'EXTRA 60% OFF',
      desc: 'SHOP NOW with 60% OFF and win free gifts on gems channel. 🔥',
      tag: 'Gems Channel Special'
    },
    {
      id: 'promo-2',
      title: 'Something exciting is coming your way 👀🔥 .',
      date: '05/06/2026',
      unread: true,
      bannerTitle: '6.6 MID YEAR SHOPPING FEST',
      bannerSub: 'PLAY GEMS TREASURE CHEST & WIN FREE GIFTS DAILY',
      discount: 'EXTRA 60% OFF',
      desc: 'SHOP with 60% OFF and win free gifts from 6th June on Gems channel. 🔥',
      tag: 'Mid-Year Fest'
    }
  ]);

  // Selected chat details for live conversation popups
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [typedMessage, setTypedMessage] = useState('');

  const currentUserId = user?.id || 'guest-user';

  // Synchronize top-level chat lists metadata in real-time based on actual Firestore data
  useEffect(() => {
    const unsubscribes = chats.map(c => {
      const chatDocId = `${c.id}-${currentUserId}`;
      const q = query(
        collection(db, 'chats', chatDocId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          let timeStr = 'Just now';
          if (docData.createdAt) {
            const date = docData.createdAt.toDate ? docData.createdAt.toDate() : new Date(docData.createdAt);
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          
          setChats(prev => prev.map(item => {
            if (item.id === c.id) {
              return {
                ...item,
                lastMessage: docData.text || item.lastMessage,
                time: timeStr
              };
            }
            return item;
          }));
        }
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUserId]);

  // Subscribe to live administrator broadcasts in real-time
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const dbNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        let dateStr = 'Just now';
        
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          dateStr = date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        
        return {
          id: doc.id,
          category: data.category || 'promos',
          title: data.title || '',
          desc: data.desc || '',
          date: dateStr,
          unread: data.unread !== undefined ? data.unread : true,
          // promos fields
          bannerTitle: data.bannerTitle || 'ANNOUNCEMENT',
          bannerSub: data.bannerSub || 'SPECIAL UPDATES FROM ADMIN',
          discount: data.discount || 'LIMITED VOUCHERS',
          tag: data.tag || 'Mart Broadcast',
          // activities fields
          points: data.points || null,
          // orders fields
          status: data.status || 'Dispatched',
          orderId: data.orderId || 'NM-ADMIN'
        };
      });

      // Filter/Prepend dynamically by category
      const livePromos = dbNotifications.filter(n => n.category === 'promos').map(p => ({
        id: p.id,
        title: p.title,
        date: p.date,
        unread: p.unread,
        bannerTitle: p.bannerTitle,
        bannerSub: p.bannerSub,
        discount: p.discount,
        desc: p.desc,
        tag: p.tag
      }));

      const liveOrders = dbNotifications.filter(n => n.category === 'orders').map(o => ({
        id: o.id,
        title: o.title,
        desc: o.desc,
        time: o.date,
        unread: o.unread,
        status: o.status,
        orderId: o.orderId
      }));

      const liveActivities = dbNotifications.filter(n => n.category === 'activities').map(a => ({
        id: a.id,
        title: a.title,
        desc: a.desc,
        time: a.date,
        unread: a.unread,
        points: a.points
      }));

      // Merge with default initial static arrays beautifully
      const defaultPromos = [
        {
          id: 'promo-1',
          title: 'The wait is over—it\'s finally here! 🎉🔥',
          date: '06/06/2026',
          unread: true,
          bannerTitle: '6.6 MID YEAR SHOPPING FEST',
          bannerSub: 'PLAY GEMS TREASURE CHEST & WIN FREE GIFTS DAILY',
          discount: 'EXTRA 60% OFF',
          desc: 'SHOP NOW with 60% OFF and win free gifts on gems channel. 🔥',
          tag: 'Gems Channel Special'
        },
        {
          id: 'promo-2',
          title: 'Something exciting is coming your way 👀🔥 .',
          date: '05/06/2026',
          unread: true,
          bannerTitle: '6.6 MID YEAR SHOPPING FEST',
          bannerSub: 'PLAY GEMS TREASURE CHEST & WIN FREE GIFTS DAILY',
          discount: 'EXTRA 60% OFF',
          desc: 'SHOP with 60% OFF and win free gifts from 6th June on Gems channel. 🔥',
          tag: 'Mid-Year Fest'
        }
      ];

      const defaultOrders = [
        {
          id: 'ord-1',
          title: 'Package Arrived at Kathmandu Sorting Center 📦',
          desc: 'Your order containing Premium Himalayan Orthodox Tea has arrived at the central Nepal hub and is being routed.',
          time: '07/06/2026',
          unread: true,
          status: 'In Transit',
          orderId: 'NM-99231'
        },
        {
          id: 'ord-2',
          title: 'Order Dispatched from Patan Warehouse 🚚',
          desc: 'Handcrafted Brass Butter Lamp package has been handed over to Daraz Express delivery courier headed to Pokhara.',
          time: '04/06/2026',
          unread: true,
          status: 'Shipped',
          orderId: 'NM-99182'
        }
      ];

      const defaultActivities = [
        {
          id: 'act-1',
          title: 'Check-in Streak Active! 🔥',
          desc: 'You have checked in 3 days in a row. Complete tomorrow to unlock the 15% off voucher.',
          time: '06/06/2026',
          unread: true,
          points: '+50 Gems'
        },
        {
          id: 'act-2',
          title: 'Security Notice',
          desc: 'Your account was logged in from a new mobile device. If this wasn\'t you, please reset your password.',
          time: '05/06/2026',
          unread: false,
          points: null
        }
      ];

      setPromotions([...livePromos, ...defaultPromos.filter(d => !livePromos.some(lp => lp.title === d.title))]);
      setOrders([...liveOrders, ...defaultOrders.filter(d => !liveOrders.some(lo => lo.title === d.title))]);
      setActivities([...liveActivities, ...defaultActivities.filter(d => !liveActivities.some(la => la.title === d.title))]);
    }, (error) => {
      console.error("Firestore live read notifications error:", error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Listen to active chat message stream in real-time
  useEffect(() => {
    if (!selectedChat) return;

    const chatDocId = `${selectedChat.id}-${currentUserId}`;
    const messagesRef = collection(db, 'chats', chatDocId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Automatically seed/bootstrap default chats history on the active database
        const initialPresetMsgs = chats.find(c => c.id === selectedChat.id)?.messages || [];
        initialPresetMsgs.forEach(async (item) => {
          try {
            await addDoc(messagesRef, {
              sender: item.sender,
              text: item.text,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.error("Failed to seed initial message to Firestore:", e);
          }
        });
        return;
      }

      const dbMsgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let timeStr = 'Just now';
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          sender: data.sender as 'user' | 'merchant',
          text: data.text || '',
          time: timeStr
        };
      });

      // Maintain internal states
      setChats(prev => prev.map(c => {
        if (c.id === selectedChat.id) {
          return {
            ...c,
            messages: dbMsgs,
            lastMessage: dbMsgs[dbMsgs.length - 1]?.text || c.lastMessage,
            time: dbMsgs[dbMsgs.length - 1]?.time || c.time
          };
        }
        return c;
      }));

      setSelectedChat(prev => {
        if (prev && prev.id === selectedChat.id) {
          return {
            ...prev,
            messages: dbMsgs,
            lastMessage: dbMsgs[dbMsgs.length - 1]?.text || prev.lastMessage,
            time: dbMsgs[dbMsgs.length - 1]?.time || prev.time
          };
        }
        return prev;
      });
    }, (error) => {
      console.error("Firestore active chat listener error:", error);
    });

    return () => unsubscribe();
  }, [selectedChat?.id, currentUserId]);

  const handleSendMessage = async () => {
    if (!typedMessage.trim() || !selectedChat) return;

    const textToSubmit = typedMessage.trim();
    setTypedMessage('');

    try {
      const chatDocId = `${selectedChat.id}-${currentUserId}`;
      const messagesRef = collection(db, 'chats', chatDocId, 'messages');
      
      // Save client message to Firestore path subcollection
      await addDoc(messagesRef, {
        sender: 'user',
        text: textToSubmit,
        createdAt: serverTimestamp()
      });

      // Write master metadata to /chats/{chatDocId} so the administrator dashboard can list this user and chat in real-time
      await setDoc(doc(db, 'chats', chatDocId), {
        id: chatDocId,
        userChatId: selectedChat.id,
        userId: currentUserId,
        userName: user?.name || 'Local Tester',
        userEmail: user?.email || 'guest@nepalimart.com',
        lastMessage: textToSubmit,
        avatarColor: selectedChat.avatarColor,
        senderName: selectedChat.senderName,
        updatedAt: serverTimestamp(),
        unreadByAdmin: true,
        unreadByUser: false
      }, { merge: true });

    } catch (err) {
      console.error("Error saving user message in Firestore:", err);
    }
  };

  // Clean-all read sweeper
  const markAllAsRead = () => {
    setUnreadCount(0);
    setUnreadDots({
      chats: false,
      orders: false,
      activities: false,
      promos: false,
    });
    
    setChats(prev => prev.map(c => ({ ...c, unread: false })));
    setOrders(prev => prev.map(o => ({ ...o, unread: false })));
    setActivities(prev => prev.map(a => ({ ...a, unread: false })));
    setPromotions(prev => prev.map(p => ({ ...p, unread: false })));
  };

  const getUnreadAlertCount = () => {
    // Calculated dynamically
    let total = 0;
    chats.forEach(c => c.unread ? total++ : null);
    orders.forEach(o => o.unread ? total++ : null);
    activities.forEach(a => a.unread ? total++ : null);
    promotions.forEach(p => p.unread ? total++ : null);
    return total;
  };

  // Keep global state synced on change
  const dynamicCount = getUnreadAlertCount();
  useEffect(() => {
    if (dynamicCount !== unreadCount && dynamicCount > 0) {
      setUnreadCount(dynamicCount);
    }
  }, [dynamicCount, unreadCount, setUnreadCount]);

  const removePromoMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div id="messages-container" className="min-h-screen bg-[#fafafa] max-w-md mx-auto relative flex flex-col pb-32">
      {/* Messages Main Header */}
      {!selectedChat ? (
        <div className="bg-white px-5 pt-6 pb-4 border-b border-neutral-100 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              Messages
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black tracking-tight rounded-full px-2 py-0.5 min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </h1>
            
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-daraz-orange hover:border-daraz-orange/40 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              <CheckCheck size={14} className="text-emerald-500" />
              Mark all as read
            </button>
          </div>

          {/* Active Client Push Authorization Info */}
          <div className="mt-4 p-3 bg-neutral-50 rounded-sm border border-neutral-100 flex items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-neutral-800 flex items-center gap-1">
                <Bell size={11} className="text-daraz-orange" /> live push notifications
              </p>
              <p className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5 truncate">
                {nativePermission === 'granted' ? '🎉 Desktop Alert Connected' : 'Turn on to receive instant chat reply chimings!'}
              </p>
            </div>
            {nativePermission !== 'granted' ? (
              <button
                onClick={async () => {
                  const res = await requestNotificationPermission();
                  if (res === 'granted') {
                    dispatchNotification("Live Push Authorized! 🔔", "You will now receive elegant alert chimings when support responds.", "promos");
                  } else {
                    // Fallback for wrapped app containers
                    dispatchNotification(
                      "In-App Chime Enabled! 🔊",
                      "Standard web-push is blocked by the app wrapper, but we successfully turned on high-fidelity live audio & in-app banners for you!",
                      "promos"
                    );
                  }
                }}
                className="bg-daraz-orange hover:opacity-95 text-white font-black text-[8px] uppercase tracking-wider py-1.5 px-2.5 rounded-sm transition-opacity shrink-0 cursor-pointer"
              >
                Enable
              </button>
            ) : (
              <span className="text-[7px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-sm border border-green-150 shrink-0">
                ✓ ACTIVE
              </span>
            )}
          </div>

          {/* Core Categories Row styled strictly like the uploaded screenshot */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {/* Chats Button */}
            <button 
              onClick={() => setActiveCategory('chats')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                  activeCategory === 'chats' ? "bg-emerald-505 bg-emerald-500 ring-2 ring-emerald-300" : "bg-emerald-500/90"
                )}>
                  <MessageSquare size={20} className="text-white fill-white/10" />
                </div>
                {unreadDots.chats && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-extrabold tracking-tight mt-1.5 uppercase",
                activeCategory === 'chats' ? "text-emerald-600" : "text-neutral-500"
              )}>
                Chats
              </span>
            </button>

            {/* Orders Button */}
            <button 
              onClick={() => setActiveCategory('orders')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                  activeCategory === 'orders' ? "bg-blue-505 bg-blue-500 ring-2 ring-blue-300" : "bg-blue-500/90"
                )}>
                  <Package size={20} className="text-white" />
                </div>
                {unreadDots.orders && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-extrabold tracking-tight mt-1.5 uppercase",
                activeCategory === 'orders' ? "text-blue-600" : "text-neutral-500"
              )}>
                Orders
              </span>
            </button>

            {/* Activities Button */}
            <button 
              onClick={() => setActiveCategory('activities')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                  activeCategory === 'activities' ? "bg-amber-505 bg-amber-500 ring-2 ring-amber-300" : "bg-amber-500/90"
                )}>
                  <Bell size={20} className="text-white fill-white/10" />
                </div>
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] font-black px-1 rounded-full border border-white">
                  13
                </span>
              </div>
              <span className={cn(
                "text-[11px] font-extrabold tracking-tight mt-1.5 uppercase",
                activeCategory === 'activities' ? "text-amber-600" : "text-neutral-500"
              )}>
                Activities
              </span>
            </button>

            {/* Promos Button */}
            <button 
              onClick={() => setActiveCategory('promos')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm",
                  activeCategory === 'promos' ? "bg-rose-500 ring-2 ring-rose-300" : "bg-rose-500/90"
                )}>
                  <Megaphone size={20} className="text-white" />
                </div>
                {unreadDots.promos && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-extrabold tracking-tight mt-1.5 uppercase",
                activeCategory === 'promos' ? "text-rose-600" : "text-neutral-500"
              )}>
                Promos
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Chat View Top Bar */
        <div className="bg-white/95 backdrop-blur px-4 pt-6 pb-4 border-b border-neutral-100 sticky top-0 z-30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedChat(null)}
              className="p-1.5 rounded-full hover:bg-neutral-150 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold", selectedChat.avatarColor)}>
                {selectedChat.senderName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-neutral-900 leading-tight">{selectedChat.senderName}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping inline-block" />
                  Online Merchant Support
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={async () => {
              // Delete history locally
              setChats(prev => prev.map(c => c.id === selectedChat.id ? { ...c, messages: [] } : c));
              setSelectedChat(prev => prev ? { ...prev, messages: [] } : null);

              // Delete history securely in firestore
              try {
                const chatDocId = `${selectedChat.id}-${currentUserId}`;
                const messagesRef = collection(db, 'chats', chatDocId, 'messages');
                const messagesSnap = await getDocs(messagesRef);
                messagesSnap.forEach(async (d) => {
                  try {
                    await deleteDoc(doc(db, 'chats', chatDocId, 'messages', d.id));
                  } catch (delErr) {
                    console.error("Failed to delete individual message doc:", delErr);
                  }
                });
              } catch (err) {
                console.error("Failed to clean firestore message log:", err);
              }
            }}
            title="Clear Chat History"
            className="p-1.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Main Alerts Body */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {!selectedChat ? (
          <>
            {/* Last 7 days section divider helper */}
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2 mt-1">
              <span>Last 7 Days</span>
              <span>Sorted by Recency</span>
            </div>

            {/* category view routers */}

            {/* PROMOS ROUTER (Exactly matched with user screenshot layout) */}
            {activeCategory === 'promos' && (
              <div className="space-y-5 animate-fadeIn">
                {promotions.length === 0 ? (
                  <div className="text-center py-12 px-6 bg-white rounded-lg border border-neutral-100 shadow-sm space-y-2">
                    <Megaphone className="mx-auto text-neutral-300" size={32} />
                    <p className="text-neutral-700 font-extrabold text-xs uppercase tracking-wider">No active promotions</p>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">Check back later for Nepali Mart seasonal sales and Mid-Year Gems campaigns!</p>
                  </div>
                ) : (
                  promotions.map((promo) => (
                    <div 
                      key={promo.id} 
                      className={cn(
                        "bg-white rounded-lg border border-neutral-150/80 p-4 transition-all relative overflow-hidden shadow-xs hover:shadow-xs group cursor-pointer",
                        promo.unread ? "border-l-4 border-l-daraz-orange" : ""
                      )}
                      onClick={() => navigate('/vouchers')}
                    >
                      {/* Promotional Badge & Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0 relative mt-0.5 shadow-sm">
                          <Bell size={20} className="fill-white/10 text-white animate-bounce-gentle" />
                          {promo.unread && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 border border-white rounded-full animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="text-xs font-black tracking-tight leading-snug text-neutral-900 group-hover:text-daraz-orange transition-colors">
                            {promo.title}
                          </h4>
                          <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-tight">{promo.date}</p>
                        </div>

                        {/* Top-right dismisser button */}
                        <button 
                          onClick={(e) => removePromoMessage(promo.id, e)}
                          className="absolute top-3.5 right-3.5 p-1 rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Daraz / Nepali Mart custom purple-pink Mid-Year Shopping Fest banner inside card */}
                      <div className="mt-3.5 rounded-md text-white overflow-hidden shadow-xs relative select-none">
                        {/* Elegant Mid-Year Pinky/Purple Radial Gradient Banner */}
                        <div className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-indigo-700 px-5 py-6 flex flex-col justify-between relative min-h-[140px]">
                          {/* Floating backdrop blur design shapes */}
                          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
                          <div className="absolute bottom-[-10%] left-[20%] w-16 h-16 bg-pink-400/30 rounded-full blur-lg" />
                          
                          {/* Banner Header Title Matches user's screenshot details exactly */}
                          <div className="space-y-1.5 z-10 relative">
                            <div className="bg-amber-400 text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider w-fit inline-block leading-tight">
                              🎟️ {promo.tag}
                            </div>
                            <h5 className="text-[17px] font-extrabold tracking-tighter text-white uppercase leading-none drop-shadow-sm font-sans">
                              {promo.bannerTitle}
                            </h5>
                            <p className="text-[9.5px] text-pink-100 font-extrabold uppercase tracking-widest leading-tight">
                              {promo.bannerSub}
                            </p>
                          </div>

                          {/* Extra off highlights */}
                          <div className="flex items-center justify-between items-end mt-4 pt-1 z-10">
                            <div>
                              <span className="text-xl font-black text-amber-300 bg-black/25 px-2 py-0.5 rounded border border-amber-300/20 leading-none shadow-xs">
                                {promo.discount}
                              </span>
                            </div>
                            
                            {/* Explore Now orange button exact color from image */}
                            <div className="bg-amber-400 hover:bg-amber-500 text-neutral-950 text-[10px] font-black uppercase px-3 py-1.5 rounded-sm flex items-center gap-1 transition-all group-hover:translate-x-1 duration-200">
                              Explore Now
                              <ChevronRight size={10} strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description Text underneath */}
                      <p className="text-xs text-neutral-700 font-extrabold leading-relaxed text-left mt-3.5 flex items-center gap-1">
                        {promo.desc}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CHATS ROUTER */}
            {activeCategory === 'chats' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="bg-emerald-50/50 rounded p-3 text-[10.5px] leading-relaxed text-emerald-800 font-medium flex gap-2 border border-emerald-100 shadow-3xs">
                  <Info size={14} className="shrink-0 text-emerald-600 mt-0.5" />
                  <p>
                    <strong>Interactive Merchant Chats:</strong> Ask vendors about their organic tea fresh batches, wood handicraft options, or Gems voucher queries for instant automated live responses!
                  </p>
                </div>
                {chats.map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
                    }}
                    className={cn(
                      "bg-white p-3.5 rounded-lg border border-neutral-150/80 hover:border-emerald-200 cursor-pointer flex items-start gap-3 transition-all relative shadow-2xs hover:shadow-1xs",
                      chat.unread ? "border-l-4 border-l-emerald-500" : ""
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 font-extrabold shadow-sm text-sm capitalize", chat.avatarColor)}>
                      {chat.senderName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-neutral-900 leading-tight block truncate uppercase tracking-tight">{chat.senderName}</span>
                      </div>
                      <p className={cn(
                        "text-[11.5px] leading-snug mt-1 truncate",
                        chat.unread ? "font-extrabold text-neutral-900" : "text-neutral-500 font-medium"
                      )}>
                        {chat.lastMessage}
                      </p>
                    </div>

                    <div className="absolute right-3.5 top-3.5 flex flex-col items-end gap-1.5 justify-between h-10">
                      <span className="text-[9.5px] font-bold text-neutral-400 capitalize">{chat.time}</span>
                      {chat.unread && (
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORDERS ROUTER */}
            {activeCategory === 'orders' && (
              <div className="space-y-3 animate-fadeIn">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white p-4 rounded-lg border border-neutral-150/80 shadow-3xs hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-wide">
                        {order.status}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400 tracking-tight">{order.time}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="p-2 h-fit bg-neutral-100 rounded text-neutral-600">
                        <Package size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-neutral-800 leading-snug">{order.title}</h4>
                        <p className="text-[11px] text-neutral-600 mt-1 lines-2 leading-relaxed h-[36px] overflow-hidden">{order.desc}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-neutral-500">
                      <span>Order ID: <strong className="text-neutral-800">{order.orderId}</strong></span>
                      <button 
                        onClick={() => navigate('/profile')}
                        className="text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Track Logistics <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIVITIES ROUTER */}
            {activeCategory === 'activities' && (
              <div className="space-y-3 animate-fadeIn">
                {activities.map((act) => (
                  <div 
                    key={act.id}
                    className="bg-white p-4 rounded-lg border border-neutral-150/80 shadow-3xs flex gap-3 hover:border-amber-200 transition-all"
                  >
                    <div className="p-2 h-fit bg-amber-50 rounded text-amber-600 shrink-0 mt-0.5 shadow-3xs">
                      <Bell size={16} className="fill-amber-500/10" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black text-neutral-800 leading-snug">{act.title}</h4>
                        <span className="text-[9px] font-semibold text-neutral-400 shrink-0 ml-2">{act.time}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">{act.desc}</p>
                      {act.points && (
                        <div className="mt-2 text-[10px] bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded font-black w-fit flex items-center gap-1 shadow-3xs">
                          <Sparkles size={10} className="fill-amber-500 text-amber-500" /> {act.points} Claimed!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Live Chat conversation active window */
          <div className="bg-white rounded-lg border border-neutral-150/80 shadow-sm flex flex-col h-[70vh] relative overflow-hidden animate-fadeIn select-text">
            {/* Header info bar */}
            <div className="bg-neutral-50 px-4 py-2 text-center text-[10px] font-bold text-neutral-400 border-b border-neutral-100 uppercase tracking-widest">
              Private Channel with {selectedChat.senderName}
            </div>

            {/* Message streams inside active chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
              {selectedChat.messages.length === 0 ? (
                <div className="text-center py-16 text-neutral-300 space-y-1 my-auto">
                  <MessageSquare className="mx-auto" size={24} />
                  <p className="text-[11px] font-bold uppercase tracking-wider">No message history yet</p>
                  <p className="text-[10px]">Type a message below to start a live inquiry!</p>
                </div>
              ) : (
                selectedChat.messages.map((m, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "max-w-[85%] rounded-md px-3 py-2 text-xs leading-relaxed shadow-3xs animate-fadeIn",
                      m.sender === 'user' 
                        ? "bg-daraz-orange text-white self-end rounded-tr-none text-right font-medium" 
                        : "bg-neutral-100 text-neutral-800 self-start rounded-tl-none text-left font-medium"
                    )}
                  >
                    <p>{m.text}</p>
                    <span className={cn(
                      "text-[8.5px] block mt-1.5 opacity-70 tracking-tight",
                      m.sender === 'user' ? "text-orange-50 text-right" : "text-neutral-400 text-left"
                    )}>
                      {m.time}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick helper buttons trigger custom responses */}
            <div className="px-3 py-2 border-t border-neutral-100 bg-neutral-50 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              <button 
                onClick={() => setTypedMessage("Namaste! How do I claim my 50 Gems? 💎")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-600 hover:text-daraz-orange hover:border-daraz-orange/40 transition-all"
              >
                Gems info
              </button>
              <button 
                onClick={() => setTypedMessage("Is organic tea delivery available in Pokhara? 🍵")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-600 hover:text-daraz-orange hover:border-daraz-orange/40 transition-all"
              >
                Shipping to Pokhara
              </button>
              <button 
                onClick={() => setTypedMessage("Can I get a discount with vouchers? 🎟️")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-[10px] font-bold text-neutral-600 hover:text-daraz-orange hover:border-daraz-orange/40 transition-all"
              >
                Discounts
              </button>
            </div>

            {/* Footer Input send bar */}
            <div className="p-3 border-t border-neutral-150 bg-white flex items-center gap-2 sticky bottom-0 shrink-0">
              <input 
                type="text"
                placeholder="Ask vendor anything about products/Gems..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 bg-neutral-100 border border-transparent rounded-sm py-2 px-3 text-xs focus:bg-white focus:border-daraz-orange outline-none transition-all font-medium"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!typedMessage.trim()}
                className="w-9 h-9 rounded-sm bg-daraz-orange text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-3xs"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
