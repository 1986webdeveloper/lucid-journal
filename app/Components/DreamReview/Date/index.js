import React, { Component } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  FlatList
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Static_Images, Static_Icons, General } from "../../../Constants";
import styles from "../../Dashboard/style";
import Sound from "react-native-sound";
import Modal from "../../CustomModal";
import theme from "../../../Theme";
import HomeTags from "../../HomeTags";
import StarRating from "react-native-star-rating";
import moment from "moment";

import { db } from "../../../Config";
import renderIf from './../../Dashboard/Settings/FBLoginButton/renderif';
import CountDown from './../../Countdown';

export default class Date extends Component {
  constructor(props) {
    super(props);
    moment.locale("en");
    this.lucidDates = [];
    this.state = {
      audioId: 0,
      counter_state: false,
      isPlay: false,
      isPause: false,
      markedDate: [],
      selectedDate: [],
      FlatListItems: [], //Sqlite flatlist data
      visible_flatlist: true,
      modal_title: "",
      modal_desc: "",
      modal_date: "",
      modal_time: "",
      modal_rating: "",
      modal_dream_type: "",
      modal_how_was_sleep: "",
      modal_clarity: "",
      modal_mood: "",
      modal_tags: [],
      modal_music: "",
      modal_music_time: ""
    };
    this.arrayholder = [];

    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM table_user ORDER BY id DESC",
        [],
        (tx, results) => {
          var entryDates = [];
          var temp = [];
          var date;
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
            date = results.rows.item(i).date;
            this.lucidDates[date] = {marked: true, customStyles: {
                container: {
                  backgroundColor: "transparent",
                  borderWidth: 2,
                  borderColor: "#7447bb"
                }
            }};
          }
          //this.lucidDates = entryDates;
          this.setState({
            FlatListItems: temp,
            selectedDate: this.lucidDates,
          });
          this.arrayholder = temp;
        }
      );
    });
  }

  openBottomSheet(item) {
    this.setState({
      modal_title: item.title,
      modal_desc: item.description,
      modal_date: moment(item.date).format("MMM DD"),
      modal_time: item.time,
      modal_rating: item.rating,
      modal_dream_type: item.type,
      modal_how_was_sleep: item.first_answer,
      modal_clarity: item.second_answer,
      modal_mood: item.fifth_answer,
      modal_tags: JSON.parse(item.tags),
      modal_music: General.AUDIO_PATH + item.voice_record,
      modal_music_time: (item.voice_time != null) ? (Number (item.voice_time) + 1) : item.voice_time,
      audioId: this.state.audioId++, 
      counter_state: false
    });
    this.refs.modal4.open();
  }

  _closeBottomSheet(){
    if(this.state.sound != null){
      this.state.sound.stop();
      this.setState({ counter_state: false, isPlay: false, isPause: false });
    }
  }

  BottomSheet() {
    return (
      <Modal
        style={[styles.modal, styles.modal4]}
        position={"bottom"}
        ref={"modal4"}
        onClosed={() => this._closeBottomSheet()}
        backButtonClose={true}
        backdropColor="black"
        backdropOpacity={0.6}
        animationDuration={400}
      >
        {this.ModalView()}
      </Modal>
    );
  }

  //Play Recorded Audio
  async _play(fileName) {

    if(!this.state.isPlay && !this.state.isPause){
      var audioSound = new Sound(this.state.modal_music, "", error => {
        if (error) {
          console.log("failed to load the sound", error);
        } else {
          audioSound.play(success => {
            if (success) {
              this.setState({ counter_state: false, audioId: (Number (this.state.audioId) + 1), isPlay: false, isPause: false });
            } 
          });
        }
      });
      this.setState({
        sound: audioSound,
        isPlay: true,
        counter_state: true,
      });
    }
    else if(this.state.isPause){
      this.state.sound.play(success => { 
        if (success) {
          this.setState({ counter_state: false, audioId: (Number (this.state.audioId) + 1), isPlay: false, isPause: false });
        } 
      });
      this.setState({ counter_state: true, isPause: false });
    }
    else{
      this.state.sound.pause();
      this.setState({ counter_state: false, isPause: true });
    }
  }

  ModalView() {
    return (
      <View
        style={{
          backgroundColor: "#6346C4",
          width: "100%",
          height: "100%",
          paddingHorizontal: "5%",
          paddingTop: "5%",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30
        }}
      >
        <View
          style={{
            height: 6,
            width: 60,
            backgroundColor: "white",
            opacity: 0.2,
            borderRadius: 6 / 2,
            alignSelf: "center",
            marginBottom: "5%"
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity activeOpacity={1}>
            <Text style={styles.text_date_time}>
              {this.state.modal_date}, {this.state.modal_time}
            </Text>
            {this.state.modal_title != null ? (
              <Text
                style={{
                  color: "white",
                  letterSpacing: 0.5,
                  fontWeight: "bold",
                  fontSize: 16,
                  fontFamily: theme.FONT_CURVED,
                  marginVertical: "3%"
                }}
              >
                {this.state.modal_title}
              </Text>
            ) : null}
            {this.state.modal_desc != null ? (
              <Text
                style={{
                  color: "white",
                  letterSpacing: 0.5,
                  fontFamily: theme.FONT_CURVED_LIGHT,
                  marginBottom: "5%"
                }}
              >
                {this.state.modal_desc}
              </Text>
            ) : null}

            {this.state.modal_tags === null ? null : (
              <View style={{ marginBottom: Platform.OS === "ios" ? 20 : "5%" }}>
                <HomeTags
                  readonly={true}
                  initialText="monkey"
                  initialTags={this.state.modal_tags}
                  onChangeTags={tags => console.log(tags)}
                  containerStyle={{ alignItems: "center", paddingEnd: 5 }}
                  renderTag={({
                    tag,
                    index,
                    onPress,
                    deleteTagOnPress,
                    readonly
                  }) => (
                    <TouchableOpacity
                      key={`${tag}-${index}`}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        margin: 2,
                        backgroundColor: theme.PRIMARY_COLOR,
                        borderRadius: 6
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: theme.FONT_SEMI_BOLD,
                          fontSize: 12
                        }}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {renderIf(this.state.modal_music_time != null)(
              <View
                style={{
                  // marginBottom: "3%",
                  marginTop: -20,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <TouchableOpacity
                  onPress={() => this._play()}
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  {renderIf(!this.state.isPlay && !this.state.isPause)(
                    <Image
                      source={Static_Images.image_play}
                      style={{ width: 50, height: 50 }}
                    />
                  )}
                  {renderIf(this.state.isPause)(
                    <Image
                      source={Static_Images.image_play}
                      style={{ width: 50, height: 50 }}
                    />
                  )}
                  {renderIf(this.state.isPlay && !this.state.isPause)(
                    <Image
                      source={Static_Icons.icon_stop}
                      style={{ width: 50, height: 50 }}
                    />
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1, margin: "5%" }}>
                  <Image
                    style={{
                      height: 20,
                      width: "100%",
                      alignSelf: "center",
                      marginEnd: 10,
                      opacity: 0.5
                    }}
                    source={Static_Images.image_record_audio}
                  />
                  <CountDown
                        id={(this.state.audioId).toString()}
                        running = {this.state.counter_state}
                        until={parseInt(this.state.modal_music_time)}
                        timeToShow={['M', 'S']}
                      />
                </View>
              </View>
            )}

            {/* How was the sleep */}
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 0.5,
                borderColor: theme.PRIMARY_COLOR,
                padding: 15
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.8,
                    fontFamily: theme.FONT_NORMAL
                  }}
                >
                  How was the sleep
                </Text>
              </View>
              <View>
                {this.state.modal_how_was_sleep === "Very bad" ? (
                  <Image
                    source={Static_Icons.icon_sleep_very_bad}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_how_was_sleep === "Meh" ? (
                  <Image
                    source={Static_Icons.icon_sleep_meh}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_how_was_sleep === "Normal" ? (
                  <Image
                    source={Static_Icons.icon_sleep_normal}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_how_was_sleep === "Great" ? (
                  <Image
                    source={Static_Icons.icon_sleep_great}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_how_was_sleep === "Supa dupa" ? (
                  <Image
                    source={Static_Icons.icon_sleep_supa_dupa}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
              </View>
            </View>

            {/* Clarity */}
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 0.5,
                borderColor: theme.PRIMARY_COLOR,
                padding: 15
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.8,
                    fontFamily: theme.FONT_NORMAL
                  }}
                >
                  Clarity
                </Text>
              </View>
              <View>
                {this.state.modal_clarity === "I didn't dream" ? (
                  <Image
                    source={Static_Icons.icon_clarity_didnt_dream}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_clarity === "Cloudy" ? (
                  <Image
                    source={Static_Icons.icon_clarity_cloudy}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_clarity === "Normal" ? (
                  <Image
                    source={Static_Icons.icon_clarity_normal}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_clarity === "Clear" ? (
                  <Image
                    source={Static_Icons.icon_clarity_clear}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_clarity === "Super clear" ? (
                  <Image
                    source={Static_Icons.icon_clarity_super_clear}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
              </View>
            </View>

            {/* Lucid or not */}
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 0.5,
                borderColor: theme.PRIMARY_COLOR,
                padding: 15
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.8,
                    fontFamily: theme.FONT_NORMAL
                  }}
                >
                  Lucid or not
                </Text>
              </View>
              <View style={{ paddingEnd: 2 }}>
              {renderIf (this.state.modal_dream_type === "lucid") (
                  <Image
                    source={Static_Icons.icon_lucid}
                    style={{ width: 19, height: 19 }}
                  />
              )}
              {renderIf (this.state.modal_dream_type === "not") (
                  <Image
                    source={Static_Images.image_not_lucid}
                    style={{ width: 19, height: 19 }}
                  />
              )}
              </View>
            </View>

            {/* Overal mood */}
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 0.5,
                borderColor: theme.PRIMARY_COLOR,
                padding: 15
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.8,
                    fontFamily: theme.FONT_NORMAL
                  }}
                >
                  Overal mood
                </Text>
              </View>
              <View>
                {this.state.modal_mood === "Super" ? (
                  <Image
                    source={Static_Icons.icon_mood_super_naegative}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_mood === "Negative" ? (
                  <Image
                    source={Static_Icons.icon_mood_negative}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_mood === "Normal" ? (
                  <Image
                    source={Static_Icons.icon_mood_normal}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_mood === "Nice" ? (
                  <Image
                    source={Static_Icons.icon_mood_nice}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
                {this.state.modal_mood === "Woop woop" ? (
                  <Image
                    source={Static_Icons.icon_mood_woop_woop}
                    style={{ width: 24, height: 24 }}
                  />
                ) : null}
              </View>
            </View>

            {/* Ratings */}
            <View
              style={{
                flexDirection: "row",
                paddingBottom: Platform.OS === "ios" ? 30 : 30,
                borderTopWidth: 0.5,
                borderColor: theme.PRIMARY_COLOR,
                padding: 15
              }}
            >
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.8,
                    fontFamily: theme.FONT_NORMAL
                  }}
                >
                  Rating
                </Text>
              </View>
              <View>
                <StarRating
                  disabled={true}
                  maxStars={5}
                  rating={Number(this.state.modal_rating)}
                  fullStarColor={"#c3a484"}
                  halfStarColor={"#c3a484"}
                  starSize={15}
                  starStyle={{ padding: 2 }}
                  selectedStar={rating => this.onStarRatingPress(rating)}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => this.openBottomSheet(item)}
    >
      <View
        // animation="lightSpeedIn"
        // duration={700}
        // iterationCount={1}
        key={item.id}
        style={{
          flexDirection: "row",
          marginTop: 20,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: theme.PRIMARY_COLOR
        }}
      >
        <View
          style={{ flex: 1, paddingHorizontal: "5%", paddingVertical: "2%" }}
        >
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.text_date_time}>
                {moment(item.date).format("MMM DD")},
              </Text>
              <Text style={styles.text_date_time}>{item.time}</Text>

              <StarRating
                disabled={true}
                maxStars={5}
                rating={item.rating}
                fullStarColor={"#c3a484"}
                halfStarColor={"#c3a484"}
                starSize={15}
                starStyle={{ padding: 2 }}
                selectedStar={rating => this.onStarRatingPress(rating)}
              />
            </View>

            <View style={{ marginVertical: "2%" }}>
              {item.title != null ? (
                <Text numberOfLines={1} style={styles.component_text}>
                  {item.title}
                </Text>
              ) : null}
              {item.description != null ? (
                <Text numberOfLines={2} style={styles.component_detailText}>
                  {item.description}
                </Text>
              ) : null}
            </View>

            <View>
              {JSON.parse(item.tags) === null ? null : (
                <HomeTags
                  readonly={true}
                  initialText="monkey"
                  initialTags={JSON.parse(item.tags)}
                  onChangeTags={tags => console.log(tags)}
                  // onTagPress={(index, tagLabel, event, deleted) =>
                  //   console.log(index, tagLabel, event, deleted ? "deleted" : "not deleted")
                  // }
                  containerStyle={{ alignItems: "center", paddingEnd: 5 }}
                  //inputStyle={{ backgroundColor: "white" }}
                  renderTag={({
                    tag,
                    index,
                    onPress,
                    deleteTagOnPress,
                    readonly
                  }) => (
                    <View
                      key={`${tag}-${index}`}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        margin: 2,
                        backgroundColor: theme.PRIMARY_COLOR,
                        borderRadius: 6
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: theme.FONT_SEMI_BOLD,
                          fontSize: 12
                        }}
                      >
                        {tag}
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>

            {item.voice_record != null ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "baseline",
                  // marginTop: "4%"
                  marginVertical: "2%"
                }}
              >
                <View style={{ flex: 1 }}>
                  <Image
                    source={Static_Images.image_record_audio}
                    style={{ width: "100%", height: 15 }}
                  />
                </View>
                <View style={{ marginStart: 10 }}>
                  <Text style={styles.text_date_time}>{item.duration}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {item.type === "lucid" ? (
          <View
            style={{
              alignItems: "flex-end",
              width: 15,
              borderBottomRightRadius: 12,
              borderTopRightRadius: 12,
              right: -1,
              top: 0,
              bottom: 0,
              overflow: "hidden"
            }}
          >
            <Image
              source={Static_Images.image_side_lucid}
              style={{
                flex: 1,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                height: "auto"
              }}
            />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  dateSelect = date => {
    var currentDate = moment(date.timestamp).format("YYYY-MM-DD");
    // this.setState({
    //  selected: day.dateString,
    // })
    this.searchDate(currentDate);
    this.markDate(currentDate);
  }
  
  markDate(date){
    let obj = [];
    obj[date] = {marked: true, customStyles: {
        container: {
          backgroundColor: "black",
          borderWidth: 2,
          borderColor: "#7447bb"
        }
    }};

    let selectDate = {...this.lucidDates, [date]: { selected: true}};
    //this.lucidDates.push(obj);
    this.setState({
      selectedDate: selectDate,
    });

    //this.setState({ selectedDate: "'"+date+"' : {selected: true, disableTouchEvent: true}"})
  }

  

  searchDate(currentDate){
    const newData = this.arrayholder.filter(item => {      
      const itemData = `${item.date}`;
      const textData = currentDate;
      return itemData.indexOf(textData) > -1;    
    });
    this.setState({ FlatListItems: newData });  
  }

  render() {
    return (
      <View style={{ flex: 1 ,backgroundColor:'#413298'}}>
        {this.BottomSheet()}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: "5%" }}>
            <Calendar
              // Collection of dates that have to be marked. Default = {}
              current={new Date()}
              onDayPress={(day) => { this.dateSelect(day)}}
              hideExtraDays={false}
              disableMonthChange={true}
              renderArrow={direction => this.Arrow(direction)}
              onPressArrowLeft={substractMonth => substractMonth()}
              onPressArrowRight={addMonth => addMonth()}
              markingType={"custom"}
              markedDates={this.state.selectedDate}
              theme={{
                arrowColor: "white",
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: "#ffffff",
                selectedDayBackgroundColor: theme.PRIMARY_COLOR,
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#ffffff",
                dayTextColor: "#ffffff",
                textDisabledColor: "#8379bc",
                dotColor: "#00adf5",
                selectedDotColor: "#ffffff",
                monthTextColor: "white",
                indicatorColor: "white",
                textDayFontFamily: theme.FONT_CURVED,
                textMonthFontFamily: theme.FONT_CURVED,
                textDayHeaderFontFamily: theme.FONT_CURVED,
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300"
                //textDayFontSize: 16,
                //textMonthFontSize: 16,
                //textDayHeaderFontSize: 16,
              }}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 30 }}
            >
              <FlatList
                showsVerticalScrollIndicator={false}
                style={{ paddingBottom: 50 }}
                data={this.state.FlatListItems}
                extraData={this.state}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this._renderItem}
                numColumns={1}
              />
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  }

  Arrow = direction => {
    if (direction === "left") {
      return (
        <Image
          source={Static_Images.image_left_arrow}
          style={{ width: 24, height: 24 }}
        />
      );
    } else {
      return (
        <Image
          source={Static_Images.image_right_arrow}
          style={{ width: 24, height: 24, opacity: 0.3 }}
        />
      );
    }
  };
}
