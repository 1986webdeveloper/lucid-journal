import PushNotification from "react-native-push-notification";
import { AsyncStorage } from "react-native";

import {
  DocumentPicker,
  DocumentPickerUtil
} from "react-native-document-picker";

export default class NotifService {
  constructor(onRegister, onNotification) {
    // this.configure(onRegister, onNotification);

    this.lastId = 0;
    this.state = {};
  }

  configure(onRegister, onNotification, gcm = "") {
    PushNotification.configure({
      onNotification: onNotification, //this._onNotification,
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
      requestPermissions: true
    });
  }

  scheduleDailyNotification(notificationTime) {
    var randomId = (Math.floor(Math.random() * 1000) + 1).toString() ;
    let soundName = "default";
    AsyncStorage.getItem ('dailyNotificationId').then (dailyNotificationId => {
      if(dailyNotificationId != null){
        this.cancelNotif(dailyNotificationId);
      }
      AsyncStorage.setItem("dailyNotificationId", randomId);
      AsyncStorage.setItem("dailyNotificationTime", notificationTime);
      
      console.log("Notification Set: "+randomId);

      PushNotification.localNotificationSchedule({
        id: randomId,
        date: new Date(notificationTime), // in 30 secs
        repeatType: "day",
        //repeatType: "minute",
        
        /* Android Only Properties */
        vibrate: true, // (optional) default: true
        ongoing: false, // (optional) set whether this is an "ongoing" notification

        /* iOS and Android properties */
        title: "Lucid Journal Daily", // (optional)
        message: "Add your dream and make a memory", // (required)
        playSound: true, // (optional) default: true`
        soundName: soundName // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      });
    });
  }

  setDailyNotification(){
    AsyncStorage.getItem ('dailyNotificationTime').then (dailyNotificationTime => {
      if(dailyNotificationTime != null){
        this.scheduleDailyNotification(dailyNotificationTime);
      }
    });
  }

  scheduleNotificationSound(frequency) {
    // alert(frequency);
    let soundName = "default";
    let index = parseInt(frequency);
    //let timePeriod = 60 * 1 * 1000;
    let timePeriod = 60 * 60 * 1000;
    let timersec = timePeriod / index;
    let timer = timersec;
    for (i = 1; i <= index; i++) {
      PushNotification.localNotificationSchedule({
        date: new Date(Date.now() + timer), // in 30 secs
        repeatType: "hour",
        //repeatType: "minute",

        /* Android Only Properties */
        vibrate: true, // (optional) default: true
        ongoing: false, // (optional) set whether this is an "ongoing" notification

        /* iOS and Android properties */
        title: "Lucid Journal", // (optional)
        message: "Add your dream and make a memory", // (required)
        playSound: true, // (optional) default: true`
        soundName: soundName // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      });
      timer += timersec;
    }
  }

  sendLocalNotification(){
    PushNotification.localNotification({
        /* iOS and Android properties */
        title: "My Notification Title", // (optional)
        message: "My Notification Message"
    });
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif(notificationId) {
    PushNotification.cancelLocalNotifications({
      id: "" + notificationId
    });
    AsyncStorage.removeItem("dailyNotificationId");
    console.log("Notification Cancel: "+notificationId);
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
    this.setDailyNotification();
  }
}
