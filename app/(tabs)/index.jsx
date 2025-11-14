// Home.js
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as Icons from "phosphor-react-native";
import HomeCard from "../../components/HomeCard";
import TransactionList from "../../components/TransactionList";
import { useRouter } from "expo-router";
import { where, orderBy } from "firebase/firestore";
import useFetchData from "../../hooks/useFetchData";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  // ✅ Fetch wallets
  const { data: wallets, loading: walletsLoading } = useFetchData(
    "wallets",
    user?.uid
      ? [where("uid", "==", user.uid), orderBy("created", "desc")]
      : []
  );

  // ✅ Fetch transactions
  const { data: transactions, loading: transactionsLoading } = useFetchData(
    "transactions",
    user?.uid
      ? [where("uid", "==", user.uid), orderBy("created", "desc")]
      : []
  );

  // ✅ Calculate total balance from wallets
  const totalBalance = useMemo(() => {
    if (!wallets || wallets.length === 0) return 0;
    return wallets.reduce((sum, w) => sum + Number(w.amount || 0), 0);
  }, [wallets]);

  // ✅ Calculate income/expense from transactions
  const { income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions?.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const type = (tx.type || "").toLowerCase();
      if (type === "income") inc += amt;
      else if (type === "expense") exp += amt;
    });
    return { income: inc, expense: exp };
  }, [transactions]);

  if (!user?.uid) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="limegreen" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(modals)/searchModal")}>
            <Icons.MagnifyingGlass size={22} color="white" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
<View style={styles.cardWrapper}>
  <HomeCard
    totalBalance={totalBalance}
    income={income}
    expense={expense}
    loading={walletsLoading || transactionsLoading}
  />
</View>


        {/* Recent Transactions */}
        <Text style={styles.recentTitle}>Recent Transactions</Text>
        <TransactionList
          data={transactions}
          loading={transactionsLoading}
          emptyListMessage="No transactions yet"
        />
      </ScrollView>

      {/* Floating + Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(modals)/transactionModel")}
      >
        <Icons.Plus color="white" weight="bold" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#171717",
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 25,
  },
  helloText: {
    color: "#aaa",
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  cardWrapper: {
    paddingHorizontal: 10,
    marginTop: 15,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#22c55e", // green
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});