// services/uploadService.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImageAsync = async (uri, uid) => {
  try {
    const response = await fetch(uri);      // Fetch the file from local URI
    const blob = await response.blob();     // Convert to blob
    const storage = getStorage();
    const storageRef = ref(storage, `wallets/${uid}_${Date.now()}.jpg`);

    await uploadBytes(storageRef, blob);    // Upload blob
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.log("🔥 uploadImageAsync error:", error);
    throw error;
  }
};
