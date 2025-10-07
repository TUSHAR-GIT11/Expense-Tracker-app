import { StyleSheet, Text, View, ActivityIndicator, Pressable } from "react-native";
import React from "react";
import { FlashList } from "@shopify/flash-list";
import { expenseCategories, incomeCategories } from "../constants/data";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";

const TransactionList = ({ data = [], loading = false, emptyListMessage = "No transactions found" }) => {
  const router = useRouter();

  const handleClick = (item) => {
    router.push({
      pathname: "/(modals)/transactionModel",
      params: {
        id: item.id,
        type: item.type,
        wallet: item.walletId, // send wallet ID, not name
        category: item.category,
        amount: item.amount.toString(),
        description: item.description || "",
        date: item.date?.toMillis?.() || Date.now(),
        icon: item.icon || "",
      },
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="limegreen" style={{ marginTop: 20 }} />;
  }

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <Pressable onPress={() => handleClick(item)}>
          <TransactionItem item={item} />
        </Pressable>
      )}
      estimatedItemSize={60}
      ListEmptyComponent={() => <Text style={styles.emptyList}>{emptyListMessage}</Text>}
      contentContainerStyle={{ paddingBottom: 10 }}
    />
  );
};

const TransactionItem = ({ item }) => {
  const categories = item.type === "income" ? incomeCategories : expenseCategories;
  const category = categories[item.category] || categories.others;
  const IconComponent = Icons[category.icon] || Icons.Question;

  return (
    <View style={styles.item}>
      <View style={styles.left}>
        <View style={[styles.iconWrapper, { backgroundColor: category.bgColor }]}>
          {IconComponent && <IconComponent size={20} weight="fill" color="white" />}
        </View>
        <Text style={styles.itemText}>{category.label}</Text>
      </View>

      <Text style={[styles.amount, { color: item.type === "income" ? "limegreen" : "tomato" }]}>
        {item.type === "income" ? "+" : "-"}${item.amount}
      </Text>
    </View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrapper: { width: 35, height: 35, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  itemText: { fontSize: 16, color: "white" },
  amount: { fontSize: 16, fontWeight: "600" },
  emptyList: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 20 },
});
