import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const SmockingScreen = () => {
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    // Simulate a network request
    setTimeout(() => {
      setLoading(false);
      alert('Data fetched!');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={styles.spinnerTextStyle}
      />
      <Text style={styles.welcome}>Welcome to React Native!</Text>
      <Button title="Fetch Data" onPress={fetchData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    //  flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default SmockingScreen;
