import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserVoucher } from '../types';

export interface VoucherTemplate {
  id: string;
  code: string;
  title: string;
  cost: number;
  discount: number;
  type: 'amount' | 'percentage' | 'shipping';
  minSpent: number;
  category?: string;
  description: string;
}

export const VOUCHER_TEMPLATES: VoucherTemplate[] = [
  {
    id: 'v_gem50',
    code: 'GEM50',
    title: 'Rs. 50 Storewide Voucher',
    cost: 100,
    discount: 50,
    type: 'amount',
    minSpent: 500,
    description: 'Get Rs. 50 off on any purchase above Rs. 500.'
  },
  {
    id: 'v_teagems',
    code: 'TEAGEMS',
    title: 'Rs. 150 Organic Tea Voucher',
    cost: 250,
    discount: 150,
    type: 'amount',
    minSpent: 400,
    category: 'Organic Tea',
    description: 'Get Rs. 150 off on any Organic Tea item. Min spend Rs. 400.'
  },
  {
    id: 'v_gemship',
    code: 'GEMSHIP',
    title: 'Free Shipping Voucher',
    cost: 350,
    discount: 150,
    type: 'shipping',
    minSpent: 750,
    description: 'Unlock completely Free Delivery on purchases above Rs. 750.'
  },
  {
    id: 'v_craft15',
    code: 'CRAFT15',
    title: '15% Off Nepali Handicrafts',
    cost: 500,
    discount: 15,
    type: 'percentage',
    minSpent: 1200,
    category: 'Handicrafts',
    description: 'Save 15% on high-quality Nepalese handicrafts. Min spend Rs. 1200.'
  },
  {
    id: 'v_gem500',
    code: 'GEM500',
    title: 'Rs. 500 Premium Voucher',
    cost: 800,
    discount: 500,
    type: 'amount',
    minSpent: 2000,
    description: 'Save Rs. 500 store-wide. Minimum purchase of Rs. 2000 required.'
  }
];

export const STREAK_REWARDS = [15, 25, 40, 55, 75, 100, 150];

export function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const GUEST_KEY = 'nepalimart_guest_gems_v4';

const defaultGuestState = {
  gems: 0,
  streak: 0,
  lastClaimed: '',
  vouchers: [] as UserVoucher[]
};

export const gemService = {
  getGuestState() {
    const data = localStorage.getItem(GUEST_KEY);
    if (!data) return defaultGuestState;
    try {
      return JSON.parse(data);
    } catch {
      return defaultGuestState;
    }
  },

  saveGuestState(state: typeof defaultGuestState) {
    localStorage.setItem(GUEST_KEY, JSON.stringify(state));
  },

  async claimDailyGems(userId?: string): Promise<{ gemsEarned: number; newTotal: number; newStreak: number }> {
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    if (userId && userId !== 'pin-admin') {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User profile does not exist in store databases.');
      }

      const userData = userDoc.data() as User;
      const currentGems = userData.gems || 0;
      const lastClaimed = userData.lastClaimed || '';
      const currentStreak = userData.streak || 0;

      if (lastClaimed === today) {
        throw new Error('You have already claimed your daily gems for today!');
      }

      // Determine streak continuation
      let newStreak = 1;
      if (lastClaimed === yesterday) {
        newStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
      }

      const gemsEarned = STREAK_REWARDS[newStreak - 1];
      const newTotal = currentGems + gemsEarned;

      await updateDoc(userDocRef, {
        gems: newTotal,
        streak: newStreak,
        lastClaimed: today
      });

      return { gemsEarned, newTotal, newStreak };
    } else {
      // Guest or local profile mode
      const state = this.getGuestState();
      
      if (state.lastClaimed === today) {
        throw new Error('You have already claimed your daily gems for today!');
      }

      let newStreak = 1;
      if (state.lastClaimed === yesterday) {
        newStreak = state.streak >= 7 ? 1 : state.streak + 1;
      }

      const gemsEarned = STREAK_REWARDS[newStreak - 1];
      const newTotal = state.gems + gemsEarned;

      const newState = {
        gems: newTotal,
        streak: newStreak,
        lastClaimed: today,
        vouchers: state.vouchers
      };

      this.saveGuestState(newState);
      return { gemsEarned, newTotal, newStreak };
    }
  },

  async redeemVoucher(templateId: string, userId?: string): Promise<UserVoucher> {
    const template = VOUCHER_TEMPLATES.find(v => v.id === templateId);
    if (!template) {
      throw new Error('Voucher template not found.');
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30 days expiry
    const expiryStr = expiry.toISOString().split('T')[0];

    const finalVoucher: UserVoucher = {
      id: `v_redeem_${Math.random().toString(36).substr(2, 9)}`,
      code: `${template.code}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      title: template.title,
      discount: template.discount,
      type: template.type,
      minSpent: template.minSpent,
      category: template.category,
      isUsed: false,
      expiryDate: expiryStr
    };

    if (userId && userId !== 'pin-admin') {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User profile database not initialized.');
      }

      const userData = userDoc.data() as User;
      const currentGems = userData.gems || 0;
      const currentVouchers = userData.vouchers || [];

      if (currentGems < template.cost) {
        throw new Error(`Insufficient gems. You need ${template.cost} gems to claim this voucher.`);
      }

      const updatedGems = currentGems - template.cost;
      const updatedVouchers = [...currentVouchers, finalVoucher];

      await updateDoc(userDocRef, {
        gems: updatedGems,
        vouchers: updatedVouchers
      });

      return finalVoucher;
    } else {
      // Guest redeem
      const state = this.getGuestState();
      if (state.gems < template.cost) {
        throw new Error(`Insufficient gems. You need ${template.cost} gems to claim this voucher.`);
      }

      const newState = {
        gems: state.gems - template.cost,
        streak: state.streak,
        lastClaimed: state.lastClaimed,
        vouchers: [...(state.vouchers || []), finalVoucher]
      };

      this.saveGuestState(newState);
      return finalVoucher;
    }
  },

  async useVoucherOffline(voucherCode: string, userId?: string): Promise<void> {
    if (userId && userId !== 'pin-admin') {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const currentVouchers = userData.vouchers || [];
        const updatedVouchers = currentVouchers.map(v => 
          v.code === voucherCode ? { ...v, isUsed: true } : v
        );
        await updateDoc(userDocRef, { vouchers: updatedVouchers });
      }
    } else {
      const state = this.getGuestState();
      const updatedVouchers = (state.vouchers || []).map((v: UserVoucher) => 
        v.code === voucherCode ? { ...v, isUsed: true } : v
      );
      this.saveGuestState({ ...state, vouchers: updatedVouchers });
    }
  }
};
