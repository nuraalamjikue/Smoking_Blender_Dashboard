import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import instance from '../Axiosinstance';
import {WebView} from 'react-native-webview';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import {log} from 'console';

type RootStackParamList = {
  OnlineCigaretteBuyAndPaymentOnlines: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
  };
  PaymentCancel: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
    Status: string;
  };
  PaymentSuccess: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
    Status: string;
  };
  OnlineCigaretteBuyAndPaymentOnline: undefined;
};

type OnlineCigaretteBuyAndPaymentOnlineScreenRouteProp = RouteProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnlines'
>;

type PaymentCancelScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PaymentCancel',
  'PaymentSuccess'
>;

const PaymentScreen = () => {
  const [bkashURL, setBkashURL] = useState<string | null>(null);
  const [tokens, setSetTokens] = useState<string | null>(null);
  const [PaymentID, setPaymentID] = useState<string | null>(null);

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  const route = useRoute<OnlineCigaretteBuyAndPaymentOnlineScreenRouteProp>();
  const navigation = useNavigation<PaymentCancelScreenNavigationProp>();
  const {TatalSelectedData, TotalAmount, InvoiceMasterID} = route.params;

  const initiateBkashPayment = async () => {
    console.log('TotalAmount ' + TotalAmount.toString());
    console.log('InvoiceMasterID ' + InvoiceMasterID);

    try {
      setBkashURL(null);

      const paymentResponse = await instance.post(
        'bkash/payment/create',
        {
          amount: TotalAmount.toString(),
          invoiceNumber: `INV${InvoiceMasterID}`, // Use dynamic invoice number
        },
        {withCredentials: true},
      );

      const paymentResult = paymentResponse.data?.data;

      console.log(
        'paymentResponse.data.bkashURL',
        JSON.stringify(paymentResult, null, 2),
      );

      if (paymentResult && paymentResult.bkashURL) {
        setBkashURL(paymentResult.bkashURL);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error: any) {
      console.log('error ' + error.message);

      Alert.alert(
        'Payment Error',
        'Failed to initiate payment. Please try again.',
      );
    }
  };

  useEffect(() => {
    initiateBkashPayment();
  }, []); // Empty dependency array to ensure it runs only once

  const handleNavigationChange = async (navState: any) => {
    const url = navState.url;
    console.log('Navigation ----- ' + url);

    if (url.includes('cancel')) {
      navigation.navigate('PaymentCancel', {
        TatalSelectedData,
        TotalAmount,
        InvoiceMasterID,
        Status: 'Cancelled',
      });
      setBkashURL(null);
    } else if (url.includes('failure')) {
      navigation.navigate('PaymentCancel', {
        TatalSelectedData,
        TotalAmount,
        InvoiceMasterID,
        Status: 'Failed',
      });
      setBkashURL(null);
    } else if (url.includes('success')) {
      navigation.navigate('PaymentSuccess', {
        TatalSelectedData,
        TotalAmount,
        InvoiceMasterID,
        Status: 'success',
      });

      setBkashURL(null);
    } else if (url.includes('error')) {
      console.log('payment error hear');
      handleToastMsg('error', `payment error`);
      setTimeout(() => {
        navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
      }, 3000); // 5000 milliseconds = 5 seconds
      setBkashURL(null);
    }
  };

  const paymentSuccess = async (paymentId: any, status: any) => {
    try {
      const paymentData: any = {
        paymentID: paymentId,
        status: status,
      };

      const paymentResponse = await instance.get(
        '/bkash/payment/callback',
        paymentData,
      );

      const paymentResult = paymentResponse?.data;

      console.log(
        'payment Status Check: ',
        JSON.stringify(paymentResult, null, 2),
      );
    } catch (error: any) {
      console.log('error -------------- ' + error.message);
    }
  };

  function extractUrlParams(url: any) {
    try {
      // Find the part of the URL after the '?' character (query parameters)
      const queryParamsString = url.split('?')[1];

      if (!queryParamsString) {
        console.log('No query parameters found');
        return {paymentID: null, status: null, signature: null};
      }

      // Split the query string into individual key=value pairs
      const queryParamsArray = queryParamsString.split('&');

      // Initialize an object to store the extracted parameters
      const queryParams: any = {};

      // Loop through each key=value pair and split it into a key and a value
      queryParamsArray.forEach((param: any) => {
        const [key, value] = param.split('=');
        queryParams[key] = decodeURIComponent(value);
      });

      // Extract the required values from the queryParams object
      const paymentID = queryParams['paymentID'];
      const status = queryParams['status'];
      const signature = queryParams['signature'];

      // console.log('status-------------------' + status);

      // If the status is "success", reset the bKash URL
      if (status?.toLowerCase() === 'success') {
        setBkashURL(null);

        navigation.navigate('PaymentSuccess', {
          TatalSelectedData,
          TotalAmount,
          InvoiceMasterID,
          Status: 'success',
        });
      }

      if (status?.toLowerCase() === 'cancel') {
        setBkashURL(null);

        navigation.navigate('PaymentCancel', {
          TatalSelectedData,
          TotalAmount,
          InvoiceMasterID,
          Status: 'Failed',
        });
      }

      if (status?.toLowerCase() === 'failure') {
        setBkashURL(null);

        navigation.navigate('PaymentCancel', {
          TatalSelectedData,
          TotalAmount,
          InvoiceMasterID,
          Status: 'Failed',
        });
      }

      return {paymentID, status, signature};
    } catch (error) {
      // console.log('Error parsing URL manually: ', error);
      return {paymentID: null, status: null, signature: null};
    }
  }

  return (
    <View style={{flex: 1}}>
      <Toast />
      {bkashURL ? (
        <WebView
          cacheEnabled={true}
          onNavigationStateChange={navState => {
            const url = navState.url;
            try {
              // Proceed only if the base URL matches "www.snowtex.com.bd"
              if (url.includes('www.snowtex.com.bd')) {
                const {paymentID, status, signature} = extractUrlParams(url);

                if (status?.toLowerCase() === 'success') {
                  setBkashURL(null);
                  paymentSuccess(paymentID, status);
                } else if (status?.toLowerCase() === 'cancelled') {
                  console.log('Order Cancel !');
                }
                console.log('navState: ', navState);
              }
            } catch (error: any) {
              console.log('Error from Return URL ', error);
              Alert.alert(' Error', 'Error from Return URL' + error.message);
            }
          }}
          source={{
            uri: bkashURL,
          }}
          style={{height: '100%'}}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Payment...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  webview: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 20,
  },
});

export default PaymentScreen;
