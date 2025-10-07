// HomeCard.js
import React, { useMemo } from "react";
import { ImageBackground, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import * as Icons from "phosphor-react-native";
import { where, orderBy } from "firebase/firestore";
import useFetchData from "../hooks/useFetchData";
import { useAuth } from "../contexts/AuthContext";

const HomeCard = () => {
  const { user } = useAuth();

  // Fetch wallets
  const { data: wallets, loading: walletsLoading } = useFetchData("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  // Fetch transactions
  const { data: transactions, loading: txLoading } = useFetchData("transactions", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  // Calculate total balance dynamically from wallets
  const totalBalance = useMemo(() => {
    if (!wallets) return 0;
    return wallets.reduce((sum, w) => sum + (w.amount || 0), 0);
  }, [wallets]);

  // Calculate income & expense from transactions
  const { income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;

    if (!transactions || transactions.length === 0) return { income: 0, expense: 0 };

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const type = (tx.type || "").toLowerCase();
      if (type === "income") inc += amt;
      else if (type === "expense") exp += amt;
    });

    return { income: inc, expense: exp };
  }, [transactions]);

  const loading = walletsLoading || txLoading;

  return (
    <ImageBackground
      source={require("../assets/images/card.png")}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="small" color="black" />
        ) : (
          <>
            <View style={styles.totalBalanceRow}>
              <Text style={styles.totalBalanceText}>Total Balance</Text>
              <Icons.DotsThreeOutline size={20} color="black" weight="fill" />
            </View>
            <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <View style={styles.statsRow}>
                  <Icons.ArrowDown size={15} weight="bold" />
                  <Text style={styles.statLabel}>Income</Text>
                </View>
                <Text style={styles.incomeTxt}>${income.toFixed(2)}</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statsRow}>
                  <Icons.ArrowUp size={15} weight="bold" />
                  <Text style={styles.statLabel}>Expense</Text>
                </View>
                <Text style={styles.expenseTxt}>${expense.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: { width: "100%", height: 180 },
  container: { paddingHorizontal: 15, paddingVertical: 15 },
  totalBalanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  totalBalanceText: { fontSize: 16, fontWeight: "500", color: "black" },
  balanceAmount: { fontSize: 20, fontWeight: "500", color: "black", marginBottom: 12 },
  stats: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { flex: 1 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statLabel: { marginLeft: 8, fontWeight: "500" },
  incomeTxt: { color: "green", marginTop: 8 },
  expenseTxt: { color: "red", marginTop: 8 },
});
