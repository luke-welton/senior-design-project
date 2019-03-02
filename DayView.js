import {Text, View} from "react-native";
import PropTypes from "prop-types";
import Styles from "./styles";
import {Agenda} from "react-native-calendars";
import React from "react";
import _ from "lodash";
import {toDateTime, toDateString, dayInMS, toLocalTime} from "./util";
import {withMappedNavigationProps} from "react-navigation-props-mapper";

@withMappedNavigationProps()
export default class DayView extends React.Component {
    static propTypes = {
        selectedDate: PropTypes.string.isRequired,
        //onClose: PropTypes.func.isRequired
    };

    render() {
        let dateEvents = {};

        //set default displayed dates to +/- 3 days from selected dates
        for (let mult in _.range(7)) {
            let date = toLocalTime(toDateTime({date: this.props.selectedDate}));
            date.setMilliseconds(date.getTime() + mult * dayInMS);
            dateEvents[toDateString(date)] = [];
        }

        return (
            <View style={[Styles.appContainer, Styles.dayView]}>
                <Agenda style={Styles.dayView}
                        selected={this.props.selectedDate}
                        items = {dateEvents}
                        //onCalendarToggled={this.props.onClose}
                        renderEmptyDate={() => {
                            return(<View />)
                        }}
                />
            </View>
        );
    }
}