//helper class to input time since the timepicker is bizarrely complex
import React from "react";
import PropTypes from "prop-types";
import {Text, TouchableOpacity, View} from "react-native";
import Styles from "../styles";
import DateTimePicker from "react-native-modal-datetime-picker";
import {toAMPM, toDateTime, toMilitaryTime, toTimeString} from "../util";

export default class TimeInput extends React.Component {
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
        return (
            <View style={Styles.datetimeContainer}>
                <TouchableOpacity style={Styles.inputBox}
                                  onPress={() => this.setState({open: true})}
                >
                    <Text>{toAMPM(toTimeString(this.state.value))}</Text>
                </TouchableOpacity>
                <DateTimePicker
                    date={this.state.value}
                    mode="time"
                    isVisible={this.state.open}
                    onConfirm={time => {
                        this.setState({
                            value: time,
                            open: false
                        });

                        this.props.onValueChange(toTimeString(time));
                    }}
                    onCancel={() => this.setState({open: false})}
                />
            </View>
        );
    }
}