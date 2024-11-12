import React, {useEffect, useState} from 'react';
import {Text, View, StyleSheet, Alert, Pressable} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import instance from '../Axiosinstance';
import {IconButton} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type PaymentCancelScreenRouteProp = RouteProp<
  RootStackParamList,
  'PaymentCancel'
>;

type RootStackParamList = {
  PaymentCancel: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
    Status: string;
  };
  OnlineCigaretteBuyAndPaymentOnline: undefined;
};

type PaymentCancelScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnline'
>;

const PaymentCancel = () => {
  const route = useRoute<PaymentCancelScreenRouteProp>();
  const {TatalSelectedData, TotalAmount, InvoiceMasterID, Status} =
    route.params;

  console.log('PaymentCancel' + JSON.stringify(TatalSelectedData, null, 2));
  const [timeLeft, setTimeLeft] = useState<number>(10);

  const navigation = useNavigation<PaymentCancelScreenNavigationProp>();

  useEffect(() => {
    const updateInvoiceData = async () => {
      const InvoiceData = {
        InvoiceMasterID: InvoiceMasterID,
        Status: Status,
      };

      try {
        const response = await instance.post(
          '/UpdateInvoiceMaster', // Replace with your server's IP
          InvoiceData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        console.log('Invoice updated successfully:', response.data);
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    };

    updateInvoiceData();
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(timeLeft => {
        if (timeLeft <= 1) {
          clearInterval(interval);
          navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');

          // resetSelectedValue();
          return 0;
        }
        return timeLeft - 1;
      });
    }, 1000);
  }, [TotalAmount]);

  const handlePress = () => {
    navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
  };

  return (
    <View
      style={[
        styles.container,
        {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: 'column',
        },
      ]}>
      <View
        style={{
          flex: 3.5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* {TatalSelectedData.map(item => (
          <View key={item.Id} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.ItemNames}</Text>
            <Text style={styles.itemDetail}>
              Rate: ${item.ItemsRate.toFixed(2)}
            </Text>
            <Text style={styles.itemDetail}>Qty: {item.Count}</Text>
          </View>
        ))} */}
        <View
          style={{
            marginTop: '10%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <IconButton icon="close-circle-outline" size={100} iconColor="red" />
          <Text style={styles.title}>Payment {Status}</Text>
        </View>
      </View>
      <View
        style={{
          flex: 1.5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handlePress}>
          <View style={styles.buttonContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="red"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Back To Online Cigarette Buy</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: '1%',
  },

  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: 16,
    marginTop: 4,
  },

  button: {
    backgroundColor: '#C90002',
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#0056b3',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  icon: {
    marginRight: 8,
    backgroundColor: '#fff',
  },
});

export default PaymentCancel;
