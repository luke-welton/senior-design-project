import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    appContainer: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        paddingTop: Platform.OS === "android" ? 25 : 0,
    },
    calendarHeader: {
        height: 50,
        display: "flex",
        flexDirection: "row"
    },
    calendarDropdown: {
        flexGrow: 15,
        flexBasis: 0
    },
    infoView: {
        justifyContent: "space-between"
    },
    infoTitle: {
        fontSize: 25,
        textAlign: "center",
        marginBottom: 20
    },
    contentContainer: {
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
        flexShrink: 0
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
        flexBasis: 0,
        textAlign: "center"
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
    buttonContainer: {
        padding: 20,
        width: "100%"
    },
    buttonBuffer: {
        height: 10
    },
    moreButton: {
        flexGrow: 1,
        padding: 15,
        paddingLeft: 0,
        paddingRight: 5,
        flexBasis: 0
    }
});