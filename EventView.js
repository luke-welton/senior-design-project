import React from 'react'
import PropTypes from 'prop-types'
import { Event } from "./objects"
import { View, Picker, TextInput, Text, TouchableOpacity } from "react-native"
import { RadioGroup } from "react-native-btr";
import DateTimePicker from "react-native-modal-datetime-picker"
import Styles from "./styles"
import { toTimeString, toAMPM} from "./util";


export default class EventView extends React.Component {
    static propTypes = {
        event: PropTypes.object,
        defaultVenue: PropTypes.string,
        clientList: PropTypes.arrayOf(PropTypes.object).isRequired,
        venueList: PropTypes.arrayOf(PropTypes.object).isRequired,
        eventList: PropTypes.arrayOf(PropTypes.object).isRequired
    };

    constructor(props) {
        super(props);
        this.customTime = false;
    }

    _generateClientDropdown() {
        let dropdown = [];
        for (let client in this.props.clientList) {
            dropdown.push(<Picker.Item label={client.stageName} value={client.id} />);
        }
        return dropdown;
    }

    _generateVenueDropdown() {
        let dropdown = [];
        for (let venue in this.props.venueList) {
            dropdown.push(<Picker.Item label={venue.name} value={venue.id} />);
        }
        return dropdown;
    }

    _generateRadioButtons() {
        let buttons = [
            {
                label: "7:30 PM - 9:00 PM",
                value: 1
            },
            {
                label: "9:30 PM - 11:00 PM",
                value: 2
            },
            {
                label: "Custom",
                value: 0
            }
        ];

        let timeString = [toAMPM(toTimeString(this.props.event.start)),
                          toAMPM(toTimeString(this.props.event.end))].join(" - ");

        let value = -1;
        for (let button in buttons) {
            if (button.label === timeString) {
                value = button.value;
            }
        }
        if (value < 0) value = 0;

        let selected = buttons.find(button => {
            return button.value === value;
        });
        selected.checked = true;

        return buttons;
    }

    render() {
        if (!!this.props.event) {
            this.props.event = new Event();
            this.props.event.venueID = this.props.defaultVenue;
        }

        let event = this.props.event;

        return (
            <View style={Styles.eventView}>
                {/* Client Selector */}
                <Picker selectedValue={event.clientID}>
                    {this._generateClientDropdown()}
                </Picker>

                {/* Venue Selector */}
                <Picker selectedValue={event.venueID}>
                    {this._generateVenueDropdown()}
                </Picker>

                {/* Price Input */}
                <MoneyInput defaultValue={event.price} />

                {/* Time Selector*/}
                <RadioGroup
                    radioButtons = {this._generateRadioButtons()}
                    onPress = {buttons => {
                        let selected = buttons.find(b => b.checked);

                        if (selected.value === 0 && !this.state.customTime) {
                            this.setState({customTime: true});
                        } else if (selected.value !== 0 && this.state.customTime) {
                            this.setState({customTime: false});
                        }
                    }}
                />
                <View style={this.state.customTime ? null : Styles.hide}>
                    <Text>Start Time</Text>
                    <TimeInput
                        value = {toAMPM(toTimeString(event.start))}
                        onValueChange = {time => {

                        }}
                    />
                    <Text>End Time</Text>
                    <TimeInput
                        value = {toAMPM(toTimeString(event.end))}
                        onValueChange = {time => {

                        }}
                    />
                </View>

                {/* Save Button */}

                {/* Update Button */}

                {/* Delete Button */}
            </View>
        );
    }
}

class MoneyInput extends React.Component {
    static propTypes = {
        defaultValue: PropTypes.Number
    };

    constructor(props) {
        super(props);
        this.value = 0.00;
    }

    _verifyValue(value) {
        let numeric = parseInt(value);
        if (isNaN(numeric)) {
            alert("Please only enter monetary values.")
        } else {
            this.setState({value: numeric / 100});
        }
    }

    render() {
        return(
            <TextInput
                keyboardStyle="numeric"
                value={this.state.value}
                onChangeText={this._verifyValue}
            />
        );
    }
}

class TimeInput extends React.Component {
    static propTypes = {
        onValueChange: PropTypes.func,
        value: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.value = this.props.value || "";
        this.open = false;
    }

    render() {
        return(
            <View>
                <TouchableOpacity style={Styles.timeInput}
                    onPress = {() => {
                        this.setState({open: true});
                    }}
                >
                    <Text>{this.state.value}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    isVisible={this.state.open}
                    onConfirm = {time => {
                        this.setState({
                            value: time,
                            open: false
                        });

                        if (typeof this.props.onValueChange === "function") this.props.onValueChange(time);
                    }}
                    onCancel = {() => {
                        this.setState({open: false});
                    }}
                    mode = "time"
                />
            </View>
        );
    }
}
