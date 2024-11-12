import React from 'react';
import {NavigationContainer, RouteProp} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AuthLoadingScreen from './src/Login/AuthLoadingScreen';
import LoginScreen from './src/Login/LoginScreen';
import CustomMaterialMenu from './src/Component/menu/CustomMaterialMenu';
import VersionCheck from './src/Component/Version/VersionCheck';
import DownloadScreen from './src/Component/Download/DownloadScreen';
import BkashPaymentGetway from './src/Bkash/BkashPaymentGetway';
import PaymentCancel from './src/Bkash/PaymentCancel';
import PaymentSuccess from './src/Bkash/PaymentSuccess';
import StockEntry from './src/Stock/StockEntry';
import Employee_salary_wise_payment from './src/Payment_with_salary/Employee_salary_wise_payment';
import Dashboard from './src/Dashboard/Dashboard';
import SwipeList from './src/SwipeListView/SwipeList';

type RootStackParamList = {
  VersionCheck: undefined;
  AuthLoadingScreen: undefined;
  DownloadScreen: undefined;

  LoginScreen: undefined;
  OnlineCigaretteBuyAndPaymentOnline: undefined;
  headerMode: any;
  BkashPaymentGetway: undefined;
  PaymentCancel: undefined;
  PaymentSuccess: undefined;
  StockEntry: undefined;
  Employee_salary_wise_payment: undefined;
  Bkash_Payment_System: undefined;
  Notification: undefined;
  ReceiveNotification: undefined;
  Dashboard: undefined;
  SwipeList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({route, navigation}) => ({
          // headerRight: () => (
          //   <CustomMaterialMenu
          //     menuText="Menu"
          //     textStyle={{color: 'white'}}
          //     navigation={navigation}
          //     route={route}
          //     isIcon={true}
          //   />
          // ),
          headerStyle: {
            backgroundColor: '#0078D7', // Set Header color
            opacity: 0.8,
          },

          statusBarColor: '#0078D7',
          headerTintColor: '#fff', // Set Header text color
          headerTitleStyle: {
            fontWeight: 'bold', // Set Header text style
          },
        })}>
        <Stack.Screen
          name="VersionCheck"
          component={VersionCheck}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="AuthLoadingScreen"
          component={AuthLoadingScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="DownloadScreen"
          component={DownloadScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="SwipeList"
          component={SwipeList}
          options={{headerShown: false}}
        />

        {/* ------------------------------------------------------------------------ */}
        <Stack.Screen
          name="BkashPaymentGetway"
          component={BkashPaymentGetway}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          // options={{
          //   headerShown: false,
          //   headerTitle: 'Login',
          //   headerTintColor: '#ffffff',
          //   headerMode: 'none',
          //   navigationOptions: {
          //     headerVisible: false,
          //   },
          //   headerTitleStyle: {
          //     fontSize: 15,
          //   },
          // }}
        />

        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="PaymentCancel"
          component={PaymentCancel}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="PaymentSuccess"
          component={PaymentSuccess}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="StockEntry"
          component={StockEntry}
          options={{
            headerShown: true,
          }}
        />

        <Stack.Screen
          name="Employee_salary_wise_payment"
          component={Employee_salary_wise_payment}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default App;
