import {Text, View} from "react-native";
import PropTypes from "prop-types";
import Styles from "./styles";
import {Agenda} from "react-native-calendars";
import React from "react";
import _ from "lodash";
import { toDateTime, toDateString, dayInMS} from "./util";

//DayView
export default class DayView extends React.Component {
    static propTypes = {
        selectedDate: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired
    };

    render() {
        let dateEvents = {};

        //set default displayed dates to +/- 3 days from selected dates
        for (let mult in _.range(7)) {
            let date = toDateTime({date: this.props.selectedDate});
            date.setMilliseconds(date.getMilliseconds() + mult * dayInMS);
            console.log(date, mult);
            dateEvents[toDateString(date)] = [];
        }

        console.log(dateEvents);

        return (
            <View style={Styles.appContainer}>
                <Text style={Styles.statusBar}> </Text>
                <Agenda style={Styles.dayView}
                        selected={this.props.selectedDate}
                        items = {dateEvents}
                        onCalendarToggled={this.props.onClose}
                        renderEmptyDate={() => {
                            return(<View />)
                        }}
                />
            </View>
        );
    }
}