import {StyleSheet, TouchableOpacity, View, Text, Button} from "react-native";
import PropTypes from "prop-types";
import {Agenda} from "react-native-calendars";
import React from "react";
import _ from "lodash";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import {dayInMS, toAMPM, toDateString, toTimeString, randomColor, Dropdown, AppContainer, MoreButton} from "./util";
import {Client, Event, Venue} from "./objects";
import {Database} from "./database";
import Styles from "./styles";
import db from "./database";

@withMappedNavigationProps()
export default class DayView extends React.Component {
    static propTypes = {
        selectedDate: PropTypes.instanceOf(Date).isRequired,
        selectedVenue: PropTypes.instanceOf(Venue).isRequired,
        loadedData: PropTypes.shape({
            clients: PropTypes.arrayOf(PropTypes.instanceOf(Client)),
            events: PropTypes.arrayOf(PropTypes.instanceOf(Event)),
            venues: PropTypes.arrayOf(PropTypes.instanceOf(Venue))
        }).isRequired,
        database: PropTypes.instanceOf(Database).isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedVenue: this.props.selectedVenue
        };
    }

    shouldComponentUpdate() {
        return true;
    }

    _generateDateStorage() {
        let dateEvents = {};

        //initialize date properties for object
        _.range(-13, 16).forEach(mult => {
            let date = new Date(this.props.selectedDate.getTime());
            date.setTime(date.getTime() + mult * dayInMS);

            dateEvents[toDateString(date)] = [];
        });

        //insert events into object
        let filteredEvents = this.props.loadedData.events.filter(event => event.venueID === this.state.selectedVenue.id);
        filteredEvents.forEach(event => {
            let eventDate = toDateString(event.start);
            if (dateEvents[eventDate]) {
                dateEvents[eventDate].push(event);
            }
        });

        //sort events within object
        for (let date in dateEvents) {
            if (dateEvents.hasOwnProperty(date)) {
                dateEvents[date].sort((eventA, eventB) => eventA.start < eventB.start ? -1 : 1);
            }
        }

        return dateEvents;
    }

    _updateEventInData(event) {
        let events = this.props.loadedData.events;
        events = events.filter(_event => _event.id !== event.id);
        events.push(new Event(event.toData(), event.id));
        this.props.loadedData.events = events;
    }

    _removeEventFromData(eventID) {
        let events = this.props.loadedData.events;
        events = events.filter(event => event.id !== eventID);
        this.props.loadedData.events = events;
    }

    _forceRerender() {
        this.props.loadedData = Object.assign({}, this.props.loadedData);
        this.forceUpdate();
    }

    render() {
        return (
            <AppContainer>
                <View style={Styles.calendarHeader}>
                    <Dropdown style={Styles.calendarDropdown}
                              options = {this.props.loadedData.venues.map(venue => {
                                  return {
                                      label: venue.name,
                                      value: venue.id
                                  };
                              })}
                              selectedValue = {this.state.selectedVenue.id}
                              onValueChange = {venueID =>
                                  this.setState({selectedVenue: this.props.loadedData.venues.find(venue => venue.id === venueID)})
                              }
                    />
                    <MoreButton
                        onPress={() => this.props.navigation.navigate("VenueManage", {
                            venueList: this.props.loadedData.venues,
                            database: db,
                            onReturn: venues => {
                                console.log(venues);
                            }
                        })}
                    />
                </View>
                <Agenda
                    hideKnob = {true}
                    selected = {toDateString(this.props.selectedDate)}
                    items = {this._generateDateStorage()}
                    rowHasChanged = {(eventA, eventB) => !eventA.isEqual(eventB)}
                    renderItem = {(event, first) => {
                        return (
                            <EventBox
                                event = {event}
                                first = {first}
                                client = {this.props.loadedData.clients.find(client => client.id === event.clientID)}
                                onPress = {() => this.props.navigation.navigate("Event", {
                                    event: event,
                                    database: this.props.database,
                                    clientList: this.props.loadedData.clients,
                                    eventList: this.props.loadedData.events,
                                    venueList: this.props.loadedData.venues,
                                    onSave: event => {
                                        this.props.database.updateEvent(event);
                                        this._updateEventInData(event);
                                        this._forceRerender();
                                    },
                                    onDelete: event => {
                                        this.props.database.removeEvent(event);
                                        this._removeEventFromData(event.id);
                                        this._forceRerender();
                                    }
                                })}
                            />
                        );
                    }}
                    renderEmptyDate = {() => <View />}
                />
                <View style={DayViewStyles.buttonContainer}>
                    <Button
                        title = "Add New Event"
                        color = "green"
                        onPress = {() => this.props.navigation.navigate("Event", {
                            database: this.props.database,
                            clientList: this.props.loadedData.clients,
                            eventList: this.props.loadedData.events,
                            venueList: this.props.loadedData.venues,
                            defaultVenue: this.state.selectedVenue,
                            defaultDate: this.props.selectedDate,
                            onSave: event => {
                                this.props.database.addEvent(event);
                                this.props.loadedData.events.push(event);
                                this._forceRerender();
                            }
                        })}
                    />
                </View>
            </AppContainer>
        );
    }
}

class EventBox extends React.Component {
    static propTypes = {
        event: PropTypes.instanceOf(Event).isRequired,
        client: PropTypes.instanceOf(Client).isRequired,
        onPress: PropTypes.func.isRequired,
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
                onPress = {this.props.onPress}
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
    },
    buttonContainer: {
        padding: 5
    }
});