import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ActivityIndicator
} from 'react-native';

import theme from '../../Theme'

const Loader = props => {
  const {
    loading,
    ...attributes
  } = props;

  return (
    <Modal
      transparent={true}
      animationType={'fade'}
      visible={loading}
      onRequestClose={() => {console.log('close modal')}}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            animating={loading}
            size={'large'}
            color={theme.PRIMARY_COLOR} />
            <Text style={{color:'black',fontSize:16,marginStart:10}}>Loading...</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  activityIndicatorWrapper: {
    padding: 20,
    flexDirection:'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',

  }
});

export default Loader;