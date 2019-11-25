import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  NativeModules,
  Dimensions,
} from 'react-native';
import Switch from 'react-native-switch-pro';
import {Slider} from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import theme from '../../../Theme';
import {Static_Images} from '../../../Constants';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker';
import appConfig from './app.json';
import NotifService from './NotifService';

// import {openDatabase} from 'react-native-sqlite-storage';
// var db = openDatabase ({name: 'UserDatabase.db'});
import {db} from '../../../Config';

const Screenwidth = Dimensions.get ('window').width;

export default class RealityCheck extends Component {
  constructor (props) {
    super (props);
    this.state = {
      frequency: 0,
      minDistance: 0,
      maxDistance: 4,

      notification_value: false,
      silent_value: false,

      rangeLow: '',
      rangeHigh: '',

      isStartingTimePickerVisible: false,
      isEndingTimePickerVisible: false,
      selectedStartingTime: '',
      selectedEndingTime: '',
      selectedStartTime: '',
      selectedEndTime: '',

      reality_check_text: "Analyzing your dreams is a great way to gain better self-knowledge, but the benefits of dream journaling don't stop there.",
      tick1: 'Get better at problem solving',
      tick2: 'Overcome anxiety and reduce stress',
      tick3: 'Be more creative',

      fileUri: '',
      fileType: '',
      fileName: '',
      fileSize: '',
      isNotificationSet: false,
      databaseItems: [],
    };

    this.notif = new NotifService ();

    //Sqlite database table creation
    db.transaction (function (txn) {
      txn.executeSql (
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_reality_check'",
        [],
        function (tx, res) {
          //txn.executeSql ('DROP TABLE IF EXISTS table_reality_check', []);
          if (res.rows.length == 0) {
            txn.executeSql ('DROP TABLE IF EXISTS table_reality_check', []);
            txn.executeSql (
              'CREATE TABLE IF NOT EXISTS table_reality_check(id INTEGER PRIMARY KEY AUTOINCREMENT, frequency INT(5), start_time VARCHAR(100), end_time VARCHAR(100), notification_status INTEGER DEFAULT 0,silent_status INTEGER DEFAULT 0 )',
              []
            );
          }
        }
      );
    });

    this.notificationStatusOn ();
  }

  notificationStatusOn () {
    db.transaction (tx => {
      tx.executeSql (
        'SELECT * FROM table_reality_check where id=1',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            this.setState ({isNotificationSet: true});

            for (let i = 0; i < results.rows.length; ++i) {
              this.setState ({
                frequency: JSON.parse (results.rows.item (i).frequency),
              });

              this.setState ({
                selectedStartingTime: this.formatTime(results.rows.item (i).start_time),
                selectedStartTime: results.rows.item (i).start_time,
              });

              this.setState ({
                selectedEndingTime: this.formatTime(results.rows.item (i).end_time),
                selectedEndTime: results.rows.item (i).end_time,
              });

              this.setState ({
                notification_value: (JSON.parse (results.rows.item (i).notification_status)) ? true : false,
              });

              this.setState ({
                silent_value: (JSON.parse (results.rows.item (i).silent_status)) ? true : false,
              });
            }
          } else {
            //this.setState ({isNotificationSet: 0});
            this.setState ({
              notification_value: false,
            });
          }
        }
      );
    });
  }

  notificationStatusOff () {
    db.transaction (tx => {
      tx.executeSql (
        'UPDATE table_reality_check set notification_status=? where id=1',
        [false],
        (tx, results) => {}
      );
    });
  }

  componentDidMount = () => {
    let self = this;

    var hours = new Date ().getHours (); //Current Hours
    var minutes = new Date ().getMinutes (); //Current Minutes
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var startTime = new Date('2019', '01', '01', '24').toString();
    var endTime = new Date('2019', '01', '02', '08').toString();
    
    self.setState ({
      selectedStartingTime: '12:00 AM',
      selectedEndingTime: '08:00 AM',
      selectedStartTime: startTime,
      selectedEndTime: endTime
    });
  };

  showStartingTimePicker = () => {
    this.setState ({isStartingTimePickerVisible: true});
  };

  showEndingTimePicker = () => {
    this.setState ({isEndingTimePickerVisible: true});
  };

  hideTimePicker = () => {
    this.setState ({
      isStartingTimePickerVisible: false,
      isEndingTimePickerVisible: false,
    });
  };

  formatTime(date){
    var dateTime = new Date(date);
    var hours = dateTime.getHours ();
    var minutes = dateTime.getMinutes ();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  handleTimePicked = date => {
    this.hideTimePicker ();
    var hours = date.getHours ();
    var minutes = date.getMinutes ();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    var startTime = date.toString();
    this.setState({ selectedStartTime: startTime, selectedStartingTime: strTime }, () => this._save());
  };

  handleEndingTimePicked = date => {
    this.hideTimePicker ();
    var hours = date.getHours ();
    var minutes = date.getMinutes ();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    var endTime = date.toString();
    this.setState({ selectedEndTime: endTime, selectedEndingTime: strTime }, () => this._save());
  };

  //Opening Document Picker
  handleChange () {
    DocumentPicker.show (
      {
        filetype: [DocumentPickerUtil.audio ()],
      },
      (error, res) => {
        if (res == null) {
          alert ('no file selected');
        } else {
          this.setState ({fileUri: res.uri});
          this.setState ({fileType: res.type});
          this.setState ({fileName: res.fileName});
          this.setState ({fileSize: res.fileSize});
        }
      }
    );
  }

  _save () {
    this.notif.configure ();

    const {frequency} = this.state;
    this.notif.cancelAll ();
    this.notif.scheduleNotificationSound (frequency);
    //const { notification_value } = this.state;
    const {selectedStartTime} = this.state;
    const {selectedEndTime} = this.state;
    const {silent_value} = this.state;

    //sqlite database table insertion
    if (this.state.isNotificationSet) {
      db.transaction (tx => {
        tx.executeSql (
          'UPDATE table_reality_check set frequency=?, notification_status=?, silent_status=?, start_time=?, end_time=? where id=1',
          [
            frequency,
            true,
            silent_value,
            selectedStartTime,
            selectedEndTime,
          ],
          (tx, results) => {}
        );
      });
    } else {

      this.setState ({isNotificationSet: true});

      db.transaction (function (tx) {
        tx.executeSql (
          'INSERT INTO table_reality_check (frequency, start_time, end_time, notification_status, silent_status) VALUES (?,?,?,?,?)',
          [
            frequency,
            selectedStartTime,
            selectedEndTime,
            true,
            silent_value,
          ],
          (tx, results) => {
            console.log ('Results', results.rowsAffected);
            if (results.rowsAffected > 0) {
              Alert.alert (
                'Success',
                'Done',
                [
                  {
                    text: 'Ok',
                    // onPress: () =>
                    // that.props.navigation.navigate ('HomeScreen'),
                  },
                ],
                {cancelable: false}
              );
            } else {
              alert ('Failed');
            }
          }
        );
      });
    }
  }

  render () {
    const {
      isEndingTimePickerVisible,
      isStartingTimePickerVisible,
      selectedStartingTime,
      selectedEndingTime
    } = this.state;
    return (
      <ImageBackground
        source={Static_Images.image_reality_check}
        style={styles.img_bg}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{flex: 1, paddingTop: '70%', paddingBottom: '20%'}}>
            <View style={{padding: '5%'}}>
              <View>
                <Text style={styles.text_title}> Reality Check </Text>
                <Text style={styles.text_desc}>
                  {this.state.reality_check_text}
                </Text>
              </View>

              <View>
                <View style={{flexDirection: 'row', marginVertical: 10}}>
                  <Image
                    source={Static_Images.image_tick_circle}
                    style={{width: 24, height: 24}}
                  />
                  <Text style={styles.tick_circle_text}>
                    {this.state.tick1}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 10}}>
                  <Image
                    source={Static_Images.image_tick_circle}
                    style={{width: 24, height: 24}}
                  />
                  <Text style={styles.tick_circle_text}>
                    {this.state.tick2}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 10}}>
                  <Image
                    source={Static_Images.image_tick_circle}
                    style={{width: 24, height: 24}}
                  />
                  <Text style={styles.tick_circle_text}>
                    {this.state.tick3}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                marginTop: Platform.OS === 'ios' ? 50 : '1%',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  borderTopWidth: 1,
                  borderColor: theme.PRIMARY_COLOR,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginStart: '5%',
                }}
              >
                <View>
                  <Text
                    style={[
                      styles.tick_circle_text,
                      {fontFamily: theme.FONT_MEDIUM, marginLeft: 0},
                    ]}
                  >
                    Reality check notifications
                  </Text>
                </View>
                <View style={{padding: '5%'}}>
                  <Switch
                    width={58}
                    height={32}
                    style={{
                      borderColor: theme.PRIMARY_COLOR,
                      borderWidth: 1,
                      opacity: 0.8,
                    }}
                    circleStyle={{
                      height: 25,
                      width: 25,
                      margin: 2,
                    }}
                    backgroundInactive="transparent"
                    backgroundActive="transparent"
                    circleColorActive="#817DE8"
                    value={this.state.notification_value}
                    onAsyncPress={callback => {
                      callback (true, value => {
                        if (value) {
                          this.setState ({
                            notification_value: value,
                          });
                          this._save ();
                        } else {
                          this.notif.cancelAll ();
                          this.setState ({
                            notification_value: value,
                          });
                          this.notificationStatusOff ();
                        }
                      });
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: theme.PRIMARY_COLOR,
                  flexDirection: 'row',
                }}
              />

              {this.state.notification_value == true
                ? <View
                    style={{
                      height: '100%',
                      paddingStart: '5%',
                      backgroundColor: '#4e38a8',
                    }}
                  >
                    {/* <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      marginEnd: "5%",
                      marginTop: "5%"
                    }}
                    onPress={() => this._save(this.state.frequency)}
                  >
                    <View>
                      <Image
                        source={Static_Images.image_not_lucid}
                        style={{ height: 18, width: 18, marginEnd: 5 }}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        fontFamily: theme.FONT_MEDIUM,
                        fontSize: 14
                      }}
                    >
                      Save
                    </Text>
                  </TouchableOpacity> */}

                    <Text style={styles.hiddentexts}>Frequency</Text>
                    <View
                      style={{
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        marginEnd: '5%',
                        paddingBottom: '5%',
                      }}
                    >
                      <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 1}}>
                          <Text
                            style={{
                              color: 'white',
                              opacity: 0.5,
                              fontFamily: theme.FONT_MEDIUM,
                              fontSize: 12,
                            }}
                          >
                            Rarely
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: 'white',
                              opacity: 0.5,
                              fontFamily: theme.FONT_MEDIUM,
                              fontSize: 12,
                            }}
                          >
                            Often
                          </Text>
                        </View>
                      </View>

                      <View>
                        <Slider
                          step={1}
                          minimumValue={this.state.minDistance}
                          maximumValue={this.state.maxDistance}
                          value={this.state.frequency}
                          onValueChange={val => {
                            this.setState ({frequency: val});
                            this._save ();
                          }}
                          thumbTintColor={theme.PRIMARY_COLOR}
                          maximumTrackTintColor="#817DE8"
                          minimumTrackTintColor="white"
                          thumbStyle={{
                            borderWidth: 2,
                            borderColor: '#4e38a8',
                          }}
                          trackStyle={{height: 2.5}}
                        />

                        <TouchableOpacity
                          activeOpacity={1}
                          style={{
                            backgroundColor: '#fff',
                            borderRadius: 6,
                            padding: 2,
                            width: 110,
                            marginTop: -5,
                            left: this.state.frequency *
                              (Screenwidth - 150) /
                              4 +
                              5,
                          }}
                        >
                          <Text
                            style={{
                              color: '#4e38a8',
                              fontSize: 12,
                              textAlign: 'center',
                              fontFamily: theme.FONT_MEDIUM,
                            }}
                          >
                            ~{this.state.frequency + ' times in hour'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        borderTopWidth: 1,
                        borderColor: theme.PRIMARY_COLOR,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View>
                        <Text style={styles.hiddentexts}>Sound</Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: '5%',
                          paddingVertical: '3%',
                        }}
                      >
                        <View style={{flexDirection: 'row'}}>
                          <Text
                            style={[styles.hiddentexts, {paddingVertical: 0}]}
                          >
                            {this.state.fileName
                              ? this.state.fileName
                              : 'Default'}
                          </Text>
                          <TouchableOpacity
                            onPress={this.handleChange.bind (this)}
                          >
                            <Image
                              source={Static_Images.image_right_arrow}
                              style={{
                                width: 20,
                                height: 20,
                                marginStart: 8,
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        borderTopWidth: 1,
                        borderColor: theme.PRIMARY_COLOR,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View>
                        <Text style={styles.hiddentexts}>Silent period</Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: '5%',
                          paddingVertical: '3%',
                        }}
                      >
                        <Switch
                          width={58}
                          height={32}
                          style={{
                            borderColor: theme.PRIMARY_COLOR,
                            borderWidth: 1,
                            opacity: 0.8,
                          }}
                          circleStyle={{
                            height: 25,
                            width: 25,
                            margin: 2,
                          }}
                          backgroundInactive="transparent"
                          backgroundActive="transparent"
                          circleColorActive="#817DE8"
                          value={this.state.silent_value}
                          onAsyncPress={callback => {
                            callback (true, value =>
                              {
                                this.setState({
                                  silent_value: value,
                                }, () => {
                                    this._save();
                                });
                              }
                            );
                          }}
                        />
                      </View>
                    </View>

                    {this.state.silent_value == true
                      ? <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginEnd: '6%',
                            marginTop: '2%',
                          }}
                        >
                          <View>
                            <TouchableOpacity
                              style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                borderRadius: 12,
                                borderColor: '#817DE8',
                                borderWidth: 1,
                                paddingVertical: 5,
                                paddingHorizontal: 10,
                              }}
                              onPress={this.showStartingTimePicker}
                            >
                              <View>
                                <Text
                                  style={{
                                    color: 'white',
                                    fontSize: 16,
                                    fontFamily: theme.FONT_SEMI_BOLD,
                                  }}
                                >
                                  {selectedStartingTime}
                                </Text>
                              </View>

                              <Image
                                source={Static_Images.image_down_arrow}
                                style={{
                                  width: 7,
                                  height: 7,
                                  resizeMode: 'stretch',
                                  marginStart: 8,
                                }}
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={{paddingHorizontal: 5}}>
                            <Image
                              source={Static_Images.image_long_arrow}
                              style={{width: 100, height: 20}}
                            />
                          </View>

                          <View>
                            <TouchableOpacity
                              style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                borderRadius: 12,
                                borderColor: '#817DE8',
                                borderWidth: 1,
                                paddingVertical: 5,
                                paddingHorizontal: 10,
                              }}
                              onPress={this.showEndingTimePicker}
                            >
                              <View>
                                <Text
                                  style={{
                                    color: 'white',
                                    fontSize: 16,
                                    fontFamily: theme.FONT_SEMI_BOLD,
                                  }}
                                >
                                  {selectedEndingTime}
                                </Text>
                              </View>

                              <Image
                                source={Static_Images.image_down_arrow}
                                style={{
                                  width: 7,
                                  height: 7,
                                  resizeMode: 'stretch',
                                  marginStart: 8,
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      : null}
                  </View>
                : null}
            </View>
          </View>

          <DateTimePicker
            mode={'time'}
            date={new Date (this.state.selectedStartTime)}
            is24Hour={false}
            timePickerModeAndroid="clock"
            isVisible={isStartingTimePickerVisible}
            onConfirm={this.handleTimePicked}
            onCancel={this.hideTimePicker}
          />
          <DateTimePicker
            mode={'time'}
            date={new Date (this.state.selectedEndTime)}
            is24Hour={false}
            timePickerModeAndroid="clock"
            isVisible={isEndingTimePickerVisible}
            onConfirm={this.handleEndingTimePicked}
            onCancel={this.hideTimePicker}
          />
        </ScrollView>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create ({
  img_bg: {
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
  },

  text_title: {
    color: 'white',
    fontSize: 24,
    fontFamily: theme.FONT_DISPLAY_BOLD,
    letterSpacing: 0.5,
  },

  text_desc: {
    marginVertical: '5%',
    color: 'white',
    opacity: 0.5,
    fontFamily: theme.FONT_REGULAR,
    lineHeight: 25,
    letterSpacing: 0.5,
    fontSize: 16,
    marginLeft: '1%',
  },

  tick_circle_text: {
    color: 'white',
    fontFamily: theme.FONT_SEMI_BOLD,
    alignSelf: 'center',
    marginLeft: '5%',
    letterSpacing: 0.5,
  },

  hiddentexts: {
    color: 'white',
    fontFamily: theme.FONT_MEDIUM,
    paddingVertical: '5%',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
});
