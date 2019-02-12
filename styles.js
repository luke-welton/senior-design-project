import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    appContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        marginTop: Platform.OS === "android" ? 25 : 20
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
        padding: 20,
        paddingBottom: 0
    },
    hide: {
        display: "none"
    },
    inputRow: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10,
        alignItems: "center"
    },
    inputTitle: {
        marginRight: 5,
        fontSize: 20,
        flexBasis: 0,
        flexGrow: 2,
        flexShrink: 0
    },
    inputBox: {
        padding: 10,
        backgroundColor: "#eee",
        flexGrow: 8,
        flexBasis: 0,
        fontSize: 15
    },
    customTimeContainer: {
        display: "flex",
        flexDirection: "column"
    },
    datetimeContainer: {
        flexGrow: 8,
        flexBasis: 0
    },
    pickerBox: {
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#eee",
        flexGrow: 8,
        flexBasis: 0
    },
    buttons: {
        alignSelf: "flex-end",
        marginTop: 5
    }
});