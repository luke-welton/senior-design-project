import React from 'react'
import PropTypes from 'prop-types'
import { Event, Client, Venue } from "./objects"
import { View, Picker, TextInput, Text, TouchableOpacity, Button } from "react-native"
import { RadioGroup } from "react-native-btr";
import DateTimePicker from "react-native-modal-datetime-picker"
import Styles from "./styles"
import {toTimeString, toAMPM, toDateString, toMilitaryTime, toUS} from "./util";


export default class EventView extends React.Component {
    static propTypes = {
        event: PropTypes.instanceOf(Event),
        isNew: PropTypes.bool,
        defaultVenue: PropTypes.string.isRequired,
        defaultDate: PropTypes.instanceOf(Date),
        clientList: PropTypes.arrayOf(PropTypes.instanceOf(Client)).isRequired,
        venueList: PropTypes.arrayOf(PropTypes.instanceOf(Venue)).isRequired,
        eventList: PropTypes.arrayOf(PropTypes.instanceOf(Event)).isRequired,
        onSave: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        onDelete: PropTypes.func
    };

    constructor(props) {
        if (!!props.event) {
            props.event = new Event();
            props.event.venueID = props.defaultVenue;
            props.isNew = true;
        } else {
            props.isNew = false;
        }

        super(props);
        this.state = {
            clientID:  this.props.event.clientID,
            venueID: this.props.event.venueID,
            price: this.props.event.price,
            date: toDateString(this.props.event.start),
            startTime: toTimeString(this.props.event.start),
            endTime: toTimeString(this.props.event.end),
            customTime: false
        };
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

        let timeString = [toAMPM(this.state.startTime),
                          toAMPM(this.state.endTime)].join(" - ");

        let value = -1;
        for (let button in buttons) {
            if (button.label === timeString) {
                value = button.value;
            }
        }
        if (value < 0) {
            value = 0;
            if (!this.state.customTime) {
                this.setState({customTime: true});
            }
        }

        let selected = buttons.find(button => {
            return button.value === value;
        });
        selected.checked = true;

        return buttons;
    }

    render() {
        let event = this.props.event;

        return (
            <View style={Styles.infoView}>
                {/* Client Selector */}
                <Text>Client</Text>
                <Picker
                    selectedValue = {event.clientID}
                    onValueChange = {value => this.setState({clientID: value})}
                >
                    {this._generateClientDropdown()}
                </Picker>

                <Text>Venue</Text>
                {/* Venue Selector */}
                <Picker
                    selectedValue = {event.venueID}
                    onValueChange = {value => this.setState({venueID: value})}
                >
                    {this._generateVenueDropdown()}
                </Picker>


                {/* Date Selector */}
                <Text>Date</Text>
                <DateInput
                    value={this.state.date}
                    onValueChange={value => this.setState({date: value})}
                />

                {/* Time Selector*/}
                <Text>Time</Text>
                <RadioGroup
                    radioButtons = {this._generateRadioButtons()}
                    onPress = {buttons => {
                        let selected = buttons.find(b => b.checked);

                        if (selected.value === 0 && !this.state.customTime) {
                            this.setState({customTime: true});
                        } else if (selected.value !== 0 && this.state.customTime) {
                            let splits = selected.label.split("-");
                            this.setState({
                                customTime: false,
                                startTime: toMilitaryTime(splits[0]),
                                endTime: toMilitaryTime(splits[1])
                            });
                        }
                    }}
                />
                <View style={this.state.customTime ? null : Styles.hide}>
                    <Text>Start Time</Text>
                    <TimeInput
                        value = {toAMPM(this.state.startTime)}
                        onValueChange = {time => this.setState({startTime: time})}
                    />
                    <Text>End Time</Text>
                    <TimeInput
                        value = {toAMPM(this.state.endTime)}
                        onValueChange = {time => this.setState({endTime: time})}
                    />
                </View>

                {/* Price Input */}
                <Text>Price</Text>
                <TextInput
                    keyboardStyle="numeric"
                    value={this.state.price}
                    onChangeText={value => {
                        let numeric = parseInt(value);
                        if (isNaN(numeric)) {
                            alert("Please only enter monetary values.")
                        } else {
                            this.setState({price: numeric / 100});
                        }
                    }}
                />

                {/* Create/Update Button */}
                    <Button
                        title = {this.props.isNew ? "Create Event" : "Save Event"}
                        onPress = {() => {
                            let ev = this;
                            this.props.event.update({
                                clientID: ev.state.clientID,
                                venueID: ev.state.venueID,
                                price: ev.state.price,
                                date: ev.state.date,
                                startTime: ev.state.startTime,
                                endTime: ev.state.endTime
                            });

                            this.props.onSave(this.props.event);
                        }}
                    />

                { /* Delete Button */
                    this.props.isNew ? null :
                        <Button
                            title = "Delete Event"
                            color: "red"
                            onPress = {this.props.onDelete}
                        />
                }
            </View>
        );
    }
}

//helper class to input dater since the timepicker is bizarrely complex
class DateInput extends React.Component {
    static propTypes = {
        onValueChange: PropTypes.func.isRequired,
        value: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || toUS(toDateString(new Date())),
            open: false
        };
    }

    render() {
        return (
            <View>
                <TouchableOpacity style={Styles.datetimeInput}
                    onPress = {() => this.setState({open: true})}
                >
                    <Text>{this.state.value}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    mode = "date"
                    isVisible = {this.state.open}
                    onConfirm = {date => {
                        this.setState({
                            value: date,
                            open: false
                        });
                    }}
                    onCancel = {() => this.setState({open: false})}
                />
            </View>
        );
    }
}

//helper class to input time since the timepicker is bizarrely complex
class TimeInput extends React.Component {
    static propTypes = {
        onValueChange: PropTypes.func.isRequired,
        value: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || "",
            open: false
        };
    }

    render() {
        return(
            <View>
                <TouchableOpacity style={Styles.datetimeInput}
                    onPress = {() => this.setState({open: true})}
                >
                    <Text>{this.state.value}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    mode = "time"
                    isVisible={ this.state.open }
                    onConfirm = {time => {
                        this.setState({
                            value: time,
                            open: false
                        });

                        this.props.onValueChange(toMilitaryTime(time));
                    }}
                    onCancel = {() => this.setState({open: false})}
                />
            </View>
        );
    }
}
