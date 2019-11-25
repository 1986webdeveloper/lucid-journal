import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity
} from "react-native";

import { AreaChart, YAxis, ProgressCircle } from "react-native-svg-charts";
import { Circle, Path } from "react-native-svg";
import * as shape from "d3-shape";
import moment from "moment";
import styles from "../../../Tags/styles";
import CustomRatingLines from '../../../CustomRatingLines'

import LinearGradient from "react-native-linear-gradient";
import Carousel, { Pagination } from "react-native-snap-carousel";

import theme from "../../../../Theme";
import { Static_Images } from "../../../../Constants";

import { db } from "../../../../Config";

export default class Tab6 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: [
        {
          title: "One",
          lucid: "Lucid dreams",
          percentage_lucid: "0",
          notlucid: "Not lucid dreams",
          percentage_notlucid: "0"
        },
        {
          title: "Two",
          avg_ratings: "0",
          widthStar1: "0%",
          widthStar2: "0%",
          widthStar3: "0%",
          widthStar4: "0%",
          widthStar5: "0%",
        },
        { title: "Three" }
      ],
      activeSlide: 0,
      sleep_data: [],
      clarity_data: [],
      mood_data: [],
      entryDate: [],
      tagData: []
    };

    this.graphData();
    this.getTags();
    this.countLucid();
    this.countStars();
  }

  countStars() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT rating FROM table_user ORDER BY date DESC",
        [],
        (tx, results) => {

          if(results.rows.length > 0){
            var COUNT = 0;
            var count1 = count2 = count3 = count4 = count5 = 0;
            var totalRating = results.rows.length;
            for (let i = 0; i < results.rows.length; ++i) {
              if (results.rows.item(i).rating != "") {
                ratingValue = results.rows.item(i).rating;
                COUNT += ratingValue;
                switch(ratingValue){
                  case 1:
                      count1++;
                      break;
                  case 2:
                      count2++;
                      break;
                  case 3:
                      count3++;
                      break;
                  case 4:
                      count4++;
                      break;
                  case 5:
                      count5++;
                      break;
                }
              }
            }

            var rating = COUNT / totalRating;

            var entries = { ...this.state.entries };
            entries[1].avg_ratings = rating.toFixed(1);
            if(totalRating > 0){
              entries[1].widthStar1 = (count1 * 100) / totalRating;
              entries[1].widthStar2 = (count2 * 100) / totalRating;
              entries[1].widthStar3 = (count3 * 100) / totalRating;
              entries[1].widthStar4 = (count4 * 100) / totalRating;
              entries[1].widthStar5 = (count5 * 100) / totalRating;
            }
            this.setState(state => ({ entries: state.entries }));
          }
        }
      );
    });
  }

  countLucid() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT type FROM table_user ORDER BY date DESC",
        [],
        (tx, results) => {
          var lucid = 0;
          var notLucid = 0;
          for (let i = 0; i < results.rows.length; ++i) {
            if (results.rows.item(i).type == "lucid") {
              lucid++;
            } else if (results.rows.item(i).type == "not") {
              notLucid++;
            } else {
            }
          }

          var total = lucid + notLucid;
          var result_l = (lucid * 100) / total;
          var result_nl = (notLucid * 100) / total;

          var entries = { ...this.state.entries };
          if (result_l >= 0) entries[0].percentage_lucid = result_l.toFixed(2);
          if (result_nl >= 0)
            entries[0].percentage_notlucid = result_nl.toFixed(2);
          this.setState(state => ({ entries: state.entries }));
        }
      );
    });
  }

  graphData() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT first_answer,second_answer,fifth_answer,date FROM table_user GROUP BY date ORDER BY date DESC",
        [],
        (tx, results) => {
          var temp_sleep_data = [];
          var temp_clarity_data = [];
          var temp_mood_data = [];
          var entryDate = [];

          for (let i = 0; i < results.rows.length; ++i) {
            entryDate.push(results.rows.item(i).date);

            if (results.rows.item(i).first_answer === "Very bad") {
              temp_sleep_data.push(1);
            } else if (results.rows.item(i).first_answer === "Meh") {
              temp_sleep_data.push(2);
            } else if (results.rows.item(i).first_answer === "Normal") {
              temp_sleep_data.push(3);
            } else if (results.rows.item(i).first_answer === "Great") {
              temp_sleep_data.push(4);
            } else if (results.rows.item(i).first_answer === "Supa dupa") {
              temp_sleep_data.push(5);
            } else {
            }

            if (results.rows.item(i).second_answer == "I didn't dream") {
              temp_clarity_data.push(1);
            } else if (results.rows.item(i).second_answer == "Cloudy") {
              temp_clarity_data.push(2);
            } else if (results.rows.item(i).second_answer == "Normal") {
              temp_clarity_data.push(3);
            } else if (results.rows.item(i).second_answer == "Clear") {
              temp_clarity_data.push(4);
            } else if (results.rows.item(i).second_answer == "Super clear") {
              temp_clarity_data.push(5);
            } else {
            }

            if (results.rows.item(i).fifth_answer == "Super") {
              temp_mood_data.push(1);
            } else if (results.rows.item(i).fifth_answer == "Negative") {
              temp_mood_data.push(2);
            } else if (results.rows.item(i).fifth_answer == "Normal") {
              temp_mood_data.push(3);
            } else if (results.rows.item(i).fifth_answer == "Nice") {
              temp_mood_data.push(4);
            } else if (results.rows.item(i).fifth_answer == "Woop woop") {
              temp_mood_data.push(5);
            } else {
            }
          }

          this.setState({
            sleep_data: temp_sleep_data,
            clarity_data: temp_clarity_data,
            mood_data: temp_mood_data,
            entryDate: entryDate
          });
        }
      );
    });
  }

  getTags() {
    db.transaction(tx => {
      tx.executeSql("SELECT tags FROM table_user", [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; i++) {
          if (results.rows.item(i).tags != null) {
            let tags = JSON.parse(results.rows.item(i).tags);
            if (tags.length > 0) {
              tags.map((item, key) => {
                temp.push(item);
              });
            }
          }
        }

        let tagItems = [];
        let tagsData = temp.sort();
        var current = null;
        var cnt = 0;
        for (var i = 0; i <= tagsData.length; i++) {
          if (tagsData[i] != current) {
            if (cnt > 0) {
              tagItems.push({ text: current, count: cnt });
            }
            current = tagsData[i];
            cnt = 1;
          } else {
            cnt++;
          }
        }

        this.setState({
          tagData: tagItems
        });
      });
    });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "#413298" }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.state.sleep_data.length < 0 ? null : (
            <View style={{ marginTop: 25 }}>
              <Carousel
                data={this.state.entries}
                extraData={this.state.entries}
                renderItem={this._renderItem}
                sliderWidth={Dimensions.get("window").width}
                itemWidth={Dimensions.get("window").width - 40}
                onSnapToItem={index => this.setState({ activeSlide: index })}
              />
              {this.pagination}
            </View>
          )}
          {this.state.sleep_data.length < 0 ? null : (
            <View style={{ marginHorizontal: 20, paddingBottom: 80 }}>
              <View style={{ marginBottom: 10 }}>
                <LinearGradient
                  colors={["#6446c5", "#543aab"]}
                  style={{
                    height: 250,
                    width: "100%",
                    padding: 15,
                    borderRadius: 15
                  }}
                >
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontFamily: theme.FONT_SEMI_BOLD,
                        marginBottom: 10
                      }}
                    >
                      Sleep quality
                    </Text>
                    <View
                      style={{
                        height: 180,
                        padding: 5,

                        flexDirection: "row"
                      }}
                    >
                      <YAxis
                        // data={sleep_data}
                        data={[1, 2, 3, 4, 5]}
                        style={{ marginBottom: xAxisHeight, paddingRight: 10 }}
                        contentInset={verticalContentInset}
                        svg={axesSvg}
                        numberOfTicks={5}
                      />
                      <ScrollView horizontal={true}>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <AreaChart
                            style={{ flex: 1 }}
                            data={this.state.sleep_data}
                            curve={shape.curveNatural}
                            contentInset={{ top: 20, bottom: 30 }}
                          >
                            <SleepLine />
                          </AreaChart>
                          {this.HorizontalDates()}
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={{ marginVertical: 10 }}>
                <LinearGradient
                  colors={["#6446c5", "#543aab"]}
                  style={{
                    height: 250,
                    width: "100%",
                    padding: 15,
                    borderRadius: 15
                  }}
                >
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontFamily: theme.FONT_SEMI_BOLD,
                        marginBottom: 10
                      }}
                    >
                      Dream clarity
                    </Text>
                    <View
                      style={{
                        height: 180,
                        padding: 5,
                        flexDirection: "row"
                      }}
                    >
                      <YAxis
                        // data={clarity_data}
                        data={[1, 2, 3, 4, 5]}
                        style={{ marginBottom: xAxisHeight, paddingRight: 10 }}
                        contentInset={verticalContentInset}
                        svg={axesSvg}
                        numberOfTicks={5}
                      />

                      <ScrollView horizontal={true}>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <AreaChart
                            style={{ flex: 1 }}
                            data={this.state.clarity_data}
                            curve={shape.curveNatural}
                            contentInset={{ top: 20, bottom: 30 }}
                          >
                            <ClarityLine />
                          </AreaChart>
                          {this.HorizontalDates()}
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={{ marginVertical: 10 }}>
                <LinearGradient
                  colors={["#6446c5", "#543aab"]}
                  style={{
                    height: 250,
                    width: "100%",
                    padding: 15,
                    borderRadius: 15
                  }}
                >
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontFamily: theme.FONT_SEMI_BOLD,
                        marginBottom: 10
                      }}
                    >
                      Dream mood
                    </Text>
                    <View
                      style={{
                        height: 180,
                        padding: 5,
                        flexDirection: "row"
                      }}
                    >
                      <YAxis
                        data={[1, 2, 3, 4, 5]}
                        style={{ marginBottom: xAxisHeight, paddingRight: 10 }}
                        contentInset={verticalContentInset}
                        svg={axesSvg}
                        numberOfTicks={5}
                      />

                      <ScrollView horizontal={true}>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <AreaChart
                            style={{ flex: 1 }}
                            data={this.state.mood_data}
                            curve={shape.curveNatural}
                            contentInset={{ top: 20, bottom: 30 }}
                          >
                            <MoodLine />
                          </AreaChart>
                          {this.HorizontalDates()}
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={{ marginVertical: 10 }}>
                <LinearGradient
                  colors={["#6446c5", "#543aab"]}
                  style={{
                    width: "100%",
                    padding: 15,
                    borderRadius: 15
                  }}
                >
                  <View style={{ padding: 10 }}>
                    <View
                      style={{
                        justifyContent: "space-between"
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontFamily: theme.FONT_SEMI_BOLD,
                          marginBottom: 10
                        }}
                      >
                        Dream tags
                      </Text>
                    </View>
                    <View style={[styles.container]}>
                      {this.state.tagData.map((item, i) => {
                        return (
                          <TouchableOpacity
                            key={i}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              margin: 4,
                              backgroundColor: theme.PRIMARY_COLOR,
                              borderRadius: 6,
                              width: "auto"
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontFamily: theme.FONT_SEMI_BOLD,
                                fontSize: 12
                              }}
                            >
                              {item.text} ({item.count})
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  _renderItem({ item, index }) {
    if (index === 0) {
      return (
        <LinearGradient
          colors={["#6446c5", "#543aab"]}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 30,
            backgroundColor: "transparent",
            borderRadius: 15,
            flexDirection: "row"
          }}
        >
          <View style={{ flex: 1.2 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 15 / 2,
                  marginEnd: 10,
                  backgroundColor: "#07e9ff"
                }}
              />
              <View>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.7,
                    fontSize: 12,
                    fontFamily: theme.FONT_SEMI_BOLD
                  }}
                >
                  {item.lucid}
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontFamily: theme.FONT_SEMI_BOLD
                  }}
                >
                  {item.percentage_lucid} %
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15
              }}
            >
              <View
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 15 / 2,
                  marginEnd: 10,
                  backgroundColor: "#ff07ed"
                }}
              />
              <View>
                <Text
                  style={{
                    color: "white",
                    opacity: 0.7,
                    fontSize: 12,
                    fontFamily: theme.FONT_SEMI_BOLD
                  }}
                >
                  {item.notlucid}
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: 13,
                    fontFamily: theme.FONT_SEMI_BOLD
                  }}
                >
                  {item.percentage_notlucid} %
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flex: 0.8 }}>
            <ProgressCircle
              style={{ height: 80 }}
              // progress={0.76}
              progress={item.percentage_lucid / 100}
              progressColor={"#07e9ff"}
              strokeWidth={8}
              backgroundColor={"#ff07ed"}
              cornerRadius={0}
              // animate={true}
              // animateDuration={500}
            />
          </View>
        </LinearGradient>
      );
    }

    if (index === 1) {
      return (
        <LinearGradient
          colors={["#6446c5", "#543aab"]}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 30,
            backgroundColor: "transparent",
            borderRadius: 15,
            flexDirection: "row"
          }}
        >
          <View style={{ flex: 0.5 }}>
            <Image
              source={Static_Images.image_avg_ratings}
              style={{ width: 80, height: 80, resizeMode: "contain" }}
            />
          </View>

          <View style={{ flex: 0.7 }}>
            <CustomRatingLines
              width1={item.widthStar1}
              width2={item.widthStar2}
              width3={item.widthStar3}
              width4={item.widthStar4}
              width5={item.widthStar5}
            />
          </View>

          <View
            style={{
              flex: 0.6,
              height: 80,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <View>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 35,
                  fontFamily: theme.FONT_SEMI_BOLD
                }}
              >
                {item.avg_ratings}
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 13,
                  fontFamily: theme.FONT_MEDIUM,
                  opacity: 0.7
                }}
              >
                AVG rating
              </Text>
            </View>
          </View>
        </LinearGradient>
      );
    }

    if (index === 2) {
      return (
        <LinearGradient
          colors={["#6446c5", "#543aab"]}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 30,
            backgroundColor: "transparent",
            borderRadius: 15,
            flexDirection: "row"
          }}
        >
          <View style={{ flex: 1 }} />

          <View style={{ flex: 1, height: 80 }} />
        </LinearGradient>
      );
    }
  }

  get pagination() {
    const { entries, activeSlide } = this.state;
    return (
      <Pagination
        dotsLength={entries.length}
        activeDotIndex={activeSlide}
        containerStyle={{ backgroundColor: "transparent", marginVertical: -15 }}
        dotStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          marginHorizontal: 0,
          backgroundColor: theme.PRIMARY_COLOR
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  }

  HorizontalDates = () => {
    return (
      <View
        style={{
          height: xAxisHeight,
          flexDirection: "row",
          opacity: 0.8
        }}
      >
        {this.state.entryDate.map((r, i) => (
          <View style={{ flex: 1 }} key={i}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                paddingRight: 8,
                fontFamily: theme.FONT_MEDIUM
              }}
            >
              {moment(r).format("DD")}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 12,
                paddingRight: 8,
                fontFamily: theme.FONT_REGULAR
              }}
            >
              {moment(r).format("MMM")}
            </Text>
          </View>
        ))}
      </View>
    );
  };
}

const Decorator = ({ x, y, data }) => {
  return data.map((value, index) => (
    <Circle
      key={index}
      cx={x(index)}
      cy={y(value)}
      r={2}
      stroke={"white"}
      fill={"white"}
    />
  ));
};

const SleepLine = ({ line }) => (
  <Path d={line} stroke={"#9E68F0"} fill={"none"} strokeWidth={3} />
);

const ClarityLine = ({ line }) => (
  <Path d={line} stroke={"#e2c88d"} fill={"none"} strokeWidth={3} />
);

const MoodLine = ({ line }) => (
  <Path d={line} stroke={"#84cdc0"} fill={"none"} strokeWidth={3} />
);

const axesSvg = {
  fontSize: 12,
  fill: "white",
  fontFamily: theme.FONT_MEDIUM,
  opacity: 0.8
};
const verticalContentInset = { top: 10, bottom: 10 };
const xAxisHeight = 40;
