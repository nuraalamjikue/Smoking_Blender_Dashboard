import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Pressable,
  Alert,
  Dimensions,
  ProgressBarAndroid,
  SafeAreaView,
} from 'react-native';
import instance from '../Axiosinstance';
const {height, width} = Dimensions.get('window');
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {DataTable, IconButton, ProgressBar} from 'react-native-paper';
import axios from 'axios';
import MQTT from 'sp-react-native-mqtt';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';
import {Int32} from 'react-native/Libraries/Types/CodegenTypes';

interface Item {
  EmployeeCode: string;
  EmployeeName: string;
}

type RootStackParamList = {
  OnlineCigaretteBuyAndPaymentOnlines: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
  };

  OnlineCigaretteBuyAndPaymentOnline: undefined;
};

type OnlineCigaretteBuyAndPaymentOnlineScreenRouteProp = RouteProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnlines'
>;

type RootStackParamListGoBack = {
  OnlineCigaretteBuyAndPaymentOnline: undefined;
};

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamListGoBack,
  'OnlineCigaretteBuyAndPaymentOnline'
>;

const Employee_salary_wise_payment = () => {
  const [employeeInfoData, setEmployeeInfoData] = useState<Item[]>([]);
  const [scanEmployeeData, setScanEmployeeData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [emp_id, setEmp_ID] = useState<Int32>(0);
  const [compmapy, setCompany] = useState<string>('');
  const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true);
  const [islogin, setIslogin] = useState<boolean>(false);
  const [timerStart, setTimerStart] = useState<boolean>(false);
  const textInputRef = useRef<TextInput>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();
  const route = useRoute<OnlineCigaretteBuyAndPaymentOnlineScreenRouteProp>();
  const {TatalSelectedData, TotalAmount, InvoiceMasterID} = route.params;

  const totalQty = TatalSelectedData.reduce(
    (acc: any, item: any) => acc + item.Count,
    0,
  );

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  //console.log('TatalSelectedData' + JSON.stringify(TatalSelectedData, null, 2));

  // Focus the TextInput when the component mounts
  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, []);

  const handleScanData = (text: string) => {
    setScanEmployeeData(text);
    if (text.length >= 10) {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }

      // Convert the text to a decimal number
      const decimalNumber = parseInt(text, 10);
      if (isNaN(decimalNumber)) {
        console.log('Invalid number');
        return;
      }

      // Convert decimal number to hexadecimal and pad to at least 10 characters
      let hex = decimalNumber.toString(16).toUpperCase();
      hex = hex.padStart(10, '0');

      // Split the hexadecimal into parts
      const firstPart = hex.slice(0, 6);
      const lastPart = hex.slice(6, 10);

      // Convert both parts back to decimal
      const firstDecValue = parseInt(firstPart, 16).toString();
      const lastDecValue = parseInt(lastPart, 16).toString();

      // Pad the decimal values
      const paddedFirstValue = firstDecValue.padStart(3, '0');
      const paddedLastValue = lastDecValue.padStart(5, '0');

      // Concatenate the padded values
      const result = paddedFirstValue + paddedLastValue;

      if (result.length >= 8) {
        setLoading(true);
        instance
          .get(`/GetEmployeeInfoData/${result}`)
          .then((response: any) => {
            setEmployeeInfoData(response.data);
            setUsername(response.data[0]?.EmployeeCode);
            setCompany(response.data[0]?.Company);
            setEmp_ID(response.data[0]?.Id);
            setLoading(false);
          })
          .catch((error: any) => {
            console.log(`Error fetching data: ${error.message}`);
            setLoading(false);
          });
      }
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      handleToastMsg('error', 'Please enter both Username and Password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://192.168.15.5:98/api/Login/DoLogin',
        {
          username: username,
          password: password,
        },
      );

      // Handle success
      if (response.status === 200) {
        const token = response.data.token;
        if (!token) {
          handleToastMsg('error', 'Invalid Username or Password');
          setLoading(false);
          //  handelTimeout();
          setTimeLeft(20);
          setTimerStart(true);
          setPassword('');
          return;
        } else {
          await AsyncStorage.setItem('token', token);
          setIslogin(true);
          setTimeLeft(totalQty * 3);
          setTimerStart(true);
          // console.log('token ' + token);
          //#region MQtt Area
          const delay = (ms: number) =>
            new Promise(resolve => setTimeout(resolve, ms));
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
                const filterTatalSelectedData = TatalSelectedData.filter(
                  (item: any) => item.Count > 0,
                );

                for (const item of filterTatalSelectedData) {
                  totalPrice += item.ItemsRate * item.Count;
                  totalQuantity += item.Count;

                  const formattedMessage = JSON.stringify({
                    drive: item.Id,
                    count: item.Count,
                  });

                  // console.log(
                  //   `Publishing message for item: ${item.ItemNames}`,
                  //   formattedMessage,
                  // );

                  await client.publish(
                    'cigarate/received/device123',
                    formattedMessage,
                    0,
                    false,
                  );
                  //  console.log(`Message published for item: ${item.ItemNames}`);

                  // Optional: If you want a delay between each publish
                  await delay(1000); // Adjust delay time as needed
                }

                try {
                  const SaveData = TatalSelectedData.filter(
                    (item: any) => item.Count > 0,
                  ).map((item: any) => ({
                    ItemId: item.Id,
                    IssueQty: item.Count,
                    LastStock: item.CurrentBalance - item.Count,
                    ItemsRate: item.ItemsRate,
                    Master_InvoiceID: InvoiceMasterID,
                    EmployeeID: username,
                  }));

                  // console.log('Save data:', JSON.stringify(SaveData, null, 2));

                  const response = await instance.post(
                    '/InsertStockData', // Replace with your server's IP
                    SaveData,
                    {
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    },
                  );

                  const getFormattedDate = () => {
                    const date = new Date();
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`; // Return formatted date in YYYY-MM-DD format
                  };

                  const SendEmployee_Wise_All_Data_Kafka_Wise = {
                    Id: InvoiceMasterID,
                    Payrollid: emp_id,
                    Balance: TotalAmount,
                    doj: getFormattedDate(),
                    Company: compmapy,
                  };

                  try {
                    const Kafka_Wise_response = await instance.post(
                      '/SandDataWithKafka', // Replace with your server's IP
                      SendEmployee_Wise_All_Data_Kafka_Wise,
                      {
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      },
                    );
                    console.log('Response:', Kafka_Wise_response.data); // Handle successful response
                  } catch (error: any) {
                    console.error('Error occurred while sending data:', error);
                    // Optional: Handle the error, e.g., show a message to the user or retry
                    if (error.response) {
                      console.error(
                        'Error response data:',
                        error.response.data,
                      );
                    } else if (error.request) {
                      console.error('No response received:', error.request);
                    } else {
                      console.error('Error message:', error.message);
                    }
                  }

                  //  console.log('Response:', response.data);
                } catch (error: any) {
                  console.error(
                    'Error saving data:',
                    error.response?.data || error.message,
                  );
                }
                //#endregion

                setLoading(false);
              } catch (err) {
                console.error('Failed to publish message:', err);

                setLoading(false);
              }
            });

            client.connect();
          } catch (err) {
            console.error('Failed to initialize MQTT client:', err);
          }

          //  handelTimeout();
        }
      } else {
        handleToastMsg('info', 'Invalid password');
        setLoading(false);
      }
    } catch (error) {
      // Handle error
      console.error(error);

      handleToastMsg('info', 'An error occurred while trying to log in.');
      setLoading(false);
    }
  };

  const handlePress = () => {
    navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
  };

  // const totalQtyMultiply = totalQty && totalQty * 10;
  // console.log('totalQtyMultiply ' + totalQtyMultiply);

  const totalTime = 60;
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timerStart) {
      if (timeLeft <= 0) return;
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            clearInterval(interval);
            navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStart, timeLeft, navigation]);

  const progress = timeLeft / totalTime;

  return (
    <SafeAreaView
      style={[
        styles.container,
        // {
        //   // Try setting `flexDirection` to `"row"`.
        //   flexDirection: 'column',
        // },
      ]}>
      <View style={{flex: 3.5, alignItems: 'center'}}>
        <View style={styles.container}>
          {islogin === true ? (
            <View
              style={{
                width: width,
                height: '100%',
                backgroundColor: '#008C8A',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <IconButton
                  icon="check-circle-outline"
                  size={100}
                  iconColor="#fff"
                />
                <Text style={styles.title}>Payment Successful</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.panicText}>
                Don't panic. Your information will be kept confidential.
              </Text>

              {employeeInfoData.length > 0 ? (
                employeeInfoData.map((employee, index) => (
                  <View key={index} style={styles.employeeContainer}>
                    <Text style={styles.employeeText}>
                      {employee.EmployeeName}
                    </Text>
                    <Text style={styles.employee_code}>
                      {employee.EmployeeCode}
                    </Text>

                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputField}
                        placeholder="Enter Your FPC Password"
                        placeholderTextColor="#aaa"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        secureTextEntry={isPasswordSecure}
                        value={password}
                        enablesReturnKeyAutomatically
                        onChangeText={text => setPassword(text)}
                      />
                      <Pressable>
                        <IconButton
                          icon={isPasswordSecure ? 'eye-off' : 'eye'}
                          size={15}
                          onPress={() => {
                            isPasswordSecure
                              ? setIsPasswordSecure(false)
                              : setIsPasswordSecure(true);
                          }}
                        />
                      </Pressable>
                    </View>

                    <Pressable
                      style={({pressed}) => [
                        styles.Login_button,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => {
                        handleLogin();
                      }}>
                      <View style={styles.buttonContent}>
                        <IconButton
                          icon="check"
                          size={15}
                          iconColor="#02AFAE"
                          style={styles.Login_button_icon}
                        />
                        <Text style={styles.Login_buttonText}>Login</Text>
                      </View>
                    </Pressable>
                  </View>
                ))
              ) : (
                <>
                  <TextInput
                    ref={textInputRef}
                    style={styles.input}
                    placeholder="Type here..."
                    value={scanEmployeeData}
                    onChangeText={handleScanData}
                    keyboardType="numeric"
                  />
                  <Text style={styles.noDataText}>Scan Your ID Card</Text>
                </>
              )}
            </>
          )}
          <Spinner
            visible={loading}
            textContent={'Loading...'}
            textStyle={styles.spinnerText}
          />
        </View>
      </View>

      <View style={{flex: 3, alignItems: 'center'}}>
        {employeeInfoData.length > 0 ? (
          <>
            <Text style={styles.PaymentText}>Your Selected Items</Text>
            <View style={styles.Tablecontainer}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={{flex: 2}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      Name
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title style={{flex: 1}} numeric>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      Qty
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title style={{flex: 1}} numeric>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      Rate
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title style={{flex: 1}} numeric>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      Total
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>
                {TatalSelectedData.filter((item: any) => item.Count > 0).map(
                  (item: any, index: number) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell style={{flex: 2}}>
                        {item.ItemNames}
                      </DataTable.Cell>
                      <DataTable.Cell style={{flex: 1}} numeric>
                        {item.Count}
                      </DataTable.Cell>
                      <DataTable.Cell style={{flex: 1}} numeric>
                        {item.ItemsRate.toFixed(2)}
                      </DataTable.Cell>
                      <DataTable.Cell style={{flex: 1}} numeric>
                        {(item.ItemsRate * item.Count).toFixed(2)}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ),
                )}
                <DataTable.Row>
                  <DataTable.Cell style={{flex: 2}}>
                    <Text
                      style={{
                        color: '#008C8A',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      Grand Total
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{flex: 1}} numeric>
                    <Text
                      style={{
                        color: '#008C8A',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      {totalQty}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{flex: 1}} numeric>
                    <Text
                      style={{
                        color: '#008C8A',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}></Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{flex: 1}} numeric>
                    <Text
                      style={{
                        color: '#008C8A',
                        fontSize: width * 0.02,
                        fontWeight: 'bold',
                      }}>
                      {TotalAmount}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </View>
          </>
        ) : null}
      </View>

      {/* -------------------------toster area--------------------------------------- */}
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
                  fontSize: height * 0.025,
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
      {/* -------------------------end toster area------------------------------------ */}

      {timeLeft !== 20 ? (
        <View>
          <ProgressBar
            progress={progress}
            color={'red'}
            style={styles.progressBar}
          />
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
            }}>
            <Text style={styles.timeLeftText}>{timeLeft}</Text>
          </View>
        </View>
      ) : null}

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
          ]}
          onPress={handlePress}>
          <View style={styles.buttonContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="red"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Go Home</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //padding: 16,
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
  employeeContainer: {
    padding: 16,
    paddingHorizontal: 120,
    paddingVertical: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // For Android shadow
    borderWidth: 1,
    borderColor: '#ddd',
  },
  employeeText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#017071',
    padding: '2%',
    textAlign: 'center',
  },
  employee_code: {
    fontSize: width * 0.028,
    fontWeight: 'bold',
    color: '#02AFAE',
    paddingBottom: '2%',
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: width * 0.05,
    marginTop: height * 0.09,
  },
  spinnerText: {
    color: '#FFF',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 16,
    paddingBottom: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  PaymentText: {
    fontSize: width * 0.03,
    fontWeight: 'bold',
    color: '#000',
    margin: '5%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: '2%',
    borderRadius: 10,
    marginBottom: 10,
  },
  panicText: {
    fontSize: width * 0.025,
    fontWeight: 'bold',
    color: '#fff',
    margin: '5%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: '2%',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F03A17',
  },
  Tablecontainer: {
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },

  Login_button: {
    backgroundColor: '#02AFAE',
    paddingVertical: 1,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    //alignItems: 'center',
    alignSelf: 'center',
  },
  Login_button_icon: {
    marginRight: 4,
    backgroundColor: '#fff',
  },
  Login_buttonText: {
    color: '#fff',
    fontSize: width * 0.028,
    fontWeight: 'bold',
    marginLeft: 4,
    paddingRight: 20,
    textAlign: 'center',
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
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    textAlign: 'center',
  },

  icon: {
    marginRight: 8,
    backgroundColor: '#fff',
  },
  timeLeftText: {
    fontWeight: 'bold',
    fontSize: width * 0.015,
    color: '#fff',
    backgroundColor: '#008C8A',
    borderRadius: 100,
    padding: 10,
    textAlign: 'center',
    width: width * 0.05,
    height: height * 0.032,
    lineHeight: height * 0.015,
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
  progressBar: {
    width: '50%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '1%',
  },
});

export default Employee_salary_wise_payment;

// import React, {useState} from 'react';
// import {View, Button, Text} from 'react-native';
// import {CountdownCircleTimer} from 'react-native-countdown-circle-timer';

// const Employee_salary_wise_payment = () => {
//   const [isPlaying, setIsPlaying] = useState(false);

//   const handleButtonClick = () => {
//     setIsPlaying(prev => !prev); // Toggle timer play/pause
//   };

//   return (
//     <View style={{alignItems: 'center', marginTop: 50}}>
//       <CountdownCircleTimer
//         isPlaying={isPlaying}
//         duration={7}
//         colors={['#004777', '#F7B801', '#A30000', '#A30000']}
//         colorsTime={[7, 5, 2, 0]}>
//         {({remainingTime}) => (
//           <Text style={{fontSize: 30}}>{remainingTime}</Text>
//         )}
//       </CountdownCircleTimer>

//       <Button
//         title={isPlaying ? 'Pause Timer' : 'Start Timer'}
//         onPress={handleButtonClick}
//       />
//     </View>
//   );
// };

// export default Employee_salary_wise_payment;
