import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import instance from '../Axiosinstance';
import io, {Socket} from 'socket.io-client';
import {IconButton} from 'react-native-paper';
const {height, width} = Dimensions.get('window');
const socket: Socket = io('http://192.168.1.232:4000/', {forceNew: true});
import Sound from 'react-native-sound';
import Modal from 'react-native-modal';
import {useNavigation} from '@react-navigation/native';

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
interface sernertwiseDate {
  sender: string;
  recipientUsername: string;
  itemID: number;
  problemQty: number;
  ItemNames: string;
  timestamp: Date;
  ShortName: string;
  ImageUrl: string;
  IssueQty: number;
  IssueDate: Date;
  EmployeeCardNumberOrMobileNumber: string;
}
interface Detail {
  ItemId: number;
  FailedQty: number;
}
interface Message {
  sender: string;
  recipientUsername: string;
  paymentType: string;
  problemQty: string;
  timestamp: string;
  itemID: number;
  ShortName: string;
  PaymentType: string;
  MobileNo: string;
  details: Detail[];
}

const Dashboard = () => {
  const [data, setData] = useState<Item[]>([]);
  const [problemListDataFromDataBase, setProblemListDataFromDataBase] =
    useState<Message[]>([]);
  const [sendeIdWisedata, setSenderWisedata] = useState<sernertwiseDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewDataDatabaseOrsocket, setViewDataDatabaseOrsocket] =
    useState<boolean>(true);
  const [IsstopSound, setIsstopSound] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const soundInstance = useRef<Sound | null>(null);
  const navigation = useNavigation();

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
          setData(response.data);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        setLoading(false);
      });
  };

  const soundStart = () => {
    const requireAudio = require('../Sound/start.mp3');
    setViewDataDatabaseOrsocket(true);
    soundInstance.current = new Sound(requireAudio, e => {
      if (e) {
        console.log('Error loading sound', e);
        return;
      }

      // Set the sound to loop indefinitely
      soundInstance.current?.setNumberOfLoops(-1);

      // Play the sound
      soundInstance.current?.setSpeakerphoneOn(true);
      soundInstance.current?.play(() => {
        // Automatically stop the sound after 45 seconds
        setTimeout(() => {
          soundInstance.current?.stop(() => {
            console.log('Sound stopped after 45 seconds');
            soundInstance.current?.release();
          });
        }, 45000);
      });
      setIsstopSound(true);
      // Log current playback time
      soundInstance.current?.getCurrentTime(seconds =>
        console.log('At second ' + seconds),
      );
    });
  };

  const stopSound = () => {
    setIsstopSound(!IsstopSound);
    if (soundInstance.current) {
      soundInstance.current.stop(() => {
        console.log('Sound stopped manually');
        soundInstance.current?.release();
        soundInstance.current = null; // Clear the reference
        // navigation.navigate('SwipeList');
      });
    }
  };

  useEffect(() => {
    socket.on('message', (data: Message) => {
      setMessages(prevMessages => [...prevMessages, data]);
      soundStart();
    });

    handelGetData();
    const intervalId = setInterval(handelGetData, 120000);
    return () => {
      socket.off('message');
      clearInterval(intervalId);
    };
  }, []);

  // useEffect(() => {
  //   socket.on('message', (data: Message) => {
  //     setMessages(prevMessages => [...prevMessages, data]);
  //   });
  //   handelGetData();
  //   return () => {
  //     socket.off('message');
  //   };
  // }, []);

  // const soundStart = () => {
  //   const requireAudio = require('../Sound/start.mp3');
  //   const s = new Sound(requireAudio, e => {
  //     console.log('requireAudio' + requireAudio);
  //     if (requireAudio > 0) {
  //       s.setSpeakerphoneOn(true);
  //       s.play(f => s.release());
  //       s.getCurrentTime(seconds => console.log('at ' + seconds));
  //     }
  //   });
  // };

  const handlefetchMessagesFormDataBase = () => {
    //  soundStart();
    setLoading(true);
    setViewDataDatabaseOrsocket(false);
    instance
      .get(`/GetTodayAllProblemListFromDataBase`)
      .then((response: any) => {
        setTimeout(() => {
          setProblemListDataFromDataBase(response.data);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        setLoading(false);
      });
  };
  const HandlefetchMessagesformsockitIO = () => {
    setViewDataDatabaseOrsocket(true);
    socket.emit('fetchMessages');
  };

  const handleSenderWiseDataView = (sender: any, paymentType: string) => {
    // console.log('data' + JSON.stringify(data, null, 2));
    // console.log('paymentType -----------------' + paymentType);

    instance
      .get(`/GetSenderWiseData/${sender}/${paymentType}`)
      .then((response: any) => {
        // console.log(
        //   'Transaction Data:',
        //   JSON.stringify(response.data, null, 2),
        // );
        setTimeout(() => {
          setSenderWisedata(response.data);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        setLoading(false);
      });

    setModalVisible(!isModalVisible);
  };
  const HandleHideModel = () => {
    setModalVisible(!isModalVisible);
  };

  // console.log(
  //   'problemListDataFromDataBase ' +
  //     JSON.stringify(problemListDataFromDataBase, null, 2),
  // );

  const [refreshing, setRefreshing] = useState(false);

  // Function to handle the refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate fetching new data with a timeout, then end refreshing
    setTimeout(() => {
      handelGetData();
      setRefreshing(false);
    }, 2000);
  }, []);

  // Render each item in the FlatList
  const renderItemData = ({item}: any) => (
    <View key={item.Id} style={{flexDirection: 'row'}}>
      <View
        style={{
          width: '30%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ImageBackground
          source={{
            uri: `http://192.168.1.232:98/${item.ImageUrl}`,
          }}
          resizeMode="contain"
          style={styles.image}></ImageBackground>
      </View>

      <View
        style={{
          width: '50%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={styles.itemText}>{item.ItemNames}</Text>
      </View>

      <View
        style={{
          width: '20%',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={[styles.itemText, {textAlign: 'center'}]}>
          {item.CurrentBalance}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.MainContainer}>
      <Spinner visible={loading} />
      <View style={styles.MainCard}>
        <View style={{flexDirection: 'row'}}>
          <View
            style={{
              width: '30%',
              paddingVertical: 10,
            }}>
            <Text style={styles.HeaderText}>Image</Text>
          </View>

          <View
            style={{
              width: '50%',
              paddingVertical: 10,
            }}>
            <Text style={styles.HeaderText}>Item Name</Text>
          </View>

          <View
            style={{
              width: '20%',
              paddingVertical: 10,
            }}>
            <Text style={styles.HeaderText}>Quantity</Text>
          </View>
        </View>

        <FlatList
          data={data}
          renderItem={renderItemData}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

      <View
        style={{
          marginVertical: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <Pressable
          onPress={() => {
            handlefetchMessagesFormDataBase();
          }}>
          <View style={styles.Goback_buttonContent}>
            <IconButton
              icon="reload"
              size={24}
              iconColor={viewDataDatabaseOrsocket !== true ? 'red' : '#000'}
              style={styles.icon}
            />
            <Text
              style={{
                color: viewDataDatabaseOrsocket !== true ? '#FF6C37' : '#000',
                fontWeight:
                  viewDataDatabaseOrsocket !== true ? 'bold' : 'normal',
                fontSize:
                  viewDataDatabaseOrsocket !== true ? width / 25 : width / 30,
              }}>
              {' '}
              Previous Problem
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            HandlefetchMessagesformsockitIO();
          }}>
          <View style={styles.Goback_buttonContent}>
            <IconButton
              icon="autorenew"
              size={24}
              iconColor={viewDataDatabaseOrsocket === true ? 'red' : '#000'}
              style={styles.icon}
            />
            <Text
              style={{
                color: viewDataDatabaseOrsocket == true ? '#FF6C37' : '#000',
                fontWeight:
                  viewDataDatabaseOrsocket == true ? 'bold' : 'normal',
                fontSize:
                  viewDataDatabaseOrsocket == true ? width / 25 : width / 30,
              }}>
              {' '}
              Recent Problem
            </Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.header}>Received Messages:</Text>

      {viewDataDatabaseOrsocket === true ? (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <Pressable
              style={styles.messageContainer}
              onPress={() =>
                handleSenderWiseDataView(item.sender, item.paymentType)
              }>
              <Text style={styles.username}>
                {item.sender} to {item.recipientUsername}:
              </Text>
              {item.details.map((detail, index) => (
                <Text key={index} style={styles.message}>
                  {detail.ItemId === 1
                    ? 'Benson Red'
                    : detail.ItemId === 2
                    ? 'Benson Blue'
                    : detail.ItemId === 3
                    ? 'Marlboro Advance'
                    : detail.ItemId === 4
                    ? 'Gold Leaf'
                    : 'Unknown Item'}{' '}
                  - Failed Qty: {detail.FailedQty}
                </Text>
              ))}
              <Text style={styles.message}>
                Payment Type: {item.paymentType}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.noDataText}>Data not found</Text>
          )}
        />
      ) : (
        <FlatList
          data={problemListDataFromDataBase}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <Pressable
              style={styles.messageContainer}
              onPress={() =>
                handleSenderWiseDataView(item.sender, item.PaymentType)
              }>
              <Text style={styles.username}>
                {item.sender} to {item.recipientUsername}:
              </Text>
              <Text style={styles.message}>MobileNo: {item.MobileNo}</Text>
              <Text style={styles.message}>Barnd Name: {item.ShortName}</Text>
              <Text style={styles.message}>Problem Qty: {item.problemQty}</Text>
              <Text style={styles.message}>
                paymentType: {item.PaymentType}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.noDataText}>Data not found </Text>
          )}
        />
      )}
      <View
        style={{
          marginVertical: 10,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
        <IconButton
          icon="stop-circle"
          size={24}
          iconColor={IsstopSound === true ? 'red' : '#000'}
          style={styles.icon}
          onPress={() => stopSound()}
        />
      </View>

      <View style={styles.container}>
        <Modal isVisible={isModalVisible} onBackdropPress={HandleHideModel}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sender Details</Text>
            <IconButton
              icon="close-circle"
              size={height / 23}
              iconColor="#E53E30"
              style={styles.closeCircle}
              onPress={() => HandleHideModel()}
            />

            <ScrollView style={styles.scrollViewContent}>
              {sendeIdWisedata.map((dataItem, index) => (
                <View key={index} style={styles.dataContainer}>
                  <Text style={styles.dataText}>
                    <Text style={styles.label}>Sender : </Text>{' '}
                    {dataItem.EmployeeCardNumberOrMobileNumber}
                  </Text>

                  <Text style={styles.dataText}>
                    <Text style={styles.label}>Name : </Text>{' '}
                    {dataItem.ShortName}
                  </Text>
                  <Text style={styles.dataText}>
                    <Text style={styles.label}>Issue Quantity : </Text>{' '}
                    {dataItem.IssueQty}
                  </Text>
                  <Text style={styles.dataText}>
                    <Text style={styles.label}>Date Time : </Text>
                    {dataItem.IssueDate
                      ? new Date(dataItem.IssueDate).toISOString().split('T')[0]
                      : ''}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  MainCard: {
    backgroundColor: '#4770FF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  itemContainer: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  itemText: {
    color: '#ffffff',
    fontSize: width / 36,
    fontWeight: 'bold',
  },
  image: {
    height: height / 20,
    width: width / 10,
    borderRadius: 20,
    margin: 5,
    alignSelf: 'center',
    overflow: 'hidden', // Ensure the image stays within rounded corners
  },
  HeaderText: {
    color: '#ffffff',
    fontSize: width / 35,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },

  icon: {
    marginRight: 8,
    backgroundColor: '#E7E9EB',
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow (elevation)
    elevation: 5,
  },
  Goback_buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  messageContainer: {
    backgroundColor: '#20A1F1',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    elevation: 2,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#37373D',
    marginTop: 8,
    textAlign: 'right',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollViewContent: {
    maxHeight: height / 1, // Limit scrollable content height if needed
    marginBottom: 20, // Add space for fixed button
  },
  dataContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dataText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
  },

  closeCircle: {
    position: 'absolute',
    top: 0,
    right: 10,
    // backgroundColor: '#E53E30', // Optional: background color for visibility
    borderRadius: 20, // Optional: rounded background
  },
  noDataText: {
    color: 'red',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height / 6,
    fontSize: width / 25,
    flex: 1,
  },
});

export default Dashboard;
