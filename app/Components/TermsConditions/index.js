import React, { Component } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  WebView,
  ImageBackground,
  DeviceEventEmitter,
  TouchableOpacity
} from "react-native";

import { Static_Images } from "../../Constants";
import styles from "./style";
import theme from "../../Theme";

export default class TermsConditions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      t_and_c_text:
        "Lucid Premium membership offers €2.99/monthly subscription after 3-day free trial for unlocking all features, premium functionality and removing ads. Payment will be charged to your iTunes Account at confirmation of purchase. Subscription automatically renews unless auto-renewal is turned off at least 24-hours before the end of the current period, and identify the cost of the renewal. Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase. Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription to that publication, where applicable"
    };
  }

  componentDidMount = () => {
    DeviceEventEmitter.removeAllListeners("hardwareBackPress");
    DeviceEventEmitter.addListener("hardwareBackPress", () => {
      this.props.navigation.goBack();
      return true;
    });
  };

  componentWillUnmount = () => {
    DeviceEventEmitter.removeAllListeners("hardwareBackPress");
  };

  render() {
    return (
      <SafeAreaView>
        <ImageBackground
          source={Static_Images.image_bg}
          style={{ height: "100%", width: "100%" }}
          resizeMode="stretch"
        >
          <View
            style={{
              height: "10%",
              paddingHorizontal: "5%",
              paddingVertical: "10%"
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: "5%" }}>
              <View style={{ flex: 0.2, alignItems: "flex-start" }}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                >
                  <Image
                    source={Static_Images.image_back_arrow}
                    style={{ width: 30, height: 30 }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.6, alignItems: "center" }}>
                <Text
                  style={{
                    color: "white",
                    fontFamily: theme.FONT_SEMI_BOLD,
                    fontSize: 18
                  }}
                >
                  Terms & Conditions
                </Text>
              </View>
              <View style={{ flex: 0.2, alignItems: "flex-end" }} />
            </View>
          </View>
          {/* <View style={{ height: "90%" }}>
            <WebView source={{ uri: "https://en.wikipedia.org/wiki/Terms_of_service" }} />
          </View> */}
          <View style={styles.container}>
            <Text style={styles.privacyText}>
              {this.state.t_and_c_text}
            </Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }
}
