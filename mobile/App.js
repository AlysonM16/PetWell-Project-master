// App.js
import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
// Auth + API
import { AuthProvider, useAuth } from "./src/AuthContext";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/dashboard";
import AddPetScreen from "./src/screens/addPet";
import PetProfile from "./src/screens/PetProfile";
import LabRecords from "./src/screens/labrecords";
import FileUploadScreen from "./src/screens/fileUpload";
import EditProfileScreen from "./src/screens/EditProfile";
import EditPetProfileScreen from "./src/screens/EditPetProfile";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import GraphScreen from "./src/screens/graph";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ---------- Home Stack ---------- */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} />
      <Stack.Screen name="AddPet" component={AddPetScreen} />
      <Stack.Screen name="PetProfile" component={PetProfile} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EditPetProfile" component={EditPetProfileScreen} />
      <Stack.Screen name="Graph" component={GraphScreen} />
    </Stack.Navigator>
  );
}

/* ---------- Main Tabs ---------- */
function MainTabs() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#B9BF1D",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#0B4F6C",
          height: 60,
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
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="AllFiles" component={LabRecords} />
      <Tab.Screen name="Upload" component={FileUploadScreen} />

      {/* Logout Tab */}
      <Tab.Screen
        name="Logout"
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Prevent navigation
            logout(); // Call logout from AuthContext
          },
        }}
      >
        {() => (
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              textAlignVertical: "center",
              color: "#fff",
              fontSize: 18,
            }}
          >
            Logging out...
          </Text>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

/* ---------- Root Navigator ---------- */
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Text
        style={{ marginTop: 100, textAlign: "center", fontSize: 16 }}
      >
        Loading...
      </Text>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainTabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

/* ---------- App Root ---------- */
export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
    </SafeAreaView>
  );
}
