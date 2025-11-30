import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Image } from "react-native";

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace("Login");   // or "Main" if user already logged in
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image 
        source={require("../../assets/logonpet.png")}
        style={styles.logoImage}
      />

      <View style={styles.textRow}>
        <Text style={styles.pet}>Pet</Text>
        <Text style={styles.well}>Well</Text>
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  logoImage: {
    width: 180,
    height: 180,
    marginBottom: 30,
    resizeMode: "contain",
  },

  textRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  pet: {
    fontSize: 38,
    fontWeight: "700",
    color: "#B0BD2B",
  },

  well: {
    fontSize: 38,
    fontWeight: "700",
    color: "#004C66",
  },
});
