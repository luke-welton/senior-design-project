import React from "react";
import PropTypes from "prop-types";
import {Picker, Platform, Text, TouchableOpacity, View, StatusBar} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "react-native-modal-datetime-picker";
import Styles from "./styles";
import TinyColor from "tinycolor2";
import RandomColor from "randomcolor";
import _ from "lodash";
import {Svg as SVG, Circle} from "react-native-svg";

//handles converting a JS Date object into an ISO date string
export function toDateString(_date) {
    let year = _date.getFullYear();
    let month = _date.getMonth() + 1;
    let date = _date.getDate();

    //add trailing 0s
    if (month < 10) {
        month = "0" + month;
    }
    if (date < 10) {
        date = "0" + date;
    }

    return [year, month, date].join("-");
}

//handles converting a JS Date object into a "YYYY-MM" string
export function toMonthString(_date) {
    let year = _date.getFullYear();
    let month = _date.getMonth() + 1;

    //add trailing 0s
    if (month < 10) {
        month = "0" + month;
    }

    return [year, month].join("-");
}

//handles converting a JS date object into a time string
export function toTimeString(time) {
    let minutes = time.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return [time.getHours(), minutes].join(":");
}

//handles converting military time to AM/PM format
export function toAMPM(militaryTime) {
    let splits = militaryTime.split(":");

    let ampm = "AM";
    let hour = parseInt(splits[0]);

    if (hour === 12 || hour === 0) {
        splits[0] = "12";
        ampm = hour === 12 ? "PM" : "AM";
    } else if (hour > 12) {
        splits[0] = (hour - 12).toString();
        ampm = "PM";
    }

    return [splits.join(":"), ampm].join(" ");
}

export function toMilitaryTime(ampmTime) {
    let splits = ampmTime.split(" ");
    let ampm = splits[1];

    splits = splits[0].split(":");

    let hour = parseInt(splits[0]);

    if (hour === 12 && ampm === "AM") {
        hour = 0;
    } else if (hour < 12 && ampm === "PM") {
        hour += 12;
    }

    return [hour, splits[1]].join(":");
}

//handles converting given options of date and/or time into a JS date object
export function toDateTime(data) {
    if (!data) data = {};

    let returnDateTime = new Date();

    if (data.date) {
        let toParse = data.date;
        if (data.date.includes("/")) {
            toParse = toISO(data.date);
        }

        let splits = toParse.split("-");
        returnDateTime.setFullYear(parseInt(splits[0]), parseInt(splits[1]) - 1, parseInt(splits[2]));
    }
    if (data.time) {
        let splits = data.time.split(":");
        returnDateTime.setHours(parseInt(splits[0]), parseInt(splits[1]), 0, 0);
    } else {
        returnDateTime.setHours(0, 0, 0, 0);
    }

    return returnDateTime;
}

//handles converting ISO date strings into US date strings
export function toUS(isoDate) {
    let splits = isoDate.split("-");

    let year = splits[0];
    let month = splits[1];
    let date = splits[2];

    //remove trailing 0s
    if (parseInt(month) < 10) {
        month = month[1];
    }
    if (parseInt(date) < 10) {
        date = date[1];
    }

    return [month, date, year].join("/");
}

//handles converting US date strings into ISO date strings
export function toISO(usDate) {
    let splits = usDate.split("/");

    let month = splits[0];
    let date = splits[1];
    let year = splits[2];

    //insert trailing 0s
    if (parseInt(month) < 10) {
        month = "0" + month;
    }
    if (parseInt(date) < 10) {
        date = "0" + date;
    }

    return [year, month, date].join("-");
}

//useful variable containing exactly how many milliseconds are in a day
let dayInMS = 24 * 60 * 60 * 1000;
export { dayInMS };

export class Dropdown extends React.Component {
    static propTypes = {
        options: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string
        })).isRequired,
        selectedValue: PropTypes.string,
        onValueChange: PropTypes.func.isRequired,
        style: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.arrayOf(PropTypes.object)
        ])
    };

    static defaultProps = {
        style: null
    };

    constructor(props) {
        super(props);
        this.state = {
            value: props.selectedValue
        };
    }

    render() {
        if (Platform.OS === "android") {
            return (
                <Picker style={this.props.style}
                    selectedValue = {this.state.value}
                    onValueChange = {value => {
                        this.setState({value: value});
                        this.props.onValueChange(value);
                    }}
                >
                    {this.props.options.map(option =>
                        <Picker.Item key={option.value} label={option.label} value={option.value} />
                    )}
                </Picker>
            );
        } else {
            return (
                <RNPickerSelect style={this.props.style}
                    items = {this.props.options}
                    value = {this.state.value}
                    onValueChange={value => {
                        this.setState({value: value});
                        this.props.onValueChange(value);
                    }}
                />
            );
        }
    }
}

//helper class to input time since the timepicker is bizarrely complex
export class TimeInput extends React.Component {
    static propTypes = {
        onValueChange: PropTypes.func.isRequired,
        value: PropTypes.string
    };

    constructor(props) {
        super(props);

        let msIn15Mins = 1000 * 60 * 15;
        let now = new Date();
        now.setMilliseconds(Math.ceil(now.getTime() / msIn15Mins) * msIn15Mins);

        this.state = {
            value: this.props.value ? toDateTime({time: toMilitaryTime(this.props.value)}) : now,
            open: false
        };
    }

    render() {
        return(
            <View style={Styles.datetimeContainer}>
                <TouchableOpacity style={Styles.inputBox}
                                  onPress = {() => this.setState({open: true})}
                >
                    <Text>{toAMPM(toTimeString(this.state.value))}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    date = {this.state.value}
                    mode = "time"
                    isVisible={this.state.open}
                    onConfirm = {time => {
                        this.setState({
                            value: time,
                            open: false
                        });

                        this.props.onValueChange(toTimeString(time));
                    }}
                    onCancel = {() => this.setState({open: false})}
                />
            </View>
        );
    }
}

export function randomColor(seed) {
    let color = TinyColor(RandomColor({seed: seed}));
    return {
        hex: color.toHexString(),
        isDark: color.isDark()
    };
}

export class AppContainer extends React.Component {
    static propTypes = {
        style: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.arrayOf(PropTypes.object)
        ])
    };

    static defaultProps = {
        style: null
    };

    render() {
        return(
            <View style={_.flatten([Styles.appContainer, this.props.style])}>
                <StatusBar barStyle="light-content" backgroundColor="#fff"/>
                {this.props.children}
            </View>
        );
    }
}

export class MoreButton extends React.Component {
    static propTypes = {
        onPress: PropTypes.func.isRequired
    };

    static generateCircles() {
        let circles = [];

        for (let i = 0; i < 4; i++) {
            let position = (i + 1) * 100 - 50;
            circles.push(
                <Circle
                    key={i.toString()}
                    cx = {position}
                    cy = "50"
                    r = "25"
                    stroke = "#111"
                    strokeWidth = "1"
                    fill = "#111"
                />
            );
        }

        return circles
    }

    render() {
        return (
            <TouchableOpacity style={Styles.moreButton}
                onPress={this.props.onPress}
            >
                <SVG height="100%" width = "100%" viewBox = "0 0 100 300">
                    {MoreButton.generateCircles()}
                </SVG>
            </TouchableOpacity>
        );
    }
}