import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  reviewText: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

function docToReview(id: string, data: any): ProductReview {
  return {
    id,
    productId: data.productId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    rating: data.rating,
    title: data.title || "",
    reviewText: data.reviewText,
    verifiedPurchase: data.verifiedPurchase ?? false,
    helpfulCount: data.helpfulCount ?? 0,
    status: data.status ?? "pending",
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export async function getProductReviews(
  productId: string,
  includePending = false
): Promise<ProductReview[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const constraints: any[] = [
      where("productId", "==", productId),
      orderBy("createdAt", "desc"),
    ];
    if (!includePending) constraints.splice(1, 0, where("status", "==", "approved"));

    const q = query(collection(db, "product_reviews"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToReview(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return [];
  }
}

export async function addReview(
  review: Omit<ProductReview, "id" | "createdAt" | "updatedAt" | "helpfulCount" | "status">
): Promise<ProductReview> {
  if (!isFirebaseConfigured()) throw new Error("Firebase is not configured");

  const data = {
    productId: review.productId,
    customerName: review.customerName,
    customerEmail: review.customerEmail,
    rating: review.rating,
    title: review.title,
    reviewText: review.reviewText,
    verifiedPurchase: review.verifiedPurchase,
    helpfulCount: 0,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "product_reviews"), data);
  return docToReview(ref.id, { ...data, createdAt: { toDate: () => new Date() }, updatedAt: { toDate: () => new Date() } });
}

export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const ref = doc(db, "product_reviews", reviewId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    await updateDoc(ref, { helpfulCount: (snap.data().helpfulCount ?? 0) + 1 });
    return true;
  } catch (err) {
    console.error("Error marking review helpful:", err);
    return false;
  }
}

export async function getAverageRating(productId: string): Promise<{ average: number; count: number }> {
  if (!isFirebaseConfigured()) return { average: 0, count: 0 };

  try {
    const q = query(
      collection(db, "product_reviews"),
      where("productId", "==", productId),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { average: 0, count: 0 };

    const sum = snapshot.docs.reduce((acc, d) => acc + (d.data().rating ?? 0), 0);
    return { average: sum / snapshot.size, count: snapshot.size };
  } catch (err) {
    console.error("Error calculating average rating:", err);
    return { average: 0, count: 0 };
  }
}

export async function getRatingDistribution(productId: string): Promise<Record<number, number>> {
  if (!isFirebaseConfigured()) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  try {
    const q = query(
      collection(db, "product_reviews"),
      where("productId", "==", productId),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    snapshot.docs.forEach((d) => {
      const r = d.data().rating;
      dist[r] = (dist[r] ?? 0) + 1;
    });
    return dist;
  } catch (err) {
    console.error("Error getting rating distribution:", err);
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
}

export async function hasUserReviewed(productId: string, email: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const q = query(
      collection(db, "product_reviews"),
      where("productId", "==", productId),
      where("customerEmail", "==", email.toLowerCase())
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    console.error("Error checking if user reviewed:", err);
    return false;
  }
}

export async function updateReviewStatus(
  reviewId: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    await updateDoc(doc(db, "product_reviews", reviewId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Error updating review status:", err);
    return false;
  }
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    await deleteDoc(doc(db, "product_reviews", reviewId));
    return true;
  } catch (err) {
    console.error("Error deleting review:", err);
    return false;
  }
}

export async function getPendingReviews(): Promise<ProductReview[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const q = query(
      collection(db, "product_reviews"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => docToReview(d.id, d.data()));
  } catch (err) {
    console.error("Error fetching pending reviews:", err);
    return [];
  }
}
