import React from "react";
import PropTypes from "prop-types";
import {StatusBar, View} from "react-native";
import _ from "lodash";
import Styles from "../styles";

export default class AppContainer extends React.Component {
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
        return (
            <View style={_.flatten([Styles.appContainer, this.props.style])}>
                <StatusBar barStyle="light-content" backgroundColor="#fff"/>
                {this.props.children}
            </View>
        );
    }
}