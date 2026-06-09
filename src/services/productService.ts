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
        // Guard check to auto-seed newly added custom products directly to Firestore or update their images
        const newProductIds = [
          'mart-product-9', 'mart-product-10', 'mart-product-11', 'mart-product-12', 'mart-product-13',
          'mart-product-14', 'mart-product-15', 'mart-product-16', 'mart-product-17', 'mart-product-18',
          'mart-product-19', 'mart-product-20', 'mart-product-21', 'mart-product-22', 'mart-product-23',
          'mart-product-24', 'mart-product-25', 'mart-product-26', 'mart-product-27', 'mart-product-28',
          'mart-product-29', 'mart-product-30'
        ];
        newProductIds.forEach(productId => {
          const dbProduct = dbProducts.find(p => p.id === productId);
          if (!dbProduct) {
            const newProduct = MOCK_PRODUCTS.find(p => p.id === productId);
            if (newProduct) {
              const { id, ...data } = newProduct;
              setDoc(doc(db, COLLECTION_NAME, id), {
                ...data,
                createdAt: serverTimestamp()
              }).catch(err => {
                console.warn(`Failed to auto-seed custom product ${productId} to Firestore:`, err);
              });
            }
          } else {
            // Force update to use the newly generated high-fidelity beautiful photo asset
            const localMock = MOCK_PRODUCTS.find(p => p.id === productId);
            if (localMock && dbProduct.image !== localMock.image) {
              updateDoc(doc(db, COLLECTION_NAME, productId), {
                image: localMock.image
              }).catch(err => {
                console.warn(`Failed to update custom product ${productId} image in Firestore:`, err);
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
