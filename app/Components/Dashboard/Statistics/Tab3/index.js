import React, { Component } from "react";
import { Text, View, FlatList } from "react-native";

//import { openDatabase } from "react-native-sqlite-storage";
//var db = openDatabase({ name: "UserDatabase.db" });
import { db } from "../../../../Config";

import BackgroundFetch from "react-native-background-fetch";

export default class Tab3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      FlatListItems: []
    };
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM table_reality_check", [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          FlatListItems: temp
        });
      });
    });
  }

  componentDidMount() {

    // Configure it.
    BackgroundFetch.configure({
      minimumFetchInterval: 15,     // <-- minutes (15 is minimum allowed)
      // Android options
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
      requiresCharging: false,      // Default
      requiresDeviceIdle: false,    // Default
      requiresBatteryNotLow: false, // Default
      requiresStorageNotLow: false  // Default
    }, () => {
      console.log("[js] Received background-fetch event");
      alert("Background Activity Call");

    var logDbUrl = 'http://192.168.1.39/lucid-dreams-web/public/api/createloguser';
    const data = new FormData ();
    data.append ('user_id', '123456789');

    fetch (logDbUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: data,
    })
      .then (response => {
        return response.text ();
      })
      .then (responseJson => {
      })
      .catch (error => {
        //alert ('Error:' + JSON.stringify (error));
      });

      // Required: Signal completion of your task to native code
      // If you fail to do this, the OS can terminate your app
      // or assign battery-blame for consuming too much background-time
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    }, (error) => {
      console.log("[js] RNBackgroundFetch failed to start");
    });
 
    // Optional: Query the authorization status.
    BackgroundFetch.status((status) => {
      switch(status) {
        case BackgroundFetch.STATUS_RESTRICTED:
          console.log("BackgroundFetch restricted");
          break;
        case BackgroundFetch.STATUS_DENIED:
          console.log("BackgroundFetch denied");
          break;
        case BackgroundFetch.STATUS_AVAILABLE:
          console.log("BackgroundFetch is enabled");
          break;
      }
    });
  }

  ListViewItemSeparator = () => {
    return (
      <View
        style={{ height: 0.2, width: "100%", backgroundColor: "#808080" }}
      />
    );
  };

  render() {
    return (
      <View style={{ flex: 1, padding: "5%", backgroundColor: "#413298" }}>
        <FlatList
          data={this.state.FlatListItems}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              key={item.user_id}
              style={{ backgroundColor: "white", padding: 20 }}
            >
              <Text>notifStatus: {item.notification_status}</Text>
              <Text>silentstatus: {item.silent_status}</Text>
              <Text>frequency: {item.frequency}</Text>
              <Text>startTime: {item.start_time}</Text>
              <Text>endTime: {item.end_time}</Text>
            </View>
          )}
        />
      </View>
    );
  }
}
