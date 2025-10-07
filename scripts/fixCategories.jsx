const admin = require("firebase-admin");

// Download your service account key JSON from Firebase Console → Project Settings → Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function fixCategories() {
  const transactionsRef = db.collection("transactions");
  const snapshot = await transactionsRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    // only fix if category is a string and not already lowercase
    if (typeof data.category === "string" && data.category !== data.category.toLowerCase()) {
      const newCategory = data.category.toLowerCase();
      console.log(`Updating ${doc.id}: ${data.category} → ${newCategory}`);
      await doc.ref.update({ category: newCategory });
    }
  }

  console.log("✅ Done fixing categories!");
}

fixCategories().catch((err) => {
  console.error("Error fixing categories:", err);
});
