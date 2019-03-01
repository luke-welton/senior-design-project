import {StyleSheet, TouchableOpacity, View, Text} from "react-native";
import PropTypes from "prop-types";
import Styles from "./styles";
import {Agenda} from "react-native-calendars";
import React from "react";
import _ from "lodash";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import {dayInMS, toAMPM, toDateString, toLocalTime, toTimeString, randomColor} from "./util";
import {Client, Event, Venue} from "./objects";

@withMappedNavigationProps()
export default class DayView extends React.Component {
    static propTypes = {
        selectedDate: PropTypes.instanceOf(Date).isRequired,
        selectedVenue: PropTypes.instanceOf(Venue).isRequired,
        clients: PropTypes.arrayOf(PropTypes.instanceOf(Client)).isRequired,
        events: PropTypes.arrayOf(PropTypes.instanceOf(Event)).isRequired,
        venues: PropTypes.arrayOf(PropTypes.instanceOf(Venue)).isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedVenue: this.props.selectedVenue
        };
    }

    _generateDateStorage() {
        let dateEvents = {};
        let minDate = null;
        let maxDate = null;

        _.range(-13, 16).forEach(mult => {
            let date = new Date(this.props.selectedDate.getTime());
            date.setTime(date.getTime() + mult * dayInMS);

            if (!minDate || date < minDate) {
                minDate = date;
            }
            if (!maxDate || date > maxDate) {
                maxDate = date;
            }

            dateEvents[toDateString(date)] = [];
        });

        this.props.events.forEach(event => {
            let eventDate = toDateString(event.start);
            if (dateEvents[eventDate]) {
                dateEvents[eventDate].push(event);
            }
        });

        for (let date in dateEvents) {
            if (dateEvents.hasOwnProperty(date)) {
                dateEvents[date].sort((eventA, eventB) => eventA.start < eventB.start ? -1 : 1);
            }
        }

        return {
            dates: dateEvents,
            min: minDate,
            max: maxDate
        };
    }

    render() {
        let dateEvents = this._generateDateStorage();
        return (
            <View style={[Styles.appContainer, DayViewStyles.appContainer]}>
                <Agenda
                        selected = {toDateString(toLocalTime(this.props.selectedDate))}
                        items = {dateEvents.dates}
                        minDate = {dateEvents.min}
                        maxDate = {dateEvents.max}
                        //onCalendarToggled = {this.props.onClose}
                        // renderDay = {() => {
                        //     return(<View />);
                        // }}
                        rowHasChanged = {(eventA, eventB) => eventA.id !== eventB.id}
                        renderItem = {(event, first) => {
                            return(
                                <EventBox
                                    event = {event}
                                    first = {first}
                                    client = {this.props.clients.find(client => client.id === event.clientID)}
                                />
                            )
                        }}
                        renderEmptyDate = {() => <View />}
                />
            </View>
        );
    }
}

class EventBox extends React.Component {
    static propTypes = {
        event: PropTypes.instanceOf(Event).isRequired,
        client: PropTypes.instanceOf(Client).isRequired,
        first: PropTypes.bool
    };

    _getTimeString() {
        let start = toAMPM(toTimeString(this.props.event.start));
        let end = toAMPM(toTimeString(this.props.event.end));

        return [start, end].join(" - ");
    }

    _getInitials() {
        let splits = this.props.client.stageName.split(" ");

        if (splits.length < 2) {
            return splits[0][0];
        } else {
            return splits[0][0] + splits[splits.length - 1][0];
        }
    }

    render() {
        let clientColor = randomColor(this.props.client.id);

        return (
            <TouchableOpacity
                style={[DayViewStyles.eventContainer, this.props.first ? DayViewStyles.firstEventContainer : null]}
                onPress = {() => {

                }}
            >
                <View style={DayViewStyles.eventInfo}>
                    {/* Time */}
                    <Text style={DayViewStyles.eventInfoText}>{this._getTimeString()}</Text>

                    {/* Performer */}
                    <Text style={DayViewStyles.eventInfoText}>{this.props.client.stageName}</Text>
                </View>
                <View style={DayViewStyles.eventIconContainer}>

                    {/* Circle with Initials */}
                    <View style={[DayViewStyles.eventIcon, {backgroundColor: clientColor.hex}]}>
                        <Text style={[DayViewStyles.eventIconText, {color: clientColor.isDark ? "#fff" : "#000"}]}>
                            {this._getInitials()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const DayViewStyles = StyleSheet.create({
    appContainer: {
        height: "100%"
    },
    eventContainer: {
        backgroundColor: "#fff",
        padding: 10,
        display: "flex",
        flexDirection: "row",
        borderRadius: 5,
        marginRight: 7.5,
        marginBottom: 10
    },
    firstEventContainer: {
        marginTop: 10
    },
    eventInfo: {
        flexGrow: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignContent: "space-between"
    },
    eventInfoText: {
        fontSize: 18
    },
    eventIconContainer: {
        flexShrink: 0
    },
    eventIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        fontSize: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    eventIconText: {
        fontSize: 25
    }
});