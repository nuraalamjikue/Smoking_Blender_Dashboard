import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';
import instance from '../../Axiosinstance';
const {height, width} = Dimensions.get('window');

type RootStackParamList = {
  OnlineCigaretteBuyAndPaymentOnline: undefined;
  DownloadScreen: {apkLink: string}; // Add this line
  AuthLoadingScreen: undefined;
  Dashboard: undefined; // Add this line
};

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnlineCigaretteBuyAndPaymentOnline'
>;

const VersionCheck: React.FC = () => {
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();
  const currentVersion: string = DeviceInfo.getVersion();
  const [loading, setLoading] = useState<boolean>(true);
  console.log('Current version: ' + parseInt(currentVersion));

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  useEffect(() => {
    setLoading(true);
    instance
      .get('/GetCheckAppVersion')
      .then((response: any) => {
        // console.log(
        //   'Response: --------' +
        //     JSON.stringify(response.data[0].Version, null, 2),
        // );
        // console.log('Response 2: --------' + parseInt(currentVersion));

        if (parseInt(currentVersion) === response.data[0].Version) {
          navigation.navigate('Dashboard');
        } else {
          navigation.navigate('Dashboard');
          // navigation.navigate('DownloadScreen', {
          //   apkLink: response.data[0].Link,
          // });
        }

        setLoading(false);
      })
      .catch((error: any) => {
        handleToastMsg('error', `Error fetching data: ${error.message}`);

        setLoading(false);
      });
  }, [currentVersion, navigation]);

  return (
    <Spinner
      visible={loading}
      textContent={'Loading...'}
      textStyle={styles.spinnerText}
    />
  );
};

const styles = StyleSheet.create({
  spinnerText: {
    color: '#FFF',
  },
});

export default VersionCheck;
