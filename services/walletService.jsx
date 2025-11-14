// services/walletService.js
import { db } from "../config/firebase"; // ✅ ensure db is imported
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createWallet = async ({ name, image, uid }) => {
  try {
    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (image) {
      const cloudName = "df3skhlll"; // your cloud name
      const uploadPreset = "images"; // your unsigned preset

      const data = new FormData();
      data.append("file", {
        uri: image,
        type: "image/jpeg",   
        name: "wallet.jpg",
      });
      data.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );

      const file = await res.json();
      if (file.secure_url) {
        imageUrl = file.secure_url;
      } else {
        console.log("Cloudinary error:", file);
        return { success: false, msg: file.error?.message || "Image upload failed" };
      }
    }

    // Save wallet in Firestore
    await addDoc(collection(db, "wallets"), {
      uid,
      name,
      image: imageUrl,
      amount: 0,
      created: serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.log("createWallet error:", err);
    return { success: false, msg: err.message };
  }
};
