import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { Alert } from 'react-native';
import axios from 'axios';


// Pre-step, call this before any NFC operations
NfcManager.start();

function App() {

  async function getTagNumber(tagId : String | undefined){
    let tagNum
    try {
        const response = await axios.get(`http://10.20.45.60:3001/data/api/${tagId}`)
        tagNum = response.data[0].TagNum
    } catch(error) {
        console.warn('something went wrong getting the tag number', error)
    }
    return tagNum
  }

  async function getTableNum(tagNum : number | undefined){
    let tableNum
    try {
        const response = await axios.get(`http://10.20.45.60:3001/data/api/g/${tagNum}`)
        tableNum = response.data[0].TableNum
    } catch(error) {
        console.warn('something went wrong getting the table number', error)
    }
    return tableNum
  }

  async function updateTableStatus(tableNum : number | undefined){
    await axios.put(`http://10.20.45.60:3001/data/api/g/c/${tableNum}`)
  }

  async function reserveTable() {
    try {
      Alert.alert('Scan button pressed', 'looking for tag to scan')
      
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();

      const tagID = tag?.id
      const tagNum =  await getTagNumber(tagID)
      const tableNum = await getTableNum(tagNum)
      await updateTableStatus(tableNum)
      Alert.alert(`You have reserved table ${tableNum} from scanning tag ${tagNum}`)

    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {

      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  } 

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={reserveTable}>
        <Text>Scan a Tag!</Text>
      </TouchableOpacity>
    </View>
  );
} 

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;