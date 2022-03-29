import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "./pages/WelcomePage.js";
import LoginScreen from "./pages/LoginPage.js";
import RegisterScreen from "./pages/RegisterPage.js";

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <RegisterScreen />
    // <NavigationContainer>
    //   <RootStack.Navigator initialRouteName="Launch">
    //     <RootStack.Screen name="Launch" component={LaunchScreen} />
    //     <RootStack.Screen name="Login" component={LoginScreen} />
    //     <RootStack.Screen name="Home" component={HomeScreen} />
    //   </RootStack.Navigator>
    // </NavigationContainer>
  );
}