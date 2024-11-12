import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {DataTable, IconButton} from 'react-native-paper';
import MQTT from 'sp-react-native-mqtt';
import Toast from 'react-native-toast-message';
import instance from '../Axiosinstance';
import Spinner from 'react-native-loading-spinner-overlay';
type RootStackParamList = {
  Paymentsuccess: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
    Status: string;
  };
  OnlineCigaretteBuyAndPaymentOnline: undefined;
};

type PaymentsuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnline'
>;

type PaymentSuccessScreenRouteProp = RouteProp<
  RootStackParamList,
  'Paymentsuccess'
>;

const PaymentSuccess = () => {
  const [mqttClient, setMqttClient] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(10);

  const navigation = useNavigation<PaymentsuccessScreenNavigationProp>();
  const route = useRoute<PaymentSuccessScreenRouteProp>();
  const {TatalSelectedData, TotalAmount, InvoiceMasterID, Status} =
    route.params;

  const handleBackToOnlineCigaretteBuyAndPaymentOnline = () => {
    navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
  };

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    setLoading(true);

    const initializeMQTTClient = async () => {
      const randomNumber = String(
        Math.floor(Math.random() * 100000000000),
      ).padStart(11, '0');

      try {
        const client = await MQTT.createClient({
          uri: 'mqtt://172.16.16.4:1883',
          clientId: randomNumber,
        });

        client.on('closed', () => {
          console.log('mqtt.event.closed');
        });

        client.on('error', msg => {
          console.log('mqtt.event.error', msg);
        });

        client.on('message', msg => {
          console.log('mqtt.event.message', msg);
        });

        client.on('connect', async () => {
          console.log('connected');
          client.subscribe('cigarate/confirmation/device123', 0);

          const delayTime = 1000;
          let totalPrice = 0;
          let totalQuantity = 0;

          try {
            for (const item of TatalSelectedData) {
              totalPrice += item.ItemsRate * item.Count;
              totalQuantity += item.Count;

              const formattedMessage = JSON.stringify({
                drive: item.Id,
                count: item.Count,
              });

              console.log(
                `Publishing message for item: ${item.ItemNames}`,
                formattedMessage,
              );

              await client.publish(
                'cigarate/received/device123',
                formattedMessage,
                0,
                false,
              );
              console.log(`Message published for item: ${item.ItemNames}`);

              // Optional: If you want a delay between each publish
              await delay(1000); // Adjust delay time as needed
            }

            //   -------------------------------Issue data Insert -------------------------------

            try {
              const SaveData = TatalSelectedData.map((item: any) => ({
                ItemId: item.Id,
                IssueQty: item.Count,
                LastStock: item.CurrentBalance - item.Count,
                ItemsRate: item.ItemsRate,
                Master_InvoiceID: InvoiceMasterID,
              }));

              //console.log('Save data:', JSON.stringify(SaveData, null, 2));

              const response = await instance.post(
                '/InsertStockData', // Replace with your server's IP
                SaveData,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              console.log('Response:', response.data);
            } catch (error: any) {
              console.error(
                'Error saving data:',
                error.response?.data || error.message,
              );
            }

            // Alert.alert(
            //   'Success',
            //   `Total Price: ৳${totalPrice.toFixed(
            //     2,
            //   )}, Total Quantity: ${totalQuantity}`,
            // );

            setLoading(false);
          } catch (err) {
            console.error('Failed to publish message:', err);
          }
        });

        client.connect();
      } catch (err) {
        console.error('Failed to initialize MQTT client:', err);
      }
    };

    initializeMQTTClient();

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

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [TatalSelectedData]); // Ensure to include dependencies

  const totalQty = TatalSelectedData.reduce(
    (acc: any, item: any) => acc + item.Count,
    0,
  );
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
          flex: 3,
          backgroundColor: '#008C8A',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            marginTop: '10%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <IconButton icon="check-circle-outline" size={100} iconColor="#fff" />
          <Text style={styles.title}>Payment Successfull</Text>
        </View>
      </View>
      <View style={{flex: 3.5, alignItems: 'center'}}>
        <Text style={styles.PaymentText}>Your Payment Successfull</Text>
        <View style={styles.Tablecontainer}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{flex: 2}}>
                <Text style={{textAlign: 'center'}}>Name</Text>
              </DataTable.Title>
              <DataTable.Title style={{flex: 1}} numeric>
                Rate
              </DataTable.Title>
              <DataTable.Title style={{flex: 1}} numeric>
                Qty
              </DataTable.Title>
            </DataTable.Header>
            {TatalSelectedData.map((item: any, index: number) => (
              <DataTable.Row key={index}>
                <DataTable.Cell style={{flex: 2}}>
                  {item.ItemNames}
                </DataTable.Cell>
                <DataTable.Cell style={{flex: 1}} numeric>
                  {item.ItemsRate.toFixed(2)}
                </DataTable.Cell>
                <DataTable.Cell style={{flex: 1}} numeric>
                  {item.Count}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
            <DataTable.Row>
              <DataTable.Cell style={{flex: 2}}>
                <Text style={{color: '#008C8A', fontSize: 12}}>
                  Grand Total
                </Text>
              </DataTable.Cell>
              <DataTable.Cell style={{flex: 1}} numeric>
                <Text style={{color: '#008C8A', fontSize: 12}}>
                  {TotalAmount}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell style={{flex: 1}} numeric>
                <Text style={{color: '#008C8A', fontSize: 12}}>{totalQty}</Text>
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
        {/* <View style={styles.footer}>
          <Text style={styles.totalText}>
            Grand Total: ${TotalAmount.toFixed(2)}
          </Text>
          <Text style={styles.totalText}>Total Quantity: {totalQty}</Text>
        </View> */}
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.timeLeftText}>Time left: {timeLeft} seconds</Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled, // Apply disabled style if loading
          ]}
          onPress={() => {
            handleBackToOnlineCigaretteBuyAndPaymentOnline();
          }}
          //disabled={loading} // Disable press event if loading
        >
          <View style={styles.buttonContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="#008C8A"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Continue</Text>
          </View>
        </Pressable>
      </View>

      {/* <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={styles.spinnerText}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '1%',
  },
  PaymentText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    margin: '5%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: '3%',
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#008C8A',
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
  buttonDisabled: {
    backgroundColor: '#ddd', // Change color when disabled
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    //marginLeft: 8,
  },
  icon: {
    marginRight: 20,
    backgroundColor: '#fff',
  },

  itemContainer: {
    paddingTop: 10,
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
  Tablecontainer: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  spinnerText: {
    color: '#FFF',
  },

  footerText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  timeLeftText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'red',
  },
});

export default PaymentSuccess;
