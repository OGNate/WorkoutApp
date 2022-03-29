import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import react from 'react-native'
import { StyleSheet, Text, View, Image, ImageBackground, Button, TextInput} from 'react-native';

import { Alert, SafeAreaView, TouchableWithoutFeedback } from 'react-native-web';

function LoginPage(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        // Main View
        <View>

            <View>
                <View></View>
                <Text>Login</Text>
            </View>

            <View></View>

            <Image 
                style= {{height: 200, width: 200}}
                source={require('../assets/logo.png')}/>

            <View></View>

            <TextInput
                placeholder='Username'
                secureTextEntry={false}  
                onChangeText={newUsername => setUsername(newUsername)}
                defaultValue={username} 
            />
            <TextInput
                placeholder='Password'
                secureTextEntry={true}
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
            />

            <View> 
                <Button  
                title='Login'
                color='#fff'
                onPress={() => [console.log(username), console.log(password)]}
                />
            </View>
            <View> 
                <Button  
                title='Back'
                color='#fff'
                onPress={() => console.log("Back")}
                />
            </View>
            
        </View>

    );
}

// const styles = StyleSheet.create({

//     background: {
//         flex: 1,
//         justifyContent: "flex-start",
//         alignItems: "center",
//         backgroundColor: "white",
//         resizeMode: "contain"
//     },
//     backSquare: {
//         position: "absolute",
//         bottom: "7%",
//         width: "80%",
//         height: "7%",
//         backgroundColor: 'red',
//         justifyContent: 'center',

//     },
//     colorTop: {
//         backgroundColor: "#ACD1AF",
//         width: "100%",
//         height: "15%",
//         borderRadius: 20,
//         justifyContent: "center",
//         alignItems: "center"
//     },
//     input: {
//         height: "5%",
//         width: "80%",
//         margin: 12,
//         borderWidth: 1,
//         borderRadius: 10,
//         padding: 10
//     },
//     titleText: {
//         fontWeight: "bold",
//         color: "white",
//         fontSize: 30,
//     },
//     smallPadding: {
//         padding: "2%"
//     },
//     loginSquare: {
//         position: "absolute",
//         bottom: "15%",
//         width: "80%",
//         height: "7%",
//         backgroundColor: '#ACD1AF',
//         justifyContent: 'center',

//         },
// });

export default LoginPage;