// Firestore + Storage rules tests. Run: cd rules-tests && npm i && npm test (needs Java 11+).
import { test, before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getBytes } from "firebase/storage";

let env;
const ADMIN = { email: "julesxshulman@gmail.com", email_verified: true };
const JANE = { email: "jane@example.com", email_verified: true };
const JANE_UNVERIFIED = { email: "jane@example.com", email_verified: false };

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-pf-rules",
    firestore: { rules: readFileSync("../firestore.rules", "utf8"), host: "127.0.0.1", port: 8085 },
    storage: { rules: readFileSync("../storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });
});
after(async () => env?.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "products/endoluten"), { name: "Endoluten" });
    await setDoc(doc(db, "orders/o1"), { customer_email: "jane@example.com", created_at: "2026-10-01", items: [] });
    await setDoc(doc(db, "orders/o2"), { customer_email: "bob@example.com", created_at: "2026-10-02", items: [] });
    await setDoc(doc(db, "abandoned_carts/s1"), { recovered: false, recoveryEmailSent: false, items: [] });
    await setDoc(doc(db, "customers/jane@example.com"), { email: "jane@example.com" });
    await setDoc(doc(db, "reviews/r1"), { approved: true });
  });
});

const anon = () => env.unauthenticatedContext().firestore();
const as = (uid, token) => env.authenticatedContext(uid, token).firestore();

const review = () => ({
  productId: "endoluten", rating: 5, text: "Easy to take, arrived fast.", firstName: "Jane", lastInitial: "D",
  email: "", date: "2026-10-15", usedProduct: true, permission: true, verified: false, approved: false,
  status: "pending", source: "customer-form", createdAt: serverTimestamp(),
});

test("products: public read, no client write", async () => {
  await assertSucceeds(getDoc(doc(anon(), "products/endoluten")));
  await assertSucceeds(getDocs(collection(anon(), "products")));
  await assertFails(setDoc(doc(as("a", ADMIN), "products/x"), { name: "x" }));
});

test("profiles: owner create/read only", async () => {
  const p = { uid: "u1", fullName: "Jane", email: "Jane@Example.com", birthday: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(as("u1", JANE), "profiles/u1"), p));
  await assertSucceeds(getDoc(doc(as("u1", JANE), "profiles/u1")));
  await assertFails(getDoc(doc(as("u2", { email: "x@y.com" }), "profiles/u1")));
  await assertFails(setDoc(doc(as("u2", { email: "x@y.com" }), "profiles/u1"), { ...p }));
  await assertFails(setDoc(doc(as("u1", JANE), "profiles/u1"), { ...p, role: "admin" }));
  await assertFails(getDoc(doc(anon(), "profiles/u1")));
});

test("orders: own (verified email) only, no writes", async () => {
  await assertSucceeds(getDocs(query(collection(as("u1", JANE), "orders"), where("customer_email", "==", "jane@example.com"))));
  await assertFails(getDocs(query(collection(as("u1", JANE_UNVERIFIED), "orders"), where("customer_email", "==", "jane@example.com"))));
  await assertFails(getDocs(collection(as("u1", JANE), "orders")));
  await assertFails(getDoc(doc(as("u1", JANE), "orders/o2")));
  await assertSucceeds(getDocs(collection(as("a", ADMIN), "orders")));
  await assertFails(setDoc(doc(as("u1", JANE), "orders/new"), { customer_email: "jane@example.com" }));
  await assertFails(getDoc(doc(anon(), "orders/o1")));
});

test("abandoned_carts: admin read + recovery flags only", async () => {
  await assertSucceeds(getDocs(collection(as("a", ADMIN), "abandoned_carts")));
  await assertSucceeds(updateDoc(doc(as("a", ADMIN), "abandoned_carts/s1"), { recoveryEmailSent: true, recoveryEmailSentAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(as("a", ADMIN), "abandoned_carts/s1"), { items: [1] }));
  await assertFails(getDocs(collection(as("u1", JANE), "abandoned_carts")));
  await assertFails(getDocs(collection(as("x", { email: "julesxshulman@gmail.com", email_verified: false }), "abandoned_carts")));
  await assertFails(setDoc(doc(anon(), "abandoned_carts/s2"), { items: [] }));
});

test("reviews: no browser access (server-only via /api/reviews)", async () => {
  await assertFails(addDoc(collection(anon(), "reviews"), review()));
  await assertFails(addDoc(collection(as("a", ADMIN), "reviews"), review()));
  await assertFails(getDoc(doc(anon(), "reviews/r1")));
  await assertFails(updateDoc(doc(as("a", ADMIN), "reviews/r1"), { approved: false }));
  await assertFails(deleteDoc(doc(anon(), "reviews/r1")));
  await assertFails(getDoc(doc(anon(), "review_rate_limits/x")));
});

test("default deny: customers, mailing_list, product_reviews", async () => {
  await assertFails(getDoc(doc(as("u1", JANE), "customers/jane@example.com")));
  await assertFails(addDoc(collection(anon(), "mailing_list"), { email: "a@b.co" }));
  await assertFails(addDoc(collection(anon(), "product_reviews"), { rating: 5 }));
  await assertFails(getDocs(collection(as("a", ADMIN), "customers")));
});

test("storage: public read products/, admin image upload only", async () => {
  const img = new Uint8Array([137, 80, 78, 71]);
  const adminSt = env.authenticatedContext("a", ADMIN).storage();
  await assertSucceeds(uploadBytes(ref(adminSt, "products/a.png"), img, { contentType: "image/png" }));
  await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), "products/a.png")));
  await assertFails(uploadBytes(ref(adminSt, "products/a.txt"), img, { contentType: "text/plain" }));
  await assertFails(uploadBytes(ref(env.authenticatedContext("u1", JANE).storage(), "products/b.png"), img, { contentType: "image/png" }));
  await assertFails(uploadBytes(ref(env.unauthenticatedContext().storage(), "products/c.png"), img, { contentType: "image/png" }));
  await assertFails(uploadBytes(ref(adminSt, "other/x.png"), img, { contentType: "image/png" }));
});
