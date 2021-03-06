import React from 'react';
import PropTypes from 'prop-types';
import {Alert, Button, FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import {Venue} from '../objects';
import Database from "../Database";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import AppContainer from "../components/AppContainer";
import Styles from "../styles";
import _ from "lodash";

@withMappedNavigationProps()
export class ManageVenues extends React.Component {
    static propTypes = {
        venueList: PropTypes.arrayOf(PropTypes.instanceOf(Venue)).isRequired,
        onReturn: PropTypes.func.isRequired,
        database: PropTypes.instanceOf(Database).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            venueList: this.props.venueList
        };
    }

    _renderVenue(venue) {
        return(
            <View style={VenueStyles.entryContainer}>
                <Text style={VenueStyles.entryName}>{venue.name}</Text>
                <View style={VenueStyles.entryButton}>
                    <Button
                        title = "Manage"
                        onPress = {() => this.props.navigation.navigate("Venue", {
                            venue: venue,
                            venueList: this.state.venueList,
                            onSave: venue => {
                                this.props.database.updateVenue(venue).catch(err => console.log(err));
                                this.forceUpdate()
                            },
                            onDelete: venue => {
                                this.props.database.removeVenue(venue).catch(err => console.log(err));
                                this.setState({
                                    venueList: this.state.venueList.filter(_venue => _venue.id !== venue.id)
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
                    <FlatList style={Styles.listContainer}
                        data={this.state.venueList.map(venue => { return {
                            key: venue.id,
                            data: venue
                        }})}
                        renderItem = {data => this._renderVenue(data.item.data)}
                    />
                </View>

                <View style={Styles.buttonContainer}>
                    <Button
                        title = "Add New Venue"
                        onPress = {() => this.props.navigation.navigate("Venue", {
                            venueList: this.state.venueList,
                            onSave: venue => {
                                this.props.database.addVenue(venue).then(venue => {
                                    this.state.venueList.push(venue);
                                    this.setState({
                                        venueList: _.sortBy(this.state.venueList, "name")
                                    });
                                });
                            }
                        })}
                    />
                </View>
            </AppContainer>
        );
    }
}

@withMappedNavigationProps()
export class VenueView extends React.Component {
    static propTypes = {
        venue: PropTypes.instanceOf(Venue),
        venueList: PropTypes.arrayOf(PropTypes.instanceOf(Venue)).isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func
    };

    constructor(props) {
        super(props);

        let venue = this.props.venue || new Venue();
        this.isNew = !venue.id;

        this.state = {
            name: venue.name || "",
            email: venue.contactEmail || "",
            street1: venue.address.street1 || "",
            street2: venue.address.street2 || "",
            city: venue.address.city || "",
            state: venue.address.state || "",
            zip: venue.address.zip || ""
        };
    }

    _validateData() {
        let matchingVenue = this.props.venueList.find(venue => {
            if (this.isNew) {
                return venue.name === this.state.name;
            } else {
                return venue.name === this.state.name && this.props.venue.id !== venue.id;
            }
        });
        let emailRegex = new RegExp(`^[\\w\.]+@(\\w{2,}\.)+\\w+$`);

        if (matchingVenue) {
            alert("There is already a venue with that name.");
        } else if (this.state.name === "") {
            alert("The venue must have a name.");
        } else if (this.state.email === "") {
            alert("The venue must have an email address.");
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
                        {this.isNew ? "Create New Venue" : "Update Venue"}
                    </Text>

                    {/* Venue Name Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Name</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.name}
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

                    {/* Address Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Street</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.street1}
                                   onChangeText = {value => this.setState({street1: value})}
                        />
                    </View>

                    {/* Address 2 Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Line 2</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.street2}
                                   onChangeText = {value => this.setState({street2: value})}
                        />
                    </View>

                    {/* City Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>City</Text>
                        <TextInput style={Styles.inputBox}
                                   value = {this.state.city}
                                   onChangeText = {value => this.setState({city: value})}
                        />
                    </View>

                    <View style={Styles.inputRow}>
                        {/* State Input */}
                        <View style={[Styles.inputRow, VenueStyles.stateContainer]}>
                            <Text style={[Styles.inputTitle, VenueStyles.stateTitle]}>State</Text>
                            <TextInput style={[Styles.inputBox, VenueStyles.stateInput]}
                                       value = {this.state.state}
                                       onChangeText = {value => this.setState({state: value})}
                            />
                        </View>

                        {/* ZIP Input */}
                        <View style={[Styles.inputRow, VenueStyles.zipContainer]}>
                            <Text style={Styles.inputTitle}>ZIP</Text>
                            <TextInput style={Styles.inputBox}
                                       value = {this.state.zip}
                                       onChangeText = {value => this.setState({zip: value})}
                            />
                        </View>
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    {/* Save Button */}
                    <Button
                        title = {this.isNew ? "Create Venue" : "Save Venue"}
                        onPress = {() => {
                            if (this._validateData()) {
                                let venue = this.props.venue || new Venue();
                                venue.update(this.state);

                                this.props.navigation.goBack();
                                this.props.onSave(venue);
                            }
                        }}
                    />

                    {/* Delete Button */}
                    { this.isNew ? null :
                        <Button
                            title = "Delete Venue"
                            color = "red"
                            onPress = {() => {
                                Alert.alert("Confirmation",
                                    "Are you sure you want to delete this venue?",
                                    [
                                        {
                                            text: "Cancel"
                                        },
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                this.props.navigation.goBack();
                                                this.props.onDelete(this.props.venue);
                                            }
                                        }
                                    ],
                                    {cancelable: true}
                                );
                            }}
                        />
                    }
                </View>
            </AppContainer>
        );
    }
}

const VenueStyles = StyleSheet.create({
    entryContainer: {
        width: "100%",
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
    },
    stateContainer: {
        flexGrow: 1,
        flexBasis: 0,
        marginRight: 10
    },
    stateTitle: {
        flexGrow: 2
    },
    stateInput: {
        flexGrow: 1
    },
    zipContainer: {
        flexGrow: 2,
        flexBasis: 0
    }
});