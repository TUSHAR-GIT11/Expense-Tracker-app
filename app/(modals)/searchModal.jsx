import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function SearchModal() {
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);

  // fetch all transactions
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid),
        orderBy("created", "desc")
      );
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [user?.uid]);

  // filter transactions
const filtered = transactions.filter((t) => {
  const q = search.toLowerCase();
  return (
    t.description?.toLowerCase().includes(q) ||
    t.category?.toLowerCase().includes(q) ||
    t.type?.toLowerCase().includes(q)
  );
});

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search transactions…"
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
      />

      {/* Transactions list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.title}>{item.category || "Other"}</Text>
              <Text style={styles.subTitle}>{item.description}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={[
                  styles.amount,
                  {
                    color:
                      item.type === "income" ? "limegreen" : "tomato",
                  },
                ]}
              >
                {item.type === "income" ? "+" : "-"}${item.amount}
              </Text>
              <Text style={styles.date}>
                {new Date(item.date?.seconds * 1000 || item.created?.seconds * 1000)
                  .toDateString()
                  .slice(4)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#aaa", textAlign: "center", marginTop: 30 }}>
            No transactions found
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#171717" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "600" },
  searchInput: {
    backgroundColor: "#1F1F1F",
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "white",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F1F1F",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { color: "white", fontSize: 16, fontWeight: "600" },
  subTitle: { color: "#aaa", fontSize: 13, marginTop: 3 },
  amount: { fontSize: 16, fontWeight: "600" },
  date: { color: "#aaa", fontSize: 12, marginTop: 3 },
});
