import {RouteProp, useRoute} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {IconButton} from 'react-native-paper';
const {height, width} = Dimensions.get('window');

type RootStackParamListData = {
  EmployeeCardNumberWiseLogin: {
    apkLink: string;
  };
};

type EmployeeCardNumberWiseLoginScreenRouteProp = RouteProp<
  RootStackParamListData,
  'EmployeeCardNumberWiseLogin'
>;

const DownloadScreen: React.FC = () => {
  const route = useRoute<EmployeeCardNumberWiseLoginScreenRouteProp>();

  // Extract employeeId from route.params
  const {apkLink} = route.params;

  console.log('Downloading employee apklink' + apkLink);

  const downloadApk = () => {
    const apkUrl = apkLink; // Replace with your APK URL

    // Use Linking to open the URL in the device's default browser, which will prompt the user to download the APK.
    Linking.openURL(apkUrl)
      .then(() => console.log('APK download started'))
      .catch(error => console.error('Error opening URL:', error));
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="download-box"
        size={150}
        style={styles.toggleButton}
        iconColor="#FF3B30"
        onPress={() => downloadApk()}
      />
      <Text style={styles.text}>New Features Added</Text>
      <Text style={styles.text1}>
        Please Download apps and reinstall again{' '}
      </Text>

      {/* <TouchableOpacity onPress={downloadApk} style={styles.button}>
        <Text style={styles.buttonText}>Download APK</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  toggleButton: {},
  text: {
    color: '#0082CF',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text1: {
    color: '#0082CF',
    fontSize: width / 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DownloadScreen;
