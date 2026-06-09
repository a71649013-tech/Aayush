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
  // Only seeds on manual admin initiation or when completely empty
  async seedIfEmpty(forceDemo = false) {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      if (forceDemo || querySnapshot.empty) {
        console.log('Clearing old entries and seeding clean demo products...');
        if (forceDemo && !querySnapshot.empty) {
          for (const docSnap of querySnapshot.docs) {
            await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
          }
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
      console.log('Seeding skipped or not permitted:', error);
    }
  },

  // Clears all products from the database
  async deleteAllProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, COLLECTION_NAME, docSnap.id));
      }
      console.log('All products successfully deleted from Firestore!');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
    }
  },

  subscribeToProducts(callback: (products: Product[]) => void) {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(q, (snapshot) => {
      const dbProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Sort database products list by createdAt descending (newest first) with alphabetical fallback
      dbProducts.sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || ((a as any).createdAt instanceof Date ? ((a as any).createdAt as Date).getTime() : 0);
        const timeB = (b as any).createdAt?.seconds || ((b as any).createdAt instanceof Date ? ((b as any).createdAt as Date).getTime() : 0);
        if (timeA !== timeB) return timeB - timeA;
        return a.name.localeCompare(b.name);
      });
      
      if (snapshot.empty) {
        // Auto-seed if the database is currently empty
        productService.seedIfEmpty(false);
      } else {
        // Delete orphaned mart-product-* entries that are no longer in our local mock data
        dbProducts.forEach(dbProduct => {
          if (dbProduct.id.startsWith('mart-product-') && !MOCK_PRODUCTS.some(p => p.id === dbProduct.id)) {
            deleteDoc(doc(db, COLLECTION_NAME, dbProduct.id)).catch(err => {
              console.warn(`Failed to clean up orphaned db product ${dbProduct.id}:`, err);
            });
          }
        });

        // Dynamic alignment of local mock products (including our new items and 5% pricing updates)
        MOCK_PRODUCTS.forEach(localMock => {
          const dbProduct = dbProducts.find(p => p.id === localMock.id);
          if (!dbProduct) {
            // New product: Auto-seed missing product directly to Firestore
            const { id, ...data } = localMock;
            setDoc(doc(db, COLLECTION_NAME, id), {
              ...data,
              createdAt: serverTimestamp()
            }).catch(err => {
              console.warn(`Failed to auto-seed new product ${localMock.id} to Firestore:`, err);
            });
          } else {
            // Existing product: Ensure live database prices and images reflect local updates
            const updates: any = {};
            if (dbProduct.image !== localMock.image) {
              updates.image = localMock.image;
            }
            if (dbProduct.price !== localMock.price) {
              updates.price = localMock.price;
            }
            if (Object.keys(updates).length > 0) {
              updateDoc(doc(db, COLLECTION_NAME, localMock.id), updates).catch(err => {
                console.warn(`Failed to align database product ${localMock.id}:`, err);
              });
            }
          }
        });
      }
      
      callback(dbProducts);
    }, (error) => {
      console.warn('Firestore subscription failed:', error);
      callback([]);
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
      console.warn('Seller products subscription failed:', error);
      callback([]);
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
