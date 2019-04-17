import React from "react";
import PropTypes from "prop-types";
import {Picker, Platform} from "react-native";
import RNPickerSelect from "react-native-picker-select";

export default class Dropdown extends React.Component {
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
                        selectedValue={this.state.value}
                        onValueChange={value => {
                            this.setState({value: value});
                            this.props.onValueChange(value);
                        }}
                >
                    {this.props.options.map(option =>
                        <Picker.Item key={option.value} label={option.label} value={option.value}/>
                    )}
                </Picker>
            );
        } else {
            return (
                <RNPickerSelect style={this.props.style}
                                items={this.props.options}
                                value={this.state.value}
                                onValueChange={value => {
                                    this.setState({value: value});
                                    this.props.onValueChange(value);
                                }}
                />
            );
        }
    }
}