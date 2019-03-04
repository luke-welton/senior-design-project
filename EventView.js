import React from 'react'
import PropTypes from 'prop-types'
import { Event, Client, Venue } from "./objects"
import { View, TextInput, Text, TouchableOpacity, Button } from "react-native"
import { RadioGroup } from "react-native-btr";
import DateTimePicker from "react-native-modal-datetime-picker"
import Styles from "./styles"
import {
    toTimeString, toAMPM, toDateString, toMilitaryTime, toUS, toDateTime,
    Dropdown, TimeInput, AppContainer
} from "./util";
import {withMappedNavigationProps} from "react-navigation-props-mapper";

const defaultTimes = [
    "7:30 PM - 9:00 PM",
    "9:30 PM - 11:00 PM"
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
        onDelete: PropTypes.func
    };

    constructor(props) {
        super(props);

        let event = this.props.event || new Event();
        this.isNew = !event.id;



        this.state = {
            clientID:  event.clientID || this.props.clientList[0].id,
            venueID: this.isNew ? this.props.defaultVenue.id : event.venueID,
            price: event.price.toString() || "",
            date: toDateString(event.start),
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
        let buttons = [
            {
                label: defaultTimes[0],
                value: 1
            },
            {
                label: defaultTimes[1],
                value: 2
            },
            {
                label: "Custom",
                value: 0
            }
        ];

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

    render() {
        return (
            <AppContainer style={Styles.infoView}>
                <View style={Styles.contentContainer}>
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
                    <View style={Styles.inputRow}>
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
                            radioButtons = {this._generateRadioButtons()}
                            onPress = {buttons => {
                                let selected = buttons.find(b => b.checked);

                                if (selected.value === 0 && !this.state.customTime) {
                                    this.setState({customTime: true});
                                } else {
                                    let splits = selected.label.split("-");

                                    let newState = {
                                        startTime: toMilitaryTime(splits[0].trim()),
                                        endTime: toMilitaryTime(splits[1].trim())
                                    };

                                    if (this.state.customTime) {
                                        newState.customTime = false;
                                    }

                                    this.setState(newState);
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
                            value = {this.state.price}
                            onChangeText = {value => {
                                if (new RegExp(`^[0-9]*\.?[0-9]*$`).test(value)) {
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
                    {/* Create/Update Button */}
                    <Button style={Styles.buttons}
                        title = {this.isNew ? "Create Event" : "Save Event"}
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
                            <Button style={Styles.buttons}
                                title = "Delete Event"
                                color = "red"
                                onPress = {() => {
                                    this.props.navigation.goBack();
                                    this.props.onDelete(this.props.event);
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

