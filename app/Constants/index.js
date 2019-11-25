import { AudioUtils } from "react-native-audio";
import { Platform, Dimensions } from 'react-native';
const { width, height } = Dimensions.get("window");

export const Static_Images = {
  image_bg: require("../Images/Entry_bg.png"),
  image_intro_bg: require("../Images/intro_bg.png"),
  image_intro2_bg: require("../Images/intro2_bg.png"),
  image_lucid_premium: require("../Images/Lucid_Premium.jpg"),
  image_calendar: require("../Images/Calendar.png"),
  image_lock: require("../Images/Lock.png"),
  image_close: require("../Images/close.png"),
  image_time: require("../Images/Time.png"),
  image_empty_star: require("../Images/Empty.png"),
  image_full_star: require("../Images/Full.png"),
  image_record_audio: require("../Images/record.png"),
  image_play: require("../Images/ic_play.png"),
  image_reality_check: require("../Images/Reality_check.png"),
  image_tick_circle: require("../Images/TickeCircle.png"),
  image_first_icon: require("../Images/FirstIcon.png"),
  image_side_lucid: require("../Images/Dream_entry_Lucid.png"),
  image_back_arrow: require("../Images/ic_back.png"),
  image_search: require("../Images/ic_search.png"),
  image_left_arrow: require("../Images/ic_arrow_left.png"),
  image_right_arrow: require("../Images/ic_arrow_right.png"),
  image_stats_locked: require("../Images/StatsLocked.png"),
  image_plus: require("../Images/ic_plus.png"),
  image_first_entry_saved: require("../Images/entry_saved_bg.png"),
  image_go_pro: require("../Images/ic_go_pro.png"),
  image_down_arrow: require("../Images/down-arrow.png"),
  image_avg_ratings: require("../Images/star-image.png"),
  image_long_arrow: require("../Images/long-arrow.png"),
  image_not_lucid: require("../Images/NotLucid.png")
};

export const Static_Icons = {
  icon_close: require("../Icons/ic_close.png"),
  icon_plus: require("../Icons/ic_plus.png"),
  icon_journal: require("../Icons/ic_journal.png"),
  icon_statistics: require("../Icons/ic_stastics.png"),
  icon_reality_check: require("../Icons/ic_reality_check.png"),
  icon_settings: require("../Icons/ic_settings.png"),
  icon_stop: require("../Icons/ic_stop.png"),
  icon_arrow_right: require("../Icons/ic_arrow_right.png"),
  icon_microphone: require("../Icons/ic_microphone.png"),
  icon_mood_super_naegative: require("../Icons/mood_super_negative.png"),
  icon_mood_negative: require("../Icons/mood_negative.png"),
  icon_mood_normal: require("../Icons/mood_normal.png"),
  icon_mood_nice: require("../Icons/mood_nice.png"),
  icon_mood_woop_woop: require("../Icons/mood_woop_woop.png"),
  icon_sleep_very_bad: require("../Icons/very_bad.png"),
  icon_sleep_meh: require("../Icons/meh.png"),
  icon_sleep_normal: require("../Icons/normal.png"),
  icon_sleep_great: require("../Icons/great.png"),
  icon_sleep_supa_dupa: require("../Icons/supa_dupa.png"),
  icon_clarity_didnt_dream: require("../Icons/didn't_dream.png"),
  icon_clarity_cloudy: require("../Icons/cloudy.png"),
  icon_clarity_normal: require("../Icons/dream_normal.png"),
  icon_clarity_clear: require("../Icons/clear.png"),
  icon_clarity_super_clear: require("../Icons/super_clear.png"),
  icon_lucid: require("../Icons/lucid.png")
};

export const isIphoneX =
  Platform.OS === "ios" &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (height === 812 || width === 812);

export const General = { 
  API_URL: "https://sector4.acquaintsoft.com/lucid-dreams-web/public/api",
  LOCAL_API_URL: "http://192.168.1.30/lucid-api/public/api",
  AUDIO_PATH: AudioUtils.DocumentDirectoryPath + "/lucid_audio/",
  ITUNES_CONNECT_SHARED_SECRET: "402cfb8218924464a0e243e690b2f850",
  IOS_SUBSCRIPTION_NAME: "com.lucid.dreamjournal.monthlySubscription",
  GOOGLE_SUBSCRIPTION_NAME: "com.lucidjournal.prouser01",
  isTestEnvironment: "true",
};