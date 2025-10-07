import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' 
import { verticalScale } from '../../components/ScreenWrapper'
import Button from '../../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => { 
  const router = useRouter()
  return (
    <SafeAreaView style={styles.container}>
      
      
      <View style={styles.btnContainer}>
        <TouchableOpacity  onPress={()=>router.push('/(auth)/login')} style={styles.btn}>
          <Text style={styles.txt}>Sign in</Text>
        </TouchableOpacity>
      </View>

  
      <View style={styles.imageContainer}>
        <Image 
          style={styles.image}
          source={require('../../assets/images/image2.png')}
          resizeMode="contain"
        />
      </View> 

      
      <View style={styles.footer}>
  <Text style={styles.footerText}>Always take control</Text>
  <Text style={styles.footerText}>of your finances</Text>
  
  <Text style={styles.belowFootertext}>
    Finances must be arranged to set a better{"\n"}lifestyle in future
  </Text>

  
<Button 
  onPress={() => router.push("/(auth)/register")} 
  style={{ width: '80%' }} 
/>

   </View>


    </SafeAreaView>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container:{ 
    flex:1,
    backgroundColor:"#171717"
  },
  txt:{
    color:"white",
    fontWeight:"500",
    fontSize:20
  },
  btn:{
    alignItems:"flex-end"
  },
  btnContainer:{
    paddingHorizontal:10,
    paddingTop: verticalScale(30)
  },
  image:{
    width: '100%',
    height: verticalScale(250)
  },
  imageContainer:{
    paddingVertical:50,
    marginTop:50,
    alignItems: 'center'
  },
  footer: {
  backgroundColor: "#171717",
  alignItems: "center",
  paddingVertical: verticalScale(20),
  position: 'absolute',
  bottom: 0,
  width: '100%',
  borderTopWidth: 2,
  borderTopColor: 'white', 
},
  footerText:{
    color: 'white',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  //  marginBottom:15
  },
  belowFootertext:{
    
    color:"white",
    textAlign:"center",
    marginTop:15
  }
})
