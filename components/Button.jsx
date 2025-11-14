import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const Button = ({ onPress, title = "Get Started", style }) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity 
        style={[styles.btnContainer, style]} 
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text style={styles.btnText}>{title}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Button

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 20,
    width: '100%',
  },
  btnContainer: {
    backgroundColor: "#C7F02C", 
    paddingVertical: 15,
    borderRadius: 30, 
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#171717", 
    fontSize: 18,
    fontWeight: "600",
  },
})
