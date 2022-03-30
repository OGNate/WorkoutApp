import { StatusBar } from 'expo-status-bar';
import react from 'react-native'
import { StyleSheet, Text, View, Image, ImageBackground, Button, TextInput} from 'react-native';

import { Alert, SafeAreaView, TouchableWithoutFeedback } from 'react-native-web';

function WelcomePage(props) {

  return (

    <ImageBackground style={styles.background} source={require('../assets/dumbbells.jpeg')}>
          
    <Image 
      style= {{height: 200, width: 200}}
      source={require('../assets/logo.png')}/>
   
    <View style={styles.logoSpacer}></View>
   
    <View style={styles.loginSquare}> 
     <Button  
      title='Login'
      color='#fff'
      onPress={() => console.log("Login")}
      />
    </View>
   
    
    <View style={styles.registerSquare}>
      <Button
      title='Register'
      color='#fff'
      onPress={() => console.log("Register")}
      />
    </View>
   
   <StatusBar style="auto" />
   </ImageBackground>
  );
}
   
   const styles = StyleSheet.create({
   background: {
   flex: 1,
   justifyContent: "flex-end",
   alignItems: "center",
   paddingBottom: 100
   },
   container: {
   flex: 1,
   backgroundColor: '#fff',
   alignItems: 'center',
   justifyContent: 'center',
   },
   loginSquare: {
     position: "absolute",
     bottom: "15%",
   width: "80%",
   height: "7%",
   backgroundColor: '#ACD1AF',
   justifyContent: 'center',
   },
   logoSpacer: {
   padding: "55%", //48% of the screen padding
   },
   mediumSpacer: {
   paddingTop: 40,
   },
   registerSquare: {
     position: "absolute",
     bottom: "7%",
     width: "80%",
     height: "7%",
     backgroundColor: '#4FB5D3',
     justifyContent: 'center',
   }, 
   spacer: {
   padding: 10,
   },
   }
  );

export default WelcomePage;
