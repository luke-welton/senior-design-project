import React from 'react';
import PropTypes from "prop-types";
import Styles from "./styles.js";
import {Picker, Platform, Text, View} from "react-native";
import {CalendarList} from "react-native-calendars";

export default class MonthView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            venue: 1
        };
    }

    render() {
        return (
            <View style={Styles.appContainer}>
                <Text style={Styles.statusBar}> </Text>
                <Picker style={Styles.calPicker}
                        selectedValue={this.state.venue.toString()}
                        onValueChange={(value) => {
                            this.setState({venue: parseInt(value)});
                        }}
                >
                    <Picker.Item label="Venue A" value="1"/>
                    <Picker.Item label="Venue B" value="2"/>
                    <Picker.Item label="Venue C" value="3"/>
                </Picker>
                <CalendarList style={Styles.monthView}
                    horizontal={Platform.OS === "android"}
                    pagingEnabled={Platform.OS === "android"}
                    hideArrows={Platform.OS !== "android"}
                    onDayPress={(day) => {
                        this.props.onDateSelect(day.dateString);
                    }}
                />
            </View>
        );
    }
}

MonthView.propTypes = {
    onDateSelect: PropTypes.func.isRequired
};