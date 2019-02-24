import {Text, View} from "react-native";
import PropTypes from "prop-types";
import Styles from "./styles";
import {Agenda} from "react-native-calendars";
import React from "react";
import _ from "lodash";
import {toDateString, dayInMS} from "./util";
import {Event} from "./objects";

//DayView
export default class DayView extends React.Component {
    static propTypes = {
        selectedDate: PropTypes.string.isRequired,
        events: PropTypes.arrayOf(PropTypes.instanceOf(Event)).isRequired,
        onClose: PropTypes.func.isRequired
    };

    _generateDateStorage() {
        let dateEvents = {};

        _.range(-14, 14).forEach(mult => {
            let date = new Date(this.props.selectedDate.getTime());
            date.setMilliseconds(date.getTime() + mult * dayInMS);
            dateEvents[toDateString(date)] = [];
        });

        this.props.events.forEach(event => {
            let eventDate = toDateString(event.start);
            if (dateEvents[eventDate]) {
                dateEvents[eventDate].push(event);
            }
        });

        return dateEvents;
    }

    render() {
        return (
            <View style={[Styles.appContainer, Styles.dayView]}>
                <Agenda style={Styles.dayView}
                        selected={this.props.selectedDate}
                        items = {this._generateDateStorage()}
                        onCalendarToggled={this.props.onClose}
                        renderEmptyDate={() => {
                            return(<View />)
                        }}
                />
            </View>
        );
    }
}