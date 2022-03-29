import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { LoginScreen } from "./LoginScreen";
import { LaunchScreen } from "./LaunchScreen";

const { Navigator, Screen } = createStackNavigator();

const RootNavigator = () => {
  <NavigationContainer>
    <Navigator headermode="none" initialRouteName="LaunchScreen">
      <Screen headermode="none" name="Launch" component={LaunchScreen}></Screen>
      <Screen name="Login" component={LoginScreen}></Screen>
    </Navigator>
  </NavigationContainer>;
};

export default RootNavigator;