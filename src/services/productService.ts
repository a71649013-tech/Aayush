import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Review } from '../types';
import { MOCK_PRODUCTS } from '../mockData';

const COLLECTION_NAME = 'products';

export const productService = {
  // Seed products if collection is empty
  async seedIfEmpty() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (querySnapshot.empty) {
        for (const product of MOCK_PRODUCTS) {
          const { id, ...data } = product;
          // Only attempt to seed if we have a chance (this might still fail if not admin)
          await setDoc(doc(db, COLLECTION_NAME, id), {
            ...data,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      // If we can't read or write due to permissions during seeding, we ignore it 
      // as it's likely a non-admin user visiting a fresh DB.
      console.log('Seeding skipped or not permitted:', error);
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      callback(products);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    });
  },

  async addProduct(product: Omit<Product, 'id' | 'reviews' | 'rating' | 'numReviews'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...product,
        reviews: [],
        rating: 5,
        numReviews: 0,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    }
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
