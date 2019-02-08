import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    appContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    statusBar: {
        height: Platform.OS === "android" ? 25 : 20
    },
    calPicker: {
        width: "100%"
    },
    monthView: {
        width: "100%"
    },
    dayView: {
        width: "100%"
    },
    infoView: {
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    datetimeInput: {
        backgroundColor: "#dddddd",
        borderWidth: "1px",
        borderColor: "#333333"
    },
    hide: {
        display: "none"
    }
});