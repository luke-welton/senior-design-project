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
    }
});