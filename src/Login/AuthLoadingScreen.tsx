import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Spinner from 'react-native-loading-spinner-overlay';

type RootStackParamList = {
  OnlineCigaretteBuyAndPaymentOnline: undefined;
  LoginScreen: undefined;
};

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnline'
>;

const AuthLoadingScreen: React.FC = () => {
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
        setLoading(false);
      } else {
        navigation.navigate('LoginScreen');
        setLoading(false);
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <ActivityIndicator size="large" color="#1e90ff" />
      <Text style={styles.text}>Loading...</Text> */}

      <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={styles.spinnerText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  spinnerText: {
    color: '#FFF',
  },
});

export default AuthLoadingScreen;

// ------------------------------------------------Employee wise ------------------------------------------------------

// import React, {useEffect} from 'react';
// import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';

// type RootStackParamList = {
//   OnlineCigaretteSale: undefined;
//   LoginScreen: undefined;
//   EmployeeDataWithCardWise: undefined;
// };

// type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'OnlineCigaretteSale'
// >;

// const AuthLoadingScreen: React.FC = () => {
//   const navigation = useNavigation<AuthLoadingScreenNavigationProp>();

//   useEffect(() => {
//     const checkToken = async () => {
//       const token = await AsyncStorage.getItem('userToken');
//       if (token) {
//         navigation.navigate('OnlineCigaretteSale');
//       } else {
//         navigation.navigate('EmployeeDataWithCardWise'); // This should work now
//       }
//     };

//     checkToken();
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <ActivityIndicator size="large" color="#1e90ff" />
//       <Text style={styles.text}>Loading...</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   text: {
//     marginTop: 20,
//     fontSize: 18,
//     color: '#333',
//   },
// });

// export default AuthLoadingScreen;
