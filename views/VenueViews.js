import React from 'react';
import PropTypes from 'prop-types';
import {View, Button, Text, TextInput, StyleSheet, FlatList} from 'react-native';
import { Venue } from '../objects';
import Database from "../Database";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import {AppContainer} from "../util";
import Styles from "../styles";

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
                            onDelete: venueID => {
                                this.props.database.removeVenue(venueID).catch(err => console.log(err));
                                this.setState({
                                    venueList: this.state.venueList.filter(venue => venue.id !== venueID)
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
                                this.props.database.addVenue(venue);
                                this.state.venueList.push(venue);
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
            email: venue.contactEmail || ""
        };
    }

    _validateData() {
        let matchingName = this.props.venueList.find(venue => venue.name === this.state.name);
        let emailRegex = new RegExp(`^[\\w\.]+@(\\w{2,}\.)+\\w+$`);

        if (matchingName) {
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
                                this.props.navigation.goBack();
                                this.props.onDelete(this.props.venue);
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