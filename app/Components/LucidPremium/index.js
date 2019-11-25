import React, {Component} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
  Platform,
  AsyncStorage,
  ActivityIndicator,
  Alert
} from 'react-native';
import Modal from '../CustomModal';
import LinearGradient from 'react-native-linear-gradient';

import {Static_Images, Static_Icons, General} from '../../Constants';
import styles from './style';
import theme from '../../Theme';
import GradientButton from '../GradientButton';

import * as RNIap from "react-native-iap";
import Loader from '../Loader';
import renderIf from './../Dashboard/Settings/FBLoginButton/renderif';

const itemSubs = Platform.select ({
  ios: [ General.IOS_SUBSCRIPTION_NAME],
  android: [ General.GOOGLE_SUBSCRIPTION_NAME]
});

export default class LucidPremium extends Component {
  constructor (props) {
    super (props);
    this.state = {
      loading: false,
      t_and_c_text: "Lucid Premium membership offers €2.99/monthly subscription after 3-day free trial for unlocking all features, premium functionality and removing ads. Payment will be charged to your iTunes Account at confirmation of purchase. Subscription automatically renews unless auto-renewal is turned off at least 24-hours before the end of the current period, and identify the cost of the renewal. Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase. Any unused portion of a free trial period, if offered, will be forfeited when the user purchases a subscription to that publication, where applicable",
      
      productList: [],
      receipt: '',
      availableItemsMessage: '',
      validateItem: []
    };

    this.getSubscriptions();
  }

  async componentDidMount() {

    DeviceEventEmitter.removeAllListeners ('hardwareBackPress');
    DeviceEventEmitter.addListener ('hardwareBackPress', () => {
      this.props.navigation.goBack ();
      return true;
    });

    try {
      const result = await RNIap.initConnection ();
      console.log ('result', result);
    } catch (err) {
      console.warn (err.code, err.message);
    }
    console.log("Retrive Data");
    this.retriveData();
  }


  componentWillMount() {
    DeviceEventEmitter.removeAllListeners ('hardwareBackPress');
  }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  goNext = () => {
    //Alert.alert ('Receipt', this.state.receipt);
    AsyncStorage.setItem('purchaseReceipt', JSON.stringify(this.state.receipt), () => {
      this.returnBack(true);
      //this.props.navigation.pop ();
    });
  };

  returnBack(isPurchased = false){
    const isGoback = this.props.navigation.getParam('isGoback');
    if(isGoback){
      if(isPurchased) this.props.navigation.state.params.onSelect({ isProUser: true});
      this.props.navigation.goBack();
    }
    else{
      this.props.navigation.navigate('Dashboard');
    }
  }

  getSubscriptions = async () => {
    try {
      const products = await RNIap.getSubscriptions (itemSubs);
      //console.log ('Products', products);
      this.setState ({productList: products});
    } catch (err) {
      console.warn (err.code, err.message);
    }
  };

  getAvailablePurchases = async () => {
    try {
      console.info (
        'Get available purchases (non-consumable or unconsumed consumable)'
      );
      const purchases = await RNIap.getAvailablePurchases ();
      //console.info ('Available purchases :: ', purchases);
      if (purchases && purchases.length > 0) {
        //console.info('Receipt: '+purchases.purchaseToken);
        this.setState ({
          availableItemsMessage: `Got ${purchases.length} items.`,
          receipt: purchases[0].transactionReceipt
            ? purchases[0].transactionReceipt
            : purchases[0].purchaseToken,
        });
      }
    } catch (err) {
      console.warn (err.code, err.message);
      Alert.alert (err.message);
    }
  };

  purchaseSubscribeItem(sku){
    this.refs.modal3.close ();
    setTimeout(() => {this.buySubscribeItem(sku)}, 500)
    
  }

  buySubscribeItem = async sku => {
    
    try {
      this.setState({loading : true});
      
      //console.log ('buySubscribeItem: ' + sku);
      const purchase = await RNIap.buySubscription (sku);

			if (Platform.OS === "ios") {
				this.receiptValidateIOS(purchase.transactionReceipt);
			} else {
				// Do stuff here for android server side validate receipt 
      }
      this.setState ({loading: false});

      //console.info (purchase);
      this.setState ({receipt: purchase.transactionReceipt}, () =>
        this.goNext ()
      );
    } catch (err) {
      this.setState ({loading: false});
      // this.setState ({loading: false}, () =>
      //    setTimeout(() => {Alert.alert(err.message)}, 1000)
      // );
    }
  };

  saveData = async (result) => {
		try {
			var countries = await AsyncStorage.getItem('purchaseItem');
			if (countries != null) {
				countries = JSON.parse(countries)
				if (!countries.includes(result)) {
					countries.push(result)
				}
				this.setState({
					validateItem: [],
					validateItem: countries,
				})
			}
			else {
				let arrProduct = []
				arrProduct.push(result)
				this.setState({
					validateItem: [],
					validateItem: arrProduct,
				})
			}
			console.log(this.state.validateItem);

			AsyncStorage.setItem('purchaseItem', JSON.stringify(this.state.validateItem));

			console.log('success');
		} catch (error) {
			console.log('fail', error);
		}
	}

	retriveData = async () => {
		try {
			var myArray = await AsyncStorage.getItem('purchaseItem');
			myArray = JSON.parse(myArray)
			if (myArray !== null) {
				this.setState({
					validateItem: myArray
				})
				console.log(this.state.validateItem);
			}
		} catch (error) {
			console.log(error);
		}
	}

	receiptValidateIOS = async receipt => {
		const receiptBody = {
			"receipt-data": receipt,
			password: General.ITUNES_CONNECT_SHARED_SECRET
		};
    const result = await RNIap.validateReceiptIos(receiptBody, General.isTestEnvironment);
    //console.log("Recipt Validation", result);
		const product = result.receipt.in_app[0].product_id
		this.setState({
			validateItem: [...this.state.validateItem, result.receipt.in_app[0].product_id],
			purchaseIndicator: false
		})
		this.saveData(result.receipt.in_app[0].product_id)
  }


  render () {
    const {productList, receipt, availableItemsMessage} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
      <Loader
          loading={this.state.loading} />
      <ImageBackground
        source={Static_Images.image_intro2_bg}
        style={{top: 0, bottom: 0, left: 0, right: 0, position: 'absolute'}}
        // resizeMode="stretch"
      >

        <TouchableOpacity
          onPress={() => this.returnBack()}
          style={{
            width: 24,
            height: 24,
            alignSelf: 'flex-end',
            flexDirection: 'row',
            flex: 1,
            padding: '7%',
            marginEnd: Platform.OS === 'ios' ? 20 : 10,
            marginTop: Platform.OS === 'ios' ? 15 : 5,
            opacity: 0.6,
          }}
        >
          <Image
            source={Static_Icons.icon_close}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{flex: 1}}>

            <View style={styles.container}>

              {/* <View style={{ paddingHorizontal: '8%' }}> */}
              <Text style={[styles.titleText, {marginBottom: '2%'}]}>
                Lucid Premium
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: Platform.OS === 'ios' ? 14 : '5%',
                }}
              >
                <Image
                  source={Static_Images.image_plus}
                  style={styles.plusImage}
                />
                <Text style={styles.simpleText}>Disable ads</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: Platform.OS === 'ios' ? 14 : '5%',
                }}
              >
                <Image
                  source={Static_Images.image_plus}
                  style={styles.plusImage}
                />
                <Text style={styles.simpleText}>
                  Backup everything on cloud
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: Platform.OS === 'ios' ? 14 : '5%',
                }}
              >
                <Image
                  source={Static_Images.image_plus}
                  style={styles.plusImage}
                />
                <Text style={styles.simpleText}>
                  Gain access to full statistics
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: Platform.OS === 'ios' ? 14 : '5%',
                }}
              >
                <Image
                  source={Static_Images.image_plus}
                  style={styles.plusImage}
                />
                <Text style={styles.simpleText}>Support app development</Text>
              </View>

              <View
                style={{
                  paddingVertical: Platform.OS === 'ios' ? 10 : '6%',
                  marginVertical: Platform.OS === 'ios' ? 10 : 0,
                }}
              >
                <GradientButton
                  style={{fontSize: 16, fontFamily: theme.FONT_SEMI_BOLD}}
                  title="Start Free Trial"
                  customClick={() => this.refs.modal3.open ()}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontFamily: theme.FONT_REGULAR,
                    color: 'white',
                    textAlign: 'center',
                    letterSpacing: 0.8,
                    fontSize: 14,
                  }}
                >
                  First 3 days for free, 2.99$ per month afterwards
                </Text>
              </View>

              <View style={{paddingVertical: '4%'}}>
                <Text style={[styles.privacyText, {lineHeight: 18}]}>
                  {this.state.t_and_c_text}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingBottom: 20,
                }}
              >
                <TouchableOpacity>
                  <Text style={styles.privacyText}>Terms of Service</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.privacyText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>

              {/* </View> */}
            </View>

          </View>
        </ScrollView>
        <Modal
          style={[styles.modal, styles.modal3]}
          position={'center'}
          ref={'modal3'}
          isDisabled={this.state.isDisabled}
        >

        {renderIf (this.state.productList.length <= 0) (
          <View style={[styles.modal, {width: '100%', height: '100%'}]}>
            <ActivityIndicator
              animating={true}
              style={{alignSelf: "center"}}
              size={'large'}
              color={theme.PRIMARY_COLOR} />
            </View>
        )}
        {renderIf (this.state.productList.length > 0) (
        productList.map ((product, i) => {
          return (
          <View key={i} style={{width: '100%', height: '100%'}}>
            <LinearGradient
              colors={['#817DE8', '#9E68F0']}
              style={{
                width: '100%',
                height: '82%',
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 1}} />
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    paddingHorizontal: '5%',
                    paddingVertical: '4%',
                  }}
                  onPress={() => this.refs.modal3.close ()}
                >
                  <Image
                    source={Static_Icons.icon_close}
                    style={{width: 12, height: 12}}
                  />
                </TouchableOpacity>
              </View>
              <View style={{padding: '8%', alignItems: 'center'}}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 24,
                    fontFamily: theme.FONT_DISPLAY_BOLD,
                    textAlign: 'center',
                    letterSpacing: 0.5,
                  }}
                >
                  Subscribe to Lucid dreams app
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontFamily: theme.FONT_MEDIUM,
                    opacity: 0.6,
                    textAlign: 'center',
                    letterSpacing: 0.5,
                    marginVertical: '5%',
                  }}
                >
                  Remove ads, unlock full dream statistics and all application
                  features
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 30,
                    fontFamily: theme.FONT_DISPLAY_BOLD,
                    marginTop: '2%',
                  }}
                >
                  {product.localizedPrice}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontFamily: theme.FONT_MEDIUM,
                    opacity: 0.8,
                    letterSpacing: 0.5,
                  }}
                >
                  per month
                </Text>
              </View>
            </LinearGradient>

            <TouchableOpacity
                  onPress={() => {this.purchaseSubscribeItem (product.productId)}}
                  style={{
                    flex: 1,
                    height: '18%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
              <Text
                style={{
                  color: theme.PRIMARY_COLOR,
                  fontFamily: theme.FONT_SEMI_BOLD,
                  fontSize: 18,
                }}
              >
                Subscribe now
              </Text>
            </TouchableOpacity>
          </View>
              );
            })
        )}
        </Modal>
      </ImageBackground>
    </SafeAreaView>
    );
  }
}
