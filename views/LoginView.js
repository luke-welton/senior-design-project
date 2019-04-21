import React from "react";
import {Button, Image, StyleSheet, TextInput, View} from "react-native";
import AppContainer from "../components/AppContainer";
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
            storageBucket: "music-matters-229420.appspot.com",
            projectId: "music-matters-229420"
        });
    }

    _authenticate() {
        Firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password).then(() => {
            this.props.navigation.navigate("Loading");
        }).catch(err => {
            alert(err.toString());
        });
    }

    render() {
        return (
            <AppContainer>
                <View style={Styles.contentContainer}>
                    <Image
                        source = {require("../assets/icon-transparent.png")}
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
                    </View>
                </View>
            </AppContainer>
        )
    }
}

const LoginViewStyles = StyleSheet.create({
    icon: {
        height: 200,
        width: 200,
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