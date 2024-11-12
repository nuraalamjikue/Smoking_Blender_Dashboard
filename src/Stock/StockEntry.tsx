import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';
import instance from '../Axiosinstance';
import {useFocusEffect} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import {DataTable, IconButton} from 'react-native-paper';
import Toast from 'react-native-toast-message';
const {height, width} = Dimensions.get('window');

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

const StockEntry = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputRates, setInputRates] = useState<{[key: number]: string}>({});
  const [inputStocks, setInputStocks] = useState<{[key: number]: string}>({});

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  const handelGetData = async () => {
    setLoading(true);

    instance
      .get('/GetLastStockQty')
      .then((response: any) => {
        setTimeout(() => {
          const initialData = response.data;

          //   console.log(
          //     'Transaction Data:',
          //     JSON.stringify(response.data, null, 2),
          //   );

          setData(initialData);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      handelGetData();
    }, []),
  );

  const handleInputChange = (
    id: number,
    field: 'rate' | 'stock',
    value: string,
  ) => {
    if (field === 'rate') {
      setInputRates(prevState => ({...prevState, [id]: value}));
    } else if (field === 'stock') {
      setInputStocks(prevState => ({...prevState, [id]: value}));
    }
  };

  const handleSubmit = async (id: number) => {
    const dataItem = data.find(item => item.Id === id);

    if (dataItem) {
      const submissionData = {
        id: id,
        rate: inputRates[id] || '',
        stock: inputStocks[id] || '',
        CurrentBalance: dataItem.CurrentBalance,
        // Add other fields as necessary
      };

      console.log('Submitting:', submissionData);
      // You can now send the submissionData to your API or perform any other actions

      if (!submissionData.rate) {
        handleToastMsg('error', 'Please enter a valid Rate');
        return;
        // You can also show a success message to the user
      }
      if (!submissionData.stock) {
        handleToastMsg('error', 'Please enter a valid Stock');
        return;
        // You can also show a success message to the user
      }

      try {
        const SaveData = {
          ItemId: submissionData.id,
          StockQty: submissionData.stock,
          PreviousStockQty: submissionData.CurrentBalance,
          ItemsRate: submissionData.rate,
        };

        console.log('Save data:', JSON.stringify(SaveData, null, 2));

        const response = await instance.post(
          '/EnterStockQuantity', // Replace with your server's IP
          SaveData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('Response:', response.data);
        setInputRates(prevState => ({...prevState, [id]: ''}));
        setInputStocks(prevState => ({...prevState, [id]: ''}));
        handelGetData();
        handleToastMsg('success', 'Data Submit successfully.');
      } catch (error: any) {
        console.error(
          'Error saving data:',
          error.response?.data || error.message,
        );
      }
    }
  };

  const renderItem = ({item}: {item: Item}) => {
    return (
      <DataTable.Row style={{backgroundColor: '#fff'}}>
        <DataTable.Cell style={{flex: 0.2}}>
          <ImageBackground
            source={{
              uri: `http://192.168.1.20:5000/${item.ImageUrl}`,
            }}
            resizeMode="contain"
            style={styles.image}></ImageBackground>
        </DataTable.Cell>
        <DataTable.Cell style={{flex: 1, justifyContent: 'center'}}>
          <Text
            style={{
              textAlign: 'center',
              color: '#4F89CA',
              fontSize: width / 60,
            }}>
            {item.ItemNames}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell style={{flex: 1, justifyContent: 'center'}}>
          <TextInput
            style={styles.textInput}
            value={inputRates[item.Id] || ''}
            onChangeText={value => handleInputChange(item.Id, 'rate', value)}
            placeholder="Enter Rate"
            placeholderTextColor={'#ccc'}
            keyboardType="decimal-pad"
            underlineColorAndroid="transparent"
          />
        </DataTable.Cell>
        <DataTable.Cell style={{flex: 1, justifyContent: 'center'}}>
          <TextInput
            style={styles.textInput}
            value={inputStocks[item.Id] || ''}
            onChangeText={value => handleInputChange(item.Id, 'stock', value)}
            placeholder="Enter Stock"
            placeholderTextColor={'#ccc'}
            keyboardType="decimal-pad"
            underlineColorAndroid="transparent"
          />
        </DataTable.Cell>
        <DataTable.Cell style={{flex: 1, justifyContent: 'center'}}>
          <Text
            style={{
              textAlign: 'center',
              color: '#4F89CA',
              fontSize: width / 60,
            }}>
            {item.CurrentBalance === null ? 0 : item.CurrentBalance} /
            {item.ItemsRate}
          </Text>
        </DataTable.Cell>
        <DataTable.Cell style={{flex: 0.5, justifyContent: 'center'}}>
          <IconButton
            icon="checkbox-marked-circle-outline"
            size={30}
            iconColor="#017071"
            onPress={() => handleSubmit(item.Id)}
          />
        </DataTable.Cell>
      </DataTable.Row>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{flex: 0.5, backgroundColor: 'red'}}>
        <ImageBackground
          source={require('../assets/Cigarette_Img/snowtex_group.jpg')}
          resizeMode="stretch"
          style={styles.Headerimage}></ImageBackground>
      </View>
      <View style={{flex: 2, justifyContent: 'center'}}>
        <DataTable>
          {/* Render the table header once */}
          <DataTable.Header style={{backgroundColor: '#fff'}}>
            <DataTable.Title style={{flex: 0.2}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#4F89CA',
                  fontSize: width / 80,
                }}>
                Image
              </Text>
            </DataTable.Title>
            <DataTable.Title style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#4F89CA',
                  fontSize: width / 60,
                }}>
                Item Name
              </Text>
            </DataTable.Title>
            <DataTable.Title style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#4F89CA',
                  fontSize: width / 60,
                }}>
                Rate
              </Text>
            </DataTable.Title>
            <DataTable.Title style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#4F89CA',
                  fontSize: width / 60,
                }}>
                Stock
              </Text>
            </DataTable.Title>
            <DataTable.Title style={{flex: 1, justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#4F89CA',
                  fontSize: width / 60,
                }}>
                Previous Stock / Rate
              </Text>
            </DataTable.Title>
            <DataTable.Title style={{flex: 0.5, justifyContent: 'center'}}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#4F89CA',
                  fontSize: width / 60,
                }}>
                Action
              </Text>
            </DataTable.Title>
          </DataTable.Header>

          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        </DataTable>
        <Toast />
        <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle={styles.spinnerText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: '1%',
  },
  spinnerText: {
    color: '#FFF',
  },
  image: {
    height: height / 15,
    width: '90%',
    borderRadius: 5,
    margin: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: height / 45,
    paddingVertical: width / 100,
    borderRadius: 5,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: width / 60,
    color: '#000',
  },
  AddButton: {
    backgroundColor: 'blue',
    // padding: 8,
    //borderRadius: 5,
  },
  Addtext: {
    color: '#fff',
    textAlign: 'center',
  },
  Headerimage: {
    height: height / 3,
    width: '100%',
  },
});

export default StockEntry;

// import React, {useCallback, useState} from 'react';
// import {
//   Dimensions,
//   FlatList,
//   ImageBackground,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
//   Pressable,
// } from 'react-native';
// import instance from '../Axiosinstance';
// import {useFocusEffect} from '@react-navigation/native';
// import Spinner from 'react-native-loading-spinner-overlay';
// import {DataTable} from 'react-native-paper';

// const {height} = Dimensions.get('window');

// interface Item {
//   Id: number;
//   itemCode: string;
//   itemDesc: string;
//   ItemNames: string;
//   quantity: number;
//   ItemsRate: number;
//   localRate: number;
//   image: string;
//   ImageUrl: string;
//   Count: number;
//   CurrentBalance: number;
//   driveAddress: number;
// }

// const StockEntry = () => {
//   const [data, setData] = useState<Item[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   const handelGetData = async () => {
//     setLoading(true);

//     try {
//       const response = await instance.get('/GetLastStockQty');
//       setTimeout(() => {
//         const initialData = response.data;
//         console.log(
//           'Transaction Data:',
//           JSON.stringify(response.data, null, 2),
//         );
//         setData(initialData);
//         setLoading(false);
//       }, 1000); // 1-second delay
//     } catch (error) {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       handelGetData();
//     }, []),
//   );

//   //   const handleInputChange = (id: number, field: string, value: string) => {
//   //     setData(prevData =>
//   //       prevData.map(item =>
//   //         item.Id === id ? {...item, [field]: parseFloat(value) || 0} : item,
//   //       ),
//   //     );
//   //     };

//   const handleInputChange = (id: number, field: string, value: string) => {
//     // Remove any non-numeric characters except the decimal point
//     const parsedValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
//     setData(prevData =>
//       prevData.map(item =>
//         item.Id === id ? {...item, [field]: parsedValue} : item,
//       ),
//     );
//   };

//   const handleSubmit = async (id: number) => {
//     const itemToSubmit = data.find(item => item.Id === id);

//     if (itemToSubmit) {
//       const submissionData = {
//         ...itemToSubmit,
//         // Add or modify fields as needed
//       };

//       console.log('Submitting:', submissionData);
//       try {
//         const SaveData = {
//           ItemId: submissionData.Id,
//           StockQty: submissionData.CurrentBalance + submissionData.quantity,
//           PreviousStockQty: submissionData.CurrentBalance,
//           ItemsRate: submissionData.ItemsRate,
//         };

//         console.log('Save data:', JSON.stringify(SaveData, null, 2));

//         const response = await instance.post(
//           '/EnterStockQuantity', // Replace with your server's IP
//           SaveData,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           },
//         );

//         console.log('Response:', response.data);
//         handelGetData();
//       } catch (error: any) {
//         console.error(
//           'Error saving data:',
//           error.response?.data || error.message,
//         );
//       }
//       // You can now send the submissionData to your API or perform other actions
//     }
//   };

//   const renderItem = ({item}: {item: Item}) => {
//     return (
//       <DataTable.Row style={{backgroundColor: '#fff'}}>
//         <DataTable.Cell style={{flex: 0.2}}>
//           <ImageBackground
//             source={{uri: `http://192.168.1.20:5000/${item.ImageUrl}`}}
//             resizeMode="contain"
//             style={styles.image}></ImageBackground>
//         </DataTable.Cell>
//         <DataTable.Cell style={{flex: 0.5}}>
//           <Text>{item.ItemNames}</Text>
//         </DataTable.Cell>
//         <DataTable.Cell style={{flex: 0.5}}>
//           <TextInput
//             style={styles.textInput}
//             value={(item.ItemsRate || 0).toString()}
//             onChangeText={value =>
//               handleInputChange(item.Id, 'ItemsRate', value)
//             }
//             placeholder="Enter Rate"
//             // keyboardType="numeric"
//           />
//         </DataTable.Cell>
//         <DataTable.Cell style={{flex: 0.5}}>
//           <TextInput
//             style={styles.textInput}
//             value={(item.quantity || 0).toString()} // Ensure value is not undefined
//             onChangeText={value =>
//               handleInputChange(item.Id, 'quantity', value)
//             }
//             placeholder="Enter Stock"
//             keyboardType="numeric"
//           />
//         </DataTable.Cell>
//         <DataTable.Cell style={{flex: 0.5}}>
//           {item.CurrentBalance === null ? 0 : item.CurrentBalance}
//         </DataTable.Cell>
//         <DataTable.Cell style={{flex: 0.5}}>
//           <Pressable
//             style={styles.AddButton}
//             onPress={() => handleSubmit(item.Id)}>
//             <Text style={styles.Addtext}>Submit</Text>
//           </Pressable>
//         </DataTable.Cell>
//       </DataTable.Row>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={{flex: 0.5, backgroundColor: 'red'}}></View>
//       <View style={{flex: 2}}>
//         <DataTable>
//           <DataTable.Header style={{backgroundColor: '#fff'}}>
//             <DataTable.Title style={{flex: 0.2}}>Image</DataTable.Title>
//             <DataTable.Title style={{flex: 0.5}}>Item Name</DataTable.Title>
//             <DataTable.Title style={{flex: 0.5}}>Rate</DataTable.Title>
//             <DataTable.Title style={{flex: 0.5}}>Stock</DataTable.Title>
//             <DataTable.Title style={{flex: 0.5}}>
//               Previous Stock
//             </DataTable.Title>
//             <DataTable.Title style={{flex: 0.5}}>Action</DataTable.Title>
//           </DataTable.Header>

//           <FlatList
//             data={data}
//             keyExtractor={item => item.Id.toString()}
//             renderItem={renderItem}
//           />
//         </DataTable>

//         <Spinner
//           visible={loading}
//           textContent={'Loading...'}
//           textStyle={styles.spinnerText}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   spinnerText: {
//     color: '#FFF',
//   },
//   image: {
//     height: height / 18,
//     width: '90%',
//     borderRadius: 5,
//     margin: 5,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 8,
//     borderRadius: 5,
//     backgroundColor: '#fff',
//     textAlign: 'center',
//   },
//   AddButton: {
//     backgroundColor: 'blue',
//     padding: 8,
//     borderRadius: 5,
//   },
//   Addtext: {
//     color: '#fff',
//     textAlign: 'center',
//   },
// });

// export default StockEntry;
