import React, {Component} from 'react';
import AppContainer from './app/Navigation';
import {Platform, PermissionsAndroid, AsyncStorage} from 'react-native';
import {General} from './app/Constants';
import BackgroundFetch from 'react-native-background-fetch';
var RNFS = require ('react-native-fs');
import RNFetchBlob from 'react-native-fetch-blob';
import moment from 'moment';
import {db} from './app/Config';
import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';
import {AudioUtils} from 'react-native-audio';
import {DocumentDirectoryPath} from 'react-native-fs';
import NotifService from './app/Components/Dashboard/RealityCheck/NotifService';

export default class App extends Component {
  constructor (props) {
    super (props);

    this.createAudioDir ();
    this.state = {
      userId: '',
      targetPath: '',
      audioFileStorage: AudioUtils.DocumentDirectoryPath + '/lucid_audio',
      audioFileBakeup: this.getAudioBackUpFilePath (),
    };

    db.transaction (function (txn) {
      txn.executeSql (
        "SELECT name FROM sqlite_master WHERE type='table' AND name='app_settings'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql ('DROP TABLE IF EXISTS app_settings', []);
            txn.executeSql (
              'CREATE TABLE IF NOT EXISTS app_settings(id INTEGER PRIMARY KEY AUTOINCREMENT, app_key VARCHAR(100), app_value VARCHAR(100), app_key_status INTEGER DEFAULT 0 )',
              []
            );
          }
        }
      );
    });

  }

  async requestPermission () {
    try {
      const granted = await PermissionsAndroid.request (
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
    } catch (err) {
      console.warn (err);
    }
  }

  checkSilentPeriod(){
    db.transaction (function (txn) {
      txn.executeSql (
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_reality_check'",
        [],
        function (tx, res) {
          if (res.rows.length > 0) {
            tx.executeSql (
              'SELECT * FROM table_reality_check where id=1',
              [],
              (tx, results) => {
                if (results.rows.length > 0) {
                  let notification_status = (JSON.parse (results.rows.item (0).notification_status)) ? true : false;
                  let silent_value = (JSON.parse (results.rows.item (0).silent_status)) ? true : false;
                  let frequency = (JSON.parse (results.rows.item (0).frequency)) ? JSON.parse (results.rows.item (0).frequency) : 0;
                  
                  if(silent_value && notification_status){
                    var currentD = new Date();
                    var currentTimeHH = currentD.getHours();
                    var currentTimeMM = currentD.getMinutes();
                    var currentTime = currentD.setHours(currentTimeHH, currentTimeMM, 0)
                    var startTimeD = new Date(results.rows.item (0).start_time);
                    var endTimeD = new Date(results.rows.item (0).end_time);

                    var startTimeHH = startTimeD.getHours();
                    var startTimeMM = startTimeD.getMinutes();
                    var startTime = currentD.setHours(startTimeHH, startTimeMM, 0);
                    var endTimeHH = endTimeD.getHours();
                    var endTimeMM = endTimeD.getMinutes();
                    var endTime = currentD.setHours(endTimeHH, endTimeMM, 0);

                    //console.log("Current Time: "+currentTime);
                    //console.log("Start Time: "+startTime);
                    //console.log("End Time: "+endTime);

                    var isStart = true;
                    if(currentTime >= startTime){
                      isStart = false;
                    }
                    if(currentTime >= endTime){
                      isStart = true;
                    }

                    if(isStart){
                      this.notif = new NotifService ();
                      this.notif.cancelAll ();
                      this.notif.scheduleNotificationSound (frequency);
                      console.log("Restart Notification");
                    }
                    else{
                      this.notif = new NotifService ();
                      this.notif.cancelAll ();
                      console.log("Cancel Notification");
                    }
                    //console.log("Current Time: "+currentTime);
                    //console.log("Start Time: "+startTime);
                    //console.log("End Time: "+endTime);
                  }
                } 
              }
            );
          }
        }
      );
    });
  }

  DbBackupUpload = async () => {
    //AsyncStorage.setItem ('purchaseReceipt', '1');

    this.setState({loading : false});
    AsyncStorage.getItem ('purchaseReceipt').then (purchaseReceipt => {
      if (purchaseReceipt != null) {
        db.transaction (tx => {
          tx.executeSql (
            'SELECT * FROM app_settings where app_key = ?',
            ['icloud_backup'],
            (tx, results) => {
              if (results.rows.length > 0) {
                for (let i = 0; i < results.rows.length; ++i) {
                  let backupStatus = JSON.parse (
                    results.rows.item (i).app_key_status
                  )
                    ? true
                    : false;
                  if (backupStatus) {

                    if (Platform.OS === 'android') {
                      this.requestPermission ();
                    }

                    AsyncStorage.getItem ('fbAccountId').then (accountId => {
                      if (accountId != null) {
                        this.setState ({userId: accountId}, () =>
                          this.generateDBBackup ()
                        );
                      }
                    });
                  }
                }
              }
            }
          );
        });
      }
    });
  };
  

  componentDidMount () {

    AsyncStorage.getItem ('dbLastBackupDate').then (date => {
      if (date != null) {
        let dbDate = date * 1;
        let todayDate = moment().format('DD/MM/YYYY');
        let dbStoreDate = moment.unix(dbDate).format('DD/MM/YYYY');
        //alert(todayDate);
        if(todayDate != dbStoreDate){
          this.DbBackupUpload ()
        }
      }
      else{
        this.DbBackupUpload ()
      }
    });

    BackgroundFetch.stop ();
    // Configure it.
    BackgroundFetch.configure (
      {
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        enableHeadless: true,
        // Android options
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
        requiresCharging: false, // Default
        requiresDeviceIdle: false, // Default
        requiresBatteryNotLow: false, // Default
        requiresStorageNotLow: false, // Default
      },
      () => {
        console.log ('[js] Received background-fetch event');
        this.checkSilentPeriod();
        BackgroundFetch.finish (BackgroundFetch.FETCH_RESULT_NEW_DATA);
      },
      error => {
        console.log ('[js] RNBackgroundFetch failed to start');
      }
    );

    BackgroundFetch.registerHeadlessTask (this.checkSilentPeriod());

    // Optional: Query the authorization status.
    BackgroundFetch.status (status => {
      switch (status) {
        case BackgroundFetch.STATUS_RESTRICTED:
          console.log ('BackgroundFetch restricted');
          break;
        case BackgroundFetch.STATUS_DENIED:
          console.log ('BackgroundFetch denied');
          break;
        case BackgroundFetch.STATUS_AVAILABLE:
          console.log ('BackgroundFetch is enabled');
          break;
      }
    });
  }

  uploadFile () {
    var uploadUrl = General.API_URL + '/user_db_backup';
    var files = [
      {
        name: 'db_file',
        filename: 'lucidDatabase.db',
        filepath: this.state.targetPath,
      },
      {
        name: 'audio_file',
        filename: 'lucidAudio.zip',
        filepath: this.state.audioFileBakeup,
      },
    ];
    RNFS.uploadFiles ({
      toUrl: uploadUrl,
      files: files,
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      fields: {
        user_id: this.state.userId,
      },
    })
      .promise.then (response => {
        if (response.statusCode == 200) {
          let dbLastBackupDate = moment ().unix () + "";
          AsyncStorage.setItem ('dbLastBackupDate', dbLastBackupDate);
          this.removeFile(this.state.audioFileBakeup);
          // alert(response.body); // response.statusCode, response.headers, response.body
          //alert ('Upload Complete');
        } else {
          //alert ('SERVER ERROR');
        }
      })
      .catch (err => {
        //alert (err);
      });
  }

  generateDBBackup () {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM table_user ORDER BY id DESC",
        [],
        (tx, results) => {
          if(results.rows.length > 0){
            this.zipAudioBackup ();
          }
        }
      );
    });
  }

  zipAudioBackup () {
    const targetPath = this.state.audioFileBakeup;
    const sourcePath = this.state.audioFileStorage;

    zip (sourcePath, targetPath)
      .then (path => {
        this.sqlDBBackup ();
        console.log (`zip completed at ${path}`);
      })
      .catch (error => {
        this.sqlDBBackup ();
        console.log (error);
      });
  }

  sqlDBBackup () {
    if (Platform.OS === 'android') {
      let targetPath = RNFS.ExternalDirectoryPath + '/LocalDatabase/';
      RNFS.exists (targetPath)
        .then (exists => {    
            if (exists) {
            RNFetchBlob.fs.unlink (targetPath).then (() => {
              RNFetchBlob.fs
                .cp (this.getLocalDBBackeUpFilePath (), targetPath)
                .then (() => {
                  this.setState ({targetPath: targetPath}, () => this.uploadFile ());
                });
            }); 
          }
          else{ 
            RNFetchBlob.fs
              .cp (this.getLocalDBBackeUpFilePath (), targetPath)
              .then (() => {
                this.setState ({targetPath: targetPath}, () => this.uploadFile ());
              });
          }
        })
    } else {
      let targetPath = RNFS.LibraryDirectoryPath + '/LocalDatabase/' + 'lucidDatabase.db';
      this.setState ({targetPath: targetPath}, () => this.uploadFile ());
    }
  }

  getLocalDBBackeUpFilePath () {
    if (Platform.OS === 'android') {
      return '/data/data/com.lucidjournal/databases/lucidDatabase.db';
    } else {
      return RNFS.LibraryDirectoryPath + '/LocalDatabase/' + 'lucidDatabase.db';
    }
  }

  getAudioBackUpFilePath () {
    if (Platform.OS === 'android') {
      return `${DocumentDirectoryPath}/lucidAudio.zip`;
    } else {
      return `${DocumentDirectoryPath}/lucidAudio.zip`;
    }
  }

  createAudioDir () {
    let filePath = AudioUtils.DocumentDirectoryPath + '/lucid_audio/';
    return new Promise (function (resolve, reject) {
      RNFS.exists (filePath)
        .then (exists => {
          if (!exists) {
            RNFS.mkdir (filePath)
              .then (() => resolve (filePath))
              .catch (error => reject (error));
          } else {
            resolve (filePath);
          }
        })
        .catch (error => reject (error));
    });
  }

  removeFile (filepath) {
    RNFS.exists (filepath)
      .then (result => {
        if (result) {
          return (
            RNFS.unlink (filepath)
              .then (() => {
              })
              .catch (err => {
              })
          );
        }
      })
      .catch (err => {
      });
  }

  render () {
    return <AppContainer />;
  }
}
