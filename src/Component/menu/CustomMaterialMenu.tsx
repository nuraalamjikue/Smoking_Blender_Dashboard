import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
  Dimensions,
} from 'react-native';
import {Menu, MenuItem} from 'react-native-material-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import {IconButton} from 'react-native-paper';
import {RouteProp} from '@react-navigation/native';
const {height, width} = Dimensions.get('window');

interface CustomMaterialMenuProps {
  menuText: string;
  textStyle: any;
  navigation: any;
  route: RouteProp<any, any>;
  isIcon: boolean;
}

const CustomMaterialMenu: React.FC<CustomMaterialMenuProps> = ({
  menuText,
  textStyle,
  navigation,
  route,
  isIcon,
}) => {
  const [visible, setVisible] = useState(false);
  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userDetails');
      await AsyncStorage.removeItem('getuserID');

      const getemployeeID = await AsyncStorage.getItem('getusername');
      if (getemployeeID) {
        navigation.navigate('EmployeeDataWithCardWise');
        await AsyncStorage.removeItem('getusername');
      } else {
        navigation.navigate('OnlineCigaretteBuyAndPaymentOnline');
      }
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <View>
      <Menu
        visible={visible}
        anchor={
          isIcon ? (
            <TouchableOpacity onPress={showMenu}>
              <Image
                source={require('../../Img/mateliar_Menu_icon_2.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          ) : (
            <Text onPress={showMenu} style={textStyle}>
              {menuText}
            </Text>
          )
        }
        onRequestClose={hideMenu}>
        <MenuItem
          onPress={() => {
            toggleModal();
            hideMenu();
          }}>
          <Text style={{color: '#000'}}>Logout</Text>
        </MenuItem>

        <MenuItem
          onPress={() => {
            // toggleModal();
            hideMenu();
            navigation.navigate('BkashPaymentGetway');
          }}>
          <Text style={{color: '#000'}}>Bkash Payment</Text>
        </MenuItem>

        <MenuItem
          onPress={() => {
            // toggleModal();
            hideMenu();
            navigation.navigate('OnlineCigaretteSale');
          }}>
          <Text style={{color: '#000'}}>Buy Cigarette </Text>
        </MenuItem>
        <MenuItem
          onPress={() => {
            // toggleModal();
            hideMenu();
            navigation.navigate('PaymentSuccess');
          }}>
          <Text style={{color: '#000'}}>Payment Success </Text>
        </MenuItem>
        <MenuItem
          onPress={() => {
            // toggleModal();
            hideMenu();
            navigation.navigate('StockEntry');
          }}>
          <Text style={{color: '#000'}}>Stock Entry </Text>
        </MenuItem>
      </Menu>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <IconButton
            icon="account-lock-outline"
            size={50}
            // onPress={() => {
            //     setIsOpenCamera(!isOpenCamera);
            // }}
          />

          <Text style={styles.modalText}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonYes} onPress={handleLogout}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonNo} onPress={toggleModal}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 25,
    height: 25,
    marginRight: 20,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10, // Adds shadow on Android
  },
  modalText: {
    fontSize: width / 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonYes: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonNo: {
    flex: 1,
    backgroundColor: '#736262',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: width / 28,
  },
});

export default CustomMaterialMenu;
