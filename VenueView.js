import React from 'react';
import PropTypes from 'prop-types';
import {View, Button, Text, TextInput} from 'react-native';
import { Venue } from './objects';
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import {AppContainer} from "./util";
import Styles from "./styles";

@withMappedNavigationProps()
export default class VenueView extends React.Component {
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
            email: venue.email || ""
        };
    }

    _validateData() {
        let matchingName = this.props.venueList.find(venue => venue.name === this.state.name);
        let emailRegex = new RegExp(`^\\w+@(\\w{2,}\\.)+\\w+$`);

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
                        {this.isNew ? "Create New Event" : "Update an Event"}
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