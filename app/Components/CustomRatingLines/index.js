import React from "react";
import {View } from 'react-native'

const CustomRatingLines = props => {
  return (
   <View style={{ flex: 1}}>
            <View style={{height: 3,width: props.width1,backgroundColor: "#817DE8",borderRadius: 2,marginTop:3}}/>
            <View style={{height: 3,width: props.width2,backgroundColor: "#817DE8",borderRadius: 2,marginTop:15}}/>
            <View style={{height: 3,width: props.width3,backgroundColor: "#817DE8",borderRadius: 2,marginTop:15}}/>
            <View style={{height: 3,width: props.width4,backgroundColor: "#817DE8",borderRadius: 2,marginTop:15}}/>
            <View style={{height: 3,width: props.width5,backgroundColor: "#817DE8",borderRadius: 2,marginTop:15}}/>
          </View>
  );
};

export default CustomRatingLines;