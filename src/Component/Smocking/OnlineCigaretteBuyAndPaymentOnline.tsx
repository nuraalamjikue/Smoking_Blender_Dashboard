import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
  TextInput,
  Button,
  ImageBackground,
  StatusBar,
  BackHandler,
} from 'react-native';
import axios from 'axios';
const {height, width} = Dimensions.get('window');
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import instance from '../../Axiosinstance';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {Icon, IconButton} from 'react-native-paper';
import KeepAwake from 'react-native-keep-awake';
import Modal from 'react-native-modal';
import DeviceInfo from 'react-native-device-info';

interface Item {
  Id: number;
  itemCode: string;
  itemDesc: string;
  ItemNames: string;
  quantity: number;
  ItemsRate: number;
  localRate: number;
  image: string;
  ImageUrl: string;
  Count: number;
  CurrentBalance: number;
  driveAddress: number;
}

type RootStackParamList = {
  BkashPaymentGetway: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
  };
  Employee_salary_wise_payment: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
  };
};

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BkashPaymentGetway',
  'Employee_salary_wise_payment'
>;

const OnlineCigaretteBuyAndPaymentOnline: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<Item[]>([]);
  const [mqttClient, setMqttClient] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();
  const [scanEmployeeData, setScanEmployeeData] = useState<string>('');
  const currentVersion: string = DeviceInfo.getVersion();

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };
  //#region payment model
  const toggleModal = () => {
    const filteredItems = selectedValue.filter(item => item.Count > 0);
    if (filteredItems.length === 0) {
      handleToastMsg('info', 'Please Select Any Items');
      return;
    }
    setModalVisible(true);
  };
  //#endregion

  //#region payment model

  const handelGetData = async () => {
    setLoading(true);

    instance
      .get('/GetLastStockQty')
      .then((response: any) => {
        // console.log(
        //   'Transaction Data:',
        //   JSON.stringify(response.data, null, 2),
        // );

        setTimeout(() => {
          const initialData = response.data;
          setData(initialData);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        //setError(`Error fetching data: ${error.message}`);
        setLoading(false);
      });
  };
  const backAction = () => {
    Alert.alert('Online cigarette Buy', 'App No Exit', [
      {
        text: 'NO',
        onPress: () => null,
        style: 'cancel',
      },
    ]);
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      handelGetData();
      setModalVisible(false);
      resetSelectedValue();
      KeepAwake.activate();
      SystemNavigationBar.immersive();
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, []),
  );

  // useEffect(() => {
  //   handelGetData();
  // }, []);

  const incrementQuantity = (Id: number) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.Id === Id) {
          if (item.CurrentBalance <= item.Count) {
            handleToastMsg('error', `Stock out`);
            return item;
          }

          if (item.Count >= 3) {
            handleToastMsg('info', `You can't buy more then 3 pcs`);
            return item;
          }
          item.Count = isNaN(item.Count) ? 1 : item.Count + 1;
          setSelectedValue(prevSelected => {
            const existingIndex = prevSelected.findIndex(i => i.Id === Id);
            if (existingIndex >= 0) {
              prevSelected[existingIndex] = {...item};
              return [...prevSelected];
            } else {
              return [...prevSelected, {...item}];
            }
          });
        }
        return item;
      });
    });

    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const decrementQuantity = (id: number) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.Id === id) {
          item.Count = item.Count > 0 ? item.Count - 1 : 0;
          setSelectedValue(prevSelected => {
            const existingIndex = prevSelected.findIndex(i => i.Id === id);
            if (existingIndex >= 0) {
              prevSelected[existingIndex] = {...item};
              return [...prevSelected];
            } else {
              return [...prevSelected, {...item}];
            }
          });
        }
        return item;
      });
    });
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };
  const handelSalaryWisePayment = async () => {
    const filteredItems = selectedValue.filter(item => item.Count > 0);
    if (filteredItems.length === 0) {
      handleToastMsg('info', 'Please Select Any Items');
      return;
    }

    if (!selectedValue || selectedValue.length < 0) {
      handleToastMsg('info', 'Please Select Any Items');
      return;
    }
    const totalAmount = selectedValue.reduce((total, item) => {
      return total + item.Count * item.ItemsRate;
    }, 0);

    // -----------------------Insert Invoice---------------------

    const InvoiceData = {
      InvoiceAmount: totalAmount,
    };

    const response = await instance.post(
      '/InsertInvoiceMaster', // Replace with your server's IP
      InvoiceData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 200) {
      //console.log('Invoice inserted successfully:', response.data);
      // You can add further logic, like redirecting or showing a success message
    } else {
      handleToastMsg('info', 'Failed - Network Error');
      //console.log('Unexpected response:', response);
    }

    //console.log('Response:', response.data.id);

    // ----------------------navigation BkashPaymentGetway ----------------------

    navigation.navigate('Employee_salary_wise_payment', {
      TatalSelectedData: selectedValue,
      TotalAmount: totalAmount,
      InvoiceMasterID: response.data.id,
    });

    resetSelectedValue();
  };

  const handleSubmitData = async () => {
    const filteredItems = selectedValue.filter(item => item.Count > 0);
    if (filteredItems.length === 0) {
      handleToastMsg('info', 'Please Select Any Items');
      return;
    }

    if (!selectedValue || selectedValue.length < 0) {
      handleToastMsg('info', 'Please Select Any Items');
      return;
    }

    const totalAmount = selectedValue.reduce((total, item) => {
      return total + item.Count * item.ItemsRate;
    }, 0);

    // -----------------------Insert Invoice---------------------

    const InvoiceData = {
      InvoiceAmount: totalAmount,
    };

    const response = await instance.post(
      '/InsertInvoiceMaster', // Replace with your server's IP
      InvoiceData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    //console.log('Response:', response.data.id);

    // ----------------------navigation BkashPaymentGetway ----------------------

    navigation.navigate('BkashPaymentGetway', {
      TatalSelectedData: selectedValue,
      TotalAmount: totalAmount,
      InvoiceMasterID: response.data.id,
    });

    resetSelectedValue();
  };

  const resetSelectedValue = () => {
    //console.log('Reset Data');

    setData(prevData =>
      prevData.map(item => ({
        ...item,
        Count: 0,
      })),
    );

    setSelectedValue([]);
  };
  //#region Auto Focuses --------------------
  const textInputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, []);

  const handleScanData = (text: string) => {
    if (selectedValue.length > 0) {
      handleToastMsg('info', 'Please hit pay now');
    } else {
      handleToastMsg('info', 'Please select any item');
    }
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };
  //#endregion

  const renderItem = ({item}: {item: Item}) => (
    <View style={styles.itemContainer}>
      <View style={{width: '100%', backgroundColor: '#fff'}}>
        <Pressable
          onPress={() => {
            incrementQuantity(item.Id);
          }}>
          <ImageBackground
            source={{
              uri: `http://192.168.1.20:96/${item.ImageUrl}`,
            }}
            resizeMode="contain"
            style={styles.image}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: '-1.6%',
                backgroundColor: '#E43D30',
                borderRadius: 100,
                borderColor: '#ccc',
                borderWidth: 1,
                borderStartWidth: 0,
                alignSelf: 'flex-end',
                paddingHorizontal: 18,
                paddingVertical: 3,
                borderBottomStartRadius: 6,
                borderTopStartRadius: 6,
              }}>
              <Text style={styles.StockText}>Stock</Text>
              <Text style={styles.CurrentBalancetext}>
                {item.CurrentBalance === null || item.CurrentBalance === 0 ? (
                  <>
                    <Text style={{fontSize: 18}}>out</Text>
                  </>
                ) : (
                  item.CurrentBalance
                )}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      </View>

      <Text style={styles.itemName}>{item.ItemNames}</Text>
      <Text style={styles.Item_Rate_Text}>Rate : {item.ItemsRate}</Text>
      <View style={styles.buttonContainer}>
        {item.Count > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
            }}>
            <IconButton
              icon="minus-thick"
              size={height / 38}
              iconColor="#fff"
              style={styles.incrementButton}
              onPress={() => decrementQuantity(item.Id)}
            />
            <Text style={styles.counterText}>{item.Count}</Text>

            <IconButton
              icon="plus-thick"
              size={height / 38}
              iconColor="#fff"
              style={[
                styles.incrementButton,
                {backgroundColor: item.Count >= 3 ? 'gray' : '#B20093'},
              ]}
              onPress={() => incrementQuantity(item.Id)}
            />
          </View>
        ) : (
          <View style={styles.addbuttonArea}>
            <>
              <Pressable
                style={[
                  styles.AddButton,
                  ,
                  {
                    backgroundColor: item.CurrentBalance > 0 ? 'red' : 'gray',
                  },
                ]}
                onPress={() => {
                  incrementQuantity(item.Id);
                }}>
                <Text style={styles.Addtext}>ADD</Text>
              </Pressable>
            </>
          </View>
        )}
      </View>
    </View>
  );

  // if (loading) {
  //   return <Text style={styles.LoadingText}>Loading...</Text>;
  // }

  if (error) {
    return (
      <Text
        style={{
          marginTop: height / 2.3,
          justifyContent: 'center',
          alignContent: 'center',
          textAlign: 'center',
          color: 'red',
        }}>
        {error}
      </Text>
    );
  }

  return (
    <View style={{flex: 4, paddingHorizontal: 8, marginTop: '5%'}}>
      {/* <StatusBar hidden={true} /> */}
      <StatusBar
        hidden={true}
        backgroundColor={'transparent'}
        translucent={true}
      />

      <TextInput
        ref={textInputRef}
        style={styles.input}
        placeholder="Type here..."
        value={scanEmployeeData}
        onChangeText={handleScanData}
        keyboardType="numeric"
      />

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />

      <Toast
        config={{
          success: props => (
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                backgroundColor: 'green',
                borderRadius: 5,
              }}>
              <Text style={{color: 'white', fontSize: 23}}>{props.text1}</Text>
            </View>
          ),
          error: props => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: '15%',
                paddingVertical: '15%',
                backgroundColor: 'red',
                borderRadius: 5,
                marginTop: height / 4,
              }}>
              <IconButton
                icon="close-circle"
                size={height / 35}
                iconColor="#fff"
                style={styles.close_circle}
                onPress={() => Toast.hide()}
              />
              <IconButton
                icon="emoticon-sad-outline"
                size={height / 10}
                iconColor="#fff"
                //style={styles.close_circle}
              />
              <Text
                style={{
                  color: '#fff',
                  fontSize: height * 0.09,
                  fontFamily: 'bold',
                }}>
                {props.text1}
              </Text>
            </View>
          ),
          info: props => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: '10%',
                paddingVertical: '10%',
                backgroundColor: 'red',
                borderRadius: 5,
              }}>
              <IconButton
                icon="close-circle"
                size={height / 35}
                iconColor="#fff"
                style={styles.close_circle}
                onPress={() => Toast.hide()}
              />

              <IconButton
                icon="alert"
                size={height / 10}
                iconColor="#fff"
                //style={styles.close_circle}
              />
              <Text
                style={{
                  color: '#fff',
                  fontSize: height * 0.04,
                  fontFamily: 'bold',
                }}>
                {props.text1}
              </Text>
            </View>
          ),
        }}
      />

      <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={styles.spinnerText}
      />

      <View
        style={{
          flex: 2,
          marginHorizontal: 10,
          // backgroundColor: 'red',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={styles.SubmitButton_area}>
            <Pressable
              style={styles.SubmitButton}
              onPress={() => {
                toggleModal();
              }}>
              <Text style={styles.text}>Pay Now</Text>
            </Pressable>
          </View>
          <View style={styles.Reset_area}>
            <Pressable
              style={styles.ResetButton}
              onPress={() => {
                resetSelectedValue();
              }}>
              <Text style={styles.text}>Reset</Text>
            </Pressable>
          </View>
        </View>
        <Text style={{textAlign: 'right', padding: 5}}>
          Version : {currentVersion}
        </Text>
      </View>
      {/* -------------------------------------Payment Method Area ------------------------------------------------- */}

      <Modal isVisible={isModalVisible}>
        <View style={styles.payment_model_area}>
          <View style={styles.Payment_model_body}>
            <IconButton
              icon="close-circle"
              size={height / 35}
              iconColor="#FE2531"
              style={styles.close_circle}
              onPress={() => setModalVisible(false)}
            />
            <Text style={styles.payment_model_Select_Text}>
              Select Payment getway
            </Text>

            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <IconButton
                icon="checkbox-outline"
                size={height / 18}
                iconColor="#fff"
              />
            </View>

            <View style={styles.Payment_model_RadioButton}>
              <Pressable
                onPress={() => {
                  handelSalaryWisePayment();
                }}
                style={({pressed}) => [
                  styles.Payment_model_button_salary,
                  pressed ? styles.Payment_model_buttonPressed : null,
                ]}>
                <Text style={styles.buttonText}>Salary</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleSubmitData();
                  //Alert.alert('info', 'Working on process');
                }}
                style={({pressed}) => [
                  styles.Payment_model_button_bkash,
                  pressed ? styles.Payment_model_buttonPressed : null,
                ]}>
                <Text style={styles.buttonText}>Bkash</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#017071',
    //alignItems: 'center',
    margin: 4,
    // height: height / 5,
    width: '49%',
    borderRadius: 1,
    borderColor: '#ccc',
    borderWidth: 0.5,
  },
  image: {
    height: height / 5,
    width: '98%',
    borderRadius: 5,
    //resizeMode: 'stretch',
    margin: 5,
  },

  itemName: {
    color: '#FFFFFF',
    fontSize: width / 21,
    fontWeight: 'bold',
    textAlign: 'center',
    // backgroundColor: 'red',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: 10,
  },
  Item_Rate_Text: {
    fontSize: width / 22,
    marginHorizontal: 10,
    fontFamily: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  Item_Stock_Text: {
    fontSize: width / 30,
    textAlign: 'right',
    fontFamily: 'bold',
    color: '#FFFFFF',
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  incrementButton: {
    backgroundColor: '#612697',
    borderRadius: 5,
    height: height / 28,
    width: width / 10,
  },
  counterText: {
    fontSize: height / 38,
    marginHorizontal: 10,
    fontFamily: 'bold',
    color: '#FFFFFF',
    alignSelf: 'center',
  },

  AddButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    width: '100%',
    height: height / 22,
  },
  addbuttonArea: {
    flex: 1,
    //paddingBottom: 10,
  },
  Addtext: {
    color: '#FFFFFF',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  SubmitButton_area: {
    width: width / 2.2,
    //height: height / 15,
    marginRight: 6,
  },
  SubmitButton: {
    backgroundColor: '#026E75',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  Reset_area: {
    width: width / 2.2,
    //height: height / 15,
  },
  ResetButton: {
    backgroundColor: '#FC4136',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  text: {
    color: '#FFFFFF',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  CurrentBalancetext: {
    color: '#fff',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
    // borderColor: '#000000',
    // borderWidth: 1,
  },
  StockText: {
    color: '#fff',
    fontSize: width / 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  toggleButton: {
    position: 'absolute',
    top: height / 50,
    left: width / 1.4,
    zIndex: 1,
    color: '#fff',
  },

  scannedText: {
    color: '#02AFAE',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    margin: 5,
    lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  injuriousText: {
    color: '#02AFAE',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    margin: 5,
    lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  timeLeftText: {
    color: '#FF3B30',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: (width / 25) * 1.2,
    letterSpacing: 1,
    backgroundColor: '#f0f0f0',
  },
  LoadingText: {
    color: '#000',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spinnerText: {
    color: '#FFF',
  },
  //   ConfirmationSendText: {
  //     color: '#000',
  //     fontSize: width / 25,
  //     fontWeight: 'bold',
  //     textAlign: 'center',
  //   },
  Logoutbutton: {
    backgroundColor: '#FC4136',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  close_circle: {
    position: 'absolute',
    top: -height / 100,
    right: -height / 100,
    zIndex: 1,
    color: '#fff',
    fontSize: height / 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: height / 100,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },

  payment_model_area: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  Payment_model_body: {
    backgroundColor: '#00C7F3',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  Payment_model_button_salary: {
    backgroundColor: '#003D75',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Payment_model_button_bkash: {
    backgroundColor: '#8366B4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Payment_model_buttonPressed: {
    backgroundColor: '#3700B3',
  },
  Payment_model_buttonText: {
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  Payment_model_RadioButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  payment_model_Select_Text: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    height: 0,
    width: 0,
    opacity: 0,
    position: 'absolute',
    left: -9999,
  },
});

export default OnlineCigaretteBuyAndPaymentOnline;
