import React from "react";
import {TextInput, Image, Button, StyleSheet, View} from "react-native";
import {AppContainer} from "../util";
import Styles from "../styles";
import Firebase from "firebase";
import auth from "../auth";

export default class LoginView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: ""
        };
    }

    componentDidMount() {
        Firebase.initializeApp({
            apiKey: auth.apiKey,
            authDomain: "music-matters-229420.firebaseapp.com",
            databaseURL: "https://music-matters-229420.firebaseio.com",
            storageBucket: "music-matters-229420.appspot.com"
        });
    }

    _authenticate() {
        Firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password).then(() => {
            this.props.navigation.navigate("Loading");
        }).catch(err => {
            alert(err.toString());
        });
    }

    _devAuthenticate() {
        Firebase.auth().signInWithEmailAndPassword("musicmattersbookings@gmail.com", "Mus1cMatter$").then(() => {
            this.props.navigation.navigate("Loading");
        }).catch(err => {
            alert(err.toString());
        })
    }

    render() {
        return (
            <AppContainer>
                <View style={Styles.contentContainer}>
                    <Image
                        source = {require("../assets/icon.png")}
                        style = {LoginViewStyles.icon}
                    />

                    {/* Username */}
                    <View style={Styles.inputRow}>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.username}
                                   placeholder = "Email"
                                   onChangeText = {value => this.setState({username: value})}
                        />
                    </View>

                    {/* Password */}
                    <View style={Styles.inputRow}>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.password}
                                   placeholder = "Password"
                                   onChangeText = {value => this.setState({password: value})}
                                   secureTextEntry = {true}
                        />
                    </View>

                    <View style={LoginViewStyles.buttonContainer}>
                        <Button
                            title = "Log In"
                            color = "blue"
                            onPress = {() => this._authenticate()}
                        />

                        {/* This makes it easier to log in as Mr. Moody.

                                THIS MUST BE DELETED BEFORE PUBLISHING!
                        */}
                        <Button
                            title = "Dev Mode"
                            color = "red"
                            onPress = {() => this._devAuthenticate()}
                        />
                    </View>
                </View>
            </AppContainer>
        )
    }
}

const LoginViewStyles = StyleSheet.create({
    icon: {
        height: 300,
        width: 300,
        marginBottom: 50,
        marginTop: 30
    },
    buttonContainer: {
        width: "100%",
        paddingLeft: 35,
        paddingRight: 35,
        marginTop: 20
    }
});