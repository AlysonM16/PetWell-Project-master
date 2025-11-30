import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

import FileUploadScreen from "../src/screens/fileUpload";
import WelcomeScreen from "../src/screens/WelcomeScreen";
import LoginScreen from "../src/screens/LoginScreen";
import RegisterScreen from "../src/screens/RegisterScreen";
import HomeScreen from "../src/screens/dashboard";
import AddPetScreen from "../src/screens/addPet";
import PetProfileScreen from "../src/screens/PetProfile";
import LabRecordsScreen from "../src/screens/labrecords";
import GraphScreen from "../src/screens/graph";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ----------------------
// Home Stack
// ----------------------
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} />
      <Stack.Screen name="AddPet" component={AddPetScreen} />
      <Stack.Screen name="PetProfile" component={PetProfileScreen} />
      <Stack.Screen name="Graph" component={GraphScreen} />
    </Stack.Navigator>
  );
}

// ----------------------
// Bottom Tabs
// ----------------------
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#B9BF1D",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#0B4F6C",
          height: 80,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "AllFiles":
              iconName = "folder-outline";
              break;
            case "Upload":
              iconName = "cloud-upload-outline";
              break;
            case "Logout":
              iconName = "log-out-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="AllFiles" component={LabRecordsScreen} />
      <Tab.Screen name="Upload" component={FileUploadScreen} />
      <Tab.Screen name="Logout" component={() => <Text>Logout</Text>} />
    </Tab.Navigator>
  );
}

// ----------------------
// App Root Navigation
// ----------------------
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
