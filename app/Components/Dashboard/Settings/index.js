import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  AsyncStorage,
  PermissionsAndroid,
} from 'react-native';

import theme from '../../../Theme';
import Loader from '../../Loader';
import styles from './style';
import {Static_Images, General} from '../../../Constants';
import Switch from 'react-native-switch-pro';
import {withNavigation} from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
var Mailer = require ('NativeModules').RNMail;
import Rate, {AndroidMarket} from 'react-native-rate';

import * as RNIap from 'react-native-iap';

var FBLoginButton = require ('./FBLoginButton');
import renderIf from './FBLoginButton/renderif';
import {AudioUtils} from 'react-native-audio';
import moment from 'moment';
import {db} from '../../../Config';

var RNFS = require ('react-native-fs');
import RNFetchBlob from 'react-native-fetch-blob';
import { DocumentDirectoryPath } from 'react-native-fs'
import { unzip } from 'react-native-zip-archive';

const itemSubs = Platform.select ({
  ios: [General.IOS_SUBSCRIPTION_NAME],
  android: [General.GOOGLE_SUBSCRIPTION_NAME],
});

class Settings extends Component {
  constructor (props) {
    super (props);
    this.state = {
      loading: false,
      journalEntries: 'journal entries',
      longestStreak: 'longest streak',
      lucidDreams: 'lucid dreams',
      passcodeValue: false,
      icloudValue: false,
      totalUser: 0,
      lucidCount: 0,
      longestStreakCount: 0,
      rated: false,
      isProUser: false,
      userId: '',
      audioFileStorage: AudioUtils.DocumentDirectoryPath + '/lucid_audio',
      //isProUser: true,
      // FlatListItems:[],
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

    this.checkAppSettings ();

    AsyncStorage.getItem ('dbLastBackupDate').then (date => {
      if (date != null) {
        //alert(moment.unix(date).format('DD/MM/YYYY hh:mm'));
      }
    });
  }

  checkAppSettings () {
    if (this.state.isProUser) {
      this.getSettingData ('passcode', 'passcodeValue', true);
      this.getSettingData ('icloud_backup', 'icloudValue', true);
    }
  }

  getSettingData (key, state, type = false) {
    db.transaction (tx => {
      tx.executeSql (
        'SELECT * FROM app_settings where app_key = ?',
        [key],
        (tx, results) => {
          if (results.rows.length > 0) {
            for (let i = 0; i < results.rows.length; ++i) {
              if (type) {
                this.setState ({
                  [state]: JSON.parse (results.rows.item (i).app_key_status)
                    ? true
                    : false,
                });
              }
            }
          }
        }
      );
    });
  }

  changeSetting (key, state, value) {
    this.setState ({
      [state]: value,
    });

    db.transaction (tx => {
      tx.executeSql (
        'SELECT * FROM app_settings where app_key = ?',
        [key],
        (tx, results) => {
          if (results.rows.length > 0) {
            db.transaction (tx => {
              tx.executeSql (
                'UPDATE app_settings set app_key_status=? where app_key=?',
                [value, key],
                (tx, results) => {}
              );
            });
          } else {
            db.transaction (tx => {
              tx.executeSql (
                'INSERT INTO app_settings (app_key, app_value, app_key_status) VALUES (?, ?, ?)',
                [key, '', value],
                (tx, results) => {}
              );
            });
          }
        }
      );
    });
  }

  onSelect = data => {
    this.setState (data);
  };

  async componentDidMount () {
    try {
      const result = await RNIap.initConnection ();

      AsyncStorage.getItem ('purchaseReceipt').then (purchaseReceipt => {
        if (purchaseReceipt != null) {
          this.setState ({
            isProUser: true,
          });
          this.getSettingData ('passcode', 'passcodeValue', true);
          this.getSettingData ('icloud_backup', 'icloudValue', true);
          this.checkSubscription ();
        }
      });

      /*
      const isValidPurchase = await this.isSubscriptionActive();
      if(isValidPurchase){
        //alert("Valid Subscription");
        if(!this.state.isProUser){
          this.restoreSubscription(false);
        }
      }
      else{
        //alert("NOT Valid Subscription");
        AsyncStorage.removeItem("purchaseReceipt");
        this.setState ({
          isProUser: false,
        });
      } 
      */
    } catch (err) {
      AsyncStorage.removeItem ('purchaseReceipt');
      this.setState ({
        isProUser: false,
      });
      this.changeSetting ('passcode', 'passcodeValue', false);
      this.changeSetting ('icloud_backup', 'icloudValue', false);
      console.warn (err.code, err.message);
    }
  }

  async checkSubscription () {
    const isValidPurchase = await this.isSubscriptionActive ();
    if (!isValidPurchase) {
      AsyncStorage.removeItem ('purchaseReceipt');
      this.setState ({
        isProUser: false,
      });
      this.changeSetting ('passcode', 'passcodeValue', false);
      this.changeSetting ('icloud_backup', 'icloudValue', false);
    }
  }

  componentWillMount () {
    db.transaction (tx => {
      tx.executeSql (
        'SELECT COUNT(id) as total FROM table_user',
        [],
        (tx, results) => {
          var temp;
          for (let i = 0; i < results.rows.length; ++i) {
            temp = JSON.parse (results.rows.item (i).total);
          }
          // alert(temp);
          this.setState ({
            totalUser: temp,
          });
        }
      );
    });

    db.transaction (tx => {
      tx.executeSql (
        "SELECT COUNT(type) as lucidCount FROM table_user where type='lucid'",
        [],
        (tx, results) => {
          var tempCount;
          for (let i = 0; i < results.rows.length; ++i) {
            tempCount = JSON.parse (results.rows.item (i).lucidCount);
          }
          //alert(tempCount);
          this.setState ({
            lucidCount: tempCount,
          });
        }
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        "SELECT date FROM table_user GROUP BY date ORDER BY date ASC",
        [],
        (tx, results) => {
          var nextDate = "";
          var maxStreak = 0;
          var dayCount = 0;
          for (let i = 0; i < results.rows.length; ++i) {
            date = results.rows.item(i).date;
            if (date === nextDate) {
              dayCount++;
            }
            else {
              dayCount = 0;
            }
            nextDate = moment(date, "YYYY-MM-DD").add('days', 1).format('YYYY-MM-DD').toString();
            if(dayCount > maxStreak) {
              maxStreak = dayCount;
            }
          }
          this.setState({
            longestStreakCount: maxStreak
          });
        }
      );
    });
  }

  componentWillUnmount () {
    RNIap.endConnection ();
  }

  handleEmail = () => {
    Mailer.mail (
      {
        subject: '',
        recipients: ['supportlucid@yopmail.com'],
        isHTML: true,
      },
      (error, event) => {
        Alert.alert (
          error,
          event,
          [
            {
              text: 'Ok',
              onPress: () => console.log ('OK: Email Error Response'),
            },
            {
              text: 'Cancel',
              onPress: () => console.log ('CANCEL: Email Error Response'),
            },
          ],
          {cancelable: true}
        );
      }
    );
  };

  isSubscriptionActive = async () => {
    try {
      if (Platform.OS === 'ios') {
        const availablePurchases = await RNIap.getAvailablePurchases ();
        if (availablePurchases && availablePurchases.length > 0) {
          const sortedAvailablePurchases = availablePurchases.sort (
            (a, b) => b.transactionDate - a.transactionDate
          );
          const latestAvailableReceipt =
            sortedAvailablePurchases[0].transactionReceipt;

          const isTestEnvironment = General.isTestEnvironment;
          const decodedReceipt = await RNIap.validateReceiptIos (
            {
              'receipt-data': latestAvailableReceipt,
              password: General.ITUNES_CONNECT_SHARED_SECRET,
            },
            isTestEnvironment
          );
          const {latest_receipt_info: latestReceiptInfo} = decodedReceipt;
          const isSubValid = !!latestReceiptInfo.find (receipt => {
            const expirationInMilliseconds = Number (receipt.expires_date_ms);
            const nowInMilliseconds = Date.now ();
            return expirationInMilliseconds > nowInMilliseconds;
          });
          return isSubValid;
        } else {
          return false;
        }
      }

      if (Platform.OS === 'android') {
        // When an active subscription expires, it does not show up in
        // available purchases anymore, therefore we can use the length
        // of the availablePurchases array to determine whether or not
        // they have an active subscription.
        const availablePurchases = await RNIap.getAvailablePurchases ();

        for (let i = 0; i < availablePurchases.length; i++) {
          if (itemSubs.includes (availablePurchases[i].productId)) {
            return true;
          }
        }
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  restoreSubscription = async (isDisplay = true) => {
    try {
      this.setState ({loading: true});
      const isValidPurchase = await this.isSubscriptionActive ();
      if (isValidPurchase) {
        this.setState ({
          loading: false,
          isProUser: true,
        });
        if (isDisplay) {
          setTimeout (() => {
            Alert.alert (
              'Restore Successful',
              'You successfully restored the purchases.'
            );
          }, 1000);
        }

        const purchases = await RNIap.getAvailablePurchases ();
        if (purchases && purchases.length > 0) {
          purchases.forEach (purchase => {
            if (purchase.productId == itemSubs) {
              AsyncStorage.setItem (
                'purchaseReceipt',
                JSON.stringify (purchase)
              );
            }
          });
        }
      } else {
        this.setState ({loading: false});
        if (isDisplay) {
          setTimeout (() => {
            Alert.alert ('Error!', 'No active subscription found!');
          }, 1000);
        }
      }
    } catch (err) {
      this.setState ({loading: false});
      if (isDisplay) {
        setTimeout (() => {
          Alert.alert (err.message);
        }, 1000);
      }
    }
  };

  restoreBackup () {
    AsyncStorage.getItem ('fbAccountId').then (accountId => {
      if (accountId == null && !this.state.icloudValue) {
        alert ('Please connect your facebook account to restore backup!');
      } else {
        Alert.alert (
          'Backup Restore',
          'Are you sure to restore backup?',
          [
            {
              text: 'Cancel',
            },
            {
              text: 'Ok',
              onPress: () =>
                this.setState ({userId: accountId}, () =>
                  this.downloadDBBackeup ()
                ),
            },
          ],
          {cancelable: true}
        );
      }
    });
  }

  downloadDBBackeup () {
    this.setState ({loading: true});
    let dbBackupFile;
    let audioBackupFile;
    var getDbUrl = General.API_URL + '/user_db_restore';
    const data = new FormData ();
    data.append ('user_id', this.state.userId);

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
     
        let errorCode = 0;
        if (rowData.meta.status == 0) {
          errorCode++;
        } else {
          dbBackupFile = rowData.data.db_file;
          audioBackupFile = rowData.data.audio_file;
        }
        if (errorCode == 0 && rowData.meta.status == 1) {
          if (dbBackupFile != "") {
           
            RNFetchBlob.config ({
              path: this.getLocalDBBackeUpFilePath (),
            })
              .fetch ('GET', dbBackupFile, {})
              .then (res => {
                //alert(JSON.stringify(res));
                //console.log('DB Download Completel');
              })
              .catch (error => {});
          }
          if (audioBackupFile != "") {
            //console.log("Audio downloading....");
            RNFetchBlob.config ({
              path: this.getAudioRestoreFilePath (),
            })
              .fetch ('GET', audioBackupFile, {})
              .then (res => { 
                //console.log('Audio Download Completel');
                const sourcePath = this.getAudioRestoreFilePath ();
                const targetPath = this.state.audioFileStorage;

                unzip (sourcePath, targetPath)
                  .then (path => {
                    this.setState ({loading: false}, () => {
                      this.deleteFile (sourcePath);
                      alert ('Backup Restore successfully!');
                    });
                  })
                  .catch (error => {
                    this.setState ({loading: false});
                    console.log (error); 
                  });
              })
              .catch (error => {
                this.setState ({loading: false});
                console.log (error); 
              });
          }

        } else {
          this.setState ({loading: false}, () => {
            alert ('No Backup found!');
          });
        }
      })
      .catch (error => {
        //alert ('Error:' + JSON.stringify (error));
      });
  }

  getLocalDBBackeUpFilePath () {
    if (Platform.OS === 'android') {
      return '/data/data/com.lucidjournal/databases/lucidDatabase.db';
    } else {
      return RNFS.LibraryDirectoryPath + '/LocalDatabase/' + 'lucidDatabase.db';
    }
  }

  getAudioRestoreFilePath () {
    if (Platform.OS === 'android') {
      return `${DocumentDirectoryPath}/lucidAudioBackup.zip`;
    } else {
      return `${DocumentDirectoryPath}/lucidAudioBackup.zip`;
    }
  }


  deleteFile(filepath){
    RNFS.exists(filepath)
    .then( (result) => {
      if(result){
        return RNFS.unlink(filepath)
          .then(() => {
            console.log('FILE DELETED');
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
    .catch((err) => {
      console.log(err.message);
    }); 
  }

  async requestPermission (callback) {
    try {
      const granted = await PermissionsAndroid.request (
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        callback (true, value =>
          this.changeSetting ('icloud_backup', 'icloudValue', value)
        );
      } else {
        alert ('Please allow Storage Permission to generate backup!');
      }
    } catch (err) {
      alert (JSON.stringify (err));
    }
  }

  render () {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Loader loading={this.state.loading} />

        <View style={{paddingTop: Platform.OS === 'ios' ? 25 : '10%'}}>
          <View style={{paddingHorizontal: '5%'}}>
            <View style={styles.firstViewContainer}>
              <View />
              <View>
                <Text style={styles.headerText}>Settings</Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.headerText,
                    {fontFamily: theme.FONT_NORMAL, opacity: 0.6},
                  ]}
                >
                  {/* Edit */}
                </Text>
              </View>
            </View>

            <View style={styles.secondViewContainer}>
              <View>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.numberText}>{this.state.totalUser}</Text>
                  <Text style={styles.stateText}>
                    {this.state.journalEntries}
                  </Text>
                </View>
              </View>

              <View>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.numberText}>{this.state.longestStreakCount}</Text>
                  <Text style={styles.stateText}>
                    {this.state.longestStreak}
                  </Text>
                </View>
              </View>

              <View>
                <View style={{alignItems: 'center'}}>
                  <Text style={styles.numberText}>{this.state.lucidCount}</Text>
                  <Text style={styles.stateText}>{this.state.lucidDreams}</Text>
                </View>
              </View>
            </View>

            {renderIf (!this.state.isProUser) (
              <View style={styles.thirdViewContainer}>
                <View style={styles.rowViewContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Image
                      source={Static_Images.image_plus}
                      style={styles.plusImage}
                    />
                    <Text style={styles.rowTexts}>Unlock full stats</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Image
                      source={Static_Images.image_plus}
                      style={styles.plusImage}
                    />
                    <Text style={styles.rowTexts}>Enable passcode</Text>
                  </View>
                </View>

                <View style={styles.rowViewContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Image
                      source={Static_Images.image_plus}
                      style={styles.plusImage}
                    />
                    <Text style={styles.rowTexts}>Remove ads</Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Image
                      source={Static_Images.image_plus}
                      style={styles.plusImage}
                    />
                    <Text style={styles.rowTexts}>iCloud backups</Text>
                  </View>
                </View>
              </View>
            )}

            {renderIf (!this.state.isProUser) (
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate ('LucidPremium', {
                      isGoback: true,
                      onSelect: this.onSelect,
                    })}
                >
                  <LinearGradient
                    colors={['#817DE8', '#9E68F0']}
                    style={styles.button}
                  >
                    <Text style={styles.text}>Go Lucid Pro</Text>
                    <Image
                      source={Static_Images.image_go_pro}
                      style={{width: 26, height: 26, marginStart: 5}}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {renderIf (this.state.isProUser) (
              <View style={{marginTop: 10}}>
                <FBLoginButton />
              </View>
            )}
          </View>

          <View
            style={{
              backgroundColor: this.state.isProUser ? 'transparent' : '#5c3bb3',
              paddingLeft: '5%',
              paddingTop: '6%',
              opacity: this.state.isProUser ? 1 : 0.5,
            }}
          >
            <View style={styles.listingViewContainer}>
              <View>
                <Text
                  style={[
                    styles.listingText,
                    this.state.isProUser ? 'opacity: 1' : 'opacity: 0.5',
                  ]}
                >
                  Passcode
                </Text>
              </View>

              <View style={{padding: '3%'}}>
                <Switch
                  disabled={!this.state.isProUser ? true : false}
                  width={58}
                  height={32}
                  style={{
                    borderColor: theme.PRIMARY_COLOR,
                    borderWidth: 1,
                  }}
                  circleStyle={{
                    height: 25,
                    width: 25,
                    margin: 2,
                  }}
                  backgroundInactive="transparent"
                  backgroundActive="transparent"
                  circleColorActive="#7d66be"
                  circleColorInactive="white"
                  value={this.state.passcodeValue}
                  onAsyncPress={callback => {
                    callback (true, value =>
                      this.changeSetting ('passcode', 'passcodeValue', value)
                    );
                  }}
                />
              </View>
            </View>

            <View style={styles.listingViewContainer}>
              <View>
                <Text
                  style={[
                    styles.listingText,
                    this.state.isProUser ? 'opacity: 1' : 'opacity: 0.5',
                  ]}
                >
                  iCloud backups
                </Text>
              </View>

              <View style={{padding: '3%'}}>
                <Switch
                  disabled={!this.state.isProUser ? true : false}
                  width={58}
                  height={32}
                  style={{
                    borderColor: theme.PRIMARY_COLOR,
                    borderWidth: 1,
                  }}
                  circleStyle={{
                    height: 25,
                    width: 25,
                    margin: 2,
                  }}
                  backgroundInactive="transparent"
                  backgroundActive="transparent"
                  circleColorActive="#7d66be"
                  circleColorInactive="white"
                  value={this.state.icloudValue}
                  onAsyncPress={callback => {
                    AsyncStorage.getItem ('fbAccountId').then (accountId => {
                      if (accountId == null && !this.state.icloudValue) {
                        alert (
                          'Please connect your facebook account first to enable backup!'
                        );
                        callback (false);
                      } else {
                        if (Platform.OS === 'android') {
                          this.requestPermission (callback);
                        } else {
                          callback (true, value =>
                            this.changeSetting (
                              'icloud_backup',
                              'icloudValue',
                              value
                            )
                          );
                        }
                      }
                    });
                  }}
                />
              </View>
            </View>
          </View>

          <View style={{paddingLeft: '5%', paddingBottom: '30%'}}>
            {renderIf (!this.state.isProUser) (
              <TouchableOpacity onPress={() => this.restoreSubscription ()}>
                <View
                  style={[styles.listingViewContainer, {borderTopWidth: 0}]}
                >
                  <View>
                    <Text style={styles.listingText}>Restore subscription</Text>
                  </View>

                  <View style={{padding: '5%'}}>
                    <Image
                      source={Static_Images.image_right_arrow}
                      style={styles.rightArrowImage}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {renderIf (this.state.isProUser) (
              <TouchableOpacity onPress={() => this.restoreBackup ()}>
                <View
                  style={[styles.listingViewContainer, {borderTopWidth: 0}]}
                >
                  <View>
                    <Text style={styles.listingText}>Restore Backup</Text>
                  </View>

                  <View style={{padding: '5%'}}>
                    <Image
                      source={Static_Images.image_right_arrow}
                      style={styles.rightArrowImage}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.listingViewContainer}>
              <View>
                <Text style={styles.listingText}>Notifications</Text>
              </View>

              <View style={{padding: '5%'}}>
                <Image
                  source={Static_Images.image_right_arrow}
                  style={styles.rightArrowImage}
                />
              </View>
            </View>

            <TouchableOpacity
              // onPress={() =>
              //   this.props.navigation.navigate("TermsConditions")
              // }
              onPress={() => {
                let options = {
                  AppleAppID: '1444037970',
                  GooglePackageName: 'com.lucidjournal',
                  // AmazonPackageName:"com.mywebsite.myapp",
                  // OtherAndroidURL:"http://www.randomappstore.com/app/47172391",
                  preferredAndroidMarket: AndroidMarket.Google,
                  preferInApp: false,
                  openAppStoreIfInAppFails: true,
                  // fallbackPlatformURL:"http://www.mywebsite.com/myapp.html",
                };
                Rate.rate (options, success => {
                  if (success) {
                    // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
                    this.setState ({rated: true});
                  }
                });
              }}
            >
              <View style={styles.listingViewContainer}>
                <View>
                  <Text style={styles.listingText}>Rate this app</Text>
                </View>

                <View style={{padding: '5%'}}>
                  <Image
                    source={Static_Images.image_right_arrow}
                    style={styles.rightArrowImage}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              // onPress={() =>
              //   this.props.navigation.navigate("TermsConditions")
              // }
              onPress={this.handleEmail}
            >
              <View style={styles.listingViewContainer}>
                <View>
                  <Text style={styles.listingText}>Support</Text>
                </View>

                <View style={{padding: '5%'}}>
                  <Image
                    source={Static_Images.image_right_arrow}
                    style={styles.rightArrowImage}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate ('TermsConditions')}
            >
              <View style={styles.listingViewContainer}>
                <View>
                  <Text style={styles.listingText}>Terms & Conditions</Text>
                </View>

                <View style={{padding: '5%'}}>
                  <Image
                    source={Static_Images.image_right_arrow}
                    style={styles.rightArrowImage}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate ('PrivacyPolicy')}
            >
              <View style={styles.listingViewContainer}>
                <View>
                  <Text style={styles.listingText}>Privacy policy</Text>
                </View>

                <View style={{padding: '5%'}}>
                  <Image
                    source={Static_Images.image_right_arrow}
                    style={styles.rightArrowImage}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default withNavigation (Settings);
