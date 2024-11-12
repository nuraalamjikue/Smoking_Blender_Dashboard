import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instance from '../Axiosinstance';
const {height, width} = Dimensions.get('window');
import jwtDecode from 'jwt-decode';
import {IconButton} from 'react-native-paper';

type DecodedToken = {
  userid: string;
  [key: string]: any;
};

// Define the type for the navigation prop
type RootStackParamList = {
  OnlineCigaretteSale: undefined;
  OnlineCigaretteBuyAndPaymentOnline: undefined;
  AuthLoading: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnlineCigaretteSale'
>;

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true);

  const handleToastMsg = (type: string, text: string) => {
    Toast.show({
      type,
      text1: text,
      visibilityTime: 2000,
    });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      handleToastMsg('error', 'Please enter both Username and Password');
      return;
    }

    setLoading(true);

    try {
      const response = await instance.post(
        '/Login/DoLogin',
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Uncomment if the API requires a token for authentication.
            // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
          },
        },
      );

      const result: {token?: string; message?: string} = response.data;

      console.log('token: ' + JSON.stringify(result.token, null, 2));

      if (result.token) {
        let decoded: DecodedToken = jwtDecode(result.token);

        console.log(
          'Decoded userid: ' + JSON.stringify(decoded.userid, null, 2),
        );

        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('getuserID', decoded.userid); // `decoded.userid` is a string

        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('getuserID', decoded.userid);
        handleToastMsg('success', 'Login Successful');
        navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
        setPassword('');
        setUsername('');
      } else {
        handleToastMsg('error', 'Something went wrong');
      }
    } catch (error) {
      handleToastMsg('error', `Failed to connect to the server: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
      <View style={{marginBottom: height / 15}}>
        <Text style={styles.WelcomeText}>Welcome to Snowtex</Text>
        <Text style={styles.SmokingText}>Cigarette Blender</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        keyboardType="default"
        autoCapitalize="none"
      />
      {/* <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      /> */}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Enter Your Password"
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
  },
  SmokingText: {
    color: '#02AFAE',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    //padding: 10,
    margin: 5,
    //lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    //backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  WelcomeText: {
    //marginBottom: height / 15,
    color: '#02AFAE',
    fontSize: width / 13,
    fontWeight: 'bold',
    textAlign: 'center',
    // padding: 10,
    //margin: 2,
    //lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    //backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#02AFAE',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: width / 20,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#1e90ff',
    textAlign: 'center',
    fontSize: width / 30,
  },

  inputContainer: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputField: {
    color: 'black',
    width: '90%',
  },
});

export default LoginScreen;

// import React, {useState} from 'react';
// import {View, StyleSheet, Dimensions} from 'react-native';
// import {TextInput, Button, Text} from 'react-native-paper';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import Toast from 'react-native-toast-message';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import instance from '../Axiosinstance';
// import jwtDecode from 'jwt-decode';

// const {height, width} = Dimensions.get('window');

// type DecodedToken = {
//   userid: string;
//   [key: string]: any;
// };

// type RootStackParamList = {
//   OnlineCigaretteSale: undefined;
//   AuthLoading: undefined;
// };

// type LoginScreenNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   'OnlineCigaretteSale'
// >;

// const LoginScreen: React.FC = () => {
//   const [username, setUsername] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true); // State to toggle password visibility
//   const navigation = useNavigation<LoginScreenNavigationProp>();

//   const handleToastMsg = (type: string, text: string) => {
//     Toast.show({
//       type,
//       text1: text,
//       visibilityTime: 2000,
//     });
//   };

//   const handleLogin = async () => {
//     if (!username || !password) {
//       handleToastMsg('error', 'Please enter both Username and Password');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await instance.post(
//         '/Login/DoLogin',
//         {
//           username,
//           password,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       const result: {token?: string; message?: string} = response.data;

//       console.log('token: ' + JSON.stringify(result.token, null, 2));

//       if (result.token) {
//         let decoded: DecodedToken = jwtDecode(result.token);

//         console.log(
//           'Decoded userid: ' + JSON.stringify(decoded.userid, null, 2),
//         );

//         await AsyncStorage.setItem('userToken', result.token);
//         await AsyncStorage.setItem('getuserID', decoded.userid);

//         handleToastMsg('success', 'Login Successful');
//         navigation.navigate('OnlineCigaretteSale');
//         setPassword('');
//         setUsername('');
//       } else {
//         handleToastMsg('error', 'Something went wrong');
//       }
//     } catch (error) {
//       handleToastMsg('error', `Failed to connect to the server: ${error}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Toast />
//       <View style={{marginBottom: height / 15}}>
//         <Text style={styles.WelcomeText}>Welcome to Snowtex</Text>
//         <Text style={styles.SmokingText}>Cigarette Blender</Text>
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholderTextColor="#aaa"
//         value={username}
//         onChangeText={setUsername}
//         keyboardType="default"
//         autoCapitalize="none"
//         label="Enter your username"
//         mode="outlined"
//       />

//       <TextInput
//         style={styles.input}
//         label="Enter your Password"
//         placeholderTextColor="#aaa"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry={isPasswordSecure}
//         mode="outlined"
//         right={
//           <TextInput.Icon
//             icon={isPasswordSecure ? 'eye-off' : 'eye'}
//             color="#1566E0"
//             onPress={() => setIsPasswordSecure(!isPasswordSecure)}
//           />
//         }
//       />

//       <Button
//         mode="contained"
//         onPress={handleLogin}
//         loading={loading}
//         disabled={loading}
//         style={styles.button}>
//         {loading ? 'Loading...' : 'Login'}
//       </Button>

//       <Button
//         onPress={() => {}}
//         style={styles.forgotPassword}
//         labelStyle={styles.forgotPasswordText}>
//         Forgot Password?
//       </Button>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//     backgroundColor: '#f5f5f5',
//   },
//   SmokingText: {
//     color: '#02AFAE',
//     fontSize: width / 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     margin: 5,
//     letterSpacing: 0.5,
//     borderRadius: 5,
//     overflow: 'hidden',
//   },
//   WelcomeText: {
//     color: '#02AFAE',
//     fontSize: width / 13,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     margin: 5,
//     letterSpacing: 0.5,
//     borderRadius: 5,
//     overflow: 'hidden',
//   },
//   input: {
//     marginBottom: height / 80,
//     height: 48,
//     borderColor: '#ccc',
//     // borderWidth: 1,
//     // borderRadius: 8,
//     // paddingHorizontal: 16,
//     backgroundColor: '#fff',
//   },
//   button: {
//     backgroundColor: '#1e90ff',
//     height: 48,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   forgotPassword: {
//     marginTop: 16,
//   },
//   forgotPasswordText: {
//     color: '#1e90ff',
//   },
// });

// export default LoginScreen;
