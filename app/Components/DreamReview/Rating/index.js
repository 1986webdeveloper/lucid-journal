import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform
} from "react-native";
import styles from "../../Dashboard/style";
import CustomFlatlist from "../../CustomFlatlist";
import { Static_Images, Static_Icons, General } from "../../../Constants";
import LinearGradient from "react-native-linear-gradient";
import Sound from "react-native-sound";
import Modal from "../../CustomModal";
import theme from "../../../Theme";
import HomeTags from "../../HomeTags";
import StarRating from "react-native-star-rating";
import moment from "moment";
import { db } from "../../../Config";
import renderIf from './../../Dashboard/Settings/FBLoginButton/renderif';
import CountDown from './../../Countdown';

export default class Rating extends Component {
  constructor(props) {
    super(props);
    moment.locale("en");
    this.state = {
      audioId: 0,
      counter_state: false,
      isPlay: false,
      isPause: false,
      FlatListItems: [], //Sqlite flatlist data

      star1: false,
      star2: false,
      star3: false,
      star4: false,
      star5: false,
      rating_data: [],
      filter_star: [],
      filter_data: [],

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
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          this.setState({
            FlatListItems: temp,
            rating_data: temp
          });
        }
      );
    });
  }

  searchRating = text => {
    this.setState({
      star1: false,
      star2: false,
      star3: false,
      star4: false,
      star5: false
    });

    if (this.state.filter_star.indexOf(text) > -1) {
      var index = this.state.filter_star.indexOf(text);
      this.state.filter_star.splice(index, 1);
    } else {
      this.state.filter_star.push(text);
    }
    this.state.filter_data = [];

    this.state.filter_star.forEach(element => {
      switch (element) {
        case 1:
          this.setState({
            star1: true
          });
          break;
        case 2:
          this.setState({
            star2: true
          });
          break;
        case 3:
          this.setState({
            star3: true
          });
          break;
        case 4:
          this.setState({
            star4: true
          });
          break;
        case 5:
          this.setState({
            star5: true
          });
          break;
      }
    });

    this.state.rating_data.filter(item => {
      const itemData = `${item.rating}`;
      // ${item.date.toUpperCase()} ${item.time.toUpperCase()}

      //const textData = text;

      this.state.filter_star.forEach(element => {
        if (itemData.indexOf(element) > -1) {
          this.state.filter_data.push(item);
        }
      });
      //return itemData.indexOf(textData) > -1;
    });

    if (this.state.filter_data.length > 0) {
      this.setState({
        FlatListItems: this.state.filter_data
      });
    } else {
      if (this.state.filter_star.length > 0) {
        this.setState({
          FlatListItems: []
        });
      } else {
        this.setState({
          FlatListItems: this.state.rating_data
        });
      }
    }
  };

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
        onClosed={() => this._closeBottomSheet()}
        ref={"modal4"}
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

  render() {
    return (
      <View style={{ flex: 1, paddingHorizontal: "5%" ,backgroundColor: "#413298"}}>
        {this.BottomSheet()}
        {this.state.rating_data.length > 0 ? (
          <View>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: "2%",
                alignItems: "center",
                marginTop: 20,
                marginBottom: 10
              }}
            >
              {this.state.star1 ? (
                <LinearGradient
                  colors={["#817DE8", "#9E68F0"]}
                  style={[styles.subView, { borderColor: "transparent" }]}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onPress={() => {
                      this.searchRating(1);
                    }}
                  >
                    <Text style={styles.numbers}>1</Text>
                    <Image
                      source={Static_Images.image_full_star}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  style={styles.subView}
                  onPress={() => {
                    this.searchRating(1);
                  }}
                >
                  <Text style={styles.numbers}>1</Text>
                  <Image
                    source={Static_Images.image_full_star}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              )}

              {this.state.star2 ? (
                <LinearGradient
                  colors={["#817DE8", "#9E68F0"]}
                  style={[styles.subView, { borderColor: "transparent" }]}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onPress={() => {
                      this.searchRating(2);
                    }}
                  >
                    <Text style={styles.numbers}>2</Text>
                    <Image
                      source={Static_Images.image_full_star}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  style={styles.subView}
                  onPress={() => {
                    this.searchRating(2);
                  }}
                >
                  <Text style={styles.numbers}>2</Text>
                  <Image
                    source={Static_Images.image_full_star}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              )}

              {this.state.star3 ? (
                <LinearGradient
                  colors={["#817DE8", "#9E68F0"]}
                  style={[styles.subView, { borderColor: "transparent" }]}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onPress={() => {
                      this.searchRating(3);
                    }}
                  >
                    <Text style={styles.numbers}>3</Text>
                    <Image
                      source={Static_Images.image_full_star}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  style={styles.subView}
                  onPress={() => {
                    this.searchRating(3);
                  }}
                >
                  <Text style={styles.numbers}>3</Text>
                  <Image
                    source={Static_Images.image_full_star}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              )}

              {this.state.star4 ? (
                <LinearGradient
                  colors={["#817DE8", "#9E68F0"]}
                  style={[styles.subView, { borderColor: "transparent" }]}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onPress={() => {
                      this.searchRating(4);
                    }}
                  >
                    <Text style={styles.numbers}>4</Text>
                    <Image
                      source={Static_Images.image_full_star}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  style={styles.subView}
                  onPress={() => {
                    this.searchRating(4);
                  }}
                >
                  <Text style={styles.numbers}>4</Text>
                  <Image
                    source={Static_Images.image_full_star}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              )}

              {this.state.star5 ? (
                <LinearGradient
                  colors={["#817DE8", "#9E68F0"]}
                  style={[styles.subView, { borderColor: "transparent" }]}
                >
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onPress={() => {
                      this.searchRating(5);
                    }}
                  >
                    <Text style={styles.numbers}>5</Text>
                    <Image
                      source={Static_Images.image_full_star}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  style={styles.subView}
                  onPress={() => {
                    this.searchRating(5);
                  }}
                >
                  <Text style={styles.numbers}>5</Text>
                  <Image
                    source={Static_Images.image_full_star}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {this.state.FlatListItems.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginBottom: 30 }}
              >
                {/* <CustomFlatlist
                  style={{ paddingBottom: 100 }}
                  data={this.state.FlatListItems}
                  keyExtractor={item => item.title}
                /> */}
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
            ) : (
              <View
                style={{
                  height: 400,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.6
                }}
              >
                <Image
                  source={Static_Images.image_go_pro}
                  style={{ width: 70, height: 70, marginBottom: 10 }}
                />
                <Text style={styles.component_text}>No Items Available</Text>
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.6
            }}
          >
            <Image
              source={Static_Images.image_go_pro}
              style={{ width: 70, height: 70 }}
            />
            <Text style={[styles.component_text, { marginVertical: 10 }]}>
              Rating Data Unavailable!
            </Text>
          </View>
        )}
      </View>
    );
  }
}
