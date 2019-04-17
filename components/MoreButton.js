import React from "react";
import PropTypes from "prop-types";
import {Circle, Svg as SVG} from "react-native-svg";
import {TouchableOpacity, Platform} from "react-native";
import Styles from "../styles";

export default class MoreButton extends React.Component {
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
                    cx={Platform.OS === "android" ? "50" : position}
                    cy={Platform.OS === "android" ? position : "50"}
                    r={"25"}
                    stroke="#111"
                    strokeWidth="1"
                    fill="#111"
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
                <SVG height="100%" width="100%" viewBox="0 0 100 300">
                    {MoreButton.generateCircles()}
                </SVG>
            </TouchableOpacity>
        );
    }
}