import React, {Component} from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import * as RNIap from "react-native-iap";

const itemSubs = Platform.select ({
  ios: [
    'com.lucid.dreamjournal.monthlySubscription',
  ],
  android: [
    'com.lucidjournal.prouser01',
  ],
});

const SUBSCRIPTIONS = {
  // This is an example, we actually have this forked by iOS / Android environments
  ALL: ['com.lucidjournal.prouser01'],
}

class TestTab extends Component {
  constructor (props) {
    super (props);

    this.state = {
      productList: [],
      receipt: '',
      availableItemsMessage: '',
      validateItem: []
    };
  }

  async componentDidMount () {
    try {
      const result = await RNIap.initConnection ();
      const consumed = await RNIap.consumeAllItems()
      console.log ('result', result);
    } catch (err) {
      console.warn (err.code, err.message);
    }
    console.log("Retrive Data");
    this.retriveData();
  }
  
  goNext = () => {
    Alert.alert ('Receipt', this.state.receipt);
  };

  getSubscriptions = async () => {
    try {
      const products = await RNIap.getSubscriptions (itemSubs);
      console.log ('Products', products);
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
      console.info ('Available purchases :: ', purchases);
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

  buySubscribeItem = async sku => {
    try {
      console.log ('buySubscribeItem: ' + sku);
      const purchase = await RNIap.buySubscription (sku);

			if (Platform.OS === "ios") {
				this.receiptValidateIOS(purchase.transactionReceipt);
			} else {
				// Do stuff here for android server side validate receipt 
      }
      
      //console.info (purchase);
      this.setState ({receipt: purchase.transactionReceipt}, () =>
        this.goNext ()
      );
    } catch (err) {
      console.warn (err.code, err.message);
      Alert.alert ("Purchase Error", err.message);
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
			password: "402cfb8218924464a0e243e690b2f850"
		};
    const result = await RNIap.validateReceiptIos(receiptBody, true);
    //console.log("Recipt Validation", result);
		const product = result.receipt.in_app[0].product_id
		this.setState({
			validateItem: [...this.state.validateItem, result.receipt.in_app[0].product_id],
			purchaseIndicator: false
		})
		this.saveData(result.receipt.in_app[0].product_id)
  }

  async isSubscriptionActive() {
    if (Platform.OS === 'ios') {
      const availablePurchases = await RNIap.getAvailablePurchases();
      const sortedAvailablePurchases = availablePurchases.sort(
        (a, b) => b.transactionDate - a.transactionDate
      );
      const latestAvailableReceipt = sortedAvailablePurchases[0].transactionReceipt;

      const isTestEnvironment = true;
      const decodedReceipt = await RNIap.validateReceiptIos(
        {
          'receipt-data': latestAvailableReceipt,
          password: "402cfb8218924464a0e243e690b2f850",
        },
        isTestEnvironment
      );
      const {latest_receipt_info: latestReceiptInfo} = decodedReceipt;
      const isSubValid = !!latestReceiptInfo.find(receipt => {
        const expirationInMilliseconds = Number(receipt.expires_date_ms);
        const nowInMilliseconds = Date.now();
        return expirationInMilliseconds > nowInMilliseconds;
      });
      return isSubValid;
    }

    if (Platform.OS === 'android') {
      // When an active subscription expires, it does not show up in
      // available purchases anymore, therefore we can use the length
      // of the availablePurchases array to determine whether or not
      // they have an active subscription.
      const availablePurchases = await RNIap.getAvailablePurchases();

      for (let i = 0; i < availablePurchases.length; i++) {
        if (SUBSCRIPTIONS.ALL.includes(availablePurchases[i].productId)) {
          return true;
        }
      }
      return false;
    }
  } 

  checkStatus(){
    //alert(this.isSubscriptionActive());
  }

  render () {
    const {productList, receipt, availableItemsMessage} = this.state;
    //const receipt100 = receipt;
    //const receipt100 = receipt.substring(0, 100);

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ScrollView style={{alignSelf: 'stretch'}}>
            <View style={{height: 50}} />
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.btn}
              textStyle={styles.txt}
            >
              <Text>Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.getAvailablePurchases}
              activeOpacity={0.5}
              style={styles.btn}
              textStyle={styles.txt}
            >
              <Text>Get available purchases</Text>
            </TouchableOpacity>

            <Text style={{margin: 5, fontSize: 15, alignSelf: 'center'}}>
              {availableItemsMessage}
            </Text>

            <Text style={{margin: 5, fontSize: 9, alignSelf: 'center'}}>
              {receipt}
            </Text>

            <TouchableOpacity
              onPress={() => this.getSubscriptions ()}
              activeOpacity={0.5}
              style={styles.btn}
              textStyle={styles.txt}
            >
              <Text>Get Products ({productList.length})</Text>
            </TouchableOpacity>
            {productList.map ((product, i) => {
              return (
                <View
                  key={i}
                  style={{
                    flexDirection: 'column',
                  }}
                >
                  <Text
                    style={{
                      marginTop: 20,
                      fontSize: 12,
                      color: 'black',
                      minHeight: 100,
                      alignSelf: 'center',
                      paddingHorizontal: 20,
                    }}
                  >
                    {JSON.stringify (product)}
                  </Text>
                  <TouchableOpacity
                    // onPress={() => this.requestPurchase(product.productId)}
                    //onPress={() => this.requestSubscription(product.productId)}
                    // onPress={() => this.buyItem(product.productId)}
                    onPress={() => this.buySubscribeItem (product.productId)}
                    activeOpacity={0.5}
                    style={styles.btn}
                    textStyle={styles.txt}
                  >
                    <Text>Request purchase for above product</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.select ({
      ios: 0,
      android: 24,
    }),
    paddingTop: Platform.select ({
      ios: 0,
      android: 24,
    }),
    backgroundColor: 'white',
  },
  header: {
    flex: 20,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTxt: {
    fontSize: 26,
    color: 'green',
  },
  content: {
    flex: 80,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  btn: {
    height: 48,
    width: 240,
    alignSelf: 'center',
    backgroundColor: '#00c40f',
    borderRadius: 0,
    borderWidth: 0,
  },
  txt: {
    fontSize: 16,
    color: 'white',
  },
});

export default TestTab;
