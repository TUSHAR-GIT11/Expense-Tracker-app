import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, FlatList } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from "expo-router";
import * as Icons from 'phosphor-react-native';
import { where, orderBy } from "firebase/firestore";
import useFetchData from '../../hooks/useFetchData';
import { useAuth } from "../../contexts/AuthContext";
import WalletListItem from '../../components/WalletListItem';

const Wallet = () => {  
  const router = useRouter();
  const { user } = useAuth();   

  // Only set query constraints if user is logged in
  const queryConstraints = [];
  if (user?.uid) {
    queryConstraints.push(where("uid", "==", user.uid));
    queryConstraints.push(orderBy("created", "desc"));
  }

  const { data: wallets, error, loading } = useFetchData("wallets", queryConstraints);

  const getTotalBalance = () => {
    if (!wallets || wallets.length === 0) return 0;
    return wallets.reduce((sum, w) => sum + (w.amount || 0), 0);
  };

  return (
    <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }}/>

      {/* Balance Section */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>
          ${getTotalBalance()?.toFixed(2)}
        </Text>  
        <Text style={styles.txt}>Total Balance</Text>
      </View> 

      {/* My Wallets Section */}
      <View style={styles.midContainer}>
        <View style={styles.walletHeader}>
          <Text style={styles.txt}>My Wallets</Text> 
          <TouchableOpacity onPress={() => router.push("/(modals)/walletModal")}>
            <Icons.PlusCircle 
              weight="fill"
              color="limegreen"
              size={28}
            /> 
          </TouchableOpacity>
        </View> 

        {/* Show loader while fetching */}
        {loading && (
          <ActivityIndicator 
            size="large" 
            color="limegreen" 
            style={{ marginTop: 20 }} 
          />
        )}

        {/* Show message if not logged in */}
        {!user?.uid && !loading && (
          <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>
            Please login to see your wallets.
          </Text>
        )}

        {/* Wallet list */}
        <FlatList
          data={wallets || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <WalletListItem item={item} index={index} router={router} />
          )}
          contentContainerStyle={styles.listStyle}
        />
      </View>
    </SafeAreaView>
  );
}

export default Wallet;

const styles = StyleSheet.create({
  balanceContainer: {
    alignItems: "center",
    marginTop: 45
  },
  balance: {
    fontWeight: "500",
    fontSize: 25,
    color: "white"
  },
  txt: {
    color: "white"
  },
  midContainer: {
    backgroundColor: "#171717",
    flex: 1,
    padding: 15,
    marginTop: 40,
    borderRadius: 30
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7
  },
  listStyle: {
    paddingTop: 15
  }
});
