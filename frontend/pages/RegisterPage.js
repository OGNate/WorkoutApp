import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import react from 'react-native'
import { StyleSheet, Text, View, Image, ImageBackground, Button, TextInput} from 'react-native';

import { Alert, SafeAreaView, TouchableWithoutFeedback } from 'react-native-web';

function RegisterPage(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirst] = useState('');
    const [lastName, setLast] = useState('');
    const [email, setEmail] = useState('');

    return (
        // Main View
        <View style = {styles.background}>

            <View style = {styles.colorTop}>
                <View style={styles.smallPadding}></View>
                <Text style={styles.titleText}>Register</Text>
            </View>
            <View style = {styles.smallPadding}></View>
            <Image 
                style= {{height: 200, width: 200}}
                source={require('../assets/logo.png')}/>


            <TextInput
                style={styles.input}
                placeholder='First Name'
                secureTextEntry={false}  
                onChangeText={newFirst => setFirst(newFirst)}
                defaultValue={firstName} 
            />
            <TextInput
                style={styles.input}
                placeholder='Last Name'
                secureTextEntry={false}
                onChangeText={newLast => setLast(newLast)}
                defaultValue={lastName}
            />
            <TextInput
                style={styles.input}
                placeholder='Username'
                secureTextEntry={false}
                onChangeText={newUsername => setUsername(newUsername)}
                defaultValue={username}
            />
            <TextInput
                style={styles.input}
                placeholder='Email'
                secureTextEntry={false}
                onChangeText={newEmail => setEmail(newEmail)}
                defaultValue={email}
            />
            <TextInput
                style={styles.input}
                placeholder='Password'
                secureTextEntry={true}
                onChangeText={newPassword => setPassword(newPassword)}
                defaultValue={password}
            />
            
            <View style={styles.registerSquare}> 
                <Button  
                title='Register Now'
                color='#fff'
                onPress={() => [console.log(firstName), console.log(lastName),console.log(username),console.log(email),console.log(password)]}
                />
            </View>

            <View style={styles.backSquare}> 
                <Button  
                title='Back'
                color='#fff'
                onPress={() => console.log("Back")}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    background: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "white",
        resizeMode: "contain"
    },
    backSquare: {
        position: "absolute",
        bottom: "7%",
        width: "80%",
        height: "7%",
        backgroundColor: 'red',
        justifyContent: 'center',
    },
    colorTop: {
        backgroundColor: "#4FB5D3",
        width: "100%",
        height: "15%",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    input: {
        height: "5%",
        width: "80%",
        margin: 12,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10
    },
    titleText: {
        fontWeight: "bold",
        color: "white",
        fontSize: 30,
    },
    smallPadding: {
        padding: "2%"
    },
    registerSquare: {
        position: "absolute",
        bottom: "15%",
        width: "80%",
        height: "7%",
        backgroundColor: '#4FB5D3',
        justifyContent: 'center',

        },
});

export default RegisterPage;