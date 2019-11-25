import React, {Component} from 'react';
import {View, Text, Platform, TouchableOpacity, PermissionsAndroid} from 'react-native';
var RNFS = require ('react-native-fs');
import RNFetchBlob from 'react-native-fetch-blob';
import { zip, unzip } from 'react-native-zip-archive';
import { AudioUtils } from "react-native-audio";
import { DocumentDirectoryPath } from 'react-native-fs'
import { General } from "../../../../Constants";

export default class Tab2 extends Component {
  constructor (props) {
    super (props);
    this.state = {
      targetPath: '',
      audioFileStorage: AudioUtils.DocumentDirectoryPath + "/lucid_audio",
      audioFileBakeup: this.getAudioBackUpFilePath()
    };

    console.log(this.state.audioFileStorage);
    console.log(this.state.audioFileBakeup);

    if(Platform.OS === "android"){
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render () {
    return (
      <View>
        <TouchableOpacity onPress={() => this.downloadFile ()}>
          <Text>DOWNLOAD</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{marginTop: 30}}
          onPress={() => this.uploadDBBackup ()}
        >
          <Text>UPLOAD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginTop: 30}}
          onPress={() => this.zipAudioBackup ()}
        >
          <Text>ZIP File</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginTop: 30}}
          onPress={() => this.deleteFile (this.getLocalDBBackeUpFilePath())}
        >
          <Text>Delete DB</Text>
        </TouchableOpacity>
      </View>
    );
  }

  deleteFile(filepath){
    RNFS.exists(filepath)
    .then( (result) => {
        console.log("file exists: ", result);

        if(result){
          return RNFS.unlink(filepath)
            .then(() => {
              console.log('FILE DELETED');
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch((err) => {
              console.log(err.message);
            });
        }

      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  zipAudioBackup(){
    const targetPath = this.state.audioFileBakeup;
    const sourcePath = this.state.audioFileStorage;
    
    zip(sourcePath, targetPath)
    .then((path) => {
      console.log(`zip completed at ${path}`)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  downloadFile () {
    //var getDbUrl = General.API_URL+'/user_db_restore';
    var getDbUrl = General.LOCAL_API_URL+'/user_db_restore';
    const data = new FormData ();
    data.append ('user_id', '123456');

    fetch (getDbUrl, {
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
        let rowData = JSON.parse (responseJson);
        let dbBackupFile = rowData.data.db_file;
        alert(dbBackupFile);
        let audioBackupFile = rowData.data.audio_file;
          RNFetchBlob.config ({
            path: this.getLocalDBBackeUpFilePath (),
          })
          .fetch ('GET', dbBackupFile, {})
          .then (res => {
            //alert(JSON.stringify(res));
            //alert ('DB Download Completel');
          })
          .catch (error => {
          });


          RNFetchBlob.config ({
            path: this.getAudioRestoreFilePath (),
          })
          .fetch ('GET', audioBackupFile, {})
          .then (res => {
            //alert(JSON.stringify(res));
            //alert ('Audio Download Completel');
            const sourcePath = this.getAudioRestoreFilePath ();
            const targetPath = this.state.audioFileStorage;

            unzip(sourcePath, targetPath)
            .then((path) => {
              this.deleteFile(sourcePath);
              //RNRestart.Restart();
              console.log(`unzip completed at ${path}`)
            })
            .catch((error) => {
              console.log(error)
            })

          })

      })
      .catch (error => {
        //alert ('Error:' + JSON.stringify (error));
      });
  }

  uploadFile () {
    var uploadUrl = General.API_URL+'/createuser';
    var files = [
      {
        name: 'file',
        filename: 'lucidDatabase.db',
        filepath: this.state.targetPath
      }
    ]; 
    RNFS.uploadFiles({
      toUrl: uploadUrl,
      files: files,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      fields: {
        'user_id': '426077181314114',
      }
    }).promise.then((response) => {
        if (response.statusCode == 200) {
          alert(response.body); // response.statusCode, response.headers, response.body
          //alert('Upload Complete');
        } else {
          alert('SERVER ERROR');
        }
      })
      .catch((err) => {
        if(err.description === "cancelled") {
          // cancelled by user
        }
        alert(err);
      });
  }

  uploadDBBackup () {
    if (Platform.OS === 'android') {
      let targetPath = RNFS.ExternalDirectoryPath + '/LocalDatabase/';
      RNFetchBlob.fs.unlink(targetPath)
      .then(() => { 
        RNFetchBlob.fs.cp(this.getLocalDBBackeUpFilePath(), targetPath)
        .then(() => {
          this.setState ({targetPath: targetPath}, () =>
            this.uploadFile()
          );
        })
      })
    } else {
      let targetPath = RNFS.LibraryDirectoryPath + '/LocalDatabase/' + 'lucidDatabase.db';
      this.setState ({targetPath: targetPath}, () =>
        this.uploadFile()
      );
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


  getAudioRestoreFilePath () {
    if (Platform.OS === 'android') {
      return `${DocumentDirectoryPath}/lucidAudioBackup.zip`;
    } else {
      return `${DocumentDirectoryPath}/lucidAudioBackup.zip`;
    }
  }
}
