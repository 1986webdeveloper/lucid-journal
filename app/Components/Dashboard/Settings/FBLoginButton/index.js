import React, { Component } from "react";
import { View, Text, TouchableOpacity, AsyncStorage, Platform } from "react-native";
import styles from "./../style";
import LinearGradient from "react-native-linear-gradient";
import renderIf from "./renderif";
import Loader from '../../../Loader';
const FBSDK = require("react-native-fbsdk");
const { GraphRequest, GraphRequestManager, LoginManager, AccessToken } = FBSDK;

export default class FBLoginButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isUserLoggedIn: false,
      fbAccountId: ''
    };
  }

  async FBGraphRequest(fields, callback) {
    // Create a graph request asking for user information
    const infoRequest = new GraphRequest("/me", null, callback.bind(this));
    // Execute the graph request created above
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  async FBLoginCallback(error, result) {

    this.setState({loading : false}, () =>{
      if (!error) {
        this.setState({ isUserLoggedIn: true });
        let fbUserId = result.id;
        AsyncStorage.setItem('fbAccountId', fbUserId.toString());
      }
    });

  }

  async facebookLogin() {
    let result;
    try {
      let behavior = Platform.OS === 'ios' ? 'native' : 'NATIVE_ONLY';
      LoginManager.setLoginBehavior(behavior);
      result = await LoginManager.logInWithReadPermissions(["public_profile"]);
    } catch (nativeError) {
      let behavior = Platform.OS === 'ios' ? 'native' : 'WEB_ONLY';
      LoginManager.setLoginBehavior(behavior);
      result = await LoginManager.logInWithReadPermissions(['public_profile', 'email']);
      //alert(JSON.stringify(nativeError));
    }
    //alert(JSON.stringify(result));
    // handle the case that users clicks cancel button in Login view
    if (result.isCancelled) {
      //alert("Login was cancelled");
    } else {
      this.setState({loading : true}, () => this.FBGraphRequest("id", this.FBLoginCallback));
      // Create a graph request asking for user information
    }
  }

  facebookLogout() {
    LoginManager.logOut();
    AsyncStorage.removeItem("fbAccountId");
    this.setState({ isUserLoggedIn: false });
  }

  componentDidMount() {
    AccessToken.getCurrentAccessToken().then(
      data => {
        if (data != null) {
          let fbUserId = data.userID;
          AsyncStorage.setItem('fbAccountId', fbUserId.toString());
          this.setState({ isUserLoggedIn: true });
        } else {
          AsyncStorage.removeItem("fbAccountId");
          this.setState({ isUserLoggedIn: false });
        }
      } //Refresh it every time
    );
  }

  render() {
    return (
      <View>

        {renderIf(!this.state.isUserLoggedIn)(
          <TouchableOpacity onPress={() => this.facebookLogin()}>
            <LinearGradient
              colors={["#817DE8", "#9E68F0"]}
              style={styles.button}
            >
              <Text style={styles.text}>Connect with Facebook</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {renderIf(this.state.isUserLoggedIn)(
          <TouchableOpacity onPress={() => this.facebookLogout()}>
            <LinearGradient
              colors={["#817DE8", "#9E68F0"]}
              style={styles.button}
            >
              <Text style={styles.text}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

module.exports = FBLoginButton;
