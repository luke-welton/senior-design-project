import React from 'react';
import PropTypes from 'prop-types';
import {Client, Event, Venue} from "../objects";
import {Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {RadioGroup} from "react-native-btr";
import DateTimePicker from "react-native-modal-datetime-picker/src/index";
import Styles from "../styles";
import {toAMPM, toDateString, toDateTime, toMilitaryTime, toTimeString, toUS} from "../util";
import Database from "../Database";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import Dropdown from "../components/Dropdown";
import TimeInput from "../components/TimeInput";
import AppContainer from "../components/AppContainer";
import MoreButton from "../components/MoreButton";

const defaultTimes = [
    "5:00 PM - 7:30 PM",
    "7:30 PM - 10:00 PM",
    "5:00 PM - 8:00 PM",
    "8:00 PM - 11:00 PM"
];

@withMappedNavigationProps()
export default class EventView extends React.Component {
    static propTypes = {
        event: PropTypes.instanceOf(Event),
        defaultVenue: PropTypes.instanceOf(Venue),
        defaultDate: PropTypes.instanceOf(Date),
        clientList: PropTypes.arrayOf(PropTypes.instanceOf(Client)).isRequired,
        venueList: PropTypes.arrayOf(PropTypes.instanceOf(Venue)).isRequired,
        eventList: PropTypes.arrayOf(PropTypes.instanceOf(Event)).isRequired,
        onSave: PropTypes.func.isRequired,
        onDelete: PropTypes.func,
        database: PropTypes.instanceOf(Database)
    };

    constructor(props) {
        super(props);

        let event = this.props.event || new Event();
        this.isNew = !event.id;

        this.state = {
            clientID:  event.clientID || this.props.clientList[0].id,
            venueID: this.isNew ? this.props.defaultVenue.id : event.venueID,
            price: event.price.toString() || "",
            date: this.isNew ? toDateString(this.props.defaultDate) : toDateString(event.start),
            startTime: toTimeString(event.start),
            endTime: toTimeString(event.end),
            customTime: false
        };

        if (this.isNew) {
            let defaultSplits = defaultTimes[0].split(" - ");
            this.state.startTime = toMilitaryTime(defaultSplits[0].trim());
            this.state.endTime = toMilitaryTime(defaultSplits[1].trim());
        } else {
            let timeString = [toAMPM(this.state.startTime), toAMPM(this.state.endTime)].join(" - ");
            if (!defaultTimes.includes(timeString)) {
                this.state.customTime = true;
            }
        }
    }

    _generateRadioButtons() {
        let date = new Date(toUS(this.state.date));
        let day = date.getDay();

        let defaultTimeIndices = (day === 5 || day === 6) ? [2, 3] : [0, 1];
        let buttons = defaultTimeIndices.map(num => {
            return {
                label: defaultTimes[num],
                value: num
            };
        });

        buttons.push({
            label: "Custom",
            value: "c"
        });

        let timeString = [toAMPM(this.state.startTime), toAMPM(this.state.endTime)].join(" - ");

        let matchingButton = buttons.find(button => {
            return button.label === timeString;
        });
        if (!matchingButton) {
            matchingButton = buttons[buttons.length - 1];
        }
        matchingButton.checked = true;

        return buttons;
    }

    _handleDocumentSending(includeMonthDocs) {
        let docQueries = [];
        docQueries.push(this.props.database.sendForm({
            type: "artist_confirmation",
            event: this.props.event.id
        }));
        docQueries.push(this.props.database.sendForm({
            type: "invoice",
            event: this.props.event.id
        }));

        if (includeMonthDocs) {
            docQueries.push(this.props.database.sendForm({
                type: "booking_list",
                venue: this.props.event.venueID,
                month: this.props.event.start.getMonth() + 1,
                year: this.props.event.start.getFullYear()
            }));
            docQueries.push(this.props.database.sendForm({
                type: "calendar",
                venue: this.props.event.venueID,
                month: this.props.event.start.getMonth() + 1,
                year: this.props.event.start.getFullYear()
            }));
        }

        Promise.all(docQueries).then(() => {
            alert("Emails successfully sent!");
        }).catch(err => {
            alert("An error occurred while sending the emails.\n" + err);
            console.error(err);
        });

        alert("Emails have now begun sending." +
            " Please wait until all emails have been sent before requesting more." +
            " This may take up to a minute to complete."
        );
    }

    render() {
        return (
            <AppContainer style={Styles.infoView}>
                <View style={Styles.contentContainer}>
                    <Text style={Styles.infoTitle}>
                        {this.isNew ? "Create New Booking" : "Manage Booking"}
                    </Text>

                    {/* Client Selector */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Client</Text>
                        <Dropdown style={Styles.pickerBox}
                            options = { this.props.clientList.map(client => {
                                return {
                                    label: client.stageName,
                                    value: client.id
                                };
                            })}
                            selectedValue = {this.state.clientID}
                            onValueChange = {value => this.setState({clientID: value})}
                        />
                        <View style={EventStyles.moreContainer}>
                            <MoreButton
                                onPress = {() => {this.props.navigation.navigate("ClientManage", {
                                    clientList: this.props.clientList,
                                    database: this.props.database,
                                    onReturn: () => {
                                        // force rerender
                                    }
                                })}}
                            />
                        </View>
                    </View>

                    {/* Venue Selector */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Venue</Text>
                        <Dropdown style={Styles.pickerBox}
                            options = { this.props.venueList.map(venue => {
                                return {
                                    label: venue.name,
                                    value: venue.id
                                };
                            })}
                            selectedValue = {this.state.venueID}
                            onValueChange = {value => this.setState({venueID: value})}
                        />
                    </View>


                    {/* Date Selector */}
                    <View style={Styles.dateContainer}>
                        <Text style={Styles.inputTitle}>Date</Text>
                        <DateInput style={Styles.inputBox}
                            value={toUS(this.state.date)}
                            onValueChange={value => this.setState({date: value})}
                        />
                    </View>

                    {/* Time Selector*/}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Time</Text>
                        <RadioGroup style={Styles.datetimeContainer}
                            key = {this.state.date}
                            radioButtons = {this._generateRadioButtons()}
                            onPress = {buttons => {
                                let selected = buttons.find(b => b.checked);

                                if (selected.value === "c") {
                                    this.setState({customTime: true});
                                } else {
                                    let splits = selected.label.split("-");

                                    this.setState({
                                        startTime: toMilitaryTime(splits[0].trim()),
                                        endTime: toMilitaryTime(splits[1].trim()),
                                        customTime: false
                                    });
                                }
                            }}
                        />
                    </View>
                    <View style={this.state.customTime ? Styles.customTimeContainer : Styles.hide}>
                        <View style={Styles.inputRow}>
                            <Text style={Styles.customTimeTitle}>Start Time</Text>
                            <TimeInput
                                value = {toAMPM(this.state.startTime)}
                                onValueChange = {time => this.setState({startTime: time})}
                            />
                        </View>
                    </View>
                    <View style={this.state.customTime ? Styles.customTimeContainer : Styles.hide}>
                        <View style={Styles.inputRow}>
                            <Text style={Styles.customTimeTitle}>End Time</Text>
                            <TimeInput
                                value = {toAMPM(this.state.endTime)}
                                onValueChange = {time => this.setState({endTime: time})}
                            />
                        </View>
                    </View>

                    {/* Price Input */}
                    <View style={Styles.inputRow}>
                        <Text style={Styles.inputTitle}>Price</Text>
                        <TextInput style={Styles.inputBox}
                            keyboardType = "numeric"
                            returnKeyType = "done"
                            value = {this.state.price}
                            onChangeText = {value => {
                                if (new RegExp(`^\\d*(\\.\\d{0,2})?$`).test(value)) {
                                    this.setState({price: value});
                                } else {
                                    alert("Please only enter monetary values.");
                                    this.setState({price: this.state.price});
                                }
                            }}
                        />
                    </View>
                </View>

                <View style={Styles.buttonContainer}>
                    {this.isNew ? null :
                        <Button
                            title = "Generate Forms"
                            color = "green"
                            onPress = {() => {
                                Alert.alert(
                                    "Confirmation",
                                    "Would you also like to generate the Calendar and Booking List containing this event?",
                                    [
                                        {
                                            text: "Cancel"
                                        },
                                        {
                                            text: "No",
                                            onPress: () => this._handleDocumentSending(false)
                                        },
                                        {
                                            text: "Yes",
                                            onPress: () => this._handleDocumentSending(true)
                                        }
                                    ],
                                    {cancelable: true}
                                )
                            }}
                        />
                    }

                    {this.isNew ? null : <View style={Styles.buttonBuffer}/>}

                    {/* Create/Update Button */}
                    <Button
                        title = {this.isNew ? "Create Booking" : "Save Booking"}
                        onPress = {() => {
                            let event = this.props.event || new Event();
                            event.update(this.state);

                            this.props.navigation.goBack();
                            this.props.onSave(event);
                        }}
                    />

                    {this.isNew ? null : <View style={Styles.buttonBuffer}/>}

                    { /* Delete Button */
                        this.isNew ? null :
                            <Button
                                title = "Delete Booking"
                                color = "red"
                                onPress = {() => {
                                    Alert.alert("Confirmation",
                                        "Are you sure you want to delete this booking?",
                                        [
                                            {
                                                text: "Cancel"
                                            },
                                            {
                                                text: "OK",
                                                onPress: () => {
                                                    this.props.navigation.goBack();
                                                    this.props.onDelete(this.props.event);
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

//helper class to input date since the datepicker is bizarrely complex
class DateInput extends React.Component {
    static propTypes = {
        onValueChange: PropTypes.func.isRequired,
        value: PropTypes.string
    };

    static defaultProps = {
        value: toUS(toDateString(new Date()))
    };

    constructor(props) {
        super(props);

        this.state = {
            value: toDateTime({date: this.props.value}),
            open: false
        };
    }

    render() {
        return (
            <View style={Styles.datetimeContainer}>
                <TouchableOpacity style={Styles.inputBox}
                    onPress = {() => this.setState({open: true})}
                >
                    <Text>{toUS(toDateString(this.state.value))}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    date = {this.state.value}
                    mode = "date"
                    isVisible = {this.state.open}
                    onConfirm = {date => {
                        this.setState({
                            value: date,
                            open: false
                        });
                        this.props.onValueChange(toDateString(date));
                    }}
                    onCancel = {() => this.setState({open: false})}
                />
            </View>
        );
    }
}

const EventStyles = StyleSheet.create({
    moreContainer: {
        width: "10%"
    }
});

