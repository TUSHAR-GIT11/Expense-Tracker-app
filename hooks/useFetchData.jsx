import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * @param {string} collectionName - name of Firestore collection
 * @param {Array} conditions - array of where/orderBy constraints
 */
export default function useFetchData(collectionName, conditions = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = collection(db, collectionName);
    const q = conditions.length > 0 ? query(ref, ...conditions) : ref;

    // 🔄 real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setData(docs);
        setLoading(false);
        // console.log(`🔎 [${collectionName}] fetched:`, docs);
      },
      (err) => {
        console.error(`❌ Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // clean up listener on unmount
    return () => unsubscribe();
  }, [collectionName, JSON.stringify(conditions)]); // include conditions as dep

  return { data, loading, error };
}
