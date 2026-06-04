import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Review } from '../types';
import { MOCK_PRODUCTS } from '../mockData';

const COLLECTION_NAME = 'products';

export const productService = {
  // Seed products and clear outdated demo versions
  async seedIfEmpty() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const hasBrandNewProducts = querySnapshot.docs.some(doc => doc.id === 'daraz-sport-7' && (doc.data() as any).image?.includes('photo-1617135813745'));
      
      if (querySnapshot.empty || !hasBrandNewProducts) {
        console.log('Clearing old mock entries and seeding updated clean background products...');
        for (const docSnap of querySnapshot.docs) {
          // Clean up old demo products to avoid collision or noise
          await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
        }
        
        for (const product of MOCK_PRODUCTS) {
          const { id, ...data } = product;
          await setDoc(doc(db, COLLECTION_NAME, id), {
            ...data,
            createdAt: serverTimestamp()
          });
        }
        console.log(`Firestore Database successfully seeded with ${MOCK_PRODUCTS.length} products!`);
      }
    } catch (error) {
      // If we can't read or write due to permissions during seeding, we ignore it 
      // as it's likely a non-admin user visiting a fresh DB.
      console.log('Seeding skipped or not permitted:', error);
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(q, (snapshot) => {
      const dbProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Merge dbProducts with MOCK_PRODUCTS, prioritizing DB versions
      const mergedProducts = [...dbProducts];
      for (const p of MOCK_PRODUCTS) {
        if (!mergedProducts.some(dp => dp.id === p.id)) {
          mergedProducts.push(p);
        }
      }
      
      // Sort the merged products list alphabetically by name
      mergedProducts.sort((a, b) => a.name.localeCompare(b.name));
      
      callback(mergedProducts);
    }, (error) => {
      console.warn('Firestore subscription failed, falling back to local MOCK_PRODUCTS:', error);
      callback(MOCK_PRODUCTS);
    });
  },

  async addProduct(product: Omit<Product, 'id' | 'reviews' | 'rating' | 'numReviews'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...product,
        reviews: [],
        rating: 5,
        numReviews: 0,
        status: product.status || 'active', // Default to active for now, maybe pending later
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  subscribeToSellerProducts(sellerId: string, callback: (products: Product[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('sellerId', '==', sellerId)
    );
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Sort client-side by createdAt descending (or id fallback) to avoid composite index requirements
      products.sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || (a as any).createdAt || 0;
        const timeB = (b as any).createdAt?.seconds || (b as any).createdAt || 0;
        return timeB - timeA;
      });
      
      callback(products);
    }, (error) => {
      console.warn('Seller products subscription failed, pulling from memory fallback if empty:', error);
      const fallbacks = MOCK_PRODUCTS.filter(p => p.sellerId === sellerId);
      callback(fallbacks);
    });
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteProduct(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async addReview(productId: string, review: Omit<Review, 'id'>) {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId);
      const reviewsColl = collection(productRef, 'reviews');
      await addDoc(reviewsColl, review);
      
      // Note: In a production app, you'd use a Cloud Function to update rating/numReviews
      // or do it transactionally here if the rules allow.
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${productId}/reviews`);
    }
  }
};
