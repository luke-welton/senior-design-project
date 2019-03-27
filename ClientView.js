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
                <Text style={ClientStyles.entryName}>{client.stageName}</Text>
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
            stageName: client.stageName || "",
            email: client.email || "",
            performers: client.performers || []
        };
    }

    _renderPerformer(performerData) {
        let name = performerData.name;
        let index = parseInt(performerData.key) - 1;

        return (
            <PerformerEntry
                name = {name}
                onSave = {newName => {
                    let performers = this.state.performers;
                    performers[index] = newName;
                    this.setState({performers: performers});
                }}
                onDelete = {() => {
                    let performers = this.state.performers;
                    performers.splice(index, 1);
                    this.setState({performers: performers});
                }}
            />
        );
    }

    _validateData() {
        let emailRegex = new RegExp(`^[\\w\.]+@(\\w{2,}\.)+\\w+$`);

        if (this.state.stageName === "") {
            alert("The client must have a stage name.")
        } else if (this.state.performers.length === 0) {
            alert("There must be at least one performer.")
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

                    {/* Client Name Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Name</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.stageName}
                                   onChangeText = {value => this.setState({name: value})}
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

                    {/* Performer Names Input */}
                    <Text style={ClientStyles.performerTitle}>Performers</Text>
                    <FlatList
                        data = {this.state.performers.map((name, i) => {
                            return {
                                key: (i + 1).toString(),
                                name: name
                            };
                        })}
                        renderItem = {data => this._renderPerformer(data.item)}
                    />
                    <PerformerButton
                        onSave = {performerName => {
                            let performers = this.state.performers;
                            performers.push(performerName);
                            this.setState({performers: performers});
                        }}
                    />
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

class PerformerEntry extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired
    };

    static defaultProps = {
        name: ""
    };

    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            isEditing: !this.props.name
        };
    }

    render() {
        if (this.state.isEditing) {
            return (
                <View style={ClientStyles.entryContainer}>
                    <TextInput style={ClientStyles.performerInput}
                        value = {this.state.name}
                        onChangeText = {value => {
                            this.setState({name: value});
                        }}
                    />
                    <View style={ClientStyles.entryButton}>
                        <Button
                            title = "✔️"
                            color = "#fff"
                            onPress = {() => {
                                this.setState({isEditing: false});

                                let name = this.state.name;
                                if (name.trim() === "") {
                                    this.props.onDelete();
                                } else {
                                    this.props.onSave(this.state.name);
                                }
                            }}
                        />
                    </View>
                </View>
            );
        } else {
            return (
                <View style={ClientStyles.entryContainer}>
                    <Text style={[ClientStyles.entryName, ClientStyles.performerName]}>{this.state.name}</Text>
                    <View style={ClientStyles.entryButton}>
                        <Button
                            title = "✏️"
                            color = "#fff"
                            onPress = {() => {
                                this.setState({isEditing: true});
                            }}
                        />
                    </View>
                    <View style={ClientStyles.entryButton}>
                        <Button
                            title = "❌"
                            color = "#fff"
                            onPress = {this.props.onDelete}
                        />
                    </View>
                </View>
            );
        }
    }
}

class PerformerButton extends React.Component {
    static propTypes = {
        onSave: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    render() {
        if (this.state.isOpen) {
            return (
                <PerformerEntry
                    onSave = { name => {
                        this.props.onSave(name);
                        this.setState({isOpen: false});
                    }}
                    onDelete = {() => this.setState({isOpen: false})}
                />
            );
        } else {
            return (
                <Button
                    title = "Add Performer"
                    onPress = {() => this.setState({isOpen: true})}
                />
            );
        }
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
    performerName: {
        flexGrow: 5
    },
    performerInput: {
        flexGrow: 6,
        flexBasis: 0,
        backgroundColor: "#fff",
        marginRight: 10,
        paddingLeft: 5
    },
    entryButton: {
        flexGrow: 1,
        flexBasis: 0,
        flexShrink: 0,
        marginRight: 5
    },
    performerTitle: {
        fontSize: 20,
        marginBottom: 5
    }
});