import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    appContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: Platform.OS === "android" ? 25 : 20
    },
    calPicker: {

    },
    monthView: {

    },
    dayView: {

    },
    infoView: {
        padding: 20
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
        flexGrow: 1,
        flexShrink: 0
    },
    inputBox: {
        padding: 10,
        backgroundColor: "#eee",
        flexGrow: 4,
        flexBasis: 0,
        fontSize: 15,
        flexShrink: 1
    },
    customTimeContainer: {
        display: "flex",
        width: "80%",
        alignSelf: "flex-end"
    },
    customTimeTitle: {
        marginRight: 5,
        fontSize: 17.5,
        flexGrow: 1,
        flexBasis: 0,
        textAlign: "center"
    },
    datetimeContainer: {
        flexGrow: 4,
        flexBasis: 0
    },
    pickerBox: {
        display: "flex",
        paddingLeft: 10,
        paddingRight: 10,
        marginLeft: 5,
        backgroundColor: "#eee",
        flexGrow: 4,
        flexBasis: 0
    },
    buttons: {
        alignSelf: "flex-end",
        marginTop: 5
    },

});