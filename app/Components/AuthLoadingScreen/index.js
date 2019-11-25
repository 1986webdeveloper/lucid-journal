import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  ActivityIndicator,
  StatusBar,
  Platform,
  ImageBackground
} from "react-native";
import { Static_Images } from "../../Constants";

export default class AuthLoadingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._bootstrapAsync();
  }

  static navigationOptions = {
    header: null
  };

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem("isIntroSkip");
    //const userToken = null;
    this.props.navigation.navigate((userToken != null) ? "App" : "Auth");
  };

  render() {
    return (
      <ImageBackground
        source={Static_Images.image_bg}
        style={styles.img_bg}
        resizeMode={(Platform.OS === "ios") ? "cover" : "stretch"}
      >
        <View style={styles.container}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  img_bg: {
    flex: 1,
    width: "100%",
    height: "100%"
  }
});
