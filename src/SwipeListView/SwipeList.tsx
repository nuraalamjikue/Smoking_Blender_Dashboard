// import React, {useState} from 'react';
// import {View, Text, StyleSheet, SafeAreaView, Alert} from 'react-native';
// import {SwipeListView} from 'react-native-swipe-list-view';

// // Define the structure of an item
// type Item = {
//   id: string;
//   title: string;
// };

// // Sample JSON data
// const initialData: Item[] = Array.from({length: 20}, (_, i) => ({
//   id: `${i + 1}`,
//   title: `Item ${i + 1}`,
// }));

// const SwipeList: React.FC = () => {
//   const [data, setData] = useState<Item[]>(initialData);

//   // Function to delete a row
//   const deleteRow = (rowMap: {[key: string]: any}, rowKey: string) => {
//     const newData = [...data];
//     const prevIndex = data.findIndex(item => item.id === rowKey);
//     newData.splice(prevIndex, 1); // Remove the item from the array
//     setData(newData); // Update the state with the new data
//   };

//   // Render each item in the list
//   const renderItem = ({item}: {item: Item}) => (
//     <View style={styles.row}>
//       <Text style={styles.title}>{item.title}</Text>
//     </View>
//   );

//   // Render the hidden item (swipe action)
//   const renderHiddenItem = (
//     data: {item: Item},
//     rowMap: {[key: string]: any},
//   ) => (
//     <View style={styles.hiddenContainer}>
//       <Text
//         style={styles.hiddenText}
//         onPress={() => {
//           deleteRow(rowMap, data.item.id); // Call deleteRow when pressed
//           Alert.alert('Deleted', `You deleted ${data.item.title}`); // Show alert
//         }}>
//         Delete
//       </Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <SwipeListView
//         data={data}
//         renderItem={renderItem}
//         renderHiddenItem={renderHiddenItem}
//         leftOpenValue={75} // Swipe from the left
//         rightOpenValue={-75} // Swipe from the right
//         keyExtractor={item => item.id}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//   },
//   row: {
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     justifyContent: 'center',
//     height: 60,
//     paddingHorizontal: 15,
//   },
//   title: {
//     fontSize: 18,
//   },
//   hiddenContainer: {
//     alignItems: 'flex-end',
//     backgroundColor: '#ff3d00',
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//   },
//   hiddenText: {
//     color: '#fff',
//     fontSize: 16,
//     alignSelf: 'center',
//   },
// });

// export default SwipeList;

// ********************************************** swipe list Delete on swipe ******************************************************************
import React, {useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';

interface Item {
  key: string;
  text: string;
}

const rowTranslateAnimatedValues: {[key: string]: Animated.Value} = {};
Array(200)
  .fill('')
  .forEach((_, i) => {
    rowTranslateAnimatedValues[`${i}`] = new Animated.Value(1);
  });

const SwipeList: React.FC = () => {
  const [listData, setListData] = useState(
    Array(20)
      .fill('')
      .map((_, i) => ({key: `${i}`, text: `item #${i}`})),
  );

  const animationIsRunning = useRef(false);

  const onSwipeValueChange = (swipeData: {key: string; value: number}) => {
    const {key, value} = swipeData;
    if (
      value < -Dimensions.get('window').width &&
      !animationIsRunning.current
    ) {
      animationIsRunning.current = true;
      Animated.timing(rowTranslateAnimatedValues[key], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        const newData = listData.filter(item => item.key !== key);
        setListData(newData);
        animationIsRunning.current = false;
      });
    }
  };

  const renderItem = (data: {item: Item}) => (
    <Animated.View
      style={[
        styles.rowFrontContainer,
        {
          height: rowTranslateAnimatedValues[data.item.key].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 50],
          }),
        },
      ]}>
      <TouchableHighlight
        onPress={() => console.log('You touched me')}
        style={styles.rowFront}
        underlayColor={'#AAA'}>
        <View>
          <Text>I am {data.item.text} in a SwipeListView</Text>
        </View>
      </TouchableHighlight>
    </Animated.View>
  );

  const renderHiddenItem = () => (
    <View style={styles.rowBack}>
      <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
        <Text style={styles.backTextWhite}>Delete</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SwipeListView
        disableRightSwipe
        data={listData}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-Dimensions.get('window').width}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        onSwipeValueChange={onSwipeValueChange}
        useNativeDriver={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  backTextWhite: {
    color: '#FFF',
  },
  rowFrontContainer: {
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  rowFront: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: 'red',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
});

export default SwipeList;
