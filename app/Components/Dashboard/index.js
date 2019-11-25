import React, { Component } from "react";
import {
  SafeAreaView,
  Platform,
  Text,
  View,
  Image,
  ImageBackground,
  StatusBar,
  BackHandler,
  DeviceEventEmitter
} from "react-native";
import styles from "./style";
import BottomBar from "../BottomBar";
import { Static_Icons } from "../../Constants";
import Journal from "./Journal";
import Statistics from "./Statistics";
import RealityCheck from "./RealityCheck";
import Settings from "./Settings";
import * as Animatable from "react-native-animatable";
import { connect } from "react-redux";
import { addItem } from "../../actions/items";
import { EventRegister } from "react-native-event-listeners";

//import { openDatabase } from "react-native-sqlite-storage";
//var db = openDatabase({ name: "UserDatabase.db" });
import { db } from '../../Config'

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.isNewSelect = 0;
    this.state = {
      selectedIndex: 1,
      journalOpacity: 1,
      statisticsOpacity: 0.5,
      realityOpacity: 0.5,
      settingsOpacity: 0.5
    };
    this.updateIndex = this.updateIndex.bind(this);

    //Sqlite database
    db.transaction(function(txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_user'",
        [],
        function(tx, res) {
          console.log("item:", res.rows.length);

          if (res.rows.length == 0) {
            txn.executeSql("DROP TABLE IF EXISTS table_user", []);
            txn.executeSql(
              "CREATE TABLE IF NOT EXISTS table_user(id INTEGER PRIMARY KEY AUTOINCREMENT, date VARCHAR(50), time VARCHAR(50), title VARCHAR(200), description VARCHAR(1000), rating INT(5), first_answer VARCHAR(200), second_answer VARCHAR(200), type TEXT(100), fifth_answer VARCHAR(200), tags VARCHAR(2000),voice_record VARCHAR(2000), voice_time VARCHAR(100))",
              []
            );
          }
        }
      );
    });
  }

  componentDidMount = () => {
    //alert(this.props.itemName)
    DeviceEventEmitter.removeAllListeners("hardwareBackPress");
    DeviceEventEmitter.addListener("hardwareBackPress", () => {
      BackHandler.exitApp();
      return true;
    });
  };


  componentWillMount() {
    this.indexListener = EventRegister.addEventListener("indexSelect", data => {
      this.updateIndex(1);
    }); 
  }

  componentWillUnmount = () => {
    EventRegister.removeEventListener(this.indexListener);
    //DeviceEventEmitter.removeCurrentListener('hardwareBackPress')
    //this.backPressSubscriptions.clear()
  };

  updateIndex(selectedIndex) {
    if(selectedIndex == 3){
      this.props.navigation.push("NewJournal");
    }
    this.setState({ selectedIndex });
    this.onItemSelect(selectedIndex);
    this.onOpacityChange(selectedIndex);
  }

  onOpacityChange(index) {
    if (index === 1) {
      this.setState({
        journalOpacity: 1,
        statisticsOpacity: 0.5,
        realityOpacity: 0.5,
        settingsOpacity: 0.5
      });
    }
    if (index === 2) {
      this.setState({
        journalOpacity: 0.5,
        statisticsOpacity: 1,
        realityOpacity: 0.5,
        settingsOpacity: 0.5
      });
    }
    if (index === 3) {
      this.setState({
        journalOpacity: 0.5,
        statisticsOpacity: 0.5,
        realityOpacity: 0.5,
        settingsOpacity: 0.5
      });
    }
    if (index === 4) {
      this.setState({
        journalOpacity: 0.5,
        statisticsOpacity: 0.5,
        realityOpacity: 1,
        settingsOpacity: 0.5
      });
    }
    if (index === 5) {
      this.setState({
        journalOpacity: 0.5,
        statisticsOpacity: 0.5,
        realityOpacity: 0.5,
        settingsOpacity: 1
      });
    }
  }

  onItemSelect(index) {
    DeviceEventEmitter.addListener("hardwareBackPress", () => {
      BackHandler.exitApp();
      return true;
    });
    if (index === 1) {
      return <Journal />;
    }
    if (index === 2) {
      return <Statistics />;
    }
    if (index === 3) {
      return <Journal />;
    }
    if (index === 4) {
      return <RealityCheck />;
    }
    if (index === 5) {
      return <Settings />;
    }
  }

  render() {
    const { selectedIndex } = this.state;
    const icons = [
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: this.state.journalOpacity
        }}
      >
        <Image
          source={Static_Icons.icon_journal}
          style={styles.bottom_icons}
          resizeMode="stretch"
        />
        <Text style={styles.icon_texts}>Journal</Text>
      </View>,
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: this.state.statisticsOpacity
        }}
      >
        <Image
          source={Static_Icons.icon_statistics}
          style={styles.bottom_icons}
        />
        <Text style={styles.icon_texts}>Statistics</Text>
      </View>,
      <Animatable.Image
        duration={2000}
        animation="rubberBand"
        iterationCount={2}
        source={Static_Icons.icon_plus}
        style={styles.bottom_icons}
      />,
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: this.state.realityOpacity
        }}
      >
        <Image
          source={Static_Icons.icon_reality_check}
          style={styles.bottom_icons}
        />
        <Text style={styles.icon_texts}>Reality check</Text>
      </View>,
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: this.state.settingsOpacity
        }}
      >
        <Image
          source={Static_Icons.icon_settings}
          style={styles.bottom_icons}
        />
        <Text style={styles.icon_texts}>Settings</Text>
      </View>
    ];

    return (
      <ImageBackground
        source={require("../../Images/Entry_bg.png")}
        style={{
          flex: 1,
          width: "100%",
          height: "100%"
        }}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar translucent={true} barStyle="light-content" backgroundColor={"transparent"} />

          {this.onItemSelect(selectedIndex)}
          <BottomBar // you can use TypeOne Also With the same settings
            icons={icons} //array of icon views this array can be image or vector icon
            selectedColor={"#FF8F00"} //color of selected item in tab bar
            backgroundColor={"#725cd3"} //background color of tab bar
            onSelect={index => this.updateIndex(index)} //on select an item , index starts at 1 :-D
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }
}

export class Home extends Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Home</Text>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    items: state.items.items,
    itemName: state.itemName.itemName
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: name => {
      dispatch(addItem(name));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
