import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BarChart } from 'react-native-gifted-charts';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const colors = {
  primary: '#3b82f6', // income
  rose: '#f43f5e',    // expense
};

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [weeklyTransactions, setWeeklyTransactions] = useState([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [yearlyTransactions, setYearlyTransactions] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = fetchAllTransactionsRealtime(
      user,
      setWeeklyTransactions,
      setMonthlyTransactions,
      setYearlyTransactions,
      setChartLoading
    );

    return () => unsubscribe?.();
  }, [user]);

  // Real-time Firestore listener
  const fetchAllTransactionsRealtime = (user, setWeekly, setMonthly, setYearly, setLoading) => {
    setLoading(true);
    const now = new Date();

    const startWeek = Timestamp.fromDate(startOfWeek(now, { weekStartsOn: 1 }));
    const endWeek = Timestamp.fromDate(endOfWeek(now, { weekStartsOn: 1 }));

    const startMonth = Timestamp.fromDate(startOfMonth(now));
    const endMonth = Timestamp.fromDate(endOfMonth(now));

    const startYear = Timestamp.fromDate(startOfYear(now));
    const endYear = Timestamp.fromDate(endOfYear(now));

    const setupListener = (start, end, setState) => {
      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', user.uid),
        where('date', '>=', start),
        where('date', '<=', end)
      );
      return onSnapshot(q, snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setState(data);
        setLoading(false);
      });
    };

    const unsubscribeWeekly = setupListener(startWeek, endWeek, setWeekly);
    const unsubscribeMonthly = setupListener(startMonth, endMonth, setMonthly);
    const unsubscribeYearly = setupListener(startYear, endYear, setYearly);

    // Cleanup listeners
    return () => {
      unsubscribeWeekly();
      unsubscribeMonthly();
      unsubscribeYearly();
    };
  };

  // Generate chart data
  const generateChartData = (transactions, type) => {
    if (!transactions) return [];

    if (type === 'weekly') {
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const sums = days.reduce((acc,d)=>({ ...acc, [d]: { income: 0, expense: 0 } }),{});
      transactions.forEach(tx=>{
        const d = tx.date.toDate ? tx.date.toDate() : new Date(tx.date);
        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const weekday = days[dayIndex];
        if(tx.type==='income') sums[weekday].income += Number(tx.amount||0);
        else sums[weekday].expense += Number(tx.amount||0);
      });
      const chartArr = [];
      days.forEach(day=>{
        chartArr.push({ value: sums[day].income, label: day, frontColor: colors.primary });
        chartArr.push({ value: sums[day].expense, frontColor: colors.rose });
      });
      return chartArr;
    }

    if (type === 'monthly') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const sums = Array(daysInMonth).fill(0).map(()=>({ income: 0, expense: 0 }));
      transactions.forEach(tx=>{
        const d = tx.date.toDate ? tx.date.toDate() : new Date(tx.date);
        const day = d.getDate() - 1;
        if(tx.type==='income') sums[day].income += Number(tx.amount||0);
        else sums[day].expense += Number(tx.amount||0);
      });
      const chartArr = [];
      sums.forEach((s,i)=>{
        chartArr.push({ value: s.income, label: `${i+1}`, frontColor: colors.primary });
        chartArr.push({ value: s.expense, frontColor: colors.rose });
      });
      return chartArr;
    }

    if (type === 'yearly') {
      const sums = Array(12).fill(0).map(()=>({ income: 0, expense: 0 }));
      transactions.forEach(tx=>{
        const d = tx.date.toDate ? tx.date.toDate() : new Date(tx.date);
        const month = d.getMonth();
        if(tx.type==='income') sums[month].income += Number(tx.amount||0);
        else sums[month].expense += Number(tx.amount||0);
      });
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const chartArr = [];
      sums.forEach((s,i)=>{
        chartArr.push({ value: s.income, label: months[i], frontColor: colors.primary });
        chartArr.push({ value: s.expense, frontColor: colors.rose });
      });
      return chartArr;
    }

    return [];
  };

  const displayedTransactions =
    activeIndex === 0
      ? weeklyTransactions
      : activeIndex === 1
      ? monthlyTransactions
      : yearlyTransactions;

  const chartData = activeIndex === 0
    ? generateChartData(weeklyTransactions,'weekly')
    : activeIndex === 1
    ? generateChartData(monthlyTransactions,'monthly')
    : generateChartData(yearlyTransactions,'yearly');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.headerText}>Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SegmentedControl
          values={['Weekly','Monthly','Yearly']}
          selectedIndex={activeIndex}
          onChange={(event)=>setActiveIndex(event.nativeEvent.selectedSegmentIndex)}
          backgroundColor="#171717"
          tintColor="#fff"
          fontStyle={{ color: '#9e9e9e' }}
          activeFontStyle={{ color: '#000' }}
          style={styles.segment}
        />

        <View style={styles.content}>
          <Text style={styles.text}>
            {activeIndex===0 && 'Showing Weekly Statistics'}
            {activeIndex===1 && 'Showing Monthly Statistics'}
            {activeIndex===2 && 'Showing Yearly Statistics'}
          </Text>
        </View>

        <View style={{ paddingHorizontal:16, marginTop:10 }}>
          {chartData.length>0 ? (
            <BarChart
              data={chartData}
              barWidth={22}
              spacing={12}
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              noOfSections={4}
              roundedTop
              roundedBottom
              yAxisTextStyle={{ color:'white' }}
              xAxisLabelTextStyle={{ color:'white' }}
            />
          ) : (!chartLoading && (
            <View style={styles.noChart}><Text style={{ color:'#999' }}>No data</Text></View>
          ))}
          {chartLoading && (
            <View style={styles.chartLoadingContainer}><ActivityIndicator color="white"/></View>
          )}
        </View>

        {/* Transactions List */}
        <View style={{ marginTop:20, paddingHorizontal:16 }}>
          <Text style={{ color:'#fff', fontSize:16, fontWeight:'bold', marginBottom:6 }}>Transactions</Text>
          <View style={{ height:1, backgroundColor:'#444', marginBottom:10 }} />
          <ScrollView
            style={{
              maxHeight:300,
              backgroundColor:'#1a1a1a',
              borderRadius:12,
              padding:8,
              shadowColor:'#000',
              shadowOffset:{ width:0, height:2 },
              shadowOpacity:0.5,
              shadowRadius:4,
              elevation:5,
            }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {displayedTransactions.length===0 ? (
              <Text style={{ color:'#999', textAlign:'center', marginVertical:10 }}>No transactions</Text>
            ) : displayedTransactions.map(tx=>(
              <View key={tx.id} style={styles.transactionItem}>
                <Text style={{ color:'white' }}>{tx.category||'Others'}</Text>
                <Text style={{ color: tx.type==='income'? colors.primary : colors.rose }}>
                  {tx.type==='income'? `+ $${tx.amount}` : `- $${tx.amount}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'black' },
  customHeader:{ alignItems:'center', paddingVertical:10 },
  headerText:{ color:'#fff', fontSize:18, fontWeight:'bold' },
  scrollContent:{ paddingTop:10, paddingBottom:20, gap:10 },
  segment:{ marginHorizontal:16 },
  content:{ padding:20, backgroundColor:'#171717', borderRadius:10, marginTop:10 },
  text:{ fontSize:16, color:'#fff' },
  noChart:{ backgroundColor:'rgba(255,255,255,0.05)', height:80, justifyContent:'center', alignItems:'center', borderRadius:8 },
  chartLoadingContainer:{ position:'absolute', width:'100%', height:'100%', borderRadius:12, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' },
  transactionItem:{ flexDirection:'row', justifyContent:'space-between', padding:12, backgroundColor:'#222', borderRadius:10, marginBottom:8 },
});
