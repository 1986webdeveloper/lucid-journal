import { StyleSheet } from "react-native";

import theme from "../../Theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },

  privacyText: {
    fontFamily: theme.FONT_REGULAR,
    color: "white",
    //     textAlign: "center",
    opacity: 0.8,
    fontSize: 16,
    letterSpacing: 1,
    lineHeight: 30
  }
});
