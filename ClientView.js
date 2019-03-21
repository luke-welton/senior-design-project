import React from 'react';
import PropTypes from 'prop-types';
import {View, Button, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { Client } from './objects';
import {Database} from "./database";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import {AppContainer} from "./util";
import Styles from "./styles";

@withMappedNavigationProps()
export class ManageClients extends React.Component {
    static propTypes = {
        clientList: PropTypes.arrayOf(PropTypes.instanceOf(Client)).isRequired,
        onReturn: PropTypes.func.isRequired,
        database: PropTypes.instanceOf(Database).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            clientList: this.props.clientList
        };
    }

    _renderClient(client) {
        return(
            <View style={ClientStyles.entryContainer}>
                <Text style={ClientStyles.entryName}>{client.name}</Text>
                <View style={ClientStyles.entryButton}>
                    <Button
                        title = "Manage"
                        onPress = {() => this.props.navigation.navigate("Client", {
                            client: client,
                            clientList: this.state.clientList,
                            onSave: client => {
                                this.props.database.updateClient(client).catch(err => console.log(err));
                                this.forceUpdate()
                            },
                            onDelete: clientID => {
                                this.props.database.removeClient(clientID).catch(err => console.log(err));
                                this.setState({
                                    clientList: this.state.clientList.filter(client => client.id !== clientID)
                                });
                            }
                        })}
                    />
                </View>
            </View>
        );
    }

    render() {
        return (
            <AppContainer style={Styles.infoView}>
                <View style={Styles.contentContainer}>
                    <FlatList
                        data={this.state.clientList.map(client => { return {
                            key: client.id,
                            data: client
                        }})}
                        renderItem = {data => this._renderClient(data.item.data)}
                    />
                </View>

                <View style={Styles.buttonContainer}>
                    <Button
                        title = "Add New Client"
                        onPress = {() => this.props.navigation.navigate("Client", {
                            clientList: this.state.clientList,
                            onSave: client => {
                                this.props.database.addVenue(client);
                                this.state.clientList.push(client);
                                this.forceUpdate();
                            }
                        })}
                    />
                </View>
            </AppContainer>
        );
    }
}

@withMappedNavigationProps()
export class ClientView extends React.Component {
    static propTypes = {
        client: PropTypes.instanceOf(Client),
        clientList: PropTypes.arrayOf(PropTypes.instanceOf(Client)).isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func
    };

    constructor(props) {
        super(props);

        let client = this.props.client || new Client();
        this.isNew = !client.id;

        this.state = {
            firstName: client.firstName || "",
            lastName: client.lastName || "",
            stageName: client.stageName || "",
            email: client.contactEmail || ""
        };
    }

    _validateData() {
        let matchingName = this.props.clientList.find(client => client.name === this.state.name);
        let emailRegex = new RegExp(`^[\\w\.]+@(\\w{2,}\.)+\\w+$`);

        if (matchingName) {
            alert("There is already a client with that name.");
        } else if (this.state.name === "") {
            alert("The client must have a name.");
        } else if (this.state.email === "") {
            alert("The client must have an email address.");
        } else if (!emailRegex.test(this.state.email)) {
            alert("The given email address was not in the proper format.")
        } else {
            return true;
        }

        return false;
    }

    render() {
        return (
            <AppContainer style={Styles.infoView}>
                <View style={Styles.contentContainer}>
                    <Text style={Styles.infoTitle}>
                        {this.isNew ? "Create New Client" : "Update Client"}
                    </Text>

                    {/* Client First Name Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>First Name</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.firstName}
                                   onChangeText = {value => this.setState({firstName: value})}
                        />
                    </View>

                    {/* Client Last Name Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Last Name</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.lastName}
                                   onChangeText = {value => this.setState({lastName: value})}
                        />
                    </View>

                    {/* Client Stage Name Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Stage Name</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.stageName}
                                   onChangeText = {value => this.setState({stageName: value})}
                        />
                    </View>

                    {/* Contact Email Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Email</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.email}
                                   onChangeText = {value => this.setState({email: value})}
                        />
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    {/* Save Button */}
                    <Button
                        title = {this.isNew ? "Create Client" : "Save Client"}
                        onPress = {() => {
                            if (this._validateData()) {
                                let client = this.props.client || new Client();
                                client.update(this.state);

                                this.props.navigation.goBack();
                                this.props.onSave(client);
                            }
                        }}
                    />

                    {/* Delete Button */}
                    { this.isNew ? null :
                        <Button
                            title = "Delete Client"
                            color = "red"
                            onPress = {() => {
                                this.props.navigation.goBack();
                                this.props.onDelete(this.props.client);
                            }}
                        />
                    }
                </View>
            </AppContainer>
        );
    }
}

const ClientStyles = StyleSheet.create({
    entryContainer: {
        backgroundColor: "#eee",
        display: "flex",
        flexDirection: "row",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        alignItems: "center"
    },
    entryName: {
        flexGrow: 3,
        flexBasis: 0,
        fontSize: 15
    },
    entryButton: {
        flexGrow: 1,
        flexBasis: 0
    }
});